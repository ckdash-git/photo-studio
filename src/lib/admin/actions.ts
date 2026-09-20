"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionResult {
  error?: string;
}

// ---- Services ----

export async function saveService(
  serviceId: string | null,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const duration = Number(formData.get("duration_minutes"));
  const price = Number(formData.get("price_inr"));

  if (!name) return { error: "Name is required" };
  if (!duration || duration <= 0) return { error: "Duration must be a positive number" };
  if (!price || price <= 0) return { error: "Price must be a positive number" };

  const payload = {
    name,
    description: description || null,
    duration_minutes: duration,
    price_inr: price,
  };

  const { error } = serviceId
    ? await db.from("services").update(payload).eq("id", serviceId)
    : await db.from("services").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function toggleServiceActive(id: string, currentActive: boolean) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("services").update({ is_active: !currentActive }).eq("id", id);
  revalidatePath("/admin/services");
}

// ---- Slots ----

export async function generateSlots(
  serviceId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const startDateStr = formData.get("start_date") as string; // "YYYY-MM-DD"
  const days = Math.max(1, Math.min(60, Number(formData.get("days")) || 0));
  const timesRaw = ((formData.get("times") as string) || "").trim();
  const times = timesRaw.split(",").map((t) => t.trim()).filter(Boolean);

  if (!startDateStr) return { error: "Start date is required" };
  if (times.length === 0) return { error: "Enter at least one time, e.g. 10:00,15:00" };
  if (times.some((t) => !/^\d{2}:\d{2}$/.test(t))) {
    return { error: "Times must be in HH:MM format, comma-separated" };
  }

  const { data: service } = await db
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();
  if (!service) return { error: "Service not found" };

  // Calendar-day arithmetic done in UTC (no wall-clock ambiguity), then the
  // IST offset (+05:30) is attached explicitly per slot - avoids any bug
  // from the server process itself running in a different timezone (e.g.
  // Vercel's functions run in UTC).
  const baseDateUtc = new Date(`${startDateStr}T00:00:00Z`);
  const rows: { service_id: string; starts_at: string; ends_at: string }[] = [];

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(baseDateUtc);
    dayDate.setUTCDate(baseDateUtc.getUTCDate() + d);
    const dayStr = dayDate.toISOString().slice(0, 10);

    for (const time of times) {
      const startsAt = new Date(`${dayStr}T${time}:00+05:30`);
      const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60000);
      rows.push({
        service_id: serviceId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      });
    }
  }

  // ignoreDuplicates skips slots that already exist at that exact time
  // (service_id, starts_at) rather than erroring the whole batch.
  const { error } = await db
    .from("slots")
    .upsert(rows, { onConflict: "service_id,starts_at", ignoreDuplicates: true });

  if (error) return { error: error.message };

  revalidatePath(`/admin/services/${serviceId}/slots`);
  return {};
}

export async function deleteSlot(id: string, serviceId: string) {
  await requireAdmin();
  const db = createAdminClient();

  const { data: slot } = await db.from("slots").select("is_booked").eq("id", id).single();
  if (!slot || slot.is_booked) return; // never delete a booked slot silently

  await db.from("slots").delete().eq("id", id);
  revalidatePath(`/admin/services/${serviceId}/slots`);
}

// ---- Coupons ----

export async function createCoupon(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const discountType = formData.get("discount_type") as string;
  const discountValue = Number(formData.get("discount_value"));
  const maxRedemptionsRaw = formData.get("max_redemptions") as string;
  const expiresAtRaw = formData.get("expires_at") as string;

  if (!code) return { error: "Coupon code is required" };
  if (!discountValue || discountValue <= 0) return { error: "Discount value must be positive" };
  if (discountType === "percent" && discountValue > 100) {
    return { error: "Percent discount can't exceed 100" };
  }

  const { error } = await db.from("coupons").insert({
    code,
    percent_off: discountType === "percent" ? discountValue : null,
    amount_off_inr: discountType === "amount" ? discountValue : null,
    max_redemptions: maxRedemptionsRaw ? Number(maxRedemptionsRaw) : null,
    expires_at: expiresAtRaw || null,
  });

  if (error) {
    if (error.message.includes("duplicate key")) return { error: "That coupon code already exists" };
    return { error: error.message };
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function toggleCouponActive(id: string, currentActive: boolean) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("coupons").update({ is_active: !currentActive }).eq("id", id);
  revalidatePath("/admin/coupons");
}
