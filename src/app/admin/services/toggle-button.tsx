"use client";

import { useTransition } from "react";
import { toggleServiceActive } from "@/lib/admin/actions";

export function ToggleServiceButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleServiceActive(id, isActive))}
      disabled={isPending}
      className={`text-xs font-medium px-2.5 py-1 rounded-full disabled:opacity-50 ${
        isActive ? "bg-success-bg text-success-text" : "bg-surface text-stone"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
