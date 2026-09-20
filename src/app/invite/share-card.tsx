"use client";

import { useEffect, useState } from "react";

export function ShareCard({ referralUrl, code }: { referralUrl: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // This page is server-rendered first, and `navigator` doesn't exist in
  // that environment - computing this via useState's initializer would
  // return `true` on the client during hydration while the server
  // rendered `false`, causing a hydration mismatch. useEffect only runs
  // after hydration completes, so the first client render intentionally
  // matches the server's (share button hidden), then updates a moment later.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- correct pattern for post-mount browser-capability detection (navigator doesn't exist during SSR, so this can't be computed any earlier); not the "derive state from props" case this rule targets.
    if (typeof navigator !== "undefined" && "share" in navigator) setCanNativeShare(true);
  }, []);

  const shareText = `Book a photo shoot on QuickPic - use my link and get a discount on your first booking: ${referralUrl}`;

  async function handleNativeShare() {
    try {
      await navigator.share({ title: "QuickPic", text: shareText, url: referralUrl });
    } catch {
      // User cancelled the share sheet - not an error worth surfacing.
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore - the link is still visible to copy manually.
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-hairline p-6 text-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-canvas)]">
      <p className="text-xs text-stone uppercase tracking-wide">Your code</p>
      <p className="mt-1 text-3xl font-semibold text-ink font-mono tracking-wider">{code}</p>

      <div className="mt-6 space-y-2">
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full rounded-lg bg-primary text-on-primary py-3 text-sm font-semibold"
          >
            Share
          </button>
        )}
        <button
          onClick={handleCopy}
          className="w-full rounded-lg border border-hairline py-3 text-sm font-semibold text-ink"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg border border-hairline py-3 text-sm font-semibold text-ink"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
