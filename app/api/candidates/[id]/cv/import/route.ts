import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";
import { CVProfile } from "@/lib/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ─── Prompt ───────────────────────────────────────────────────────────────────

const PARSE_PROMPT = `You are a CV/resume parser. Extract all structured data from this CV/resume document and return ONLY a valid JSON object — no markdown, no code fences, no explanation, just raw JSON.

Use this exact structure (omit any field that has no data):
{
  "headline": "job title or professional tagline",
  "summary": "professional summary paragraph",
  "contact": {
    "email": "email address",
    "phone": "phone number",
    "location": "city, country",
    "website": "linkedin url or personal site"
  },
  "skills": ["skill1", "skill2"],
  "languages": [
    { "id": "lang_1", "name": "English", "proficiency": "Native" }
  ],
  "experience": [
    {
      "id": "exp_1",
      "role": "Job Title",
      "company": "Company Name",
      "from": "Jan 2020",
      "to": "Mar 2023",
      "current": false,
      "description": "Responsibilities and achievements",
      "bullets": []
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "University Name",
      "degree": "BSc",
      "field": "Computer Science",
      "from": "2018",
      "to": "2021",
      "description": ""
    }
  ],
  "certifications": [
    { "id": "cert_1", "name": "AWS Solutions Architect", "issuer": "Amazon", "date": "Jun 2022" }
  ],
  "awards": [
    { "id": "awd_1", "title": "Employee of the Year", "issuer": "Acme Corp", "date": "2023", "description": "" }
  ],
  "interests": ["Photography", "Hiking"],
  "projects": [
    { "id": "proj_1", "title": "Project Name", "description": "What it does and your role", "link": "", "from": "Jan 2023", "to": "Jun 2023" }
  ]
}

Rules:
- proficiency must be exactly one of: Native, Fluent, Advanced, Intermediate, Basic
- dates should be "Mon YYYY" (e.g. "Jan 2020") or just "YYYY" for education years
- for current roles set "current": true and "to": ""
- generate short unique ids like exp_1, exp_2, edu_1 etc.
- return ONLY the raw JSON object, nothing else`;

// ─── Gemini ───────────────────────────────────────────────────────────────────

// Models to try in order — first one that responds (not 404) wins
const GEMINI_MODELS = [
  "v1beta/models/gemini-2.0-flash",
  "v1beta/models/gemini-2.0-flash-exp",
  "v1beta/models/gemini-1.5-flash-latest",
  "v1beta/models/gemini-1.5-flash",
  "v1beta/models/gemini-1.5-flash-8b",
  "v1beta/models/gemini-1.0-pro",
  "v1beta/models/gemini-pro",
  "v1/models/gemini-2.0-flash",
  "v1/models/gemini-1.5-flash-latest",
  "v1/models/gemini-1.5-flash",
];

async function parseWithGemini(
  input: { type: "pdf" | "text"; data: string }
): Promise<Partial<CVProfile>> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const BASE   = "https://generativelanguage.googleapis.com";

  const parts =
    input.type === "pdf"
      ? [
          { inline_data: { mime_type: "application/pdf", data: input.data } },
          { text: PARSE_PROMPT },
        ]
      : [{ text: `${PARSE_PROMPT}\n\nCV TEXT:\n${input.data.slice(0, 20000)}` }];

  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
  });

  let lastError = "No Gemini model available";

  for (const modelPath of GEMINI_MODELS) {
    const url = `${BASE}/${modelPath}:generateContent?key=${apiKey}`;
    const res  = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.status === 404) continue; // model doesn't exist on this key — try next

    if (res.status === 429) {
      // Model exists but quota exceeded — stop trying, surface this error
      const errText = await res.text();
      throw new Error(
        `Quota exceeded for ${modelPath}. Your API key's free tier limit is 0 for this model. ` +
        `Please enable billing at console.cloud.google.com or create a new API key at aistudio.google.com`
      );
    }

    if (!res.ok) {
      const errText = await res.text();
      lastError = `${modelPath} → ${res.status}: ${errText.slice(0, 200)}`;
      continue; // try next model
    }

    const json = await res.json();
    const raw  = (json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "") as string;
    if (!raw) { lastError = `${modelPath} returned empty response`; continue; }

    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      return JSON.parse(clean) as Partial<CVProfile>;
    } catch {
      lastError = `${modelPath} returned unparseable JSON`;
      continue;
    }
  }

  throw new Error(`AI parsing failed — ${lastError}`);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured on server" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf", "doc", "docx", "txt"].includes(ext)) {
    return NextResponse.json(
      { error: "Only PDF, DOC, DOCX and TXT files are supported" },
      { status: 400 }
    );
  }

  // ── Prepare input for Gemini ──────────────────────────────────────────────
  let input: { type: "pdf" | "text"; data: string };

  if (ext === "pdf") {
    // Send PDF directly to Gemini as base64 — no text extraction library needed
    const buffer = Buffer.from(await file.arrayBuffer());
    input = { type: "pdf", data: buffer.toString("base64") };

  } else if (ext === "docx" || ext === "doc") {
    // Extract text from DOCX with mammoth
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod     = require("mammoth");
      const mammoth = typeof mod.extractRawText === "function" ? mod : (mod.default ?? mod);
      const result  = await mammoth.extractRawText({ buffer });
      const text    = (result.value as string) || "";
      if (!text.trim()) throw new Error("empty");
      input = { type: "text", data: text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Could not read DOCX: ${msg}` }, { status: 500 });
    }

  } else {
    // Plain text
    input = { type: "text", data: await file.text() };
  }

  // ── Parse with Gemini ─────────────────────────────────────────────────────
  let parsed: Partial<CVProfile>;
  try {
    parsed = await parseWithGemini(input);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `AI parsing failed: ${msg}` }, { status: 500 });
  }

  // ── Merge with existing CV ────────────────────────────────────────────────
  const existing: Partial<CVProfile> = candidate.cvProfile ?? {};

  const merged: Partial<CVProfile> = {
    ...existing,
    headline:       parsed.headline       || existing.headline       || "",
    summary:        parsed.summary        || existing.summary        || "",
    skills:         parsed.skills?.length        ? parsed.skills         : (existing.skills         ?? []),
    languages:      parsed.languages?.length     ? parsed.languages      : (existing.languages      ?? []),
    experience:     parsed.experience?.length    ? parsed.experience     : (existing.experience     ?? []),
    education:      parsed.education?.length     ? parsed.education      : (existing.education      ?? []),
    certifications: parsed.certifications?.length? parsed.certifications : (existing.certifications ?? []),
    awards:         parsed.awards?.length        ? parsed.awards         : (existing.awards         ?? []),
    interests:      parsed.interests?.length     ? parsed.interests      : (existing.interests      ?? []),
    projects:       parsed.projects?.length      ? parsed.projects       : (existing.projects       ?? []),
    contact: { ...existing.contact, ...(parsed.contact ?? {}) },
  };

  // Which sections were successfully parsed
  const sectionMap: Record<string, unknown> = {
    summary:        merged.summary,
    experience:     merged.experience,
    education:      merged.education,
    skills:         merged.skills,
    languages:      merged.languages,
    certifications: merged.certifications,
    awards:         merged.awards,
    interests:      merged.interests,
    projects:       merged.projects,
  };

  const sections = Object.entries(sectionMap)
    .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
    .map(([k]) => k);

  return NextResponse.json({ cvProfile: merged, sections });
}
