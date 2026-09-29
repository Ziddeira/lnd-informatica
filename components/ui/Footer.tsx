import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Star } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { COMPANY, FOOTER_GROUPS } from "@/data/company";
import { MODEL_CREDITS } from "@/data/models3d";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-panel/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="space-y-5 lg:col-span-4">
          <Logo className="h-10" />
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Infraestrutura de TI, servidores e suporte para empresas. PCs Gamers e Workstations montados e testados. Assistência
            técnica especializada em Palhoça desde {COMPANY.foundedYear}.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Star className="h-4 w-4 fill-brand text-brand" />
            <strong className="text-white">{COMPANY.rating.toFixed(1).replace(".", ",")}</strong> no Google ·{" "}
            {COMPANY.reviewCountLabel} avaliações
          </div>
          <div className="flex gap-3 text-sm">
            <a href={COMPANY.social.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand">
              Facebook
            </a>
            <span className="text-slate-700">·</span>
            <a href={COMPANY.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand">
              LinkedIn
            </a>
          </div>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.title} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{group.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 transition hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-4">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contato</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <a href={COMPANY.mapsUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                {COMPANY.address.full}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>
                <a href={`tel:${COMPANY.phoneE164}`} className="transition hover:text-white">
                  {COMPANY.phoneDisplay}
                </a>{" "}
                ·{" "}
                <a href={buildWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="text-whatsapp hover:underline">
                  WhatsApp
                </a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <a href={`mailto:${COMPANY.email}`} className="transition hover:text-white">
                {COMPANY.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>
                {COMPANY.hours
                  .filter((h) => h.time !== "Fechado")
                  .map((h) => `${h.days}: ${h.time}`)
                  .join(" · ")}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {COMPANY.name} · CNPJ {COMPANY.cnpj}
          </p>
          <p>Palhoça · São José · Florianópolis · Biguaçu · suporte remoto para todo o Brasil</p>
          {MODEL_CREDITS.length > 0 && <p className="w-full sm:w-auto">Modelos 3D: {MODEL_CREDITS.join(" · ")}</p>}
        </div>
      </div>
    </footer>
  );
}
