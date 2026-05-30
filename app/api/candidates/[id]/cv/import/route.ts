import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";
import { CVProfile } from "@/lib/types";

// pdf-parse → pdfjs-dist uses DOMMatrix which doesn't exist in Node.js < 19.
// Polyfill it minimally so PDF text extraction works in Vercel's runtime.
if (typeof globalThis.DOMMatrix === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a=1;b=0;c=0;d=1;e=0;f=0;
    m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
    is2D=true;isIdentity=true;
    invertSelf()         { return this; }
    multiplySelf()       { return this; }
    translateSelf()      { return this; }
    scaleSelf()          { return this; }
    scale3dSelf()        { return this; }
    rotateSelf()         { return this; }
    rotateAxisAngleSelf(){ return this; }
    skewXSelf()          { return this; }
    skewYSelf()          { return this; }
    setMatrixValue()     { return this; }
    transformPoint()     { return { x:0, y:0, z:0, w:1 }; }
    toFloat32Array()     { return new Float32Array(16); }
    toFloat64Array()     { return new Float64Array(16); }
    toString()           { return "matrix(1,0,0,1,0,0)"; }
  };
}

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ─── Text extraction ──────────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("pdf-parse");
    const pdfParse = typeof mod === "function" ? mod : (mod.default ?? mod);
    const data = await pdfParse(buffer);
    return data.text as string;
  }

  if (ext === "docx" || ext === "doc") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("mammoth");
    const mammoth = mod.default ?? mod;
    const result = await mammoth.extractRawText({ buffer });
    return result.value as string;
  }

  return buffer.toString("utf-8");
}

// ─── Gemini parsing ───────────────────────────────────────────────────────────

async function parseWithGemini(text: string): Promise<Partial<CVProfile>> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a CV/resume parser. Extract structured data from the following CV text and return ONLY a valid JSON object with no markdown, no code blocks, just raw JSON.

Use this exact structure (omit fields that have no data):
{
  "headline": "job title / professional tagline",
  "summary": "professional summary paragraph",
  "contact": {
    "email": "email address",
    "phone": "phone number",
    "location": "city, country",
    "website": "linkedin or personal website url"
  },
  "skills": ["skill1", "skill2"],
  "languages": [
    { "id": "1", "name": "English", "proficiency": "Native" }
  ],
  "experience": [
    {
      "id": "1",
      "role": "Job Title",
      "company": "Company Name",
      "from": "Mon YYYY",
      "to": "Mon YYYY",
      "current": false,
      "description": "description of role and achievements",
      "bullets": []
    }
  ],
  "education": [
    {
      "id": "1",
      "institution": "University Name",
      "degree": "BSc",
      "field": "Computer Science",
      "from": "2018",
      "to": "2021",
      "description": ""
    }
  ],
  "certifications": [
    { "id": "1", "name": "Cert Name", "issuer": "Issuer", "date": "Mon YYYY" }
  ],
  "awards": [
    { "id": "1", "title": "Award", "issuer": "Issuer", "date": "YYYY", "description": "" }
  ],
  "interests": ["interest1", "interest2"],
  "projects": [
    { "id": "1", "title": "Project", "description": "desc", "link": "", "from": "", "to": "" }
  ]
}

Rules:
- proficiency must be one of: Native, Fluent, Advanced, Intermediate, Basic
- dates should be formatted as "Mon YYYY" (e.g. "Jan 2020") or just "YYYY" for education years
- for current roles set "current": true and leave "to" as ""
- generate unique short ids (e.g. "exp_1", "edu_1")
- return ONLY the JSON object, no explanation

CV TEXT:
${text.slice(0, 15000)}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip any accidental markdown fences
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(clean) as Partial<CVProfile>;
  } catch {
    console.error("[cv-import] Gemini JSON parse failed:", clean.slice(0, 300));
    throw new Error("Could not parse AI response as JSON");
  }
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

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf", "doc", "docx", "txt"].includes(ext)) {
    return NextResponse.json({ error: "Only PDF, DOC, DOCX and TXT files are supported" }, { status: 400 });
  }

  // Extract text
  let text = "";
  try {
    text = await extractText(file);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Could not read file: ${msg}` }, { status: 500 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "File appears to be empty or unreadable" }, { status: 400 });
  }

  // Parse with Gemini
  let parsed: Partial<CVProfile>;
  try {
    parsed = await parseWithGemini(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `AI parsing failed: ${msg}` }, { status: 500 });
  }

  // Merge parsed data with any existing CV (parsed values take priority)
  const existing: Partial<CVProfile> = candidate.cvProfile ?? {};
  const merged: Partial<CVProfile> = {
    ...existing,
    headline:       parsed.headline       || existing.headline       || "",
    summary:        parsed.summary        || existing.summary        || "",
    skills:         parsed.skills?.length        ? parsed.skills         : (existing.skills         ?? []),
    languages:      parsed.languages?.length     ? parsed.languages      : (existing.languages      ?? []),
    experience:     parsed.experience?.length    ? parsed.experience     : (existing.experience     ?? []),
    education:      parsed.education?.length     ? parsed.education      : (existing.education      ?? []),
    certifications: parsed.certifications?.length ? parsed.certifications : (existing.certifications ?? []),
    awards:         parsed.awards?.length        ? parsed.awards         : (existing.awards         ?? []),
    interests:      parsed.interests?.length     ? parsed.interests      : (existing.interests      ?? []),
    projects:       parsed.projects?.length      ? parsed.projects       : (existing.projects       ?? []),
    contact: {
      ...existing.contact,
      ...(parsed.contact ?? {}),
    },
  };

  // Determine which sections were successfully extracted
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
