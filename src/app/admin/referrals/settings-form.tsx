"use client";

import { useActionState } from "react";
import { saveReferralSettings } from "@/lib/admin/referral-actions";
import type { ActionResult } from "@/lib/admin/actions";

export function SettingsForm({
  welcomePercentOff,
  referrerPercentOff,
}: {
  welcomePercentOff: number;
  referrerPercentOff: number;
}) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(saveReferralSettings, {});

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div>
        <label className="text-xs text-stone">New signup&apos;s welcome discount (%)</label>
        <input
          required
          type="number"
          min={1}
          max={100}
          name="welcome_percent_off"
          defaultValue={welcomePercentOff}
          className="w-full mt-1 rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-stone">Referrer&apos;s reward discount (%)</label>
        <input
          required
          type="number"
          min={1}
          max={100}
          name="referrer_percent_off"
          defaultValue={referrerPercentOff}
          className="w-full mt-1 rounded-md border border-hairline px-4 py-2.5 text-sm"
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
        className="rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
