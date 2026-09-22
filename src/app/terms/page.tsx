import { LegalPageLayout } from "../legal-page-layout";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <section>
        <h2 className="text-base font-semibold text-ink">1. What QuickPic is</h2>
        <p className="mt-2">
          QuickPic is a platform that lets customers book photo shoot
          sessions directly and connects customers with independent
          photographers for custom requirements. QuickPic is not itself a
          photography service - photographers listed on the platform are
          independent, and any photography session is a service they
          provide, not QuickPic.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">2. Accounts</h2>
        <p className="mt-2">
          You&apos;re responsible for the accuracy of information you
          provide and for activity under your account. You must be at
          least 18 to create an account or make a booking.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">3. Bookings and payments</h2>
        <p className="mt-2">
          Payments for directly listed sessions are processed through our
          payment provider. See our{" "}
          <a href="/refund-policy" className="underline">Refund &amp; Cancellation Policy</a>{" "}
          for how cancellations and refunds work.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">4. Photographer marketplace</h2>
        <p className="mt-2">
          Photographers who list themselves on QuickPic are independent
          contractors, not employees or agents of QuickPic. Contact
          details are not shown publicly; photographers and customers
          connect through the platform. Attempting to circumvent the
          platform to arrange payment or contact outside QuickPic may
          result in account suspension.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">5. Conduct</h2>
        <p className="mt-2">
          You agree not to use QuickPic for unlawful purposes, to harass
          other users, or to post false or misleading information in a
          profile, requirement, or proposal.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">6. Limitation of liability</h2>
        <p className="mt-2">
          QuickPic facilitates bookings and connections but is not a party
          to the photography service itself. To the extent permitted by
          law, QuickPic is not liable for the quality, timeliness, or
          outcome of a photography session arranged through the platform.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">7. Changes</h2>
        <p className="mt-2">
          These terms may be updated from time to time. Continued use of
          QuickPic after a change means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">8. Governing law</h2>
        <p className="mt-2">These terms are governed by the laws of India.</p>
      </section>
    </LegalPageLayout>
  );
}
