import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cable, Check, Cloud, Server, ShieldCheck } from "lucide-react";
import { ServerRack } from "@/components/b2b/Visuals";
import LeadForm from "@/components/forms/LeadForm";
import { FeatureCard, PageHero, SectionHeading } from "@/components/ui/Section";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { CLOUD_SERVICES, FIREWALL_FEATURES, NETWORK_STEPS, SERVER_SERVICES, SERVER_STACK } from "@/data/b2b";

export const metadata: Metadata = {
  title: "Servidores, Redes e Firewall",
  description:
    "Implantação e administração de servidores Windows Server e Linux, Active Directory, virtualização, failover, firewall pfSense, VPN, cabeamento estruturado, backup e Google Workspace em Palhoça e Grande Florianópolis.",
};

const JUMP_LINKS = [
  { href: "#servidores", label: "Servidores", icon: Server },
  { href: "#firewall", label: "Firewall", icon: ShieldCheck },
  { href: "#redes", label: "Redes", icon: Cable },
  { href: "#cloud", label: "Cloud e backup", icon: Cloud },
];

export default function ServidoresPage() {
  return (
    <>
      <PageHero
        eyebrow={
          <>
            <Server className="h-4 w-4" /> Infraestrutura de TI
          </>
        }
        title={
          <>
            Servidores, redes e segurança <span className="text-gradient">feitos para durar.</span>
          </>
        }
        description="Projetamos, implantamos e administramos a infraestrutura da sua empresa: servidores Windows e Linux, firewall pfSense, rede estruturada, backup e nuvem — tudo documentado e monitorado."
        aside={<ServerRack />}
      >
        <Link
          href="#projeto"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-night shadow-lg shadow-brand/25 transition hover:bg-brand-light"
        >
          Solicitar projeto <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <WhatsappCta
          size="lg"
          variant="outline"
          label="Emergência no servidor"
          message="Olá, Leonardo! Estou com um problema urgente no servidor da empresa."
        />
      </PageHero>

      {/* Navegação interna */}
      <nav aria-label="Seções da página" className="sticky top-16 z-30 border-b border-white/5 bg-night/85 backdrop-blur-xl lg:top-[72px]">
        <ul className="scrollbar-thin mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {JUMP_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <a
                href={href}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4 text-brand" /> {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Servidores */}
      <section id="servidores" className="scroll-mt-32 py-20 sm:py-24" aria-labelledby="srv-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="srv-title"
            eyebrow="Servidores"
            title="Especialistas em Windows Server e Linux."
            description="Do servidor de arquivos da pequena empresa ao ambiente virtualizado com alta disponibilidade."
          />
          <ul className="mb-10 flex flex-wrap gap-2">
            {SERVER_STACK.map((item) => (
              <li key={item} className="rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1.5 text-sm text-slate-200">
                {item}
              </li>
            ))}
          </ul>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVER_SERVICES.map((service) => (
              <FeatureCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Firewall */}
      <section id="firewall" className="scroll-mt-32 border-y border-white/5 bg-panel/40 py-20 sm:py-24" aria-labelledby="fw-title">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionHeading
            className="mb-0"
            id="fw-title"
            eyebrow="Firewall pfSense"
            title="Controle total sobre a internet da sua empresa."
            description="Um firewall bem configurado protege contra ataques, garante a banda para o que importa e mostra exatamente como a rede está sendo usada."
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {FIREWALL_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-panel/70 p-4 text-sm text-slate-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Redes */}
      <section id="redes" className="scroll-mt-32 py-20 sm:py-24" aria-labelledby="net-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="net-title"
            eyebrow="Cabeamento e administração de redes"
            title="Rede estável é a base de tudo."
            description="Precisa implantar novos sistemas, expandir a rede, criar rotinas de backup ou melhorar a performance? Cuidamos do projeto à administração."
          />
          <ol className="grid gap-5 md:grid-cols-3">
            {NETWORK_STEPS.map((step, i) => (
              <li key={step.title} className="rounded-3xl border border-white/8 bg-panel/70 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand font-display font-bold text-night">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cloud */}
      <section id="cloud" className="scroll-mt-32 border-y border-white/5 bg-panel/40 py-20 sm:py-24" aria-labelledby="cloud-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="cloud-title"
            eyebrow="Cloud, backup e segurança"
            title="Seus dados seguros, dentro e fora da empresa."
            description="Soluções Google para empresas, backup em nuvem e segurança da informação — com rotinas testadas, não apenas configuradas."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {CLOUD_SERVICES.map((service) => (
              <FeatureCard key={service.title} {...service} />
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-brand/25 bg-gradient-to-r from-brand/10 to-transparent p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="font-display text-xl font-bold text-white">Quer tudo isso com custo mensal previsível?</p>
              <p className="mt-1 text-sm text-slate-400">A gestão de servidores, firewall e backup faz parte dos planos de suporte B2B.</p>
            </div>
            <Link
              href="/empresas#planos"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-night transition hover:bg-brand-light"
            >
              Ver planos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Projeto */}
      <section id="projeto" className="scroll-mt-32 py-20 sm:py-24" aria-labelledby="project-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <SectionHeading
              className="mb-8"
              id="project-title"
              eyebrow="Projeto de infraestrutura"
              title="Conte o seu cenário."
              description="Servidor novo, migração, firewall, rede ou backup: descreva o que precisa e enviamos uma proposta técnica."
            />
            <ul className="space-y-3 text-sm text-slate-300">
              {["Levantamento técnico no local", "Proposta com hardware e escopo detalhados", "Documentação entregue ao final"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-brand" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <LeadForm
            className="lg:col-span-3"
            defaultInterest="servidores"
            interests={["servidores", "empresa"]}
            title="Solicitar projeto de infraestrutura"
          />
        </div>
      </section>
    </>
  );
}
