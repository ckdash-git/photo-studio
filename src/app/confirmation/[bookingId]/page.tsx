import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_name, total_inr, status, slots(starts_at, services(name))")
    .eq("id", bookingId)
    .single();

  if (!booking) notFound();

  const slot = booking.slots as unknown as { starts_at: string; services: { name: string } };
  const isConfirmed = booking.status === "confirmed";

  return (
    <main className="flex-1 mx-auto max-w-md w-full px-6 py-24 text-center">
      <div
        className={`inline-flex h-14 w-14 items-center justify-center rounded-lg ${
          isConfirmed ? "bg-success-bg" : "bg-surface"
        }`}
      >
        <span className={`text-2xl ${isConfirmed ? "text-success-text" : "text-stone"}`}>
          {isConfirmed ? "✓" : "…"}
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-ink">
        {isConfirmed ? "Booking confirmed" : "Payment pending"}
      </h1>
      <p className="mt-2 text-slate">
        {isConfirmed
          ? `${booking.customer_name}, your session is booked. A confirmation email is on its way.`
          : "We haven't received your payment yet. Refresh this page in a moment."}
      </p>

      <div className="mt-8 rounded-lg border border-hairline p-5 text-left text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-stone">Session</span>
          <span className="text-ink font-medium">{slot.services.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone">Date & time</span>
          <span className="text-ink font-medium">
            {new Date(slot.starts_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Kolkata",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone">Amount paid</span>
          <span className="text-ink font-medium">₹{booking.total_inr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone">Booking ID</span>
          <span className="text-ink font-mono text-xs">{booking.id}</span>
        </div>
      </div>
    </main>
  );
}
