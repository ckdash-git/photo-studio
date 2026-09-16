import Link from "next/link";
import { getActiveServices } from "@/lib/services";

const CARD_GRADIENTS = [
  "from-[var(--color-brand-coral)] to-[var(--color-brand-magenta)]",
  "from-[var(--color-brand-magenta)] to-[var(--color-brand-purple)]",
  "from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)]",
  "from-[var(--color-brand-purple)] to-[var(--color-brand-blue)]",
];

export default async function HomePage() {
  const services = await getActiveServices();

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
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

      <section id="services" className="mx-auto max-w-5xl px-6 pb-24">
        {services.length === 0 ? (
          <div className="text-center py-20 text-stone">
            No sessions are open for booking right now. Check back soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => (
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
