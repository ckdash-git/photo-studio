"use client";

export function PayButton({ bookingId, amountInr }: { bookingId: string; amountInr: number }) {
  return (
    <button
      onClick={() => {
        // Hits a Route Handler (marks payment paid, sends email, then
        // redirects server-side) - a real HTTP navigation is required,
        // not a client-side page transition.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/api/payments/mock/confirm?bookingId=${bookingId}`;
      }}
      className="mt-6 w-full rounded-lg bg-primary text-on-primary py-3.5 text-sm font-semibold"
    >
      Pay ₹{amountInr}
    </button>
  );
}
