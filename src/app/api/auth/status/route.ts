import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Used only by the app's own JS injection to decide whether to redirect
// to /login before showing content. The website itself stays publicly
// browsable for everyone else - this is intentionally NOT used to gate
// anything on the website side, since photographer profiles and service
// pages need to stay indexable and anonymously browsable for SEO.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return NextResponse.json({ loggedIn: !!user });
}
