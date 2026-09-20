"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "./actions";

export async function saveReferralSettings(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const db = createAdminClient();

  const welcomePercent = Number(formData.get("welcome_percent_off"));
  const referrerPercent = Number(formData.get("referrer_percent_off"));

  if (!welcomePercent || welcomePercent < 1 || welcomePercent > 100) {
    return { error: "Welcome discount must be between 1 and 100" };
  }
  if (!referrerPercent || referrerPercent < 1 || referrerPercent > 100) {
    return { error: "Referrer reward must be between 1 and 100" };
  }

  const { error } = await db
    .from("referral_settings")
    .update({
      welcome_percent_off: welcomePercent,
      referrer_percent_off: referrerPercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");

  if (error) return { error: error.message };

  revalidatePath("/admin/referrals");
  return {};
}
