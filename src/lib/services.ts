import { createClient } from "@/lib/supabase/server";

export async function getActiveServices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("id, name, description, price_inr, duration_minutes")
    .eq("is_active", true)
    .order("price_inr", { ascending: true });
  return data ?? [];
}

export async function getServiceWithOpenSlots(serviceId: string) {
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("id, name, description, price_inr, duration_minutes")
    .eq("id", serviceId)
    .eq("is_active", true)
    .single();

  if (!service) return null;

  const { data: slots } = await supabase
    .from("slots")
    .select("id, starts_at, ends_at")
    .eq("service_id", serviceId)
    .eq("is_booked", false)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return { service, slots: slots ?? [] };
}
