"use client";

import { useState } from "react";

interface Slot {
  id: string;
  starts_at: string;
  ends_at: string;
}

export function CheckoutForm({
  serviceId,
  priceInr,
  slots,
}: {
  serviceId: string;
  priceInr: number;
  slots: Slot[];
}) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlotId) {
      setError("Pick a time slot first");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          slotId: selectedSlotId,
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

      window.location.href = data.redirectUrl;
    } catch {
      setError("Network error - please try again");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-ink mb-3">Pick a slot</h2>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            const date = new Date(slot.starts_at);
            return (
              <button
                type="button"
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`rounded-md px-4 py-2 text-sm border transition-colors ${
                  isSelected
                    ? "bg-primary text-on-primary border-primary"
                    : "border-hairline text-ink hover:border-slate"
                }`}
              >
                {date.toLocaleString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}
              </button>
            );
          })}
        </div>
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
        {submitting ? "Processing..." : `Pay ₹${priceInr}`}
      </button>
    </form>
  );
}
