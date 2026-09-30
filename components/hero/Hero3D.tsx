"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Flame,
  LockOpen,
  MousePointerClick,
  Palette,
  RotateCcw,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import CanvasSkeleton from "@/components/3d/CanvasSkeleton";
import HardwareModal from "@/components/3d/HardwareModal";
import { COMPANY } from "@/data/company";
import { use3DStore } from "@/store/use3DStore";
import { RGB_PRESETS } from "@/store/useBuilderStore";
import { cn } from "@/lib/utils";

// O WebGL só existe no navegador: o módulo 3D é carregado sob demanda, fora do SSR.
const PcCanvas = dynamic(() => import("@/components/3d/PcCanvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

const TRUST = [
  { icon: Building2, text: "Suporte de TI e servidores para empresas" },
  { icon: Flame, text: "PCs Gamers com teste de estresse e garantia" },
  { icon: Truck, text: "Presencial na Grande Florianópolis · remoto e envio para todo o Brasil" },
];

export default function Hero3D() {
  const isOpen = use3DStore((s) => s.isOpen);
  const activePart = use3DStore((s) => s.activePart);
  const rgbColor = use3DStore((s) => s.rgbColor);
  const rainbow = use3DStore((s) => s.rainbow);
  const setOpen = use3DStore((s) => s.setOpen);
  const setRgbColor = use3DStore((s) => s.setRgbColor);
  const toggleRainbow = use3DStore((s) => s.toggleRainbow);
  const resetView = use3DStore((s) => s.resetView);
  const stage = useRef<HTMLDivElement>(null);

  // No mobile, ao focar uma peça, garante que o 3D esteja visível acima do card educativo
  useEffect(() => {
    if (activePart && window.innerWidth < 1024) {
      stage.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activePart]);

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* fundo */}
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
      <div className="absolute -left-40 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-brand/15 blur-[120px]" />
      <div className="absolute -right-20 bottom-0 -z-10 h-[460px] w-[460px] rounded-full bg-accent/15 blur-[140px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-14 pt-6 sm:px-6 lg:min-h-[calc(100svh-72px)] lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-10 lg:pt-4">
        {/* Coluna de texto (no desktop vira o card educativo quando uma peça é selecionada) */}
        <div className="relative lg:col-span-5 lg:flex lg:min-h-[600px] lg:items-center">
          <div className={cn("transition-all duration-300", activePart && "lg:pointer-events-none lg:-translate-x-4 lg:opacity-0")}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-xs text-amber-100"
            >
              <span className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </span>
              <strong>{COMPANY.rating.toFixed(1).replace(".", ",")}</strong> no Google · {COMPANY.reviewCountLabel} avaliações
            </motion.div>

            <motion.h1
              id="hero-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl"
            >
              Tecnologia que não para: <span className="text-gradient">da sua empresa ao seu setup gamer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Mais de 20 anos de experiência em servidores, redes, suporte B2B e máquinas de alta performance. Da infraestrutura da
              sua empresa ao PC Gamer montado com cable management impecável.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/empresas"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-night shadow-lg shadow-brand/25 transition hover:bg-brand-light"
              >
                Soluções para empresas
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/monte-seu-pc"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-brand/40 px-6 py-3.5 text-base font-semibold text-brand transition hover:bg-brand/10"
              >
                Monte seu PC Gamer
              </Link>
            </motion.div>

            <ul className="mt-8 grid gap-2.5 text-sm text-slate-300">
              {TRUST.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-brand" /> {text}
                </li>
              ))}
            </ul>
          </div>

          <HardwareModal />
        </div>

        {/* Palco 3D */}
        <div ref={stage} className="scroll-mt-20 lg:col-span-7">
          <div className="relative h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-panel-2/80 via-panel/60 to-night shadow-2xl shadow-black/50 sm:h-[540px] lg:h-[min(680px,calc(100svh-120px))]">
            <PcCanvas mode="hero" />

            {/* Selo */}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-night/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Raio-X 3D interativo
            </div>

            {/* Dica contextual */}
            <div className="pointer-events-none absolute inset-x-0 top-14 flex justify-center px-4 sm:top-4">
              {!isOpen ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-white/15 sm:ml-auto sm:mr-0"
                >
                  <MousePointerClick className="h-4 w-4 text-brand" /> Clique no gabinete para abrir
                </button>
              ) : (
                !activePart && (
                  <p className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur sm:ml-auto">
                    <Sparkles className="h-4 w-4 text-brand" /> Toque nos pontos para ver cada peça
                  </p>
                )
              )}
            </div>

            {/* Barra de controles */}
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-2xl sm:gap-2 border border-white/10 bg-night/75 p-2 backdrop-blur-md sm:inset-x-4 sm:bottom-4">
              <button
                type="button"
                onClick={() => setOpen(!isOpen)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:gap-2 sm:px-3",
                  isOpen ? "bg-white/10 text-white hover:bg-white/15" : "bg-brand text-night hover:bg-brand-light",
                )}
              >
                {isOpen ? <X className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                {isOpen ? "Fechar painel" : "Abrir painel"}
              </button>

              <div className="flex items-center gap-1 pl-0.5 sm:gap-1.5 sm:pl-1" role="radiogroup" aria-label="Cor do RGB">
                <Palette className="mr-0.5 hidden h-4 w-4 text-slate-500 sm:block" />
                {RGB_PRESETS.slice(0, 5).map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    role="radio"
                    aria-checked={!rainbow && rgbColor === preset.value}
                    aria-label={`RGB ${preset.name}`}
                    onClick={() => setRgbColor(preset.value)}
                    className={cn(
                      "h-5 w-5 rounded-full border-2 transition hover:scale-110 sm:h-6 sm:w-6",
                      !rainbow && rgbColor === preset.value ? "border-white" : "border-transparent",
                    )}
                    style={{ backgroundColor: preset.value, boxShadow: `0 0 10px ${preset.value}80` }}
                  />
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={rainbow}
                  aria-label="RGB arco-íris"
                  onClick={toggleRainbow}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 sm:h-6 sm:w-6 bg-[conic-gradient(#ef4444,#ffaa01,#22c55e,#22d3ee,#a855f7,#ef4444)] transition hover:scale-110",
                    rainbow ? "border-white" : "border-transparent",
                  )}
                />
              </div>

              <button
                type="button"
                onClick={resetView}
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-xs sm:px-3 font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Centralizar câmera"
              >
                <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Centralizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
