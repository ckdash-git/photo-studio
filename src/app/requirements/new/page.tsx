import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequirementForm } from "./requirement-form";
import { PageGradientBg } from "@/app/page-gradient-bg";

export default async function NewRequirementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex-1 relative overflow-hidden mx-auto max-w-xl w-full px-6 py-16">
      <PageGradientBg />
      <h1 className="text-2xl font-semibold text-ink">Post what you need</h1>
      <p className="mt-2 text-slate">
        Photographers in your area will see this and send you quotes.
      </p>
      <RequirementForm />
    </main>
  );
}
