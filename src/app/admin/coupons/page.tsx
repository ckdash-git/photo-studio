import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ToggleCouponButton } from "./toggle-button";

export default async function AdminCouponsPage() {
  await requireAdmin();
  const db = createAdminClient();
  const { data: coupons } = await db
    .from("coupons")
    .select("id, code, percent_off, amount_off_inr, max_redemptions, redemptions_count, expires_at, is_active")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Coupons</h1>
        <Link href="/admin/coupons/new" className="rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-semibold">
          + New coupon
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {!coupons || coupons.length === 0 ? (
          <p className="text-stone">No coupons yet.</p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="rounded-lg border border-hairline p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono font-medium text-ink">{c.code}</p>
                <p className="text-sm text-stone mt-0.5">
                  {c.percent_off ? `${c.percent_off}% off` : `₹${c.amount_off_inr} off`}
                  {" · "}
                  {c.redemptions_count}
                  {c.max_redemptions ? ` / ${c.max_redemptions}` : ""} used
                  {c.expires_at &&
                    ` · expires ${new Date(c.expires_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}`}
                </p>
              </div>
              <ToggleCouponButton id={c.id} isActive={c.is_active} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
