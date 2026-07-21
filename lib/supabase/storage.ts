"use client";

import { createClient } from "@/lib/supabase/client";

const POST_ASSETS_BUCKET = "post-assets";

/** Envia (ou substitui) o arquivo de um campo de asset do post e devolve a URL pública. */
export async function uploadPostAsset(file: File, postId: string, field: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const path = `${postId}/${field}${ext ? `.${ext}` : ""}`;

  const { error } = await supabase.storage.from(POST_ASSETS_BUCKET).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(POST_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
