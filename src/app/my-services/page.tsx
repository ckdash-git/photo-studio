import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ServiceListEditor } from "./service-list-editor";

export default async function MyServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!photographer) {
    return (
      <main className="flex-1 mx-auto max-w-lg w-full px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Set up your profile first</h1>
        <p className="mt-2 text-slate">
          You need a photographer profile before you can list bookable sessions.
        </p>
        <a href="/become-a-photographer" className="mt-6 inline-block text-ink underline">
          Create your profile
        </a>
      </main>
    );
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, name, description, duration_minutes, price_inr, is_active")
    .eq("photographer_id", photographer.id)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Your bookable sessions</h1>
      <p className="mt-2 text-slate">
        Customers pick a date and time that works for them, then you accept
        or decline based on your own availability - no fixed slots to set up.
      </p>

      <ServiceListEditor photographerId={photographer.id} existingServices={services ?? []} />
    </main>
  );
}
