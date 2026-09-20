import { createClient } from "@/lib/supabase/server";

export async function getActivePhotographers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photographers")
    .select("id, display_name, bio, city, categories")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
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
