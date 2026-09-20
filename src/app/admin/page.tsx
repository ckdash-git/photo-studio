import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboard() {
  await requireAdmin();
  const db = createAdminClient();

  const [{ count: activeServices }, { count: openSlots }, { count: pendingBookings }, { count: openRequirements }] =
    await Promise.all([
      db.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
      db.from("slots").select("*", { count: "exact", head: true }).eq("is_booked", false),
      db.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending_payment"),
      db.from("requirements").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);

  const stats = [
    { label: "Active services", value: activeServices ?? 0 },
    { label: "Open slots", value: openSlots ?? 0 },
    { label: "Pending payments", value: pendingBookings ?? 0 },
    { label: "Open requirements", value: openRequirements ?? 0 },
  ];

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Admin</h1>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-hairline p-4">
            <p className="text-2xl font-semibold text-ink">{s.value}</p>
            <p className="text-xs text-stone mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/admin/services"
          className="block rounded-lg border border-hairline p-4 hover:shadow-md transition-shadow"
        >
          <p className="font-medium text-ink">Services &amp; slots</p>
          <p className="text-sm text-stone mt-0.5">Create sessions, manage bookable time slots</p>
        </Link>
        <Link
          href="/admin/coupons"
          className="block rounded-lg border border-hairline p-4 hover:shadow-md transition-shadow"
        >
          <p className="font-medium text-ink">Coupons</p>
          <p className="text-sm text-stone mt-0.5">Create and manage discount codes</p>
        </Link>
        <Link
          href="/admin/referrals"
          className="block rounded-lg border border-hairline p-4 hover:shadow-md transition-shadow"
        >
          <p className="font-medium text-ink">Referral program</p>
          <p className="text-sm text-stone mt-0.5">Reward settings, signups, conversions</p>
        </Link>
      </div>
    </main>
  );
}
