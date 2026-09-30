import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import { PageHero } from "@/components/ui/Section";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { COMPANY } from "@/data/company";

export const metadata: Metadata = {
  title: "Contato e Orçamento",
  description: `Fale com a LND Informática: ${COMPANY.phoneDisplay}, WhatsApp e e-mail. Loja no Centro de Palhoça — ${COMPANY.address.full}.`,
};

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp", value: COMPANY.phoneDisplay, href: `https://wa.me/${COMPANY.whatsappNumber}` },
  { icon: Phone, label: "Telefone", value: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneE164}` },
  { icon: Mail, label: "E-mail", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
];

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow={
          <>
            <MapPin className="h-4 w-4" /> Centro de Palhoça · SC
          </>
        }
        title={
          <>
            Fale com a LND. <span className="text-gradient">A gente resolve.</span>
          </>
        }
        description="Orçamentos para empresas, projetos de servidores, PCs Gamers e assistência técnica. Escolha o canal que preferir."
      >
        <WhatsappCta size="lg" label="Chamar no WhatsApp" />
      </PageHero>

      <section className="py-16 sm:py-20" aria-label="Formulário e canais de contato">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="space-y-4 lg:col-span-2">
            {CHANNELS.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-panel/70 p-5 transition hover:border-brand/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wider text-slate-500">{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </span>
              </a>
            ))}
            <div className="rounded-2xl border border-white/8 bg-panel/70 p-5">
              <p className="flex items-center gap-2 font-semibold text-white">
                <Clock className="h-4 w-4 text-brand" /> Horário de funcionamento
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-400">
                {COMPANY.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4">
                    <span>{h.days}</span>
                    <span className="text-slate-300">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <LeadForm className="lg:col-span-3" defaultInterest="empresa" />
        </div>
      </section>

      <section className="border-t border-white/5 bg-panel/40 py-16 sm:py-20" aria-labelledby="map-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <h2 id="map-title" className="font-display text-3xl font-bold text-white">
              Como chegar
            </h2>
            <p className="mt-4 flex gap-3 text-slate-400">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" /> {COMPANY.address.full}
            </p>
            <p className="mt-4 text-sm text-slate-400">{COMPANY.serviceArea}.</p>
            <a
              href={COMPANY.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/25"
            >
              <Navigation className="h-4 w-4" /> Abrir no Google Maps
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 lg:col-span-3">
            <iframe
              title="Mapa: LND Informática no Centro de Palhoça"
              src={COMPANY.mapsEmbedUrl}
              className="h-[380px] w-full grayscale-[0.4] invert-[0.9] hue-rotate-180 lg:h-[440px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
