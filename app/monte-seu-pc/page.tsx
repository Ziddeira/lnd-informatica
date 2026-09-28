import type { Metadata } from "next";
import { Flame, ShieldCheck, Truck } from "lucide-react";
import BuilderWizard from "@/components/builder/BuilderWizard";

export const metadata: Metadata = {
  title: "Monte seu PC Gamer",
  description:
    "Monte seu PC Gamer ou Workstation em 7 etapas com validação de compatibilidade, cálculo de fonte e valor estimado em tempo real. Envie para o WhatsApp da LND e receba o orçamento final.",
};

export default function MonteSeuPcPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000,transparent)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-72 w-[680px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Configurador LND</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Monte seu PC Gamer <span className="text-gradient">peça por peça.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            Escolha cada componente, acompanhe a compatibilidade e o valor estimado em tempo real e envie a configuração para
            o Leonardo finalizar o orçamento com as melhores condições.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> Compatibilidade validada
            </li>
            <li className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-brand" /> Montagem com teste de estresse
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" /> Envio para todo o Brasil
            </li>
          </ul>
        </div>
      </section>
      <BuilderWizard />
    </>
  );
}
