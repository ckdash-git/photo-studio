import Link from "next/link";
import { getActiveServices } from "@/lib/services";
import { getActivePhotographers } from "@/lib/photographers";
import { getSiteImage } from "@/lib/site-images";
import { PageGradientBg } from "./page-gradient-bg";

const CARD_GRADIENTS = [
  "from-[var(--color-brand-coral)] to-[var(--color-brand-magenta)]",
  "from-[var(--color-brand-magenta)] to-[var(--color-brand-purple)]",
  "from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)]",
  "from-[var(--color-brand-purple)] to-[var(--color-brand-blue)]",
];

export default async function HomePage() {
  const [services, photographers, heroImage] = await Promise.all([
    getActiveServices(),
    getActivePhotographers(3),
    getSiteImage("hero"),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickpic.click";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "QuickPic",
    url: siteUrl,
    description: "Book a photo shoot session, or find and hire an independent photographer.",
  };

  return (
    <main className="flex-1 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <PageGradientBg />
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center relative">
        <h1 className="text-5xl sm:text-[80px] font-semibold leading-[1.1] tracking-[-2px] text-ink">
          Your next shoot,
          <br />
          booked in minutes
        </h1>
        <p className="mt-6 text-lg text-slate max-w-xl mx-auto">
          Pick a session, choose a slot that works, pay securely. Your
          confirmation lands in your inbox right after.
        </p>
        <a
          href="#services"
          className="inline-block mt-10 rounded-lg bg-primary text-on-primary px-8 py-3.5 text-sm font-semibold"
        >
          Browse sessions
        </a>
      </section>

      {heroImage && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage.public_url}
            alt=""
            className="w-full aspect-[16/7] object-cover rounded-lg"
          />
          {heroImage.credit_name && (
            <p className="mt-2 text-xs text-stone text-right">
              Photo by {heroImage.credit_name} on{" "}
              <a href={heroImage.credit_url ?? "https://pixabay.com"} className="underline">
                Pixabay
              </a>
            </p>
          )}
        </section>
      )}

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-hairline p-6">
            <h2 className="text-lg font-semibold text-ink">Book a session instantly</h2>
            <ol className="mt-4 space-y-2 text-sm text-slate">
              <li>1. Pick a session below</li>
              <li>2. Choose a slot that works</li>
              <li>3. Pay and you&apos;re confirmed</li>
            </ol>
            <a href="#services" className="mt-4 inline-block text-sm font-semibold text-ink underline">
              Browse sessions
            </a>
          </div>
          <div className="rounded-lg border border-hairline p-6">
            <h2 className="text-lg font-semibold text-ink">Get quotes from photographers</h2>
            <ol className="mt-4 space-y-2 text-sm text-slate">
              <li>1. Post what you need</li>
              <li>2. Photographers send quotes</li>
              <li>3. Accept the one you like</li>
            </ol>
            <Link href="/requirements/new" className="mt-4 inline-block text-sm font-semibold text-ink underline">
              Post a job
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-semibold text-ink">Secure payments</p>
            <p className="mt-1 text-sm text-slate">Every booking is paid for and confirmed on the platform.</p>
          </div>
          <div>
            <p className="font-semibold text-ink">No hidden contact</p>
            <p className="mt-1 text-sm text-slate">Photographer details stay private until you book.</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Instant confirmation</p>
            <p className="mt-1 text-sm text-slate">Get an email the moment your booking goes through.</p>
          </div>
        </div>
      </section>

      {photographers.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-ink">Photographers on QuickPic</h2>
            <Link href="/photographers" className="text-sm font-semibold text-ink underline">
              See all
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {photographers.map((p) => (
              <Link
                key={p.id}
                href={`/photographers/${p.id}`}
                className="rounded-lg border border-hairline overflow-hidden hover:shadow-md transition-shadow"
              >
                {p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnailUrl} alt={p.display_name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 bg-gradient-to-br from-[var(--color-brand-coral)] to-[var(--color-brand-magenta)]" />
                )}
                <div className="p-4">
                  <p className="font-medium text-ink text-sm">{p.display_name}</p>
                  <p className="text-xs text-stone mt-0.5">{p.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="services" className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-2xl font-semibold text-ink mb-6">Sessions you can book now</h2>
        {services.length === 0 ? (
          <div className="text-center py-20 text-stone">
            No sessions are open for booking right now. Check back soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => {
              const photographer = service.photographers as unknown as { display_name: string } | null;
              return (
                <Link
                  key={service.id}
                  href={`/book/${service.id}`}
                  className="group rounded-lg border border-hairline overflow-hidden bg-canvas hover:shadow-md transition-shadow"
                >
                  <div
                    className={`h-28 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-ink">{service.name}</h3>
                    {photographer && <p className="text-xs text-stone mt-0.5">by {photographer.display_name}</p>}
                    {service.description && (
                      <p className="mt-1.5 text-sm text-slate line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-stone">{service.duration_minutes} min</span>
                      <span className="font-semibold text-ink">₹{service.price_inr}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
