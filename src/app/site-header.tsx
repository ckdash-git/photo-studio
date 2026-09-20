import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-ink">
          QuickPic
        </Link>
        <Link
          href={user ? "/my-bookings" : "/login"}
          className="text-sm text-slate hover:text-ink"
        >
          {user ? "My bookings" : "Log in"}
        </Link>
      </div>
    </header>
  );
}
