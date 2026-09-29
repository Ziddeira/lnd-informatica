"use client";

import { useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Check, MessageCircle, Palette, Sparkles } from "lucide-react";
import CanvasSkeleton from "@/components/3d/CanvasSkeleton";
import StepSelector from "@/components/builder/StepSelector";
import SummaryCard, { openWhatsappWithBuild, useBuildSummary } from "@/components/builder/SummaryCard";
import { PRESET_BUILDS } from "@/data/hardwareCatalog";
import { STEPS } from "@/lib/builder";
import { RGB_PRESETS, useBuilderStore } from "@/store/useBuilderStore";
import { cn, formatBRL } from "@/lib/utils";

const PcCanvas = dynamic(() => import("@/components/3d/PcCanvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton label="Carregando visualizador 3D…" />,
});

function Stepper() {
  const step = useBuilderStore((s) => s.step);
  const setStep = useBuilderStore((s) => s.setStep);
  const selections = useBuilderStore((s) => s.selections);
  return (
    <nav aria-label="Etapas do montador" className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-2">
      <ol className="flex min-w-max gap-2">
        {STEPS.map((s, i) => {
          const done = s.categories.every((c) => selections[c]);
          const current = i === step;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                  current
                    ? "border-brand bg-brand/10 text-white"
                    : "border-white/8 text-slate-400 hover:border-white/20 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold",
                    done ? "bg-emerald-400/20 text-emerald-300" : current ? "bg-brand text-night" : "bg-white/5",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {s.short}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Presets() {
  const applyPreset = useBuilderStore((s) => s.applyPreset);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {PRESET_BUILDS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => applyPreset(preset.selections)}
          className="group rounded-2xl border border-white/8 bg-panel/60 p-4 text-left transition hover:border-accent/40 hover:bg-panel"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-accent" /> {preset.name}
          </span>
          <span className="mt-1 block text-xs text-slate-400">{preset.description}</span>
        </button>
      ))}
    </div>
  );
}

function Viewer() {
  const rgbColor = useBuilderStore((s) => s.rgbColor);
  const rainbow = useBuilderStore((s) => s.rainbow);
  const setRgbColor = useBuilderStore((s) => s.setRgbColor);
  const toggleRainbow = useBuilderStore((s) => s.toggleRainbow);
  return (
    <div className="relative h-72 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-panel-2/80 to-night sm:h-80 lg:h-[340px]">
      <PcCanvas mode="builder" />
      <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-night/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur">
        Seu PC em 3D
      </p>
      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-night/75 px-3 py-1.5 backdrop-blur"
        role="radiogroup"
        aria-label="Cor do RGB"
      >
        <Palette className="h-3.5 w-3.5 text-slate-500" />
        {RGB_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={!rainbow && rgbColor === p.value}
            aria-label={`RGB ${p.name}`}
            onClick={() => setRgbColor(p.value)}
            className={cn(
              "h-5 w-5 rounded-full border-2 transition hover:scale-110",
              !rainbow && rgbColor === p.value ? "border-white" : "border-transparent",
            )}
            style={{ backgroundColor: p.value }}
          />
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={rainbow}
          aria-label="RGB arco-íris"
          onClick={toggleRainbow}
          className={cn(
            "h-5 w-5 rounded-full border-2 bg-[conic-gradient(#ef4444,#ffaa01,#22c55e,#22d3ee,#a855f7,#ef4444)] transition hover:scale-110",
            rainbow ? "border-white" : "border-transparent",
          )}
        />
      </div>
    </div>
  );
}

function MobileBar() {
  const { build, total, count } = useBuildSummary();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <a href="#resumo" className="min-w-0 flex-1">
          <p className="text-[11px] text-slate-400">Estimado · {count}/8 peças</p>
          <p className="font-display text-xl font-bold text-white">{formatBRL(total)}</p>
        </a>
        <button
          type="button"
          disabled={count === 0}
          onClick={() => void openWhatsappWithBuild(build)}
          className="inline-flex items-center gap-2 rounded-xl bg-whatsapp px-4 py-3 text-sm font-bold text-night disabled:opacity-40"
        >
          <MessageCircle className="h-4 w-4" /> Enviar ao Leonardo
        </button>
      </div>
    </div>
  );
}

const DESKTOP_QUERY = "(min-width: 1024px)";

/** true/false no cliente, null no servidor — garante um único visualizador 3D (um contexto WebGL). */
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => null,
  );
}

export default function BuilderWizard() {
  const isDesktop = useIsDesktop();

  // Restaura a configuração salva no navegador (feito no cliente para evitar mismatch de hidratação)
  useEffect(() => {
    void useBuilderStore.persist.rehydrate();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8 lg:pb-20">
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Atalho: comece por uma configuração pronta</p>
        <Presets />
      </div>

      <div id="builder-top" className="scroll-mt-20">
        <Stepper />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-12">
        {isDesktop === false && <Viewer />}
        <div className="lg:col-span-7 xl:col-span-8">
          <StepSelector />
        </div>
        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            {isDesktop && <Viewer />}
            <SummaryCard />
          </div>
        </aside>
      </div>

      <MobileBar />
    </div>
  );
}
