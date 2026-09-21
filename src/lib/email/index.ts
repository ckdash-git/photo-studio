import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface BookingConfirmationInput {
  to: string;
  customerName: string;
  serviceName: string;
  startsAt: Date;
  totalInr: number;
  bookingId: string;
}

export async function sendBookingConfirmation(input: BookingConfirmationInput) {
  if (!resend) {
    // No API key configured (e.g. local dev without .env.local set up) -
    // don't crash the booking flow over a missing email integration.
    console.warn("RESEND_API_KEY not set - skipping confirmation email", input.bookingId);
    return { skipped: true };
  }

  const formattedDate = input.startsAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "bookings@yourdomain.com",
    to: input.to,
    replyTo: process.env.RESEND_FROM_EMAIL,
    subject: `Booking confirmed: ${input.serviceName}`,
    text: `Hi ${input.customerName},

Your booking for ${input.serviceName} is confirmed.

Date & time: ${formattedDate}
Amount paid: ₹${input.totalInr}
Booking ID: ${input.bookingId}

See you then!
— QuickPic`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Your session is confirmed</h2>
        <p>Hi ${input.customerName},</p>
        <p>Your booking for <strong>${input.serviceName}</strong> is confirmed.</p>
        <table style="width: 100%; margin: 16px 0;">
          <tr><td style="color: #666;">Date & time</td><td>${formattedDate}</td></tr>
          <tr><td style="color: #666;">Amount paid</td><td>₹${input.totalInr}</td></tr>
          <tr><td style="color: #666;">Booking ID</td><td>${input.bookingId}</td></tr>
        </table>
        <p>See you then!</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— QuickPic</p>
      </div>
    `,
  });

  if (error) {
    console.error("sendBookingConfirmation failed:", error.message, "booking:", input.bookingId);
  }
  return { data, error };
}

export interface BookingAcceptedInput {
  to: string;
  customerName: string;
  serviceName: string;
  payUrl: string;
  totalInr: number;
}

export async function sendBookingAccepted(input: BookingAcceptedInput) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set - skipping booking-accepted email");
    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "bookings@yourdomain.com",
    to: input.to,
    replyTo: process.env.RESEND_FROM_EMAIL,
    subject: `Your request was accepted: ${input.serviceName}`,
    text: `Hi ${input.customerName},

Good news - your request for ${input.serviceName} was accepted. Complete payment to confirm your booking:

${input.payUrl}

Amount: ₹${input.totalInr}

— QuickPic`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Your request was accepted</h2>
        <p>Hi ${input.customerName},</p>
        <p>Your request for <strong>${input.serviceName}</strong> was accepted. Complete payment to confirm your booking.</p>
        <p style="margin: 24px 0;">
          <a href="${input.payUrl}" style="background: #0A0A0A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Pay ₹${input.totalInr}
          </a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">— QuickPic</p>
      </div>
    `,
  });

  if (error) {
    console.error("sendBookingAccepted failed:", error.message);
  }
  return { data, error };
}
