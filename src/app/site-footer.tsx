import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="font-semibold text-ink">QuickPic</p>
          <p className="text-sm text-stone mt-1">Book a photo shoot, or find a photographer.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate">
          <Link href="/photographers" className="hover:text-ink">Find a photographer</Link>
          <Link href="/requirements/new" className="hover:text-ink">Post a job</Link>
          <Link href="/leads" className="hover:text-ink">For photographers</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-5xl px-6 pb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone">
        <span>© {new Date().getFullYear()} QuickPic</span>
        <Link href="/terms" className="hover:text-ink">Terms</Link>
        <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/refund-policy" className="hover:text-ink">Refunds</Link>
      </div>
    </footer>
  );
}
