"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Photographer {
  id: string;
  display_name: string;
  bio: string | null;
  city: string;
  categories: string[];
}
interface PortfolioItem {
  id: string;
  image_url: string;
  caption: string | null;
}

export function ProfileForm({
  existingPhotographer,
  existingPortfolio,
}: {
  existingPhotographer: Photographer | null;
  existingPortfolio: PortfolioItem[];
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(existingPhotographer?.display_name ?? "");
  const [city, setCity] = useState(existingPhotographer?.city ?? "");
  const [categories, setCategories] = useState(
    existingPhotographer?.categories.join(", ") ?? "",
  );
  const [bio, setBio] = useState(existingPhotographer?.bio ?? "");
  const [portfolioUrls, setPortfolioUrls] = useState(
    existingPortfolio.length > 0
      ? existingPortfolio.map((p) => p.image_url).join("\n")
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired - please log in again");
      setSubmitting(false);
      return;
    }

    const { data: photographer, error: upsertError } = await supabase
      .from("photographers")
      .upsert(
        {
          user_id: user.id,
          display_name: displayName,
          city,
          bio: bio || null,
          categories: categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();

    if (upsertError || !photographer) {
      setError(upsertError?.message ?? "Could not save profile");
      setSubmitting(false);
      return;
    }

    // Simple full-replace for portfolio: delete existing, insert current list.
    await supabase.from("portfolio_items").delete().eq("photographer_id", photographer.id);
    const urls = portfolioUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length > 0) {
      await supabase.from("portfolio_items").insert(
        urls.map((url, i) => ({
          photographer_id: photographer.id,
          image_url: url,
          sort_order: i,
        })),
      );
    }

    setSubmitting(false);
    router.push(`/photographers/${photographer.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <input
        required
        placeholder="Display name (shown publicly)"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <input
        required
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <input
        placeholder="Categories, comma separated (e.g. portrait, wedding)"
        value={categories}
        onChange={(e) => setCategories(e.target.value)}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <textarea
        placeholder="Short bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm"
      />
      <div>
        <label className="text-sm font-medium text-ink">Portfolio image URLs</label>
        <p className="text-xs text-stone mt-1">
          One per line. Upload elsewhere (Imgur, Cloudinary, etc.) and paste
          the links for now - direct upload is coming later.
        </p>
        <textarea
          placeholder="https://..."
          value={portfolioUrls}
          onChange={(e) => setPortfolioUrls(e.target.value)}
          rows={4}
          className="w-full mt-2 rounded-md border border-hairline px-4 py-2.5 text-sm font-mono"
        />
      </div>

      {error && (
        <p className="text-sm text-brand-coral" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-primary text-on-primary py-3.5 text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
