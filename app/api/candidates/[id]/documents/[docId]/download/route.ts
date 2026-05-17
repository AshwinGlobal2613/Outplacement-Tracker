import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";
import { supabase } from "@/lib/supabase";

const BUCKET = "candidate-docs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = (candidate.documents ?? []).find((d) => d.id === params.docId);
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.storagePath, 60 * 60); // 1 hour

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl, name: doc.name });
}
