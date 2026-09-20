import { notFound, redirect } from "next/navigation";
import { getMyPhotographerAndAccess } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { ProposalForm } from "./proposal-form";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await getMyPhotographerAndAccess();
  if (!access) redirect("/login");
  if (!access.photographer) redirect("/become-a-photographer");
  if (!access.hasAccess) redirect("/lead-access");

  const supabase = await createClient();
  const { data: requirement } = await supabase
    .from("requirements")
    .select("id, category, city, event_date, budget_min_inr, budget_max_inr, description, status")
    .eq("id", id)
    .single();
  if (!requirement) notFound();

  const { data: existingProposal } = await supabase
    .from("proposals")
    .select("id, quoted_price_inr, message, status")
    .eq("requirement_id", id)
    .eq("photographer_id", access.photographer.id)
    .maybeSingle();

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">{requirement.category}</h1>
      <p className="text-sm text-stone mt-1">
        {requirement.city}
        {requirement.event_date &&
          ` · ${new Date(requirement.event_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}`}
      </p>
      {(requirement.budget_min_inr || requirement.budget_max_inr) && (
        <p className="text-sm text-stone">
          Budget: ₹{requirement.budget_min_inr ?? "?"} - ₹{requirement.budget_max_inr ?? "?"}
        </p>
      )}
      <p className="mt-4 text-slate">{requirement.description}</p>

      <div className="mt-10">
        {existingProposal ? (
          <div className="rounded-lg border border-hairline p-4">
            <p className="text-sm text-stone">Your proposal</p>
            <p className="mt-1 font-medium text-ink">₹{existingProposal.quoted_price_inr}</p>
            <p className="mt-1 text-sm text-slate">{existingProposal.message}</p>
            <p className="mt-2 text-xs text-stone uppercase">{existingProposal.status}</p>
          </div>
        ) : requirement.status === "open" ? (
          <ProposalForm requirementId={requirement.id} photographerId={access.photographer.id} />
        ) : (
          <p className="text-stone">This requirement is no longer open.</p>
        )}
      </div>
    </main>
  );
}
