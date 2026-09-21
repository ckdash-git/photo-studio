import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PayButton } from "./pay-button";

export default async function PayPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const db = createAdminClient();

  const { data: booking } = await db
    .from("bookings")
    .select("id, status, total_inr, customer_name, requested_starts_at, services(name)")
    .eq("id", bookingId)
    .single();

  if (!booking) notFound();

  const service = booking.services as unknown as { name: string } | null;

  if (booking.status !== "pending_payment") {
    return (
      <main className="flex-1 mx-auto max-w-md w-full px-6 py-24 text-center">
        <p className="text-slate">
          {booking.status === "confirmed"
            ? "This booking is already paid and confirmed."
            : "This booking isn't awaiting payment right now."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Complete your payment</h1>
      <div className="mt-6 rounded-lg border border-hairline p-5 text-left text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-stone">Session</span>
          <span className="text-ink font-medium">{service?.name}</span>
        </div>
        {booking.requested_starts_at && (
          <div className="flex justify-between">
            <span className="text-stone">Requested time</span>
            <span className="text-ink font-medium">
              {new Date(booking.requested_starts_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone">Amount</span>
          <span className="text-ink font-medium">₹{booking.total_inr}</span>
        </div>
      </div>
      <PayButton bookingId={booking.id} amountInr={booking.total_inr} />
    </main>
  );
}
