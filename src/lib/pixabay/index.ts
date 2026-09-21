"use server";

export interface PixabayResult {
  id: number;
  previewURL: string; // safe to hotlink for search-result previews (Pixabay allows temporary display)
  largeImageURL: string;
  user: string;
  pageURL: string;
}

/** Server Action so the API key never reaches the client bundle. */
export async function searchPixabay(query: string): Promise<{ results: PixabayResult[]; error?: string }> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return { results: [], error: "PIXABAY_API_KEY not set" };
  if (!query.trim()) return { results: [] };

  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=8`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { results: [], error: `Pixabay returned ${res.status}` };
    const data = await res.json();
    const results: PixabayResult[] = (data.hits ?? []).map((h: PixabayResult) => ({
      id: h.id,
      previewURL: h.previewURL,
      largeImageURL: h.largeImageURL,
      user: h.user,
      pageURL: h.pageURL,
    }));
    return { results };
  } catch (err) {
    console.error("Pixabay search failed:", err);
    return { results: [], error: "Search failed - try again" };
  }
}
