// Shared decorative background - same subtle blurred gradient blob used on
// the homepage hero, reused across other pages so they don't feel starkly
// white/black in contrast.
//
// Deliberately has NO z-index at all (not even z-0). A positioned element
// with an explicit z-index - even 0 - establishes its own stacking context,
// which can then compete unpredictably with other explicitly-stacked
// elements elsewhere on the page (like the header's mobile dropdown at
// z-50) depending on exactly how intermediate wrapper elements are
// positioned. An element with NO z-index (auto) never does this - it just
// paints in normal document order, safely behind anything that comes
// later or has an explicit z-index. This was the actual cause of the
// mobile-menu bleed-through bug, not something a "higher" z-index would
// have fixed.
export function PageGradientBg({ variant = "default" }: { variant?: "default" | "cool" }) {
  const gradient =
    variant === "cool"
      ? "radial-gradient(circle at 30% 30%, var(--color-brand-blue), transparent 60%), radial-gradient(circle at 70% 60%, var(--color-brand-cyan), transparent 60%)"
      : "radial-gradient(circle at 30% 30%, var(--color-brand-coral), transparent 60%), radial-gradient(circle at 70% 60%, var(--color-brand-purple), transparent 60%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.12] blur-3xl"
      style={{ background: gradient }}
    />
  );
}
