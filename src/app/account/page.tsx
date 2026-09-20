import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/app/sign-out-button";
import { isAdmin } from "@/lib/admin/auth";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-stone uppercase tracking-wide mb-2">{children}</p>;
}

function AccountLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-hairline p-4 text-sm font-medium text-ink hover:shadow-md transition-shadow"
    >
      {children}
    </Link>
  );
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: photographer }, adminAccess] = await Promise.all([
    supabase.from("photographers").select("id").eq("user_id", user.id).maybeSingle(),
    isAdmin(),
  ]);

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Account</h1>
      <p className="mt-2 text-sm text-stone">{user.email}</p>

      <div className="mt-8">
        <SectionLabel>Customer</SectionLabel>
        <div className="space-y-2">
          <AccountLink href="/my-bookings">My bookings</AccountLink>
          <AccountLink href="/requirements/new">Post a job</AccountLink>
          <AccountLink href="/invite">Invite friends</AccountLink>
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel>Photographer</SectionLabel>
        <div className="space-y-2">
          {photographer ? (
            <>
              <AccountLink href="/become-a-photographer">Edit photographer profile</AccountLink>
              <AccountLink href="/leads">Browse leads</AccountLink>
              <AccountLink href="/lead-access">Lead access</AccountLink>
            </>
          ) : (
            <AccountLink href="/become-a-photographer">List yourself as a photographer</AccountLink>
          )}
        </div>
      </div>

      {adminAccess && (
        <div className="mt-6">
          <SectionLabel>Admin</SectionLabel>
          <div className="space-y-2">
            <AccountLink href="/admin">Admin dashboard</AccountLink>
          </div>
        </div>
      )}

      <div className="mt-10">
        <SignOutButton />
      </div>
    </main>
  );
}
