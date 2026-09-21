"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Always the canonical domain, not window.location.origin - a
        // visitor arriving via a different host (e.g. www vs non-www)
        // would otherwise generate a redirect Supabase's allow-list
        // rejects, silently breaking login. Falls back to the actual
        // origin only if the env var is somehow unset.
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });

    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex-1 mx-auto max-w-sm w-full px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-slate">
          We sent a login link to {email}. Click it to see your bookings.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto max-w-sm w-full px-6 py-24">
      <h1 className="text-2xl font-semibold text-ink text-center">Log in</h1>
      <p className="mt-2 text-slate text-center">
        No password needed - we&apos;ll email you a link.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        {error && (
          <p className="text-sm text-brand-coral" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary text-on-primary py-3.5 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send login link"}
        </button>
      </form>
    </main>
  );
}
