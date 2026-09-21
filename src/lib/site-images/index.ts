"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface SiteImage {
  slot_key: string;
  public_url: string;
  credit_name: string | null;
  credit_url: string | null;
}

export async function getSiteImage(slotKey: string): Promise<SiteImage | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_images")
    .select("slot_key, public_url, credit_name, credit_url")
    .eq("slot_key", slotKey)
    .maybeSingle();
  return data;
}

export async function getSiteImages(slotKeys: string[]): Promise<Record<string, SiteImage>> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_images")
    .select("slot_key, public_url, credit_name, credit_url")
    .in("slot_key", slotKeys);

  const map: Record<string, SiteImage> = {};
  for (const row of data ?? []) map[row.slot_key] = row;
  return map;
}

/**
 * Downloads a chosen Pixabay image to our own Supabase Storage and records
 * it against a named slot. Required by Pixabay's terms - their image URLs
 * can't be permanently hotlinked, and the medium-size ones expire after
 * 24h anyway, so re-hosting is the only compliant option.
 */
export async function attachPixabayImageToSlot(
  slotKey: string,
  largeImageURL: string,
  pixabayId: number,
  creditName: string,
  creditUrl: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const db = createAdminClient();

  let imageBytes: ArrayBuffer;
  try {
    const res = await fetch(largeImageURL);
    if (!res.ok) return { error: `Could not download image (${res.status})` };
    imageBytes = await res.arrayBuffer();
  } catch {
    return { error: "Could not download image from Pixabay" };
  }

  const path = `${slotKey}.jpg`;
  const { error: uploadError } = await db.storage
    .from("site-images")
    .upload(path, imageBytes, { contentType: "image/jpeg", upsert: true });
  if (uploadError) return { error: uploadError.message };

  const { data: publicUrlData } = db.storage.from("site-images").getPublicUrl(path);

  const { error: dbError } = await db.from("site_images").upsert({
    slot_key: slotKey,
    public_url: `${publicUrlData.publicUrl}?v=${Date.now()}`, // cache-bust on replace
    storage_path: path,
    pixabay_id: pixabayId,
    credit_name: creditName,
    credit_url: creditUrl,
    updated_at: new Date().toISOString(),
  });
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/images");
  revalidatePath("/");
  return {};
}
