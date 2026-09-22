import { PageGradientBg } from "./page-gradient-bg";

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 relative overflow-hidden mx-auto max-w-2xl w-full px-6 py-16">
      <PageGradientBg />
      <h1 className="text-3xl font-semibold text-ink">{title}</h1>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs text-stone">
        Draft - not yet reviewed by a lawyer
      </div>

      <div className="mt-8 rounded-lg border border-hairline bg-canvas p-6 sm:p-8 space-y-6 text-sm text-slate">
        {children}
      </div>
    </main>
  );
}
