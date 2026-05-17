import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { documentId, folderId } = await req.json();
  // folderId can be a string (move into folder) or null (move to root)

  const documents = (candidate.documents ?? []).map((d) =>
    d.id === documentId ? { ...d, folderId: folderId ?? null } : d
  );

  const updated = await updateCandidate(params.id, { documents });
  return NextResponse.json(updated);
}
