import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProposalList } from "./proposal-list";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: requirement } = await supabase
    .from("requirements")
    .select("id, category, city, description, status, customer_user_id")
    .eq("id", id)
    .single();
  if (!requirement || requirement.customer_user_id !== user.id) notFound();

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, quoted_price_inr, message, status, photographer_id, photographers(display_name)")
    .eq("requirement_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">{requirement.category}</h1>
      <p className="text-sm text-stone mt-1">{requirement.city}</p>
      <p className="mt-4 text-slate">{requirement.description}</p>

      <h2 className="mt-10 text-lg font-semibold text-ink">
        Proposals ({proposals?.length ?? 0})
      </h2>
      <ProposalList
        requirementId={requirement.id}
        requirementStatus={requirement.status}
        proposals={proposals ?? []}
      />
    </main>
  );
}
