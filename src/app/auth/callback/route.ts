import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processReferralSignup } from "@/lib/referrals";

// Same validation as the login page's client-side getSafeRedirect - only
// allow a same-site relative path, reject anything else (a full URL, or
// "//evil.com" which browsers treat as protocol-relative to another host).
function getSafeRedirect(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/my-bookings";
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const redirectTo = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const referralCode = req.cookies.get("qp_ref")?.value;
    if (referralCode && data.user) {
      await processReferralSignup(data.user.id, referralCode);
    }
  }

  const response = NextResponse.redirect(`${siteUrl}${redirectTo}`);
  response.cookies.delete("qp_ref"); // consumed (or was never valid) - don't keep reapplying it
  return response;
}
