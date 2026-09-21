"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_inr: number;
  is_active: boolean;
}

export function ServiceListEditor({
  photographerId,
  existingServices,
}: {
  photographerId: string;
  existingServices: Service[];
}) {
  const [services, setServices] = useState(existingServices);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .insert({
        photographer_id: photographerId,
        name,
        description: description || null,
        duration_minutes: Number(duration),
        price_inr: Number(price),
      })
      .select()
      .single();

    setSubmitting(false);
    if (error || !data) {
      setError(error?.message ?? "Could not create session");
      return;
    }
    setServices([data, ...services]);
    setShowForm(false);
    setName("");
    setDescription("");
    setPrice("");
  }

  async function toggleActive(service: Service) {
    const supabase = createClient();
    await supabase.from("services").update({ is_active: !service.is_active }).eq("id", service.id);
    setServices(services.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s)));
  }

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {services.length === 0 && !showForm && (
          <p className="text-stone text-sm">No sessions listed yet.</p>
        )}
        {services.map((s) => (
          <div key={s.id} className="rounded-lg border border-hairline p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-ink">{s.name}</p>
              <p className="text-sm text-stone mt-0.5">
                {s.duration_minutes} min &middot; ₹{s.price_inr}
              </p>
            </div>
            <button
              onClick={() => toggleActive(s)}
              className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                s.is_active ? "bg-success-bg text-success-text" : "bg-surface text-stone"
              }`}
            >
              {s.is_active ? "Active" : "Inactive"}
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="mt-6 space-y-3 rounded-lg border border-hairline p-4">
          <input
            required
            placeholder="Session name (e.g. Portrait Session)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
          />
          <textarea
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
          />
          <div className="flex gap-3">
            <input
              required
              type="number"
              min={1}
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
            />
            <input
              required
              type="number"
              min={1}
              placeholder="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-brand-coral" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add session"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-hairline px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-6 rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold"
        >
          + Add a session
        </button>
      )}
    </div>
  );
}
