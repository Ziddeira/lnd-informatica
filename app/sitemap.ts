import type { MetadataRoute } from "next";
import { COMPANY } from "@/data/company";

export const dynamic = "force-static";

const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/empresas/", priority: 0.9 },
  { path: "/servidores/", priority: 0.9 },
  { path: "/monte-seu-pc/", priority: 0.8 },
  { path: "/assistencia/", priority: 0.8 },
  { path: "/contato/", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.siteUrl).replace(/\/$/, "");
  return ROUTES.map(({ path, priority }) => ({ url: `${base}${path}`, changeFrequency: "monthly", priority }));
}
