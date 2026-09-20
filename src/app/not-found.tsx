import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 mx-auto max-w-md w-full px-6 py-24 text-center">
      <p className="text-sm font-mono text-stone">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-slate">
        This page doesn&apos;t exist, or it may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-primary text-on-primary px-6 py-3 text-sm font-semibold"
      >
        Back to home
      </Link>
    </main>
  );
}
