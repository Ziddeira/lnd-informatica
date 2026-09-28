import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Cable,
  Clock,
  Flame,
  HandCoins,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Hero3D from "@/components/hero/Hero3D";
import ReviewsSection from "@/components/ui/ReviewsSection";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { COMPANY } from "@/data/company";
import { SERVICES } from "@/data/services";
import { STEPS } from "@/lib/builder";

const STATS = [
  { value: "4,9★", label: "Nota no Google" },
  { value: "~5.000", label: "Avaliações de clientes" },
  { value: "20+", label: "Anos de experiência" },
  { value: "Brasil", label: "Envio de PCs montados" },
];

const DIFFERENTIALS = [
  { icon: HandCoins, title: "Transparência total", text: "Orçamento aprovado antes de qualquer serviço. Você sabe exatamente o que está pagando e por quê." },
  { icon: BadgeCheck, title: "Peças de procedência", text: "Trabalhamos só com distribuidores oficiais e componentes com nota fiscal e garantia." },
  { icon: Cable, title: "Cable management impecável", text: "Cabos organizados melhoram o fluxo de ar, a temperatura e deixam sua máquina linda." },
  { icon: Flame, title: "Teste de estresse", text: "Todo PC montado passa por horas de teste de CPU, GPU e memória antes de sair daqui." },
  { icon: ShieldCheck, title: "Garantia", text: "Garantia nas peças e no serviço, com suporte direto de quem montou a sua máquina." },
  { icon: MessageCircle, title: "Atendimento pelo WhatsApp", text: "Fale direto com o Leonardo: dúvidas, orçamentos e acompanhamento do serviço." },
];

export default function Home() {
  return (
    <>
      <Hero3D />

      {/* Números */}
      <section aria-label="Números da LND" className="border-y border-white/5 bg-panel/50">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col text-center">
              <dt className="order-2 text-xs uppercase tracking-wider text-slate-500">{s.label}</dt>
              <dd className="font-display text-3xl font-bold text-white sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 sm:py-28" aria-labelledby="services-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">O que fazemos</p>
            <h2 id="services-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Tudo o que o seu computador precisa, em um só lugar.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <article
                key={service.id}
                className={`group relative overflow-hidden rounded-3xl border border-white/8 bg-panel/70 p-6 transition hover:border-brand/30 hover:bg-panel ${i === 1 ? "lg:row-span-2 lg:flex lg:flex-col" : ""}`}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/10 blur-3xl transition group-hover:bg-brand/20" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-accent/20 text-brand ring-1 ring-white/10">
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{service.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                  {service.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-brand" /> {b}
                    </li>
                  ))}
                </ul>
                {i === 1 && (
                  <Link
                    href="/monte-seu-pc"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand lg:mt-auto lg:pt-6"
                  >
                    Montar meu PC agora <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Chamada para o montador */}
      <section className="px-4 sm:px-6 lg:px-8" aria-labelledby="builder-cta-title">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-brand/20 bg-gradient-to-br from-panel-2 via-panel to-night p-8 sm:p-12">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent,#000)]" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Monte seu PC Gamer</p>
              <h2 id="builder-cta-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Monte sua máquina em 7 etapas e veja o valor em tempo real.
              </h2>
              <p className="mt-4 text-slate-400">
                Validamos a compatibilidade das peças, calculamos a fonte ideal e você envia a configuração direto para o
                WhatsApp do Leonardo para receber o orçamento final com montagem e teste de estresse.
              </p>
              <Link
                href="/monte-seu-pc"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-night shadow-lg shadow-brand/25 transition hover:bg-cyan-300"
              >
                Começar a montar
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {STEPS.map((step, i) => (
                <li key={step.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-night/60 p-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 font-display text-sm font-bold text-brand">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{step.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 sm:py-28" aria-labelledby="diff-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Por que a LND</p>
            <h2 id="diff-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Os detalhes que fazem sua máquina durar anos.
            </h2>
          </div>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIALS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <Icon className="h-6 w-6 shrink-0 text-brand" />
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* Sobre */}
      <section id="sobre" className="scroll-mt-20 py-20 sm:py-28" aria-labelledby="about-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="relative">
            <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-panel-2 to-night">
              <div className="bg-grid absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-[9rem] font-bold leading-none text-gradient">20+</span>
                <span className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">anos de bancada</span>
              </div>
            </div>
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-white/10 bg-panel px-5 py-3 shadow-xl">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-sm text-slate-300">
                <strong className="text-white">4,9</strong> · {COMPANY.reviewCountLabel} avaliações
              </span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Sobre a LND</p>
            <h2 id="about-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Atendimento de especialista, do jeito que deveria ser.
            </h2>
            <div className="mt-6 space-y-4 text-slate-400">
              <p>
                A LND Informática nasceu da experiência do <strong className="text-white">Leonardo</strong>, que há mais de 20
                anos trabalha com manutenção de computadores, notebooks, servidores e máquinas de alta performance.
              </p>
              <p>
                Do centro de Palhoça, atendemos pessoas e empresas de toda a Grande Florianópolis com assistência técnica
                presencial — e enviamos PCs Gamers montados e testados, além de consultoria, para todo o Brasil.
              </p>
              <p>
                Nosso compromisso é simples: explicar tudo com clareza, indicar só o que faz sentido para você e entregar um
                serviço que dispensa retrabalho.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsappCta label="Conversar com o Leonardo" />
              <Link
                href="/assistencia"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/25"
              >
                Ver assistência técnica <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="scroll-mt-20 border-t border-white/5 bg-panel/40 py-20 sm:py-28" aria-labelledby="contact-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Localização e contato</p>
            <h2 id="contact-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Venha nos visitar no Centro de Palhoça.
            </h2>

            <ul className="mt-8 space-y-5">
              <li className="flex gap-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-white">Endereço</p>
                  <p className="text-sm text-slate-400">{COMPANY.address.full}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-white">Telefone e WhatsApp</p>
                  <a href={`tel:${COMPANY.phoneE164}`} className="text-sm text-slate-400 hover:text-white">
                    {COMPANY.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-white">Horário de funcionamento</p>
                  <ul className="text-sm text-slate-400">
                    {COMPANY.hours.map((h) => (
                      <li key={h.days}>
                        {h.days}: {h.time}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li className="flex gap-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-white">Área de atendimento</p>
                  <p className="text-sm text-slate-400">{COMPANY.serviceArea}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsappCta label="Chamar no WhatsApp" />
              <a
                href={COMPANY.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/25"
              >
                <Navigation className="h-4 w-4" /> Como chegar
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 lg:col-span-3">
            <iframe
              title="Mapa: LND Informática no Centro de Palhoça"
              src={COMPANY.mapsEmbedUrl}
              className="h-[380px] w-full grayscale-[0.4] invert-[0.9] hue-rotate-180 lg:h-full lg:min-h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
