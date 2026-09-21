import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createFreeformBookingRequest, BookingError } from "@/lib/bookings";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  serviceId: z.string().uuid(),
  requestedStartsAt: z.string(), // ISO datetime from a local <input type="datetime-local">
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(20).optional(),
  couponCode: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const booking = await createFreeformBookingRequest({ ...parsed.data, userId: user?.id });
    return NextResponse.json({ bookingId: booking.id });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("Unexpected error creating booking request", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
