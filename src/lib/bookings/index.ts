import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateBookingInput {
  serviceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  couponCode?: string;
  userId?: string;
}

export class BookingError extends Error {}

async function validateCoupon(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: SupabaseClient<any>,
  couponCode: string,
  priceInr: number,
  userId?: string,
): Promise<{ discountInr: number; couponId: string }> {
  const { data: coupon } = await db
    .from("coupons")
    .select("*")
    .eq("code", couponCode.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!coupon) {
    throw new BookingError("Invalid or expired coupon code");
  }
  if (coupon.restricted_to_user_id && coupon.restricted_to_user_id !== userId) {
    throw new BookingError("This coupon isn't valid for your account");
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new BookingError("This coupon has expired");
  }
  if (coupon.max_redemptions !== null && coupon.redemptions_count >= coupon.max_redemptions) {
    throw new BookingError("This coupon has reached its redemption limit");
  }

  const discountInr = coupon.percent_off
    ? Math.round((priceInr * coupon.percent_off) / 100)
    : coupon.amount_off_inr;

  return { discountInr, couponId: coupon.id };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function incrementCouponRedemption(db: SupabaseClient<any>, couponId: string) {
  // Non-fatal if this fails: worst case a coupon's redemption count
  // under-counts by one. See supabase/migrations/0002_coupon_redemption_fn.sql
  const { error } = await db.rpc("increment_coupon_redemption", { coupon_id_input: couponId });
  if (error) console.error("Failed to increment coupon redemption count", error);
}

export async function createBooking(input: CreateBookingInput) {
  const db = createAdminClient();

  const { data: service, error: serviceError } = await db
    .from("services")
    .select("id, name, price_inr, is_active")
    .eq("id", input.serviceId)
    .single();

  if (serviceError || !service || !service.is_active) {
    if (serviceError) console.error("createBooking: service lookup failed:", serviceError.message);
    throw new BookingError("Service not found or unavailable");
  }

  const { data: slot, error: slotError } = await db
    .from("slots")
    .select("id, service_id, starts_at, is_booked")
    .eq("id", input.slotId)
    .single();

  if (slotError || !slot || slot.service_id !== service.id) {
    if (slotError) console.error("createBooking: slot lookup failed:", slotError.message);
    throw new BookingError("Slot not found");
  }
  if (slot.is_booked) {
    throw new BookingError("This slot was just booked by someone else - please pick another");
  }

  let discountInr = 0;
  let couponId: string | null = null;

  if (input.couponCode) {
    const result = await validateCoupon(db, input.couponCode, service.price_inr, input.userId);
    discountInr = result.discountInr;
    couponId = result.couponId;
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
      user_id: input.userId ?? null,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    if (bookingError) console.error("createBooking: insert failed:", bookingError.message);
    // Release the slot lock since the booking row failed to create.
    await db.from("slots").update({ is_booked: false }).eq("id", slot.id);
    throw new BookingError("Could not create booking, please try again");
  }

  if (couponId) {
    await incrementCouponRedemption(db, couponId);
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

// ---- Free-form marketplace bookings (photographer-owned services) ----

export interface CreateFreeformBookingInput {
  serviceId: string;
  requestedStartsAt: string; // ISO string
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  couponCode?: string;
  userId?: string;
}

/**
 * Unlike createBooking, this doesn't create a payment order yet - it's a
 * request awaiting the photographer's acceptance (they know their own
 * real availability; there's no slot to lock against). Payment happens
 * after they accept, see acceptFreeformBooking below.
 */
export async function createFreeformBookingRequest(input: CreateFreeformBookingInput) {
  const db = createAdminClient();

  const { data: service, error: serviceError } = await db
    .from("services")
    .select("id, name, price_inr, duration_minutes, photographer_id, is_active")
    .eq("id", input.serviceId)
    .single();

  if (serviceError || !service || !service.is_active || !service.photographer_id) {
    throw new BookingError("Service not found or unavailable");
  }

  const requestedDate = new Date(input.requestedStartsAt);
  if (isNaN(requestedDate.getTime()) || requestedDate < new Date()) {
    throw new BookingError("Please pick a valid future date and time");
  }

  let discountInr = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const result = await validateCoupon(db, input.couponCode, service.price_inr, input.userId);
    discountInr = result.discountInr;
    couponId = result.couponId;
  }

  const subtotalInr = service.price_inr;
  const totalInr = Math.max(0, subtotalInr - discountInr);

  const { data: booking, error: bookingError } = await db
    .from("bookings")
    .insert({
      service_id: service.id,
      requested_starts_at: requestedDate.toISOString(),
      requested_duration_minutes: service.duration_minutes,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      coupon_id: couponId,
      subtotal_inr: subtotalInr,
      discount_inr: discountInr,
      total_inr: totalInr,
      status: "pending_confirmation",
      user_id: input.userId ?? null,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    if (bookingError) console.error("createFreeformBookingRequest: insert failed:", bookingError.message);
    throw new BookingError("Could not send your request, please try again");
  }

  if (couponId) {
    await incrementCouponRedemption(db, couponId);
  }

  return booking;
}

// ---- Photographer accept/decline for free-form booking requests ----

async function assertPhotographerOwnsBooking(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: SupabaseClient<any>,
  bookingId: string,
  photographerUserId: string,
) {
  const { data: booking } = await db
    .from("bookings")
    .select("id, status, service_id, services(photographer_id, name, photographers(user_id))")
    .eq("id", bookingId)
    .single();

  if (!booking) throw new BookingError("Booking not found");

  const service = booking.services as unknown as {
    photographer_id: string;
    name: string;
    photographers: { user_id: string };
  };
  if (!service?.photographers || service.photographers.user_id !== photographerUserId) {
    throw new BookingError("You don't have permission to manage this booking");
  }

  return { booking, serviceName: service.name };
}

export async function acceptFreeformBooking(bookingId: string, photographerUserId: string) {
  const db = createAdminClient();
  const { booking, serviceName } = await assertPhotographerOwnsBooking(db, bookingId, photographerUserId);

  if (booking.status !== "pending_confirmation") {
    throw new BookingError("This request has already been handled");
  }

  const { data: fullBooking } = await db
    .from("bookings")
    .select("total_inr, customer_name, customer_email, customer_phone")
    .eq("id", bookingId)
    .single();
  if (!fullBooking) throw new BookingError("Booking not found");

  const provider = getPaymentProvider();
  const order = await provider.createOrder({
    bookingId,
    amountInr: fullBooking.total_inr,
    customerName: fullBooking.customer_name,
    customerEmail: fullBooking.customer_email,
    customerPhone: fullBooking.customer_phone ?? undefined,
  });

  await db.from("payments").insert({
    booking_id: bookingId,
    provider: provider.name,
    provider_order_id: order.providerOrderId,
    amount_inr: fullBooking.total_inr,
    status: "created",
  });

  await db.from("bookings").update({ status: "pending_payment" }).eq("id", bookingId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickpic.click";
  const { sendBookingAccepted } = await import("@/lib/email");
  await sendBookingAccepted({
    to: fullBooking.customer_email,
    customerName: fullBooking.customer_name,
    serviceName,
    payUrl: `${siteUrl}/pay/${bookingId}`,
    totalInr: fullBooking.total_inr,
  });
}

export async function declineFreeformBooking(bookingId: string, photographerUserId: string) {
  const db = createAdminClient();
  const { booking } = await assertPhotographerOwnsBooking(db, bookingId, photographerUserId);

  if (booking.status !== "pending_confirmation") {
    throw new BookingError("This request has already been handled");
  }

  await db.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
}
