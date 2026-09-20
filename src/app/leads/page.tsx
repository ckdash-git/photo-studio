import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyPhotographerAndAccess } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const access = await getMyPhotographerAndAccess();
  if (!access) redirect("/login");
  if (!access.photographer) redirect("/become-a-photographer");
  if (!access.hasAccess) redirect("/lead-access");

  const supabase = await createClient();
  const { data: requirements } = await supabase
    .from("requirements")
    .select("id, category, city, event_date, budget_min_inr, budget_max_inr, description, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Open leads</h1>
      <div className="mt-8 space-y-3">
        {!requirements || requirements.length === 0 ? (
          <p className="text-stone">No open requirements right now.</p>
        ) : (
          requirements.map((r) => (
            <Link
              key={r.id}
              href={`/leads/${r.id}`}
              className="block rounded-lg border border-hairline p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{r.category}</span>
                <span className="text-sm text-stone">{r.city}</span>
              </div>
              <p className="mt-1 text-sm text-slate line-clamp-2">{r.description}</p>
              {(r.budget_min_inr || r.budget_max_inr) && (
                <p className="mt-1 text-sm text-stone">
                  Budget: ₹{r.budget_min_inr ?? "?"} - ₹{r.budget_max_inr ?? "?"}
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
