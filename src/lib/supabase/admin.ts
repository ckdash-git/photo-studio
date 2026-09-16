// Service-role Supabase client. Bypasses Row Level Security entirely -
// import this ONLY in server-only code (route handlers, server actions),
// never in anything that ships to the browser.
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
