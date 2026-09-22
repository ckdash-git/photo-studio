"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Exposes the browser Supabase client on window so the native app's
 * WebView-based tabs (not yet converted to native Flutter screens) can be
 * kept in sync with a session established natively via the Dart SDK.
 * Native login and this WebView's own browser session are stored
 * completely separately (different storage entirely) - without this
 * bridge, logging in through the native login screen wouldn't carry over
 * to any page still rendered inside a WebView. Harmless on the website
 * itself; regular browser visitors just get an unused global.
 */
export function SessionBridge() {
  useEffect(() => {
    (window as unknown as { __quickpicSupabase?: ReturnType<typeof createClient> }).__quickpicSupabase =
      createClient();
  }, []);

  return null;
}
