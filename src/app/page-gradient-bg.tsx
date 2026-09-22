// Shared decorative background - same subtle gradient wash used on the
// homepage hero, reused across other pages so they don't feel starkly
// white/black in contrast.
//
// This element deliberately uses NONE of the CSS properties that
// independently create a new stacking context: no explicit z-index (even
// 0 counts), no filter (blur), no opacity < 1, no transform. Any one of
// these can promote the element to its own GPU compositing layer, and
// mobile Safari has real, documented quirks rendering composited layers
// in unexpected stacking order relative to other positioned elements
// (the header's mobile dropdown, specifically) - three separate rounds
// of this bug turned out to be three separate triggers from this same
// list, not one bug. Only `position: absolute` remains here, which does
// NOT trigger a stacking context on its own per spec.
//
// The soft, low-opacity look is achieved entirely through color-mix()
// in the gradient stops instead of the `opacity` property, and centering
// uses a fixed negative margin instead of `transform: translateX(-50%)`.
export function PageGradientBg({ variant = "default" }: { variant?: "default" | "cool" }) {
  const [colorA, colorB] =
    variant === "cool"
      ? ["var(--color-brand-blue)", "var(--color-brand-cyan)"]
      : ["var(--color-brand-coral)", "var(--color-brand-purple)"];

  const gradient = `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${colorA} 12%, transparent), transparent 55%), radial-gradient(circle at 70% 60%, color-mix(in srgb, ${colorB} 12%, transparent), transparent 55%)`;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 ml-[-450px] w-[900px] h-[600px]"
      style={{ background: gradient }}
    />
  );
}
