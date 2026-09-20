"use client";

import { useActionState, useState } from "react";
import { createCoupon, type ActionResult } from "@/lib/admin/actions";

export function CouponForm() {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(createCoupon, {});
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input
        required
        name="code"
        placeholder="Coupon code, e.g. WELCOME10"
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm uppercase placeholder:normal-case"
      />

      <div className="flex gap-3">
        <select
          name="discount_type"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
          className="rounded-md border border-hairline px-4 py-2.5 text-sm"
        >
          <option value="percent">% off</option>
          <option value="amount">₹ off</option>
        </select>
        <input
          required
          type="number"
          min={1}
          name="discount_value"
          placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 200"}
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
        />
      </div>

      <input
        type="number"
        min={1}
        name="max_redemptions"
        placeholder="Max redemptions (optional, blank = unlimited)"
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <div>
        <label className="text-xs text-stone">Expires (optional)</label>
        <input
          type="date"
          name="expires_at"
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
        className="rounded-lg bg-primary text-on-primary px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create coupon"}
      </button>
    </form>
  );
}
