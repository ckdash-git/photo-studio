import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequestActions } from "./request-actions";

export default async function BookingRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS policy "photographers see bookings on their services" (0011)
  // scopes this to only the current photographer's own bookings.
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, customer_name, total_inr, requested_starts_at, services(name)")
    .not("service_id", "is", null)
    .order("created_at", { ascending: false });

  const pending = bookings?.filter((b) => b.status === "pending_confirmation") ?? [];
  const others = bookings?.filter((b) => b.status !== "pending_confirmation") ?? [];

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Booking requests</h1>

      <h2 className="mt-8 text-sm font-semibold text-ink">
        Awaiting your response ({pending.length})
      </h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 ? (
          <p className="text-stone text-sm">Nothing waiting on you right now.</p>
        ) : (
          pending.map((b) => {
            const service = b.services as unknown as { name: string } | null;
            return (
              <div key={b.id} className="rounded-lg border border-hairline p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{service?.name}</span>
                  <span className="text-ink font-medium">₹{b.total_inr}</span>
                </div>
                <p className="mt-1 text-sm text-slate">{b.customer_name}</p>
                {b.requested_starts_at && (
                  <p className="text-sm text-stone">
                    Requested:{" "}
                    {new Date(b.requested_starts_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                )}
                <RequestActions bookingId={b.id} />
              </div>
            );
          })
        )}
      </div>

      {others.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold text-ink">History</h2>
          <div className="mt-3 space-y-2">
            {others.map((b) => {
              const service = b.services as unknown as { name: string } | null;
              return (
                <div key={b.id} className="flex items-center justify-between rounded-md border border-hairline px-4 py-2.5">
                  <span className="text-sm text-ink">
                    {service?.name} &middot; {b.customer_name}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-stone uppercase">
                    {b.status}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
