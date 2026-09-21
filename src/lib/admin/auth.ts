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

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user?.email || !adminEmail || user.email.toLowerCase() !== adminEmail) {
    redirect("/");
  }

  return user;
}

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!user?.email && !!adminEmail && user.email.toLowerCase() === adminEmail;
}
