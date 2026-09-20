import { createClient } from "@/lib/supabase/server";

export async function getActivePhotographers(limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("photographers")
    .select("id, display_name, bio, city, categories")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data: photographers } = await query;
  if (!photographers || photographers.length === 0) return [];

  const ids = photographers.map((p) => p.id);
  const { data: portfolioItems } = await supabase
    .from("portfolio_items")
    .select("photographer_id, image_url, sort_order")
    .in("photographer_id", ids)
    .order("sort_order", { ascending: true });

  // First portfolio image per photographer, by sort_order. Grouped
  // client-side rather than a DB-level "first row per group" query -
  // simple and fine at this scale (a handful of photographers).
  const thumbnailByPhotographer = new Map<string, string>();
  for (const item of portfolioItems ?? []) {
    if (!thumbnailByPhotographer.has(item.photographer_id)) {
      thumbnailByPhotographer.set(item.photographer_id, item.image_url);
    }
  }

  return photographers.map((p) => ({
    ...p,
    thumbnailUrl: thumbnailByPhotographer.get(p.id) ?? null,
  }));
}

export async function getPhotographerProfile(id: string) {
  const supabase = await createClient();
  const { data: photographer } = await supabase
    .from("photographers")
    .select("id, display_name, bio, city, categories")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!photographer) return null;

  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("id, image_url, caption")
    .eq("photographer_id", id)
    .order("sort_order", { ascending: true });

  return { photographer, portfolio: portfolio ?? [] };
}
