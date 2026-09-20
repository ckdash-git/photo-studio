import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyPhotographerAndAccess, LEAD_ACCESS_PRICE_INR } from "@/lib/subscriptions";
import { SubscribeButton } from "./subscribe-button";

export default async function LeadAccessPage() {
  const result = await getMyPhotographerAndAccess();
  if (!result) redirect("/login");

  if (!result.photographer) {
    return (
      <main className="flex-1 mx-auto max-w-lg w-full px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Set up your profile first</h1>
        <p className="mt-2 text-slate">
          You need a photographer profile before you can access leads.
        </p>
        <Link href="/become-a-photographer" className="mt-6 inline-block text-ink underline">
          Create your profile
        </Link>
      </main>
    );
  }

  if (result.hasAccess) {
    return (
      <main className="flex-1 mx-auto max-w-lg w-full px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">You have lead access</h1>
        <p className="mt-2 text-slate">
          Active until{" "}
          {new Date(result.expiresAt!).toLocaleDateString("en-IN", { dateStyle: "medium" })}.
        </p>
        <Link href="/leads" className="mt-6 inline-block text-ink underline">
          Browse leads
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 mx-auto max-w-lg w-full px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Get lead access</h1>
      <p className="mt-2 text-slate">
        ₹{LEAD_ACCESS_PRICE_INR}/month unlocks browsing and responding to
        customer requirements.
      </p>
      <SubscribeButton priceInr={LEAD_ACCESS_PRICE_INR} />
    </main>
  );
}
