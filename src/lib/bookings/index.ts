import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

export interface CreateBookingInput {
  serviceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  couponCode?: string;
}

export class BookingError extends Error {}

export async function createBooking(input: CreateBookingInput) {
  const db = createAdminClient();

  const { data: service, error: serviceError } = await db
    .from("services")
    .select("id, name, price_inr, is_active")
    .eq("id", input.serviceId)
    .single();

  if (serviceError || !service || !service.is_active) {
    throw new BookingError("Service not found or unavailable");
  }

  const { data: slot, error: slotError } = await db
    .from("slots")
    .select("id, service_id, starts_at, is_booked")
    .eq("id", input.slotId)
    .single();

  if (slotError || !slot || slot.service_id !== service.id) {
    throw new BookingError("Slot not found");
  }
  if (slot.is_booked) {
    throw new BookingError("This slot was just booked by someone else - please pick another");
  }

  let discountInr = 0;
  let couponId: string | null = null;

  if (input.couponCode) {
    const { data: coupon } = await db
      .from("coupons")
      .select("*")
      .eq("code", input.couponCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (!coupon) {
      throw new BookingError("Invalid or expired coupon code");
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new BookingError("This coupon has expired");
    }
    if (coupon.max_redemptions !== null && coupon.redemptions_count >= coupon.max_redemptions) {
      throw new BookingError("This coupon has reached its redemption limit");
    }

    discountInr = coupon.percent_off
      ? Math.round((service.price_inr * coupon.percent_off) / 100)
      : coupon.amount_off_inr;
    couponId = coupon.id;
  }

  const subtotalInr = service.price_inr;
  const totalInr = Math.max(0, subtotalInr - discountInr);

  // Atomic slot lock: only succeeds if the slot is still unbooked at write
  // time. This is what actually prevents double-booking, not the read above
  // (which can race). If 0 rows come back, someone else grabbed it first.
  const { data: lockedSlot } = await db
    .from("slots")
    .update({ is_booked: true })
    .eq("id", slot.id)
    .eq("is_booked", false)
    .select()
    .single();

  if (!lockedSlot) {
    throw new BookingError("This slot was just booked by someone else - please pick another");
  }

  const { data: booking, error: bookingError } = await db
    .from("bookings")
    .insert({
      slot_id: slot.id,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      coupon_id: couponId,
      subtotal_inr: subtotalInr,
      discount_inr: discountInr,
      total_inr: totalInr,
      status: "pending_payment",
    })
    .select()
    .single();

  if (bookingError || !booking) {
    // Release the slot lock since the booking row failed to create.
    await db.from("slots").update({ is_booked: false }).eq("id", slot.id);
    throw new BookingError("Could not create booking, please try again");
  }

  if (couponId) {
    // Non-fatal if this fails: worst case a coupon's redemption count
    // under-counts by one. See supabase/migrations/0002_coupon_redemption_fn.sql
    const { error } = await db.rpc("increment_coupon_redemption", { coupon_id_input: couponId });
    if (error) console.error("Failed to increment coupon redemption count", error);
  }

  const provider = getPaymentProvider();
  const order = await provider.createOrder({
    bookingId: booking.id,
    amountInr: totalInr,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
  });

  await db.from("payments").insert({
    booking_id: booking.id,
    provider: provider.name,
    provider_order_id: order.providerOrderId,
    amount_inr: totalInr,
    status: "created",
  });

  return { booking, redirectUrl: order.redirectUrl };
}
