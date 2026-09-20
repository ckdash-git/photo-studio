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
      <h1 className="text-3xl font-semibold text-ink">{photographer.display_name}</h1>
      <p className="text-sm text-stone mt-1">{photographer.city}</p>
      {photographer.categories.length > 0 && (
        <p className="text-sm text-slate mt-1">{photographer.categories.join(", ")}</p>
      )}
      {photographer.bio && <p className="mt-4 text-slate max-w-xl">{photographer.bio}</p>}

      {portfolio.length > 0 && (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
      )}
    </main>
  );
}
