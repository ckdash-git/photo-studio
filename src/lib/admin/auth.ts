import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Gates every /admin page. Not a database role - just an email match
 * against ADMIN_EMAIL. Simple and sufficient for a single-owner business;
 * revisit with a real roles table if this ever needs multiple admins.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  return user;
}

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user && !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
}
