import { COMPANY } from "@/data/company";

/**
 * URL pública do site: NEXT_PUBLIC_SITE_URL, se definida; na Vercel, o domínio de produção
 * do projeto (definido automaticamente); senão, o domínio oficial da LND.
 */
export function siteUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : COMPANY.siteUrl);
  return url.replace(/\/$/, "");
}
