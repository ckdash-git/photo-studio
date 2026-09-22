import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export async function getActiveServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, price_inr, duration_minutes, photographer_id, photographers(display_name)")
    .eq("is_active", true)
    .order("price_inr", { ascending: true });
  if (error) console.error("getActiveServices failed:", error.message);
  return data ?? [];
}

export const getServiceDetail = cache(async (serviceId: string) => {
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("id, name, description, price_inr, duration_minutes, photographer_id, photographers(display_name)")
    .eq("id", serviceId)
    .eq("is_active", true)
    .single();

  if (!service) return null;

  // Admin-owned services (no photographer) still use the fixed-slot
  // system - unchanged, existing behavior. Photographer-owned services
  // use free-form date/time requests instead (see the booking page).
  if (service.photographer_id) {
    return { service, slots: null };
  }

  const { data: slots } = await supabase
    .from("slots")
    .select("id, starts_at, ends_at")
    .eq("service_id", serviceId)
    .eq("is_booked", false)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return { service, slots: slots ?? [] };
});
