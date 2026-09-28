"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, Copy, FileDown, Info, MessageCircle, Pencil, RefreshCw, Zap } from "lucide-react";
import CompatibilityBadge from "@/components/builder/CompatibilityBadge";
import { CATEGORY_LABEL, type PartCategory } from "@/data/hardwareCatalog";
import {
  buildSummaryText,
  estimateWattage,
  getCompatibility,
  missingRequired,
  recommendedPsuWatts,
  resolveBuild,
  STEP_CATEGORY_ORDER,
  STEPS,
  totalPrice,
} from "@/lib/builder";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { useBuilderStore } from "@/store/useBuilderStore";
import { cn, formatBRL } from "@/lib/utils";

export const TRANSPARENCY_NOTICE =
  "Valores estimados com base na média do mercado nacional. Solicite o orçamento exato com a LND no WhatsApp para garantir valores promocionais, condições de parcelamento e montagem com teste de estresse inclusos.";

const stepIndexOf = (category: PartCategory) => STEPS.findIndex((s) => s.categories.includes(category));

export function useBuildSummary() {
  const selections = useBuilderStore((s) => s.selections);
  return useMemo(() => {
    const build = resolveBuild(selections);
    const warnings = STEP_CATEGORY_ORDER.flatMap((category) => {
      const part = build[category];
      if (!part) return [];
      const others = { ...build };
      delete others[category];
      const result = getCompatibility(category, part as never, others);
      return result.status === "warning" || result.status === "error"
        ? [{ category, message: `${CATEGORY_LABEL[category]}: ${result.message}` }]
        : [];
    });
    return {
      build,
      total: totalPrice(build),
      wattage: estimateWattage(build),
      recommendedPsu: recommendedPsuWatts(build),
      missing: missingRequired(build),
      warnings,
      count: Object.keys(build).length,
    };
  }, [selections]);
}

export function openWhatsappWithBuild(build: ReturnType<typeof useBuildSummary>["build"]) {
  window.open(buildWhatsappUrl(buildSummaryText(build, { forWhatsapp: true })), "_blank", "noopener,noreferrer");
}

export default function SummaryCard({ className }: { className?: string }) {
  const { build, total, wattage, recommendedPsu, missing, warnings, count } = useBuildSummary();
  const setStep = useBuilderStore((s) => s.setStep);
  const reset = useBuilderStore((s) => s.reset);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = buildSummaryText(build);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const download = () => {
    const blob = new Blob([buildSummaryText(build)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orcamento-preliminar-lnd-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="resumo"
      aria-labelledby="summary-title"
      className={cn("scroll-mt-24 rounded-3xl border border-white/8 bg-panel/80 p-5 backdrop-blur", className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="summary-title" className="font-display text-lg font-bold text-white">
          Sua configuração
        </h2>
        <span className="text-xs text-slate-500">{count}/8 peças</span>
      </div>

      <ul className="divide-y divide-white/5">
        {STEP_CATEGORY_ORDER.map((category) => {
          const part = build[category];
          const integratedVideo = category === "gpu" && !part && build.cpu?.integratedGraphics;
          return (
            <li key={category} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{CATEGORY_LABEL[category]}</p>
                <p className={cn("truncate text-sm", part ? "text-white" : "text-slate-500")}>
                  {part ? part.name : integratedVideo ? "Vídeo integrado" : "Não selecionado"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-200">
                {part ? (part.price === 0 ? "Incluso" : formatBRL(part.price)) : "—"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep(stepIndexOf(category));
                  document.getElementById("builder-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-brand"
                aria-label={`Alterar ${CATEGORY_LABEL[category]}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
        <span className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-brand" /> Consumo ~{wattage}W
        </span>
        <span>Fonte ideal: {recommendedPsu}W</span>
      </div>

      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 space-y-1.5">
            {warnings.map((w) => (
              <li key={w.category}>
                <CompatibilityBadge status="warning" message={w.message} className="whitespace-normal" />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/5 pt-4">
        <div>
          <p className="text-xs text-slate-400">Valor estimado de mercado</p>
          <motion.p
            key={total}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-white"
          >
            {formatBRL(total)}
          </motion.p>
        </div>
        {missing.length > 0 && count > 0 && (
          <p className="flex items-center gap-1 text-right text-[11px] text-amber-300">
            <CircleAlert className="h-3.5 w-3.5" /> Faltam {missing.length}
          </p>
        )}
      </div>

      <p className="mt-3 flex gap-2 rounded-xl border border-sky-400/20 bg-sky-400/5 p-3 text-xs leading-relaxed text-sky-100/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
        {TRANSPARENCY_NOTICE}
      </p>

      <button
        type="button"
        disabled={count === 0}
        onClick={() => openWhatsappWithBuild(build)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 py-3.5 text-sm font-bold text-night shadow-lg shadow-whatsapp/20 transition hover:bg-whatsapp-strong disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MessageCircle className="h-5 w-5" />
        Enviar Configuração para o WhatsApp do Leonardo
      </button>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={count === 0}
          onClick={copy}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-40"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar resumo"}
        </button>
        <button
          type="button"
          disabled={count === 0}
          onClick={download}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-40"
        >
          <FileDown className="h-4 w-4" /> Baixar orçamento
        </button>
      </div>

      {count > 0 && (
        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-3 flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300"
        >
          <RefreshCw className="h-3 w-3" /> Recomeçar do zero
        </button>
      )}
    </section>
  );
}
