import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";
import {
  CVProfile, CVExperience, CVEducation, CVCertification,
  CVLanguage, CVProject, CVCourse, CVAward,
} from "@/lib/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ─── Text extraction ──────────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text as string;
  }

  if (ext === "docx" || ext === "doc") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value as string;
  }

  // Plain text fallback
  return buffer.toString("utf-8");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const MONTHS_RE = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
const DATE_RE   = new RegExp(`(${MONTHS_RE.source}\\s+\\d{4}|\\d{4})`, "gi");

function normaliseDate(raw: string): string {
  const m = raw.match(/(jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\s+(\d{4})/i);
  if (m) {
    const abbr: Record<string, string> = {
      jan:"Jan",feb:"Feb",mar:"Mar",apr:"Apr",may:"May",jun:"Jun",
      jul:"Jul",aug:"Aug",sep:"Sep",oct:"Oct",nov:"Nov",dec:"Dec",
    };
    const key = m[1].toLowerCase().slice(0, 3);
    return `${abbr[key] ?? m[1]} ${m[2]}`;
  }
  return raw.match(/\d{4}/)?.[0] ?? raw;
}

// ─── CV Parser ────────────────────────────────────────────────────────────────

function parseCV(text: string): Partial<CVProfile> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const profile: Partial<CVProfile> & { contact: NonNullable<CVProfile["contact"]> } = {
    headline: "",
    summary: "",
    skills: [],
    languages: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    courses: [],
    awards: [],
    publications: [],
    references: [],
    customSections: [],
    interests: [],
    contact: {},
  };

  // ── Contact info ────────────────────────────────────────────────────────────
  const emailMatch = text.match(/[\w.+\-]+@[\w.\-]+\.[a-z]{2,}/i);
  if (emailMatch) profile.contact.email = emailMatch[0];

  const phoneMatch = text.match(/\+?[\d][\d\s\-().]{6,15}[\d]/);
  if (phoneMatch) profile.contact.phone = phoneMatch[0].trim();

  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w\-_%]+/i);
  if (linkedinMatch) profile.contact.website = `https://${linkedinMatch[0]}`;

  const locationMatch = text.match(/\b[A-Z][a-zA-Z\s]+,\s*[A-Z]{2,}(?:\s+\d{4,})?\b/);
  if (locationMatch) profile.contact.location = locationMatch[0].trim();

  // ── Headline — find short descriptive line near the top ────────────────────
  const skipRe = /[@+\d]|linkedin|github|http|www\./i;
  for (let i = 1; i < Math.min(8, lines.length); i++) {
    const l = lines[i];
    if (!skipRe.test(l) && l.length > 5 && l.length < 120 && l.split(" ").length < 15) {
      profile.headline = l;
      break;
    }
  }

  // ── Section splitting ───────────────────────────────────────────────────────
  const SECTION_RE: Record<string, RegExp> = {
    summary:        /^(summary|professional\s+summary|profile|about\s+me|objective|career\s+objective|personal\s+statement)/i,
    experience:     /^(experience|work\s+experience|professional\s+experience|employment|work\s+history|career)/i,
    education:      /^(education|academic|qualifications?|academic\s+background|academic\s+qualifications)/i,
    skills:         /^(skills|technical\s+skills|core\s+competenc|competenc|key\s+skills|expertise|technologies)/i,
    languages:      /^(languages?|language\s+skills|language\s+proficienc)/i,
    certifications: /^(certifications?|certificates?|licen[sc]es?|accreditations?|professional\s+development)/i,
    projects:       /^(projects?|personal\s+projects?|key\s+projects?|portfolio)/i,
    awards:         /^(awards?|honors?|honours?|achievements?|recognitions?)/i,
    interests:      /^(interests?|hobbies|activities|personal\s+interests?)/i,
  };

  const sections: Record<string, string[]> = {};
  let currentSection = "header";
  sections[currentSection] = [];

  for (const line of lines) {
    let matched = false;
    for (const [key, re] of Object.entries(SECTION_RE)) {
      if (re.test(line) && line.length < 60) {
        currentSection = key;
        sections[currentSection] = sections[currentSection] ?? [];
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections[currentSection] = sections[currentSection] ?? [];
      sections[currentSection].push(line);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  if (sections.summary?.length) {
    profile.summary = sections.summary.join(" ").trim();
  }

  // ── Skills ──────────────────────────────────────────────────────────────────
  if (sections.skills?.length) {
    const raw = sections.skills.join(" , ");
    const chips = raw.split(/[,•|·\n\/]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 60);
    profile.skills = Array.from(new Set(chips)).slice(0, 30);
  }

  // ── Languages ───────────────────────────────────────────────────────────────
  if (sections.languages?.length) {
    const PROF_WORDS = /native|fluent|advanced|intermediate|basic|beginner|conversational|proficient|mother\s+tongue/i;
    const langs: CVLanguage[] = [];
    for (const line of sections.languages) {
      const parts = line.split(/[,•|·\n—\-]/).map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        const profMatch = part.match(PROF_WORDS);
        const name = part.replace(PROF_WORDS, "").replace(/[():\-]/g, "").trim();
        if (name.length > 0 && name.length < 40) {
          const proficiencyMap: Record<string, CVLanguage["proficiency"]> = {
            native: "Native", "mother tongue": "Native",
            fluent: "Fluent",
            advanced: "Advanced", proficient: "Advanced",
            intermediate: "Intermediate", conversational: "Intermediate",
            basic: "Basic", beginner: "Basic",
          };
          const rawProf = profMatch?.[0].toLowerCase() ?? "";
          const proficiency = proficiencyMap[rawProf] ?? "Fluent";
          langs.push({ id: uid(), name, proficiency });
        }
      }
    }
    if (langs.length) profile.languages = langs;
  }

  // ── Interests ───────────────────────────────────────────────────────────────
  if (sections.interests?.length) {
    const raw = sections.interests.join(" , ");
    profile.interests = raw.split(/[,•|·\/]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 50).slice(0, 15);
  }

  // ── Experience ───────────────────────────────────────────────────────────────
  if (sections.experience?.length) {
    const expLines = sections.experience;
    const experiences: CVExperience[] = [];
    let cur: Partial<CVExperience> | null = null;
    const descBuf: string[] = [];

    const flushExp = () => {
      if (cur && (cur.company || cur.role)) {
        experiences.push({
          id: uid(), company: cur.company ?? "", role: cur.role ?? "",
          from: cur.from ?? "", to: cur.to ?? "",
          current: cur.current ?? false,
          description: descBuf.join(" ").trim(),
          bullets: [],
        });
      }
    };

    for (const line of expLines) {
      const dates = line.match(DATE_RE);
      if (dates && dates.length >= 1) {
        flushExp(); descBuf.length = 0;
        cur = { from: normaliseDate(dates[0]), to: dates[1] ? normaliseDate(dates[1]) : "" };
        if (/present|current|now/i.test(line)) cur.current = true;
        const noDate = line.replace(DATE_RE, "").replace(/present|current|now|[-–—|·•,]+/gi, "").trim();
        if (noDate) cur.role = noDate;
      } else if (cur) {
        if (!cur.role)    { cur.role    = line; }
        else if (!cur.company) { cur.company = line; }
        else                   { descBuf.push(line); }
      }
    }
    flushExp();
    if (experiences.length) profile.experience = experiences;
  }

  // ── Education ────────────────────────────────────────────────────────────────
  if (sections.education?.length) {
    const eduLines = sections.education;
    const educations: CVEducation[] = [];
    let cur: Partial<CVEducation> | null = null;
    const descBuf: string[] = [];

    const INST_RE = /university|college|school|institute|academy|polytechnic/i;
    const DEG_RE  = /b\.?sc|b\.?a|m\.?sc|m\.?a|m\.?b\.?a|ph\.?d|bachelor|master|diploma|certificate|a-level|gcse/i;

    const flushEdu = () => {
      if (cur && cur.institution) {
        educations.push({
          id: uid(), institution: cur.institution ?? "", degree: cur.degree ?? "",
          field: cur.field ?? "", from: cur.from ?? "", to: cur.to ?? "",
          description: descBuf.join(" ").trim(),
        });
      }
    };

    for (const line of eduLines) {
      const years = [...line.matchAll(/\b(\d{4})\b/g)].map((m) => m[1]);
      if (INST_RE.test(line) || (years.length >= 1 && DEG_RE.test(line))) {
        flushEdu(); descBuf.length = 0;
        cur = { institution: line.replace(/\b\d{4}\b/g, "").replace(/[-–—|,]+/g, "").trim(), from: years[0] ?? "", to: years[1] ?? "" };
      } else if (cur) {
        if (!cur.degree && DEG_RE.test(line)) { cur.degree = line; }
        else if (!cur.field) { cur.field = line; }
        else { descBuf.push(line); }
      }
    }
    flushEdu();
    if (educations.length) profile.education = educations;
  }

  // ── Certifications ───────────────────────────────────────────────────────────
  if (sections.certifications?.length) {
    const certs: CVCertification[] = [];
    for (const line of sections.certifications) {
      const dateMatch = line.match(DATE_RE);
      const name = line.replace(DATE_RE, "").replace(/[-–—|,]+/g, "").trim();
      if (name.length > 3) {
        certs.push({ id: uid(), name, issuer: "", date: dateMatch ? normaliseDate(dateMatch[0]) : "" });
      }
    }
    if (certs.length) profile.certifications = certs;
  }

  // ── Awards ───────────────────────────────────────────────────────────────────
  if (sections.awards?.length) {
    const awards: CVAward[] = [];
    for (const line of sections.awards) {
      const dateMatch = line.match(DATE_RE);
      const title = line.replace(DATE_RE, "").replace(/[-–—|,]+/g, "").trim();
      if (title.length > 3) {
        awards.push({ id: uid(), title, issuer: "", date: dateMatch ? normaliseDate(dateMatch[0]) : "", description: "" });
      }
    }
    if (awards.length) profile.awards = awards;
  }

  return profile;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = ["pdf", "doc", "docx", "txt"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Only PDF, DOC, DOCX and TXT files are supported" }, { status: 400 });
  }

  let text = "";
  try {
    text = await extractText(file);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cv-import] extraction error:", msg);
    return NextResponse.json({ error: `Could not read file: ${msg}` }, { status: 500 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "File appears to be empty or could not be read" }, { status: 400 });
  }

  const parsed = parseCV(text);

  // Merge with existing CV — prefer parsed values for non-empty fields
  const existing = candidate.cvProfile ?? {};
  const merged: Partial<CVProfile> = {
    ...existing,
    headline:       parsed.headline      || existing.headline      || "",
    summary:        parsed.summary       || existing.summary       || "",
    skills:         parsed.skills?.length       ? parsed.skills        : (existing.skills        ?? []),
    languages:      parsed.languages?.length    ? parsed.languages     : (existing.languages     ?? []),
    experience:     parsed.experience?.length   ? parsed.experience    : (existing.experience    ?? []),
    education:      parsed.education?.length    ? parsed.education     : (existing.education     ?? []),
    certifications: parsed.certifications?.length ? parsed.certifications : (existing.certifications ?? []),
    awards:         parsed.awards?.length       ? parsed.awards        : (existing.awards        ?? []),
    interests:      parsed.interests?.length    ? parsed.interests     : (existing.interests     ?? []),
    contact: {
      ...existing.contact,
      ...Object.fromEntries(Object.entries(parsed.contact ?? {}).filter(([, v]) => v)),
    },
  };

  return NextResponse.json({ cvProfile: merged, sections: Object.keys(parsed).filter((k) => {
    const v = (parsed as Record<string, unknown>)[k];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  })});
}
