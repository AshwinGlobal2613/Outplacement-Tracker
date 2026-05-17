import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { CandidateDocument } from "@/lib/types";

const BUCKET = "candidate-docs";

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folderId = (formData.get("folderId") as string) || null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const docId = `doc_${uuidv4().slice(0, 8)}`;
  const storagePath = `candidates/${params.id}/${docId}/${file.name}`;

  await ensureBucket();

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[documents] Upload error:", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const newDoc: CandidateDocument = {
    id: docId,
    name: file.name,
    folderId: folderId || null,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
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
    // Remove from storage (fire-and-forget — don't block on it)
    supabase.storage.from(BUCKET).remove([doc.storagePath]).catch((err) =>
      console.error("[documents] Storage delete error:", err)
    );
  }

  const documents = (candidate.documents ?? []).filter((d) => d.id !== documentId);
  const updated = await updateCandidate(params.id, { documents });

  return NextResponse.json(updated);
}
