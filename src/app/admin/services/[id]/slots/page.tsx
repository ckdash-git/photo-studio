import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { GenerateSlotsForm } from "./generate-form";
import { DeleteSlotButton } from "./delete-button";

export default async function ServiceSlotsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();

  const { data: service } = await db.from("services").select("id, name").eq("id", id).single();
  if (!service) notFound();

  const { data: slots } = await db
    .from("slots")
    .select("id, starts_at, is_booked")
    .eq("service_id", id)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Slots &middot; {service.name}</h1>

      <div className="mt-8 rounded-lg border border-hairline p-5">
        <h2 className="text-sm font-semibold text-ink">Generate slots</h2>
        <GenerateSlotsForm serviceId={service.id} />
      </div>

      <h2 className="mt-10 text-sm font-semibold text-ink">
        Upcoming ({slots?.length ?? 0})
      </h2>
      <div className="mt-3 space-y-2">
        {!slots || slots.length === 0 ? (
          <p className="text-stone text-sm">No upcoming slots. Generate some above.</p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-md border border-hairline px-4 py-2.5"
            >
              <span className="text-sm text-ink">
                {new Date(slot.starts_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Kolkata",
                })}
              </span>
              {slot.is_booked ? (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-stone">Booked</span>
              ) : (
                <DeleteSlotButton id={slot.id} serviceId={service.id} />
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
