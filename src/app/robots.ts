import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickpic.click";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing behind these routes is meant for search results - all
        // require login, and admin/account pages have no public content
        // to index anyway.
        disallow: ["/admin", "/account", "/my-bookings", "/my-services", "/leads", "/invite", "/pay", "/confirmation"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
