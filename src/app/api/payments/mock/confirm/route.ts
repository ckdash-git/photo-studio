import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/email";
import { maybeRewardReferrer } from "@/lib/referrals";

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
    .select("*, slots(starts_at, services(name)), services(name)")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.redirect(`${siteUrl}/`);
  }

  await db.from("payments").update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("booking_id", bookingId);
  await db.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);

  await maybeRewardReferrer(booking.user_id);

  // Slot-based bookings carry the time via slots.starts_at; free-form
  // (marketplace) bookings carry it directly on the booking row via
  // requested_starts_at, with no slot at all.
  const slotJoin = booking.slots as unknown as { starts_at: string; services: { name: string } } | null;
  const directService = booking.services as unknown as { name: string } | null;

  const serviceName = slotJoin?.services.name ?? directService?.name ?? "your session";
  const startsAt = slotJoin ? new Date(slotJoin.starts_at) : new Date(booking.requested_starts_at);

  await sendBookingConfirmation({
    to: booking.customer_email,
    customerName: booking.customer_name,
    serviceName,
    startsAt,
    totalInr: booking.total_inr,
    bookingId: booking.id,
  });

  return NextResponse.redirect(`${siteUrl}/confirmation/${bookingId}`);
}
