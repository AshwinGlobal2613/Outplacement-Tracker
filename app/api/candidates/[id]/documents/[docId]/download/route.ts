import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById } from "@/lib/db";
import { downloadFile } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = (candidate.documents ?? []).find((d) => d.id === params.docId);
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  let fileBuffer: Buffer;
  try {
    fileBuffer = await downloadFile(doc.storagePath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `File not found: ${message}` }, { status: 404 });
  }

  // ?attachment=1 forces browser download; otherwise inline (for preview)
  const forceDownload = req.nextUrl.searchParams.get("attachment") === "1";
  const disposition = forceDownload
    ? `attachment; filename="${encodeURIComponent(doc.name)}"`
    : `inline; filename="${encodeURIComponent(doc.name)}"`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": disposition,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
