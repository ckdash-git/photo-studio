import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Temporary diagnostic page - not linked anywhere, only reachable if you
// know the URL. Shows exactly what the server sees, to nail down a
// mismatch instead of guessing. Safe to delete once /admin works.
export default async function AdminCheckPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const rawAdminEmail = process.env.ADMIN_EMAIL;
  const yourEmail = user.email ?? "(no email on this account)";
  const isSet = !!rawAdminEmail;
  const matches =
    isSet && yourEmail.toLowerCase().trim() === rawAdminEmail!.toLowerCase().trim();

  return (
    <main className="flex-1 mx-auto max-w-lg w-full px-6 py-16">
      <h1 className="text-xl font-semibold text-ink">Admin access check</h1>
      <div className="mt-6 space-y-3 text-sm">
        <p>
          <span className="text-stone">You are logged in as: </span>
          <span className="font-mono text-ink">{yourEmail}</span>
        </p>
        <p>
          <span className="text-stone">ADMIN_EMAIL is set: </span>
          <span className="font-mono text-ink">{isSet ? "yes" : "NO - not set at all"}</span>
        </p>
        {isSet && (
          <p>
            <span className="text-stone">ADMIN_EMAIL value: </span>
            <span className="font-mono text-ink">&quot;{rawAdminEmail}&quot;</span>
          </p>
        )}
        <p className="pt-2">
          <span className="text-stone">Match: </span>
          <span className={`font-mono font-semibold ${matches ? "text-success-text" : "text-brand-coral"}`}>
            {matches ? "YES - /admin should work" : "NO - this is why /admin redirects home"}
          </span>
        </p>
      </div>
    </main>
  );
}
