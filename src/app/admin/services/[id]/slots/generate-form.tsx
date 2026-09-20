"use client";

import { useActionState } from "react";
import { generateSlots, type ActionResult } from "@/lib/admin/actions";

export function GenerateSlotsForm({ serviceId }: { serviceId: string }) {
  const generateForService = generateSlots.bind(null, serviceId);
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(generateForService, {});

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <div className="flex gap-3">
        <input
          required
          type="date"
          name="start_date"
          defaultValue={today}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
        <input
          required
          type="number"
          min={1}
          max={60}
          name="days"
          placeholder="Days"
          defaultValue={7}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
      </div>
      <input
        required
        name="times"
        placeholder="Times, comma separated e.g. 10:00,15:00"
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <p className="text-xs text-stone">
        One slot per time, per day, for the number of days entered. Existing
        slots at the same time are skipped, not duplicated.
      </p>

      {state.error && (
        <p className="text-sm text-brand-coral" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? "Generating..." : "Generate slots"}
      </button>
    </form>
  );
}
