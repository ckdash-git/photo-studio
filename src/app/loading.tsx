export default function Loading() {
  // Next.js renders this automatically while a page's server data is
  // loading, replacing a blank-white-flash with a lightweight generic
  // skeleton. Kept intentionally simple (not grid-shaped) since this one
  // file covers every route that doesn't define its own loading.tsx.
  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-16 animate-pulse">
      <div className="h-7 w-1/2 bg-surface rounded-md" />
      <div className="mt-4 h-4 w-3/4 bg-surface rounded-md" />
      <div className="mt-2 h-4 w-2/3 bg-surface rounded-md" />
      <div className="mt-8 h-40 bg-surface rounded-lg" />
    </main>
  );
}
