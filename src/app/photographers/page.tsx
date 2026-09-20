import Link from "next/link";
import { getActivePhotographers } from "@/lib/photographers";

export default async function PhotographersDirectoryPage() {
  const photographers = await getActivePhotographers();

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-16">
      <h1 className="text-3xl font-semibold text-ink">Find a photographer</h1>
      <p className="mt-2 text-slate">Browse portfolios and post what you need.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photographers.length === 0 ? (
          <p className="text-stone">No photographers listed yet.</p>
        ) : (
          photographers.map((p) => (
            <Link
              key={p.id}
              href={`/photographers/${p.id}`}
              className="rounded-lg border border-hairline p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-ink">{p.display_name}</h3>
              <p className="text-sm text-stone mt-1">{p.city}</p>
              {p.categories.length > 0 && (
                <p className="text-sm text-slate mt-2">{p.categories.join(", ")}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
