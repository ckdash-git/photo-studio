import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processReferralSignup } from "@/lib/referrals";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const referralCode = req.cookies.get("qp_ref")?.value;
    if (referralCode && data.user) {
      await processReferralSignup(data.user.id, referralCode);
    }
  }

  const response = NextResponse.redirect(`${siteUrl}/my-bookings`);
  response.cookies.delete("qp_ref"); // consumed (or was never valid) - don't keep reapplying it
  return response;
}
