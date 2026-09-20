import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ServiceForm } from "../../service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const db = createAdminClient();
  const { data: service } = await db
    .from("services")
    .select("id, name, description, duration_minutes, price_inr")
    .eq("id", id)
    .single();

  if (!service) notFound();

  return (
    <main className="flex-1 mx-auto max-w-xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Edit service</h1>
      <ServiceForm existing={service} />
    </main>
  );
}
