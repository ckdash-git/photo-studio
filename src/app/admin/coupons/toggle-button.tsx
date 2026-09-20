"use client";

import { useTransition } from "react";
import { toggleCouponActive } from "@/lib/admin/actions";

export function ToggleCouponButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleCouponActive(id, isActive))}
      disabled={isPending}
      className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full disabled:opacity-50 ${
        isActive ? "bg-success-bg text-success-text" : "bg-surface text-stone"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
