"use client";

import { useTransition } from "react";
import { deleteSlot } from "@/lib/admin/actions";

export function DeleteSlotButton({ id, serviceId }: { id: string; serviceId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this slot?")) {
          startTransition(() => deleteSlot(id, serviceId));
        }
      }}
      disabled={isPending}
      className="text-xs font-medium text-brand-coral disabled:opacity-50"
    >
      Delete
    </button>
  );
}
