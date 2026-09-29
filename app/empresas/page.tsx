import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Check, ChevronDown, Clock, Timer } from "lucide-react";
import { StatusPanel } from "@/components/b2b/Visuals";
import LeadForm from "@/components/forms/LeadForm";
import { FeatureCard, PageHero, SectionHeading } from "@/components/ui/Section";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { B2B_FAQ, B2B_SERVICES, ONBOARDING, PLANS, SEGMENTS } from "@/data/b2b";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Suporte de TI para Empresas",
  description:
    "Suporte de TI B2B em Palhoça e Grande Florianópolis: help desk, contratos de manutenção, gestão de servidores, backup, firewall pfSense e Google Workspace. Atendimento remoto para todo o Brasil.",
};

const PAINS = [
  "O servidor cai e ninguém sabe o que fazer",
  "Backup existe… mas nunca foi testado",
  "Internet lenta e Wi-Fi que não chega na sala",
  "Cada computador foi configurado de um jeito",
  "Chamado de TI demora dias para ser atendido",
  "Sem controle de licenças, senhas e acessos",
];

export default function EmpresasPage() {
  return (
    <>
      <PageHero
        eyebrow={
          <>
            <Building2 className="h-4 w-4" /> Suporte de TI B2B
          </>
        }
        title={
          <>
            TI terceirizada para empresas que <span className="text-gradient">não podem parar.</span>
          </>
        }
        description="Help desk, manutenção preventiva, servidores, backup e segurança em um só contrato. Você tem um time de TI experiente, com custo previsível e prioridade no atendimento."
        aside={<StatusPanel />}
      >
        <Link
          href="#proposta"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-night shadow-lg shadow-brand/25 transition hover:bg-brand-light"
        >
          Solicitar diagnóstico <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <WhatsappCta
          size="lg"
          variant="outline"
          label="Falar no WhatsApp"
          message="Olá, Leonardo! Quero conhecer o suporte de TI para a minha empresa."
        />
      </PageHero>

      {/* Dores */}
      <section className="py-20 sm:py-24" aria-labelledby="pains-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionHeading
            className="mb-0"
            id="pains-title"
            eyebrow="Isso soa familiar?"
            title="Problemas de TI custam horas de trabalho — e clientes."
            description="Se algum destes itens acontece na sua empresa, um contrato de suporte resolve na raiz, e não só apaga incêndio."
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {PAINS.map((pain) => (
              <li key={pain} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-panel/60 p-4 text-sm text-slate-300">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {pain}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Serviços */}
      <section className="border-y border-white/5 bg-panel/40 py-20 sm:py-24" aria-labelledby="services-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="services-title"
            eyebrow="O que está incluído"
            title="Tudo o que a TI da sua empresa precisa."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {B2B_SERVICES.map((service) => (
              <FeatureCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-20 py-20 sm:py-28" aria-labelledby="plans-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="center"
            id="plans-title"
            eyebrow="Planos de suporte"
            title="Escolha o nível de cuidado certo para o seu negócio."
            description="Valores sob medida, de acordo com o número de computadores, servidores e filiais. Proposta fechada após o diagnóstico."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-7",
                  plan.highlight
                    ? "border-brand/50 bg-gradient-to-b from-brand/10 to-panel shadow-2xl shadow-brand/10"
                    : "border-white/8 bg-panel/70",
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-bold text-night">Mais contratado</span>
                )}
                <h3 className="font-display text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm font-medium text-brand">{plan.tagline}</p>
                <p className="mt-3 text-sm text-slate-400">{plan.forWho}</p>
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <Timer className="h-4 w-4 shrink-0 text-brand" /> {plan.response}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {feature}
                    </li>
                  ))}
                </ul>
                <WhatsappCta
                  className="mt-8 w-full"
                  variant={plan.highlight ? "solid" : "outline"}
                  label="Pedir proposta"
                  message={`Olá, Leonardo! Tenho interesse no plano de suporte ${plan.name} para a minha empresa.`}
                />
              </article>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
            <Clock className="h-4 w-4" /> Precisa só de um atendimento pontual? Também atendemos chamados avulsos.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y border-white/5 bg-panel/40 py-20 sm:py-24" aria-labelledby="onboarding-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading id="onboarding-title" eyebrow="Como começamos" title="Do diagnóstico ao suporte contínuo em 4 passos." />
          <ol className="grid gap-6 md:grid-cols-4">
            {ONBOARDING.map((step, i) => (
              <li key={step.title} className="relative rounded-3xl border border-white/8 bg-panel/70 p-6">
                <span className="font-display text-5xl font-bold text-brand/25">0{i + 1}</span>
                <h3 className="mt-2 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Segmentos + FAQ */}
      <section className="py-20 sm:py-24" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              className="mb-8"
              eyebrow="Para quem"
              title="Empresas de todos os portes e segmentos."
              description="Do escritório com 3 computadores à indústria com vários servidores e filiais."
            />
            <ul className="flex flex-wrap gap-2">
              {SEGMENTS.map((segment) => (
                <li key={segment} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-slate-300">
                  {segment}
                </li>
              ))}
            </ul>
            <Link href="/servidores" className="group mt-8 inline-flex items-center gap-2 font-semibold text-brand">
              Ver soluções de servidores e redes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div>
            <h2 id="faq-title" className="font-display text-2xl font-bold text-white sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="mt-6 divide-y divide-white/5 rounded-3xl border border-white/8 bg-panel/60">
              {B2B_FAQ.map((item) => (
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
        </div>
      </section>

      {/* Proposta */}
      <section id="proposta" className="scroll-mt-20 border-t border-white/5 bg-panel/40 py-20 sm:py-24" aria-labelledby="proposal-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <SectionHeading
            className="lg:col-span-2"
            id="proposal-title"
            eyebrow="Diagnóstico de TI"
            title="Vamos entender o seu ambiente."
            description="Conte como está a TI da sua empresa hoje. Retornamos para agendar o diagnóstico e enviar uma proposta sob medida."
          />
          <LeadForm
            className="lg:col-span-3"
            defaultInterest="empresa"
            interests={["empresa", "servidores"]}
            title="Solicitar proposta para empresa"
          />
        </div>
      </section>
    </>
  );
}
