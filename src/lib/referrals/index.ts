import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function randomCode(length = 7) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function getOrCreateMyReferralCode(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("user_referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return existing.code;

  // Retry a few times on the unlikely event of a code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabase.from("user_referral_codes").insert({ user_id: user.id, code });
    if (!error) return code;
    if (!error.message.includes("duplicate key")) return null; // some other failure
  }
  return null;
}

export async function getReferralSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referral_settings")
    .select("welcome_percent_off, referrer_percent_off")
    .eq("id", "default")
    .single();
  return data ?? { welcome_percent_off: 10, referrer_percent_off: 10 };
}

export async function getMyReferralStats(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referral_signups")
    .select("id, reward_issued_at")
    .eq("referrer_user_id", userId);

  const signups = data?.length ?? 0;
  const rewarded = data?.filter((r) => r.reward_issued_at).length ?? 0;
  return { signups, rewarded };
}

/**
 * Called right after a new user's first login (see /auth/callback). If
 * they arrived via a referral link (qp_ref cookie) and haven't already
 * been credited, records the referral and issues them a one-time,
 * personal welcome coupon. Safe to call on every login - the unique
 * constraint on referred_user_id means this only ever does something
 * once per user.
 */
export async function processReferralSignup(userId: string, referralCode: string) {
  const db = createAdminClient();

  const { data: referrer } = await db
    .from("user_referral_codes")
    .select("user_id")
    .eq("code", referralCode)
    .maybeSingle();
  if (!referrer || referrer.user_id === userId) return; // invalid code or self-referral

  const { data: settings } = await db
    .from("referral_settings")
    .select("welcome_percent_off")
    .eq("id", "default")
    .single();
  const welcomePercent = settings?.welcome_percent_off ?? 10;

  const welcomeCouponCode = `WELCOME-${randomCode(6)}`;
  const { error: couponError } = await db.from("coupons").insert({
    code: welcomeCouponCode,
    percent_off: welcomePercent,
    max_redemptions: 1,
    restricted_to_user_id: userId,
  });
  if (couponError) return; // don't record a signup if the coupon failed to create

  // Unique constraint on referred_user_id means a second call for the
  // same user (e.g. logging in again) simply fails here and does nothing.
  await db.from("referral_signups").insert({
    referred_user_id: userId,
    referrer_user_id: referrer.user_id,
    code_used: referralCode,
    welcome_coupon_code: welcomeCouponCode,
  });
}

/**
 * Called after a booking is confirmed (see payment confirm routes). If
 * the customer was referred and this is their first-ever confirmed
 * booking, issues the referrer's reward coupon. Contingent on a real
 * completed booking, not just the signup - the whole point of tying the
 * reward to actual business rather than giving it away for free.
 */
export async function maybeRewardReferrer(customerUserId: string | null) {
  if (!customerUserId) return; // guest booking, not tied to an account

  const db = createAdminClient();

  const { data: referral } = await db
    .from("referral_signups")
    .select("id, referrer_user_id, reward_issued_at")
    .eq("referred_user_id", customerUserId)
    .maybeSingle();
  if (!referral || referral.reward_issued_at) return;

  const { count: confirmedCount } = await db
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", customerUserId)
    .eq("status", "confirmed");
  if ((confirmedCount ?? 0) > 1) return; // this wasn't their first confirmed booking

  const { data: settings } = await db
    .from("referral_settings")
    .select("referrer_percent_off")
    .eq("id", "default")
    .single();
  const referrerPercent = settings?.referrer_percent_off ?? 10;

  const rewardCouponCode = `THANKS-${randomCode(6)}`;
  const { error: couponError } = await db.from("coupons").insert({
    code: rewardCouponCode,
    percent_off: referrerPercent,
    max_redemptions: 1,
    restricted_to_user_id: referral.referrer_user_id,
  });
  if (couponError) return;

  await db
    .from("referral_signups")
    .update({ reward_coupon_code: rewardCouponCode, reward_issued_at: new Date().toISOString() })
    .eq("id", referral.id);
}
