import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ToggleServiceButton } from "./toggle-button";

export default async function AdminServicesPage() {
  await requireAdmin();
  const db = createAdminClient();
  const { data: services } = await db
    .from("services")
    .select("id, name, price_inr, duration_minutes, is_active")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Services</h1>
        <Link href="/admin/services/new" className="rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-semibold">
          + New service
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {!services || services.length === 0 ? (
          <p className="text-stone">No services yet.</p>
        ) : (
          services.map((s) => (
            <div key={s.id} className="rounded-lg border border-hairline p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{s.name}</p>
                <p className="text-sm text-stone mt-0.5">
                  {s.duration_minutes} min &middot; ₹{s.price_inr}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/admin/services/${s.id}/slots`} className="text-sm font-medium text-ink underline">
                  Slots
                </Link>
                <Link href={`/admin/services/${s.id}/edit`} className="text-sm font-medium text-ink underline">
                  Edit
                </Link>
                <ToggleServiceButton id={s.id} isActive={s.is_active} />
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
