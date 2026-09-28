import type { Metadata } from "next";
import { ChevronDown, ClipboardCheck, MapPin, MessageCircle, PackageCheck, ScanSearch } from "lucide-react";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { COMPANY } from "@/data/company";
import { QUICK_SERVICES, SERVICE_AREAS } from "@/data/services";

export const metadata: Metadata = {
  title: "Assistência Técnica em Palhoça e Região",
  description:
    "Assistência técnica de computadores, notebooks e servidores em Palhoça e Grande Florianópolis: limpeza com troca de pasta térmica, formatação, upgrades, reparos e consultoria de TI.",
};

const PROCESS = [
  { icon: MessageCircle, title: "Contato", text: "Chame no WhatsApp e conte o problema. Muitas vezes já adiantamos uma orientação." },
  { icon: ScanSearch, title: "Diagnóstico", text: "Avaliamos o equipamento na bancada e identificamos a causa real do defeito." },
  { icon: ClipboardCheck, title: "Aprovação", text: "Você recebe o orçamento detalhado e só fazemos o serviço depois da sua aprovação." },
  { icon: PackageCheck, title: "Entrega testada", text: "Equipamento testado, limpo e com garantia do serviço realizado." },
];

// TODO(LND): revisar prazos e condições conforme a prática real da loja.
const FAQ = [
  {
    q: "Quanto tempo leva uma limpeza com troca de pasta térmica?",
    a: "Na maioria dos casos o serviço fica pronto no mesmo dia ou no dia seguinte. Informamos o prazo exato no momento do orçamento.",
  },
  {
    q: "Vocês fazem backup antes de formatar?",
    a: "Sim. Salvamos seus documentos, fotos e arquivos importantes antes da formatação e devolvemos tudo no lugar.",
  },
  {
    q: "O diagnóstico é cobrado?",
    a: "Fale com a gente pelo WhatsApp: explicamos as condições do diagnóstico para o seu equipamento antes de você trazer.",
  },
  {
    q: "Atendem empresas?",
    a: "Sim. Prestamos consultoria de TI, manutenção de servidores, redes e suporte recorrente para empresas da Grande Florianópolis e de todo o Brasil (remoto).",
  },
  {
    q: "Os serviços têm garantia?",
    a: "Sim. Todo serviço realizado e toda peça instalada têm garantia, informada no orçamento.",
  },
];

export default function AssistenciaPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000,transparent)]" />
        <div className="absolute -left-20 top-0 -z-10 h-80 w-80 rounded-full bg-brand/15 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-20">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            <MapPin className="h-4 w-4" /> Palhoça e Grande Florianópolis
          </p>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Assistência técnica rápida, <span className="text-gradient">honesta e com garantia.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-400">
            Computador lento, notebook esquentando, servidor dando sinais de problema? Mais de 20 anos de bancada para
            resolver de verdade — com orçamento aprovado por você antes de qualquer serviço.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsappCta
              size="lg"
              label="Solicitar orçamento no WhatsApp"
              message="Olá, Leonardo! Preciso de assistência técnica. Meu equipamento é: "
            />
            <a
              href={`tel:${COMPANY.phoneE164}`}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-white/25"
            >
              Ligar {COMPANY.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="pb-20" aria-labelledby="quick-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="quick-title" className="mb-8 font-display text-2xl font-bold text-white sm:text-3xl">
            Serviços mais procurados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_SERVICES.map((s) => (
              <article key={s.title} className="rounded-3xl border border-white/8 bg-panel/70 p-6 transition hover:border-brand/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ServiceIcon name={s.icon} className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.description}</p>
                <a
                  href={`https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(`Olá, Leonardo! Gostaria de um orçamento de: ${s.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-whatsapp hover:underline"
                >
                  Pedir orçamento →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-panel/40 py-20" aria-labelledby="process-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="process-title" className="mb-10 font-display text-2xl font-bold text-white sm:text-3xl">
            Como funciona
          </h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {PROCESS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/25 to-accent/25 text-white ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-sm font-bold text-slate-500">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 id="faq-title" className="font-display text-2xl font-bold text-white sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="mt-6 divide-y divide-white/5 rounded-3xl border border-white/8 bg-panel/60">
              {FAQ.map((item) => (
                <details key={item.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                    {item.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Onde atendemos</h2>
            <p className="mt-3 text-slate-400">
              Atendimento presencial na loja, no Centro de Palhoça, para toda a Grande Florianópolis. Consultoria e envio de PCs
              montados para todo o Brasil.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SERVICE_AREAS.map((area) => (
                <li key={area} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-slate-300">
                  {area}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-3xl border border-whatsapp/20 bg-whatsapp/5 p-6">
              <p className="font-semibold text-white">{COMPANY.address.full}</p>
              <p className="mt-1 text-sm text-slate-400">
                {COMPANY.hours
                  .filter((h) => h.time !== "Fechado")
                  .map((h) => `${h.days}: ${h.time}`)
                  .join(" · ")}
              </p>
              <WhatsappCta className="mt-5" label="Falar agora pelo WhatsApp" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
