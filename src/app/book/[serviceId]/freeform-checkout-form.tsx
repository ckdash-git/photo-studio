"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FreeformCheckoutForm({
  serviceId,
  priceInr,
}: {
  serviceId: string;
  priceInr: number;
}) {
  const router = useRouter();
  const [dateTime, setDateTime] = useState("");
  // Earliest selectable moment - "now" in the datetime-local input's
  // expected local-wall-clock format (no timezone suffix). Computed once
  // via useState's initializer since calling Date.now() directly in the
  // render body isn't allowed (render must be pure/idempotent); a few
  // seconds of drift between server-render and hydration is harmless
  // here, it only sets an input's min bound.
  const [minDateTime] = useState(() =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dateTime) {
      setError("Pick a date and time first");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          requestedStartsAt: new Date(dateTime).toISOString(),
          customerName: name,
          customerEmail: email,
          customerPhone: phone || undefined,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }

      // Real client-side page transition - router.push() is correct here.
      router.push(`/confirmation/${data.bookingId}`);
    } catch {
      setError("Network error - please try again");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">Pick a date and time</h2>
        <input
          required
          type="datetime-local"
          min={minDateTime}
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <p className="mt-2 text-xs text-stone">
          The photographer will confirm based on their own availability - you
          won&apos;t be charged until they accept.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Your details</h2>
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <input
          placeholder="Coupon code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm uppercase placeholder:normal-case"
        />
      </div>

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
        {submitting ? "Sending..." : `Request booking - ₹${priceInr}`}
      </button>
    </form>
  );
}
