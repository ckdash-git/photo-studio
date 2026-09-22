import { LegalPageLayout } from "../legal-page-layout";

export const metadata = { title: "Refund & Cancellation Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy">
      <section>
        <h2 className="text-base font-semibold text-ink">Directly booked sessions</h2>
        <p className="mt-2">
          Cancel more than 24 hours before your session for a full refund.
          Cancellations within 24 hours of the session, or no-shows, are
          not refunded. Refunds are processed back to your original
          payment method.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">Coupons and discounts</h2>
        <p className="mt-2">
          A coupon discount applied to a cancelled-and-refunded booking is
          not separately refunded or reissued.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">Photographer marketplace bookings</h2>
        <p className="mt-2">
          Once you accept a photographer&apos;s proposal, cancellation
          terms are between you and that photographer. QuickPic will help
          mediate disputes but is not a party to that agreement.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">Photographer lead access fees</h2>
        <p className="mt-2">
          Lead access subscription fees paid by photographers are
          non-refundable once the billing period has started.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">How to request a refund</h2>
        <p className="mt-2">
          Contact us with your booking ID and we&apos;ll process eligible
          refunds within 5-7 business days.
        </p>
      </section>
    </LegalPageLayout>
  );
}
