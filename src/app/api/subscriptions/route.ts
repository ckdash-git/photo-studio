import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { LEAD_ACCESS_PRICE_INR } from "@/lib/subscriptions";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Log in first" }, { status: 401 });
  }

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!photographer) {
    return NextResponse.json({ error: "Create your photographer profile first" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: subscription, error } = await db
    .from("photographer_subscriptions")
    .insert({
      photographer_id: photographer.id,
      amount_inr: LEAD_ACCESS_PRICE_INR,
      status: "pending_payment",
      provider_order_id: "pending", // replaced right after with the real order id
    })
    .select()
    .single();

  if (error || !subscription) {
    console.error("Failed to create subscription row:", error?.message);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }

  const provider = getPaymentProvider();
  const order = await provider.createOrder({
    bookingId: subscription.id, // reused as a generic reference id for the mock redirect
    amountInr: LEAD_ACCESS_PRICE_INR,
    customerName: user.email ?? "photographer",
    customerEmail: user.email ?? "",
  });

  await db
    .from("photographer_subscriptions")
    .update({ provider_order_id: order.providerOrderId })
    .eq("id", subscription.id);

  // Mock provider's redirectUrl points at /api/payments/mock/confirm?bookingId=...
  // which knows nothing about subscriptions. Point it at our own confirm route
  // instead, keeping the two flows independent.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  return NextResponse.json({
    redirectUrl: `${siteUrl}/api/subscriptions/mock/confirm?subscriptionId=${subscription.id}`,
  });
}
