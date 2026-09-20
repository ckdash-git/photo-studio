import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function BecomePhotographerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id, display_name, bio, city, categories")
    .eq("user_id", user.id)
    .maybeSingle();

  let portfolio: { id: string; image_url: string; caption: string | null }[] = [];
  if (photographer) {
    const { data } = await supabase
      .from("portfolio_items")
      .select("id, image_url, caption")
      .eq("photographer_id", photographer.id)
      .order("sort_order", { ascending: true });
    portfolio = data ?? [];
  }

  return (
    <main className="flex-1 mx-auto max-w-xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">
        {photographer ? "Edit your profile" : "List yourself as a photographer"}
      </h1>
      <p className="mt-2 text-slate">
        Your name, phone, and email are never shown publicly. Customers see
        only your display name, city, categories, bio, and portfolio.
      </p>
      <ProfileForm existingPhotographer={photographer} existingPortfolio={portfolio} />
    </main>
  );
}
