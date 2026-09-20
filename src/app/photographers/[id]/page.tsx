import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhotographerProfile } from "@/lib/photographers";

export default async function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPhotographerProfile(id);
  if (!result) notFound();
  const { photographer, portfolio } = result;

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-16">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-brand-coral)] to-[var(--color-brand-magenta)] flex items-center justify-center text-on-primary text-2xl font-semibold">
          {photographer.display_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">{photographer.display_name}</h1>
          <p className="text-sm text-stone mt-0.5">{photographer.city}</p>
          {photographer.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {photographer.categories.map((c: string) => (
                <span
                  key={c}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-slate"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {photographer.bio && <p className="mt-6 text-slate max-w-xl">{photographer.bio}</p>}

      <div className="mt-6 rounded-lg border border-hairline p-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate">
          Contact details stay private until you book. Post what you need and
          photographers like this one can send you a quote.
        </p>
        <Link
          href="/requirements/new"
          className="shrink-0 rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-semibold"
        >
          Post a job
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-ink">Portfolio</h2>
      {portfolio.length > 0 ? (
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {portfolio.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.id}
              src={item.image_url}
              alt={item.caption ?? photographer.display_name}
              className="w-full aspect-square object-cover rounded-lg border border-hairline"
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-stone text-sm">No portfolio photos yet.</p>
      )}
    </main>
  );
}
