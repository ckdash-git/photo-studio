"use client";

import { useState } from "react";

export function CopyBookingId({ bookingId }: { bookingId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in some WebView contexts - fail silently,
      // the ID is still visible to read out manually.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-ink font-mono text-xs underline decoration-dotted"
    >
      {copied ? "Copied" : bookingId}
    </button>
  );
}
