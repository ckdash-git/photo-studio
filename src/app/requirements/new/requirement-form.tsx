"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RequirementForm() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired - please log in again");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("requirements")
      .insert({
        customer_user_id: user.id,
        category,
        city,
        event_date: eventDate || null,
        budget_min_inr: budgetMin ? Number(budgetMin) : null,
        budget_max_inr: budgetMax ? Number(budgetMax) : null,
        description,
      })
      .select("id")
      .single();

    setSubmitting(false);
    if (error || !data) {
      setError(error?.message ?? "Could not post requirement");
      return;
    }
    router.push(`/requirements/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <input
        required
        placeholder="Category (e.g. wedding, portrait, product)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <input
        required
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <input
        type="date"
        placeholder="Event date (optional)"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Budget min (₹)"
          value={budgetMin}
          onChange={(e) => setBudgetMin(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <input
          type="number"
          placeholder="Budget max (₹)"
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
      </div>
      <textarea
        required
        placeholder="Describe what you need"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
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
        {submitting ? "Posting..." : "Post requirement"}
      </button>
    </form>
  );
}
