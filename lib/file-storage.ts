/**
 * Unified file storage abstraction.
 * - If NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set → Supabase Storage
 * - Otherwise → local filesystem under uploads/candidate-docs/
 */

import path from "path";
import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "candidate-docs";
const LOCAL_DIR = path.join(process.cwd(), "uploads", "candidate-docs");

const useSupabase =
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function ensureBucket() {
  const supabase = getSupabase();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: false });
  }
}

/** Upload a file. Returns storagePath on success or throws. */
export async function uploadFile(
  storagePath: string,
  data: ArrayBuffer,
  mimeType: string
): Promise<void> {
  if (useSupabase) {
    await ensureBucket();
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, data, { contentType: mimeType, upsert: false });
    if (error) throw new Error(error.message ?? JSON.stringify(error));
  } else {
    const localPath = path.join(LOCAL_DIR, storagePath);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(data));
  }
}

/** Download a file. Returns a Buffer or throws. */
export async function downloadFile(storagePath: string): Promise<Buffer> {
  if (useSupabase) {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (error || !data) throw new Error(error?.message ?? "Download failed");
    return Buffer.from(await data.arrayBuffer());
  } else {
    const localPath = path.join(LOCAL_DIR, storagePath);
    return fs.readFile(localPath);
  }
}

/** Delete a file (fire-and-forget safe — logs but doesn't throw). */
export async function deleteFile(storagePath: string): Promise<void> {
  if (useSupabase) {
    const supabase = getSupabase();
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) console.error("[storage] Supabase delete error:", error);
  } else {
    const localPath = path.join(LOCAL_DIR, storagePath);
    await fs.unlink(localPath).catch((e) =>
      console.error("[storage] Local delete error:", e)
    );
  }
}

export { useSupabase };
