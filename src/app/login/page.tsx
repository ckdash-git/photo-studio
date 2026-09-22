"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeLoginReferralCapture } from "@/lib/referrals/actions";

const STORAGE_KEY = "quickpic-pending-login-email";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Restores the "check your email" screen if this tab was reloaded, or
  // reopened, while the code was being read on another device - the
  // whole point of the code (rather than the link) is that it can be
  // typed in from anywhere, so losing this screen on a reload would
  // defeat that.
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem(STORAGE_KEY);
    if (pendingEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage doesn't exist during SSR, so reading it via a useState initializer would return a different value on the client during hydration than the server rendered, causing a mismatch. This must run post-mount.
      setEmail(pendingEmail);
      setSent(true);
    }
  }, []);

  // If the user has this login tab open and completes login in a
  // different tab in the same browser (e.g. clicking the magic link,
  // which opens in a new tab) - the two tabs share the same cookies, so
  // that login is already real, but this tab's own state doesn't know
  // it yet. Supabase's client syncs session state across same-origin
  // tabs via localStorage, so this fires without any polling.
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.push("/my-bookings");
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function handleSendLink(e: React.FormEvent) {
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
    sessionStorage.setItem(STORAGE_KEY, email);
    setSent(true);
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setVerifying(false);
      setError(error.message);
      return;
    }

    // Mirrors what /auth/callback does for the link-click path - this
    // path (typing the code) never hits that route since verifyOtp
    // happens entirely client-side.
    await completeLoginReferralCapture();

    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/my-bookings");
    router.refresh();
  }

  if (sent) {
    return (
      <main className="flex-1 mx-auto max-w-sm w-full px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-slate">
          We sent a link to {email}. On a computer, clicking it is easiest.
        </p>
        <p className="mt-4 text-sm text-stone">
          On this app, it&apos;s more reliable to type the 6-digit code from
          that same email instead - the link can open in a different app
          than this one.
        </p>

        <form onSubmit={handleVerifyCode} className="mt-6 space-y-3">
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm text-center tracking-[0.3em] font-mono"
          />
          {error && (
            <p className="text-sm text-brand-coral" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={verifying}
            className="w-full rounded-lg bg-primary text-on-primary py-3.5 text-sm font-semibold disabled:opacity-50"
          >
            {verifying ? "Verifying..." : "Verify code"}
          </button>
        </form>
        <button
          onClick={() => {
            sessionStorage.removeItem(STORAGE_KEY);
            setSent(false);
            setEmail("");
            setCode("");
            setError(null);
          }}
          className="mt-4 text-xs text-stone underline"
        >
          Use a different email
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto max-w-sm w-full px-6 py-24">
      <h1 className="text-2xl font-semibold text-ink text-center">Log in</h1>
      <p className="mt-2 text-slate text-center">
        No password needed - we&apos;ll email you a code.
      </p>
      <form onSubmit={handleSendLink} className="mt-8 space-y-4">
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
          {submitting ? "Sending..." : "Send login code"}
        </button>
      </form>
    </main>
  );
}
