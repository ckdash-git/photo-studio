import { NextRequest, NextResponse } from "next/server";

// Sets a cookie remembering which referral code brought this visitor in,
// then sends them to the home page. Consumed on their first login (see
// /auth/callback) - doesn't require them to be logged in yet to work.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const response = NextResponse.redirect(`${siteUrl}/`);

  response.cookies.set("qp_ref", code.toUpperCase(), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    httpOnly: false,
  });

  return response;
}
