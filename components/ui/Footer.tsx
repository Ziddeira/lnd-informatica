import Link from "next/link";
import { Clock, MapPin, Phone, Star } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { COMPANY, NAV_LINKS } from "@/data/company";
import { MODEL_CREDITS } from "@/data/models3d";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-panel/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            Mais de {COMPANY.yearsOfExperience} anos cuidando de computadores, notebooks e servidores na Grande Florianópolis — e
            enviando PCs gamers montados e testados para todo o Brasil.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <strong className="text-white">{COMPANY.rating.toFixed(1).replace(".", ",")}</strong> no Google ·{" "}
            {COMPANY.reviewCountLabel} avaliações
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Navegação</h3>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-400 transition hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
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
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Horários</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            {COMPANY.hours.map((h) => (
              <li key={h.days} className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  <span className="text-slate-300">{h.days}:</span> {h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. Todos os direitos reservados.
          </p>
          <p>Palhoça · São José · Florianópolis · Biguaçu · e todo o Brasil</p>
          {MODEL_CREDITS.length > 0 && <p className="w-full sm:w-auto">Modelos 3D: {MODEL_CREDITS.join(" · ")}</p>}
        </div>
      </div>
    </footer>
  );
}
