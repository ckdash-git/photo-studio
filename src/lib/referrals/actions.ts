"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { processReferralSignup } from "./index";

/**
 * Called from the client right after a successful OTP code verification
 * (see login page) - mirrors what /auth/callback does for the link-click
 * path, since verifyOtp() happens entirely client-side and never hits
 * that route.
 */
export async function completeLoginReferralCapture() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const cookieStore = await cookies();
  const referralCode = cookieStore.get("qp_ref")?.value;
  if (!referralCode) return;

  await processReferralSignup(user.id, referralCode);
  cookieStore.delete("qp_ref");
}
