import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageGradientBg } from "../page-gradient-bg";

export const metadata: Metadata = { title: "Welcome, photographer" };

function Step({
  number,
  title,
  description,
  cta,
  href,
}: {
  number: number;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-hairline p-5">
      <div className="h-8 w-8 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-slate">{description}</p>
        <Link href={href} className="mt-3 inline-block text-sm font-semibold text-ink underline">
          {cta} →
        </Link>
      </div>
    </div>
  );
}

export default async function PhotographerOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!photographer) redirect("/become-a-photographer");

  return (
    <main className="flex-1 relative overflow-hidden mx-auto max-w-2xl w-full px-6 py-16">
      <PageGradientBg variant="cool" />
      <h1 className="text-3xl font-semibold text-ink">Welcome to QuickPic</h1>
      <p className="mt-2 text-slate">
        Your profile is live. Here&apos;s how getting booked actually works.
      </p>

      <div className="mt-8 rounded-lg border border-hairline bg-canvas p-5 space-y-3 text-sm text-slate">
        <p>
          <span className="font-semibold text-ink">There are two ways customers find you:</span>{" "}
          they can book a session you&apos;ve listed directly, or they post what they need and
          you send a quote. You don&apos;t have to use both.
        </p>
        <p>
          <span className="font-semibold text-ink">Your contact details stay private.</span>{" "}
          Your phone number and email are never shown on your public profile - customers and
          photographers connect through the platform until a booking is confirmed.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Step
          number={1}
          title="Add portfolio photos"
          description="Profiles with real work shown get picked far more often than empty ones. A handful of your best shots is enough to start."
          cta="Add photos"
          href="/become-a-photographer"
        />
        <Step
          number={2}
          title="List a session you can shoot"
          description="Set your own name, price, and duration. Customers can book it directly, on your own availability - no back-and-forth needed."
          cta="Create a session"
          href="/my-services"
        />
        <Step
          number={3}
          title="Or respond to what customers are posting"
          description="Browse open requests and send a quote. This needs a lead access subscription to unlock - your call whether it's worth it for your area."
          cta="See how it works"
          href="/lead-access"
        />
      </div>

      <div className="mt-8 text-center">
        <Link href="/account" className="text-sm text-stone underline">
          Skip for now, I&apos;ll figure it out
        </Link>
      </div>
    </main>
  );
}
