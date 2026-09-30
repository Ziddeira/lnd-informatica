import type { NextConfig } from "next";

/*
 * Dois modos de build:
 *  - Padrão (`npm run build` + `npm start`): site completo com backend (API de contatos,
 *    orçamentos salvos e painel /admin). Precisa de uma hospedagem Node.js.
 *  - Estático (`LND_STATIC_EXPORT=1`, usado por `npm run build:static` e `build:html`): gera só HTML em /out.
 *    Arquivos `*.api.ts(x)` (rotas de API e páginas que dependem do servidor) ficam de fora e os formulários
 *    passam a enviar direto para o WhatsApp.
 */
const isStaticExport = process.env.LND_STATIC_EXPORT === "1";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Cada rota vira uma pasta com index.html (/monte-seu-pc/index.html), compatível com qualquer hospedagem.
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: isStaticExport ? ["tsx", "ts"] : ["api.tsx", "api.ts", "tsx", "ts"],
  env: { NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "1" : "" },
  ...(isStaticExport
    ? { output: "export" as const }
    : {
        async headers() {
          return [
            { source: "/:path*", headers: securityHeaders },
            { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
          ];
        },
      }),
};

export default nextConfig;
