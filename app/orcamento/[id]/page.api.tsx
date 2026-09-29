import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleAlert, Cpu, Info, Zap } from "lucide-react";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { CATEGORY_LABEL } from "@/data/hardwareCatalog";
import { findById } from "@/lib/server/store";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Configuração salva",
  robots: { index: false, follow: false },
};

/** Página compartilhável de uma configuração salva no montador (link enviado no WhatsApp). */
// Tipagem manual: o gerador de tipos do Next não enxerga páginas com extensão customizada (.api.tsx).
export default async function OrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = /^PC-[A-Z0-9]{6}$/.test(id) ? await findById("orcamentos", id) : undefined;
  if (!quote) notFound();

  const created = new Date(quote.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        <Cpu className="h-4 w-4" /> Configuração {quote.id}
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Orçamento preliminar de PC</h1>
      <p className="mt-2 text-sm text-slate-400">Montado no configurador da LND em {created}.</p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/8 bg-panel/80">
        <ul className="divide-y divide-white/5">
          {quote.parts.map((part) => (
            <li key={part.category} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{CATEGORY_LABEL[part.category]}</p>
                <p className="truncate text-white">{part.name}</p>
              </div>
              <span className="shrink-0 font-semibold text-slate-200">{part.price === 0 ? "Incluso" : formatBRL(part.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/8 bg-white/[0.02] px-5 py-5">
          <p className="flex items-center gap-2 text-sm text-slate-300">
            <Zap className="h-4 w-4 text-brand" /> Consumo ~{quote.wattage}W · fonte ideal {quote.recommendedPsu}W
          </p>
          <div className="text-right">
            <p className="text-xs text-slate-400">Valor estimado de mercado</p>
            <p className="font-display text-3xl font-bold text-white">{formatBRL(quote.total)}</p>
          </div>
        </div>
      </div>

      {(quote.warnings.length > 0 || quote.missing.length > 0) && (
        <ul className="mt-4 space-y-2 text-sm text-amber-200">
          {quote.missing.length > 0 && (
            <li className="flex gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Faltam: {quote.missing.map((c) => CATEGORY_LABEL[c]).join(", ")}
            </li>
          )}
          {quote.warnings.map((w) => (
            <li key={w} className="flex gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {w}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 flex gap-2 rounded-xl border border-sky-400/20 bg-sky-400/5 p-3 text-xs leading-relaxed text-sky-100/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
        Valores estimados com base na média do mercado nacional. O orçamento final, com montagem, teste de estresse e
        garantia, é enviado pela LND.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <WhatsappCta
          size="lg"
          label="Pedir valor final no WhatsApp"
          message={`Olá, Leonardo! Quero o valor final da configuração ${quote.id}.`}
        />
        <Link
          href="/monte-seu-pc/"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-white/25"
        >
          Montar outra configuração
        </Link>
      </div>
    </section>
  );
}
