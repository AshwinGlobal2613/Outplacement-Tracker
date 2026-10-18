import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";
import { Candidate, CandidateDocument } from "@/lib/types";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

async function getCandidateWithFallback(id: string): Promise<Candidate | undefined> {
  try {
    const result = await getCandidateById(id);
    if (result) return result;
  } catch { /* fall through */ }
  if (process.env.NODE_ENV === "development") {
    try {
      const db = JSON.parse(readFileSync(join(process.cwd(), "data", "db.json"), "utf-8"));
      return db.candidates?.find((c: Candidate) => c.id === id);
    } catch { /* ignore */ }
  }
  return undefined;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "candidate") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidateId = session.user.candidateId;
  if (!candidateId) return NextResponse.json({ error: "No candidate linked to this account" }, { status: 400 });

  const candidate = await getCandidateWithFallback(candidateId);
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  // Strip sensitive internal fields
  const {
    notes, adminNotes, invoiceStatus, costingStatus, budget, budgetCurrency,
    discStyle, discDone, updatedBy,
    ...safe
  } = candidate as Candidate & Record<string, unknown>;

  // Mark documents: keep all but strip any sensitive info
  const safeDocuments = (safe.documents ?? []).map((d: CandidateDocument) => ({
    id: d.id,
    name: d.name,
    size: d.size,
    mimeType: d.mimeType,
    uploadedAt: d.uploadedAt,
    source: d.source ?? "team",
    folderId: d.folderId,
  }));

  return NextResponse.json({
    ...safe,
    documents: safeDocuments,
    candidateResources: candidate.candidateResources ?? [],
    goals: candidate.goals ?? [],
    cvProfile: candidate.cvProfile ?? null,
  });
}
