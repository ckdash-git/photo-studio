import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking, BookingError } from "@/lib/bookings";

const bodySchema = z.object({
  serviceId: z.string().uuid(),
  slotId: z.string().uuid(),
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

  try {
    const { booking, redirectUrl } = await createBooking(parsed.data);
    return NextResponse.json({ bookingId: booking.id, redirectUrl });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("Unexpected error creating booking", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
