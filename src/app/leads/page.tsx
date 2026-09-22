import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyPhotographerAndAccess } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { PageGradientBg } from "../page-gradient-bg";

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
    <main className="flex-1 relative overflow-hidden mx-auto max-w-3xl w-full px-6 py-16">
      <PageGradientBg variant="cool" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Open leads</h1>
        <span className="text-sm text-stone">{requirements?.length ?? 0} open</span>
      </div>
      <div className="mt-8 space-y-3">
        {!requirements || requirements.length === 0 ? (
          <div className="text-center py-16 text-stone">
            <p>No open requirements right now.</p>
            <p className="text-sm mt-1">Check back soon - new jobs show up here as customers post them.</p>
          </div>
        ) : (
          requirements.map((r) => (
            <Link
              key={r.id}
              href={`/leads/${r.id}`}
              className="block rounded-lg border border-hairline p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-slate">
                  {r.category}
                </span>
                <span className="text-xs text-stone shrink-0">{timeAgo(r.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-slate line-clamp-2">{r.description}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-stone">
                <span>{r.city}</span>
                {(r.budget_min_inr || r.budget_max_inr) && (
                  <span>₹{r.budget_min_inr ?? "?"} - ₹{r.budget_max_inr ?? "?"}</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
