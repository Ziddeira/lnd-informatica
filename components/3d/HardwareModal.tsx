"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gauge, Info, Lightbulb, MessageCircle, Wrench, X } from "lucide-react";
import { EDUCATION_BY_ID, HARDWARE_EDUCATION } from "@/data/hardwareEducation";
import { use3DStore } from "@/store/use3DStore";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Card educativo da peça em foco.
 * Desktop: ocupa a coluna de texto do Hero (o 3D continua 100% visível).
 * Mobile: bottom sheet fixo na parte de baixo da tela.
 */
export default function HardwareModal({ className }: { className?: string }) {
  const activePart = use3DStore((s) => s.activePart);
  const setActivePart = use3DStore((s) => s.setActivePart);
  const part = activePart ? EDUCATION_BY_ID[activePart] : null;

  useEffect(() => {
    if (!activePart) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePart(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = HARDWARE_EDUCATION.findIndex((p) => p.id === activePart);
        const delta = e.key === "ArrowRight" ? 1 : -1;
        setActivePart(HARDWARE_EDUCATION[(i + delta + HARDWARE_EDUCATION.length) % HARDWARE_EDUCATION.length].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePart, setActivePart]);

  const go = (delta: number) => {
    if (!part) return;
    const i = HARDWARE_EDUCATION.findIndex((p) => p.id === part.id);
    setActivePart(HARDWARE_EDUCATION[(i + delta + HARDWARE_EDUCATION.length) % HARDWARE_EDUCATION.length].id);
  };

  return (
    <AnimatePresence mode="wait">
      {part && (
        <motion.aside
          key={part.id}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`hw-title-${part.id}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className={cn(
            "fixed inset-x-3 bottom-3 z-50 flex max-h-[58vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl lg:bg-panel/95 shadow-black/60 backdrop-blur-xl",
            "lg:absolute lg:inset-0 lg:max-h-none",
            className,
          )}
        >
          <header className="flex items-start gap-3 border-b border-white/5 p-5 pb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/25 to-accent/25 text-brand ring-1 ring-brand/30">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Raio-X do hardware</p>
              <h2 id={`hw-title-${part.id}`} className="font-display text-xl font-bold text-white sm:text-2xl">
                {part.name}
              </h2>
              <p className="text-sm text-slate-400">{part.tagline}</p>
            </div>
            <button
              type="button"
              onClick={() => setActivePart(null)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Fechar explicação"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
            <div className="flex flex-wrap gap-2">
              {part.quickFacts.map((fact) => (
                <span key={fact} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {fact}
                </span>
              ))}
            </div>

            <section>
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white">
                <Info className="h-4 w-4 text-brand" /> O que é e o que faz
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">{part.whatItIs}</p>
            </section>

            <section>
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-white">
                <Gauge className="h-4 w-4 text-brand" /> Impacto no desempenho
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">{part.performanceImpact}</p>
            </section>

            <section className="rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-transparent p-4">
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-amber-200">
                <Lightbulb className="h-4 w-4" /> Dica do Especialista — Leonardo, LND
              </h3>
              <p className="text-sm leading-relaxed text-amber-50/90">{part.expertTip}</p>
            </section>
          </div>

          <footer className="flex flex-wrap items-center gap-2 border-t border-white/5 p-4">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => go(-1)}
                className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:text-white"
                aria-label="Peça anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-white/20 hover:text-white"
                aria-label="Próxima peça"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link
              href="/monte-seu-pc"
              className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand/10"
            >
              Montar meu PC
            </Link>
            <a
              href={buildWhatsappUrl(`Olá, Leonardo! Estava vendo o Raio-X do PC no site e fiquei com uma dúvida sobre ${part.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-3.5 py-2 text-sm font-semibold text-night transition hover:bg-whatsapp-strong"
            >
              <MessageCircle className="h-4 w-4" /> Tirar dúvida
            </a>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
