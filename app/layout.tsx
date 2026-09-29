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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || COMPANY.siteUrl),
  title: {
    default: "LND Informática | Suporte de TI para Empresas, Servidores e PC Gamer em Palhoça",
    template: "%s | LND Informática",
  },
  description:
    "Suporte de TI B2B, servidores Windows e Linux, firewall pfSense, redes e backup para empresas da Grande Florianópolis e de todo o Brasil. PCs Gamers montados com teste de estresse e assistência técnica em Palhoça. Nota 4,9 no Google.",
  keywords: [
    "suporte de TI para empresas Palhoça",
    "terceirização de TI Florianópolis",
    "manutenção de servidores",
    "firewall pfSense",
    "PC Gamer Palhoça",
    "assistência técnica Palhoça",
    "LND Informática",
  ],
  openGraph: {
    title: "LND Informática — TI para empresas e PCs de alta performance",
    description: "Suporte B2B, servidores e redes para empresas. PC Gamer montado por quem entende há mais de 20 anos. Nota 4,9 no Google.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080b",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["ComputerStore", "ProfessionalService"],
  name: COMPANY.name,
  url: COMPANY.siteUrl,
  email: COMPANY.email,
  foundingDate: String(COMPANY.foundedYear),
  sameAs: Object.values(COMPANY.social),
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
  knowsAbout: ["Suporte de TI", "Windows Server", "Linux", "Active Directory", "pfSense", "Backup", "Google Workspace", "PC Gamer"],
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
