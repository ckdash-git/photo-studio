import Link from "next/link";
import { getActivePhotographers } from "@/lib/photographers";

const CARD_GRADIENTS = [
  "from-[var(--color-brand-coral)] to-[var(--color-brand-magenta)]",
  "from-[var(--color-brand-magenta)] to-[var(--color-brand-purple)]",
  "from-[var(--color-brand-blue)] to-[var(--color-brand-cyan)]",
  "from-[var(--color-brand-purple)] to-[var(--color-brand-blue)]",
];

export default async function PhotographersDirectoryPage() {
  const photographers = await getActivePhotographers();

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-16">
      <h1 className="text-3xl font-semibold text-ink">Find a photographer</h1>
      <p className="mt-2 text-slate">Browse portfolios and post what you need.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photographers.length === 0 ? (
          <div className="col-span-full text-center py-16 text-stone">
            <p>No photographers listed yet.</p>
            <Link href="/become-a-photographer" className="mt-3 inline-block text-sm font-semibold text-ink underline">
              Be the first to list yourself
            </Link>
          </div>
        ) : (
          photographers.map((p, i) => (
            <Link
              key={p.id}
              href={`/photographers/${p.id}`}
              className="group rounded-lg border border-hairline overflow-hidden bg-canvas hover:shadow-md transition-shadow"
            >
              {p.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnailUrl}
                  alt={p.display_name}
                  className="h-36 w-full object-cover"
                />
              ) : (
                <div
                  className={`h-36 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
                />
              )}
              <div className="p-5">
                <h3 className="font-semibold text-ink">{p.display_name}</h3>
                <p className="text-sm text-stone mt-1">{p.city}</p>
                {p.categories.length > 0 && (
                  <p className="text-sm text-slate mt-2">{p.categories.join(", ")}</p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
