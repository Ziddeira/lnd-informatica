import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import WhatsappButton from "@/components/ui/WhatsappButton";
import { COMPANY } from "@/data/company";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "LND Informática | PC Gamer, Assistência Técnica e Consultoria em Palhoça",
    template: "%s | LND Informática",
  },
  description:
    "Mais de 20 anos em informática: montagem de PC Gamer e Workstation com teste de estresse, assistência técnica especializada em Palhoça e Grande Florianópolis e envio para todo o Brasil. Nota 4,9 no Google.",
  keywords: [
    "PC Gamer Palhoça",
    "assistência técnica Palhoça",
    "montagem de PC",
    "manutenção de notebook Florianópolis",
    "consultoria TI empresas",
    "LND Informática",
  ],
  openGraph: {
    title: "LND Informática — PC Gamer e Assistência Técnica",
    description: "Monte seu PC Gamer com quem entende há mais de 20 anos. Nota 4,9 no Google com quase 5.000 avaliações.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04060a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ComputerStore",
  name: COMPANY.name,
  telephone: COMPANY.phoneE164,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.address.street,
    addressLocality: COMPANY.address.city,
    addressRegion: COMPANY.address.state,
    postalCode: COMPANY.address.zip,
    addressCountry: "BR",
  },
  areaServed: ["Palhoça", "São José", "Florianópolis", "Biguaçu", "Brasil"],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: COMPANY.rating,
    reviewCount: COMPANY.reviewCount,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${space.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-night"
        >
          Pular para o conteúdo
        </a>
        <Navbar />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsappButton />
      </body>
    </html>
  );
}
