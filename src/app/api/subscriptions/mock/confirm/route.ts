import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Stands in for Razorpay's payment webhook. Marks the subscription active
// for 30 days from now. See src/lib/payments/mock.ts for the equivalent
// on the booking side - same simplification, different domain object.
export async function GET(req: NextRequest) {
  const subscriptionId = req.nextUrl.searchParams.get("subscriptionId");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (!subscriptionId) return NextResponse.redirect(`${siteUrl}/lead-access`);

  const db = createAdminClient();
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await db
    .from("photographer_subscriptions")
    .update({ status: "active", starts_at: now.toISOString(), expires_at: expires.toISOString() })
    .eq("id", subscriptionId);

  return NextResponse.redirect(`${siteUrl}/leads`);
}
