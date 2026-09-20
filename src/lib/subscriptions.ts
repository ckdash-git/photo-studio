import { createClient } from "@/lib/supabase/server";

export const LEAD_ACCESS_PRICE_INR = 499;

export async function getMyPhotographerAndAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!photographer) return { photographer: null, hasAccess: false };

  const { data: activeSub } = await supabase
    .from("photographer_subscriptions")
    .select("id, expires_at")
    .eq("photographer_id", photographer.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { photographer, hasAccess: !!activeSub, expiresAt: activeSub?.expires_at };
}
