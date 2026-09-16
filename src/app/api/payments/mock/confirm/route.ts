import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/email";

// Stands in for a real gateway's webhook + return_url. When Cashfree is
// wired in, this whole route is replaced by app/api/webhooks/cashfree
// (server-to-server, signature-verified) plus a plain return_url redirect.
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  if (!bookingId) {
    return NextResponse.redirect(`${siteUrl}/`);
  }

  const db = createAdminClient();

  const { data: booking } = await db
    .from("bookings")
    .select("*, slots(starts_at, services(name))")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.redirect(`${siteUrl}/`);
  }

  await db.from("payments").update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("booking_id", bookingId);
  await db.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);

  const slot = booking.slots as unknown as { starts_at: string; services: { name: string } };
  await sendBookingConfirmation({
    to: booking.customer_email,
    customerName: booking.customer_name,
    serviceName: slot.services.name,
    startsAt: new Date(slot.starts_at),
    totalInr: booking.total_inr,
    bookingId: booking.id,
  });

  return NextResponse.redirect(`${siteUrl}/confirmation/${bookingId}`);
}
