"use client";

import { useState } from "react";

export function SubscribeButton({ priceInr }: { priceInr: number }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("Network error - please try again");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      {error && (
        <p className="text-sm text-brand-coral mb-3" role="alert">
          {error}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={submitting}
        className="rounded-lg bg-primary text-on-primary px-8 py-3.5 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "Processing..." : `Subscribe - ₹${priceInr}/month`}
      </button>
    </div>
  );
}
