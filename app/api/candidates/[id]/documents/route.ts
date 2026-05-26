import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/file-storage";
import { CandidateDocument } from "@/lib/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EXT_MIME: Record<string, string> = {
  pdf:  "application/pdf",
  doc:  "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls:  "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt:  "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  gif:  "image/gif",
  webp: "image/webp",
  zip:  "application/zip",
  txt:  "text/plain",
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folderId = (formData.get("folderId") as string) || null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  const extKey = ext.replace(".", "");
  const mimeType = file.type || EXT_MIME[extKey] || "application/octet-stream";

  const docId = `doc_${uuidv4().slice(0, 8)}`;
  // Use docId+ext as filename to avoid path issues with spaces/special chars
  const storagePath = `candidates/${params.id}/${docId}${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    await uploadFile(storagePath, arrayBuffer, mimeType);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[documents] Upload error:", message);
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }

  const newDoc: CandidateDocument = {
    id: docId,
    name: file.name,
    folderId: folderId || null,
    size: file.size,
    mimeType,
    storagePath,
    uploadedAt: new Date().toISOString(),
    uploadedBy: authSession.user.name || "Unknown",
  };

  const documents = [...(candidate.documents ?? []), newDoc];
  const updated = await updateCandidate(params.id, { documents });

  return NextResponse.json({ candidate: updated, document: newDoc });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { documentId } = await req.json();
  const doc = (candidate.documents ?? []).find((d) => d.id === documentId);

  if (doc) {
    deleteFile(doc.storagePath).catch(() => {}); // fire-and-forget
  }

  const documents = (candidate.documents ?? []).filter((d) => d.id !== documentId);
  const updated = await updateCandidate(params.id, { documents });

  return NextResponse.json(updated);
}
