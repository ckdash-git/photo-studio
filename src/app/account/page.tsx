import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/app/sign-out-button";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Account</h1>
      <p className="mt-2 text-sm text-stone">{user.email}</p>

      <div className="mt-8 space-y-3">
        <Link
          href="/my-bookings"
          className="block rounded-lg border border-hairline p-4 text-sm font-medium text-ink hover:shadow-md transition-shadow"
        >
          My bookings
        </Link>

        {photographer ? (
          <>
            <Link
              href="/become-a-photographer"
              className="block rounded-lg border border-hairline p-4 text-sm font-medium text-ink hover:shadow-md transition-shadow"
            >
              Edit photographer profile
            </Link>
            <Link
              href="/leads"
              className="block rounded-lg border border-hairline p-4 text-sm font-medium text-ink hover:shadow-md transition-shadow"
            >
              Browse leads
            </Link>
          </>
        ) : (
          <Link
            href="/become-a-photographer"
            className="block rounded-lg border border-hairline p-4 text-sm font-medium text-ink hover:shadow-md transition-shadow"
          >
            List yourself as a photographer
          </Link>
        )}
      </div>

      <div className="mt-10">
        <SignOutButton />
      </div>
    </main>
  );
}
