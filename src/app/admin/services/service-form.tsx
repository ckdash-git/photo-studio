"use client";

import { useActionState } from "react";
import { saveService, type ActionResult } from "@/lib/admin/actions";

interface ExistingService {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_inr: number;
}

export function ServiceForm({ existing }: { existing?: ExistingService }) {
  const saveWithId = saveService.bind(null, existing?.id ?? null);
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(saveWithId, {});

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input
        required
        name="name"
        placeholder="Service name (e.g. Portrait Session)"
        defaultValue={existing?.name}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <textarea
        name="description"
        placeholder="Short description (optional)"
        defaultValue={existing?.description ?? ""}
        rows={3}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <div className="flex gap-3">
        <input
          required
          type="number"
          min={1}
          name="duration_minutes"
          placeholder="Duration (minutes)"
          defaultValue={existing?.duration_minutes}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <input
          required
          type="number"
          min={1}
          name="price_inr"
          placeholder="Price (₹)"
          defaultValue={existing?.price_inr}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
      </div>

      {state.error && (
        <p className="text-sm text-brand-coral" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary text-on-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? "Saving..." : existing ? "Save changes" : "Create service"}
      </button>
    </form>
  );
}
