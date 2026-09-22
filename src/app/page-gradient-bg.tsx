// Shared decorative background - same subtle blurred gradient blob used on
// the homepage hero, reused across other pages so they don't feel starkly
// white/black in contrast. z-0 keeps it behind all real content; the
// header sits at z-50 (see site-header.tsx) so it's never affected.
export function PageGradientBg({ variant = "default" }: { variant?: "default" | "cool" }) {
  const gradient =
    variant === "cool"
      ? "radial-gradient(circle at 30% 30%, var(--color-brand-blue), transparent 60%), radial-gradient(circle at 70% 60%, var(--color-brand-cyan), transparent 60%)"
      : "radial-gradient(circle at 30% 30%, var(--color-brand-coral), transparent 60%), radial-gradient(circle at 70% 60%, var(--color-brand-purple), transparent 60%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.12] blur-3xl z-0"
      style={{ background: gradient }}
    />
  );
}
