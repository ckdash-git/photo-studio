"use client";

import { useState, useTransition } from "react";
import { acceptBookingRequest, declineBookingRequest } from "@/lib/bookings/photographer-actions";

export function RequestActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(action: (id: string) => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action(bookingId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="mt-3">
      {error && (
        <p className="text-sm text-brand-coral mb-2" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => handle(acceptBookingRequest)}
          disabled={isPending}
          className="rounded-md bg-primary text-on-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={() => handle(declineBookingRequest)}
          disabled={isPending}
          className="rounded-md border border-hairline px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
