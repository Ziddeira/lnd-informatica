import type { MetadataRoute } from "next";
import { COMPANY } from "@/data/company";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.siteUrl).replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/orcamento/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
