import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera o site como HTML estático na pasta /out (pode ser hospedado em qualquer servidor).
  output: "export",
  // Cada rota vira uma pasta com index.html (/monte-seu-pc/index.html), compatível com qualquer hospedagem.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
