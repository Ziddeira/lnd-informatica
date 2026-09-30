import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleCheck,
  Cpu,
  FileText,
  Flame,
  HandCoins,
  MessageCircle,
  Server,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import Hero3D from "@/components/hero/Hero3D";
import { ServerRack, StatusPanel } from "@/components/b2b/Visuals";
import LeadForm from "@/components/forms/LeadForm";
import ReviewsSection from "@/components/ui/ReviewsSection";
import { FeatureCard, SectionHeading } from "@/components/ui/Section";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { B2B_SERVICES, SERVER_STACK } from "@/data/b2b";
import { COMPANY } from "@/data/company";
import { STEPS } from "@/lib/builder";

const STATS = [
  { value: "4,9★", label: "Nota no Google" },
  { value: "~5.000", label: "Avaliações de clientes" },
  { value: "20+", label: "Anos de experiência" },
  { value: String(COMPANY.foundedYear), label: "Loja no Centro de Palhoça" },
];

const PATHS = [
  {
    href: "/empresas",
    icon: Building2,
    eyebrow: "Para empresas",
    title: "Suporte de TI B2B",
    text: "Help desk, manutenção preventiva, backup e contratos com prioridade de atendimento. Sua equipe trabalhando sem parar.",
    bullets: ["Planos mensais sob medida", "Atendimento remoto e presencial", "Relatório mensal da saúde da TI"],
    className: "lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    href: "/servidores",
    icon: Server,
    eyebrow: "Infraestrutura",
    title: "Servidores, redes e firewall",
    text: "Windows Server, Linux, Active Directory, virtualização, pfSense, cabeamento e nuvem.",
    className: "lg:col-span-2",
  },
  {
    href: "/monte-seu-pc",
    icon: Cpu,
    eyebrow: "Universo gamer",
    title: "Monte seu PC Gamer",
    text: "Configurador com compatibilidade validada e preço em tempo real.",
  },
  {
    href: "/assistencia",
    icon: Wrench,
    eyebrow: "Assistência",
    title: "Reparo e manutenção",
    text: "Notebooks, desktops, impressoras e nobreaks com orçamento aprovado antes.",
  },
] as const;

const DIFFERENTIALS = [
  { icon: HandCoins, title: "Transparência total", text: "Orçamento e escopo aprovados antes de qualquer serviço. Você sabe o que está pagando e por quê." },
  { icon: FileText, title: "Contrato claro", text: "Planos com escopo definido e custo previsível. Sem letras miúdas, sem surpresa na fatura." },
  { icon: BadgeCheck, title: "Procedência garantida", text: "Equipamentos e peças de distribuidores oficiais, com nota fiscal e garantia." },
  { icon: Flame, title: "Teste de estresse", text: "Todo PC e servidor montado passa por horas de teste antes da entrega." },
  { icon: ShieldCheck, title: "Segurança em primeiro lugar", text: "Backup testado, firewall e boas práticas alinhadas à LGPD em cada projeto." },
  { icon: MessageCircle, title: "Atendimento direto", text: "Fale com quem resolve: WhatsApp, telefone e e-mail com o Leonardo e a equipe técnica." },
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

      {/* Caminhos por público */}
      <section className="py-20 sm:py-28" aria-labelledby="paths-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="paths-title"
            eyebrow="Como podemos ajudar"
            title="Uma equipe de TI para a sua empresa. Um especialista para o seu setup."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((path) => {
              const Icon = path.icon;
              const featured = "featured" in path && path.featured;
              return (
                <Link
                  key={path.href}
                  href={path.href}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border p-6 transition sm:p-7 ${
                    featured
                      ? "border-brand/30 bg-gradient-to-br from-brand/15 via-panel to-panel hover:border-brand/60"
                      : "border-white/8 bg-panel/70 hover:border-brand/30 hover:bg-panel"
                  } ${"className" in path ? path.className : ""}`}
                >
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl transition group-hover:bg-brand/20" />
                  <span
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${
                      featured ? "bg-brand text-night ring-brand" : "bg-brand/10 text-brand ring-brand/20"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{path.eyebrow}</p>
                  <h3 className={`mt-2 font-display font-bold text-white ${featured ? "text-3xl sm:text-4xl" : "text-xl"}`}>{path.title}</h3>
                  <p className={`mt-3 leading-relaxed text-slate-400 ${featured ? "max-w-md text-base" : "text-sm"}`}>{path.text}</p>
                  {"bullets" in path && (
                    <ul className="mt-6 space-y-2.5">
                      {path.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-sm text-slate-200">
                          <CircleCheck className="h-4 w-4 text-brand" /> {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-brand">
                    Saiba mais <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destaque B2B */}
      <section className="relative overflow-hidden border-y border-white/5 bg-panel/40 py-20 sm:py-28" aria-labelledby="b2b-title">
        <div className="bg-grid absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_right,#000_20%,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                className="mb-8"
                id="b2b-title"
                eyebrow="Suporte de TI para empresas"
                title={
                  <>
                    Sua TI funcionando, <span className="text-gradient">sua equipe produzindo.</span>
                  </>
                }
                description="Cuidamos de computadores, servidores, rede, backup e segurança para que você foque no seu negócio. Contratos mensais com prioridade, preventivas programadas e relatório de tudo o que foi feito."
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/empresas#planos"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-night shadow-lg shadow-brand/25 transition hover:bg-brand-light"
                >
                  Ver planos de suporte <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <WhatsappCta
                  size="lg"
                  variant="outline"
                  label="Falar com um especialista"
                  message="Olá, Leonardo! Gostaria de conhecer os planos de suporte de TI para a minha empresa."
                />
              </div>
            </div>
            <StatusPanel />
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {B2B_SERVICES.map((service) => (
              <FeatureCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Destaque Servidores */}
      <section className="overflow-hidden py-20 sm:py-28" aria-labelledby="servers-title">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <ServerRack className="order-2 lg:order-1" />
          <div className="order-1 lg:order-2">
            <SectionHeading
              className="mb-8"
              id="servers-title"
              eyebrow="Servidores & infraestrutura"
              title="Especialistas em servidores Windows e Linux."
              description="Da implantação à administração do dia a dia: projetamos, instalamos e mantemos o coração da TI da sua empresa — com firewall, rede estruturada e backup."
            />
            <ul className="flex flex-wrap gap-2">
              {SERVER_STACK.map((item) => (
                <li key={item} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/servidores"
              className="group mt-8 inline-flex items-center gap-2 font-semibold text-brand"
            >
              Conhecer as soluções de infraestrutura <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Universo gamer */}
      <section className="px-4 sm:px-6 lg:px-8" aria-labelledby="builder-cta-title">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-brand/20 bg-gradient-to-br from-panel-2 via-panel to-night p-8 sm:p-12">
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent,#000)]" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Universo gamer</p>
              <h2 id="builder-cta-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Monte sua máquina em 7 etapas e veja o valor em tempo real.
              </h2>
              <p className="mt-4 text-slate-400">
                Validamos a compatibilidade das peças, calculamos a fonte ideal e você envia a configuração direto para o WhatsApp
                do Leonardo para receber o orçamento final com montagem, cable management e teste de estresse.
              </p>
              <Link
                href="/monte-seu-pc"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-night shadow-lg shadow-brand/25 transition hover:bg-brand-light"
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
          <SectionHeading id="diff-title" eyebrow="Por que a LND" title="O jeito LND de cuidar da sua tecnologia." />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIALS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
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
                <span className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">anos de experiência</span>
              </div>
            </div>
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-white/10 bg-panel px-5 py-3 shadow-xl">
              <Star className="h-5 w-5 fill-brand text-brand" />
              <span className="text-sm text-slate-300">
                <strong className="text-white">4,9</strong> · {COMPANY.reviewCountLabel} avaliações
              </span>
            </div>
          </div>
          <div>
            <SectionHeading
              className="mb-6"
              id="about-title"
              eyebrow="Sobre a LND"
              title="Atendimento de especialista, do jeito que deveria ser."
            />
            <div className="space-y-4 text-slate-400">
              <p>
                A LND Informática foi fundada em {COMPANY.foundedYear} pelo <strong className="text-white">Leonardo</strong>, que há
                mais de 20 anos trabalha com servidores, redes, suporte a empresas e máquinas de alta performance.
              </p>
              <p>
                Do Centro de Palhoça, atendemos empresas e pessoas de toda a Grande Florianópolis com suporte presencial — e, de
                forma remota, empresas de todo o Brasil. PCs Gamers montados e testados também são enviados para qualquer estado.
              </p>
              <p>
                Nosso compromisso é simples: explicar tudo com clareza, indicar só o que faz sentido e entregar um serviço que
                dispensa retrabalho.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsappCta label="Conversar com o Leonardo" />
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/25"
              >
                Como chegar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="scroll-mt-20 border-t border-white/5 bg-panel/40 py-20 sm:py-28" aria-labelledby="contact-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <SectionHeading
              className="mb-8"
              id="contact-title"
              eyebrow="Orçamento sem compromisso"
              title="Conte o que você precisa."
              description="Empresa, servidor, PC Gamer ou conserto: responda em 1 minuto e retornamos em horário comercial."
            />
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                "Diagnóstico e proposta com escopo claro",
                "Atendimento presencial na Grande Florianópolis",
                "Suporte remoto para empresas de todo o Brasil",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CircleCheck className="h-4 w-4 text-brand" /> {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-slate-400">
              Prefere falar agora? Ligue{" "}
              <a href={`tel:${COMPANY.phoneE164}`} className="font-semibold text-white hover:text-brand">
                {COMPANY.phoneDisplay}
              </a>{" "}
              ou chame no WhatsApp.
            </p>
          </div>
          <LeadForm className="lg:col-span-3" />
        </div>
      </section>
    </>
  );
}
