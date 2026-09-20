export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-xs text-stone">
        Draft - not yet reviewed by a lawyer. Do not treat this as final or legally binding.
      </p>

      <div className="mt-8 space-y-6 text-sm text-slate">
        <section>
          <h2 className="text-base font-semibold text-ink">What we collect</h2>
          <p className="mt-2">
            Name, email, and phone number when you book a session, create an
            account, or list a photographer profile. Payment details are
            handled directly by our payment provider - we don&apos;t store
            card or UPI details ourselves.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">How we use it</h2>
          <p className="mt-2">
            To process bookings, send confirmation emails, connect customers
            with photographers, and improve the service. We don&apos;t sell
            your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">Photographer contact info</h2>
          <p className="mt-2">
            A photographer&apos;s phone number, email, and full name are
            never shown on their public profile. Customer contact details
            are similarly kept private from photographers until a booking
            or accepted proposal requires coordination.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">Cookies and analytics</h2>
          <p className="mt-2">
            We use basic analytics to understand how the site is used. If
            you arrive via an advertisement, ad platforms may use their own
            tracking pixels as disclosed in their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">Your data</h2>
          <p className="mt-2">
            You can request a copy of your data or ask us to delete your
            account by contacting us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">Contact</h2>
          <p className="mt-2">
            Questions about this policy: bookings@quickpic.click
          </p>
        </section>
      </div>
    </main>
  );
}
