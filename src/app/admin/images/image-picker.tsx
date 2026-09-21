"use client";

import { useState } from "react";
import { searchPixabay, type PixabayResult } from "@/lib/pixabay";
import { attachPixabayImageToSlot } from "@/lib/site-images";

export function ImagePicker() {
  const [slotKey, setSlotKey] = useState("hero");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PixabayResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setSavedMessage(null);
    const { results, error } = await searchPixabay(query);
    setResults(results);
    if (error) setError(error);
    setSearching(false);
  }

  async function handleUse(image: PixabayResult) {
    if (!slotKey.trim()) {
      setError("Enter a slot key first (e.g. hero)");
      return;
    }
    setSavingId(image.id);
    setError(null);
    const result = await attachPixabayImageToSlot(
      slotKey.trim(),
      image.largeImageURL,
      image.id,
      image.user,
      image.pageURL,
    );
    setSavingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSavedMessage(`Saved to slot "${slotKey}"`);
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSearch} className="space-y-3">
        <input
          value={slotKey}
          onChange={(e) => setSlotKey(e.target.value)}
          placeholder="Slot key, e.g. hero"
          className="w-full rounded-md border border-hairline px-4 py-2.5 text-sm font-mono"
        />
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pixabay, e.g. wedding photography"
            className="flex-1 rounded-md border border-hairline px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-lg bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 text-sm text-brand-coral" role="alert">
          {error}
        </p>
      )}
      {savedMessage && <p className="mt-3 text-sm text-success-text">{savedMessage}</p>}

      {results.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          {results.map((r) => (
            <div key={r.id} className="rounded-lg border border-hairline overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.previewURL} alt="" className="w-full aspect-video object-cover" />
              <div className="p-2">
                <p className="text-xs text-stone truncate">by {r.user}</p>
                <button
                  onClick={() => handleUse(r)}
                  disabled={savingId === r.id}
                  className="mt-1 w-full rounded-md bg-primary text-on-primary py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  {savingId === r.id ? "Saving..." : "Use this"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
