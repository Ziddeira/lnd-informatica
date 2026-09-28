"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, CircleAlert, MonitorOff, X, Zap } from "lucide-react";
import CompatibilityBadge from "@/components/builder/CompatibilityBadge";
import {
  CATALOG,
  CATEGORY_LABEL,
  describePart,
  type AnyPart,
  type PartCategory,
} from "@/data/hardwareCatalog";
import {
  estimateWattage,
  getCompatibility,
  recommendedPsuWatts,
  resolveBuild,
  STEPS,
  type BuilderStep,
  type CompatResult,
} from "@/lib/builder";
import { useBuilderStore } from "@/store/useBuilderStore";
import { cn, formatBRL } from "@/lib/utils";

type FilterOption = { value: string; label: string };

const FILTERS: Partial<Record<PartCategory, { options: FilterOption[]; match: (part: AnyPart, value: string) => boolean }>> = {
  cpu: {
    options: [
      { value: "all", label: "Todos" },
      { value: "intel", label: "Intel" },
      { value: "amd", label: "AMD" },
    ],
    match: (p, v) => "vendor" in p && p.vendor === v,
  },
  gpu: {
    options: [
      { value: "all", label: "Todas" },
      { value: "nvidia", label: "NVIDIA" },
      { value: "amd", label: "AMD Radeon" },
      { value: "intel", label: "Intel Arc" },
    ],
    match: (p, v) => "vendor" in p && p.vendor === v,
  },
  ram: {
    options: [
      { value: "all", label: "Todas" },
      { value: "16", label: "16GB" },
      { value: "32", label: "32GB" },
      { value: "48", label: "48GB" },
      { value: "64", label: "64GB" },
      { value: "96", label: "96GB" },
    ],
    match: (p, v) => "capacityGB" in p && p.capacityGB === Number(v),
  },
  storage: {
    options: [
      { value: "all", label: "Todos" },
      { value: "nvme", label: "SSD NVMe" },
      { value: "sata", label: "SSD SATA" },
      { value: "hdd", label: "HDD" },
    ],
    match: (p, v) => "type" in p && p.type === v,
  },
};

const STATUS_ORDER: Record<CompatResult["status"], number> = { recommended: 0, ok: 1, warning: 2, error: 3 };

function PartGrid({ category }: { category: PartCategory }) {
  const selections = useBuilderStore((s) => s.selections);
  const select = useBuilderStore((s) => s.select);
  const clear = useBuilderStore((s) => s.clear);
  const [filter, setFilter] = useState("all");
  const filterDef = FILTERS[category];

  const build = useMemo(() => {
    // Avalia cada opção como se ela substituísse a peça atual da mesma categoria
    const withoutCurrent = { ...selections };
    delete withoutCurrent[category];
    return resolveBuild(withoutCurrent);
  }, [selections, category]);

  const items = useMemo(() => {
    const list = (CATALOG[category] as AnyPart[])
      .filter((p) => !filterDef || filter === "all" || filterDef.match(p, filter))
      .map((part) => ({ part, compat: getCompatibility(category, part as never, build) }));
    return list.sort((a, b) => STATUS_ORDER[a.compat.status] - STATUS_ORDER[b.compat.status] || a.part.price - b.part.price);
  }, [category, filter, filterDef, build]);

  const selectedId = selections[category];
  const canSkipGpu = category === "gpu" && !!build.cpu?.integratedGraphics;

  return (
    <div className="space-y-4">
      {filterDef && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={`Filtrar ${CATEGORY_LABEL[category]}`}>
          {filterDef.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={filter === opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                filter === opt.value
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {canSkipGpu && (
          <button
            type="button"
            onClick={() => clear("gpu")}
            aria-pressed={!selectedId}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4 text-left transition sm:col-span-2",
              !selectedId ? "border-brand bg-brand/10" : "border-dashed border-white/15 hover:border-white/30",
            )}
          >
            <MonitorOff className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="text-sm">
              <strong className="text-white">Usar o vídeo integrado do processador</strong>
              <span className="block text-slate-400">Ideal para escritório e estudo. Dá para adicionar uma placa depois.</span>
            </span>
          </button>
        )}

        {items.map(({ part, compat }) => {
          const selected = part.id === selectedId;
          const disabled = compat.status === "error";
          return (
            <motion.button
              layout
              key={part.id}
              type="button"
              disabled={disabled}
              onClick={() => select(category, part.id)}
              aria-pressed={selected}
              className={cn(
                "group relative flex flex-col rounded-2xl border p-4 text-left transition",
                selected
                  ? "border-brand bg-gradient-to-br from-brand/15 to-accent/5 shadow-lg shadow-brand/10"
                  : "border-white/8 bg-panel-2/60 hover:border-white/20 hover:bg-panel-2",
                disabled && "cursor-not-allowed opacity-45 hover:border-white/8 hover:bg-panel-2/60",
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{part.brand}</p>
                  <p className="font-semibold leading-snug text-white">{part.name}</p>
                </div>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                    selected ? "border-brand bg-brand text-night" : "border-white/15 text-transparent group-hover:border-white/30",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>

              {part.highlight && <p className="mb-2 text-xs text-brand/90">{part.highlight}</p>}

              <div className="mb-3 flex flex-wrap gap-1.5">
                {describePart(category, part as never).map((spec) => (
                  <span key={spec} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-end justify-between gap-2">
                <CompatibilityBadge status={compat.status} message={compat.message} />
                <span className="shrink-0 font-display text-lg font-bold text-white">
                  {part.price === 0 ? "Incluso" : formatBRL(part.price)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PowerBanner() {
  const selections = useBuilderStore((s) => s.selections);
  const build = useMemo(() => resolveBuild(selections), [selections]);
  const draw = estimateWattage(build);
  const recommended = recommendedPsuWatts(build);
  const pct = Math.min(100, (draw / recommended) * 100);
  return (
    <div className="mb-4 rounded-2xl border border-brand/20 bg-brand/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-semibold text-white">
          <Zap className="h-4 w-4 text-brand" /> Consumo estimado: ~{draw}W
        </span>
        <span className="text-slate-300">
          Fonte recomendada: <strong className="text-brand">{recommended}W</strong>
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Cálculo: TDP de pico do processador + placa de vídeo + placa-mãe, memórias, SSDs e fans, com ~35% de margem de segurança
        para picos de consumo e upgrades futuros.
      </p>
    </div>
  );
}

export default function StepSelector() {
  const step = useBuilderStore((s) => s.step);
  const nextStep = useBuilderStore((s) => s.nextStep);
  const prevStep = useBuilderStore((s) => s.prevStep);
  const notice = useBuilderStore((s) => s.notice);
  const dismissNotice = useBuilderStore((s) => s.dismissNotice);
  const current: BuilderStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <section aria-labelledby="step-title" className="rounded-3xl border border-white/8 bg-panel/70 p-4 sm:p-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Etapa {step + 1} de {STEPS.length}
        </p>
        <h2 id="step-title" className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
          {current.title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{current.description}</p>
      </header>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="flex-1">{notice}</p>
              <button type="button" onClick={dismissNotice} aria-label="Fechar aviso" className="text-amber-200/70 hover:text-amber-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {current.id === "psu" && <PowerBanner />}
          {current.categories.map((category) => (
            <div key={category}>
              {current.categories.length > 1 && (
                <h3 className="mb-3 font-display text-lg font-semibold text-white">{CATEGORY_LABEL[category]}</h3>
              )}
              <PartGrid category={category} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-5">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
        {isLast ? (
          <a
            href="#resumo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-night transition hover:bg-cyan-300"
          >
            Revisar e enviar <ChevronRight className="h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              nextStep();
              document.getElementById("builder-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-night transition hover:bg-cyan-300"
          >
            Próximo: {STEPS[step + 1].short} <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </footer>
    </section>
  );
}
