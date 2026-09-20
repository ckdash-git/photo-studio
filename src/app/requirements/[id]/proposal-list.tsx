"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Proposal {
  id: string;
  quoted_price_inr: number;
  message: string;
  status: string;
  photographer_id: string;
  photographers: { display_name: string } | { display_name: string }[];
}

export function ProposalList({
  requirementId,
  requirementStatus,
  proposals,
}: {
  requirementId: string;
  requirementStatus: string;
  proposals: Proposal[];
}) {
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function handleAccept(proposalId: string) {
    setAcceptingId(proposalId);
    const supabase = createClient();

    // Accept this one, decline the rest, close the requirement. Not wrapped
    // in a DB transaction (client-side can't do that) - acceptable for now
    // since a partial failure here just means a stray "pending" row, not
    // money or data loss. Revisit once this becomes a server route.
    await supabase.from("proposals").update({ status: "accepted" }).eq("id", proposalId);
    await supabase
      .from("proposals")
      .update({ status: "declined" })
      .eq("requirement_id", requirementId)
      .neq("id", proposalId);
    await supabase.from("requirements").update({ status: "closed" }).eq("id", requirementId);

    setAcceptingId(null);
    router.refresh();
  }

  if (proposals.length === 0) {
    return <p className="mt-4 text-stone">No proposals yet.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {proposals.map((p) => {
        const photographer = Array.isArray(p.photographers) ? p.photographers[0] : p.photographers;
        return (
          <div key={p.id} className="rounded-lg border border-hairline p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{photographer?.display_name}</span>
              <span className="font-medium text-ink">₹{p.quoted_price_inr}</span>
            </div>
            <p className="mt-1 text-sm text-slate">{p.message}</p>
            {requirementStatus === "open" && p.status === "pending" ? (
              <button
                onClick={() => handleAccept(p.id)}
                disabled={acceptingId === p.id}
                className="mt-3 rounded-md bg-primary text-on-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {acceptingId === p.id ? "Accepting..." : "Accept"}
              </button>
            ) : (
              <p className="mt-2 text-xs text-stone uppercase">{p.status}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
