import { requireAdmin } from "@/lib/admin/auth";
import { ServiceForm } from "../service-form";

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <main className="flex-1 mx-auto max-w-xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">New service</h1>
      <ServiceForm />
    </main>
  );
}
