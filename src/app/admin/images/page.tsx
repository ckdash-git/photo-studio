import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ImagePicker } from "./image-picker";

export default async function AdminImagesPage() {
  await requireAdmin();
  const db = createAdminClient();
  const { data: currentImages } = await db
    .from("site_images")
    .select("slot_key, public_url, credit_name")
    .order("slot_key");

  return (
    <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
      <h1 className="text-2xl font-semibold text-ink">Site images</h1>
      <p className="mt-2 text-sm text-stone">
        Search Pixabay, pick a photo, it&apos;s downloaded to our own storage
        (required by Pixabay&apos;s terms - their links can&apos;t be
        permanently embedded) and attributed automatically.
      </p>

      <ImagePicker />

      {currentImages && currentImages.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-ink mb-3">Currently assigned</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {currentImages.map((img) => (
              <div key={img.slot_key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.public_url} alt={img.slot_key} className="w-full aspect-video object-cover rounded-lg border border-hairline" />
                <p className="mt-1 text-xs text-stone">{img.slot_key}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
