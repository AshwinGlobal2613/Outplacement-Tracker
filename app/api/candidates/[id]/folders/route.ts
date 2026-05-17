import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { DocumentFolder } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Folder name required" }, { status: 400 });

  const newFolder: DocumentFolder = {
    id: `folder_${uuidv4().slice(0, 8)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    createdBy: authSession.user.name || "Unknown",
  };

  const folders = [...(candidate.folders ?? []), newFolder];
  const updated = await updateCandidate(params.id, { folders });

  return NextResponse.json({ candidate: updated, folder: newFolder });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { folderId } = await req.json();

  // Move all documents in this folder back to root (folderId = null)
  const documents = (candidate.documents ?? []).map((d) =>
    d.folderId === folderId ? { ...d, folderId: null } : d
  );

  const folders = (candidate.folders ?? []).filter((f) => f.id !== folderId);
  const updated = await updateCandidate(params.id, { folders, documents });

  return NextResponse.json(updated);
}
