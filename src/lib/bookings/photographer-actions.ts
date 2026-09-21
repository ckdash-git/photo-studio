"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { acceptFreeformBooking, declineFreeformBooking, BookingError } from "./index";

async function requirePhotographerUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new BookingError("Not logged in");
  return user;
}

export async function acceptBookingRequest(bookingId: string): Promise<{ error?: string }> {
  try {
    const user = await requirePhotographerUser();
    await acceptFreeformBooking(bookingId, user.id);
    revalidatePath("/my-services/requests");
    return {};
  } catch (err) {
    return { error: err instanceof BookingError ? err.message : "Something went wrong" };
  }
}

export async function declineBookingRequest(bookingId: string): Promise<{ error?: string }> {
  try {
    const user = await requirePhotographerUser();
    await declineFreeformBooking(bookingId, user.id);
    revalidatePath("/my-services/requests");
    return {};
  } catch (err) {
    return { error: err instanceof BookingError ? err.message : "Something went wrong" };
  }
}
