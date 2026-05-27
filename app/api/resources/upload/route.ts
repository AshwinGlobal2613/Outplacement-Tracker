import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { uploadResourceFile } from "@/lib/file-storage";

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "team_member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  const extKey = ext.replace(".", "");
  const mimeType = file.type || EXT_MIME[extKey] || "application/octet-stream";
  const fileId = `res_${uuidv4().slice(0, 8)}`;
  const storagePath = `${fileId}${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const publicUrl = await uploadResourceFile(storagePath, arrayBuffer, mimeType);
    return NextResponse.json({ url: publicUrl, fileName: file.name });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resources/upload]", message);
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
