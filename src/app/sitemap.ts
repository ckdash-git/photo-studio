import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickpic.click";
  const db = createAdminClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/photographers`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/requirements/new`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [{ data: services }, { data: photographers }] = await Promise.all([
    db.from("services").select("id, created_at").eq("is_active", true),
    db.from("photographers").select("id, created_at").eq("is_active", true),
  ]);

  const serviceRoutes: MetadataRoute.Sitemap = (services ?? []).map((s) => ({
    url: `${siteUrl}/book/${s.id}`,
    lastModified: new Date(s.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const photographerRoutes: MetadataRoute.Sitemap = (photographers ?? []).map((p) => ({
    url: `${siteUrl}/photographers/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...photographerRoutes];
}
