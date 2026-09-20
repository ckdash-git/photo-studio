"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProposalForm({
  requirementId,
  photographerId,
}: {
  requirementId: string;
  photographerId: string;
}) {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("proposals").insert({
      requirement_id: requirementId,
      photographer_id: photographerId,
      quoted_price_inr: Number(price),
      message,
    });

    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        type="number"
        min={1}
        placeholder="Your quote (₹)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <textarea
        required
        placeholder="Message to the customer"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
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
        className="rounded-lg bg-primary text-on-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send proposal"}
      </button>
    </form>
  );
}
