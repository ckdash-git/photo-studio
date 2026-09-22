import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/app/sign-out-button";
import { PageGradientBg } from "../page-gradient-bg";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, total_inr, created_at, requested_starts_at, slots(starts_at, services(name)), services(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 relative overflow-hidden mx-auto max-w-2xl w-full px-6 py-16">
      <PageGradientBg />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">My bookings</h1>
        <SignOutButton />
      </div>

      <div className="mt-8 space-y-3">
        {!bookings || bookings.length === 0 ? (
          <p className="text-stone">
            No bookings yet on this account. Bookings you make while logged
            out won&apos;t show up here.
          </p>
        ) : (
          bookings.map((booking) => {
            const slotJoin = booking.slots as unknown as { starts_at: string; services: { name: string } } | null;
            const directService = booking.services as unknown as { name: string } | null;
            const serviceName = slotJoin?.services.name ?? directService?.name ?? "Session";
            const startsAt = slotJoin ? slotJoin.starts_at : booking.requested_starts_at;

            return (
              <div key={booking.id} className="rounded-lg border border-hairline p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{serviceName}</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      booking.status === "confirmed"
                        ? "bg-success-bg text-success-text"
                        : "bg-surface text-stone"
                    }`}
                  >
                    {booking.status === "pending_confirmation" ? "awaiting photographer" : booking.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate">
                  {startsAt &&
                    new Date(startsAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                  &middot; ₹{booking.total_inr}
                </p>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
