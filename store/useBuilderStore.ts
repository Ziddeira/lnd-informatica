"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PartCategory } from "@/data/hardwareCatalog";
import { STEPS, sanitizeSelections, type Selections } from "@/lib/builder";

export const RGB_PRESETS = [
  { name: "Âmbar LND", value: "#ffaa01" },
  { name: "Ciano", value: "#22d3ee" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Verde", value: "#22c55e" },
  { name: "Branco", value: "#f8fafc" },
] as const;

interface BuilderState {
  selections: Selections;
  step: number;
  rgbColor: string;
  rainbow: boolean;
  notice: string | null;
  select: (category: PartCategory, id: string) => void;
  clear: (category: PartCategory) => void;
  applyPreset: (selections: Selections) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setRgbColor: (color: string) => void;
  toggleRainbow: () => void;
  dismissNotice: () => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      selections: {},
      step: 0,
      rgbColor: RGB_PRESETS[0].value,
      rainbow: false,
      notice: null,

      select: (category, id) => {
        const current = get().selections;
        if (current[category] === id) return;
        const { selections, removed } = sanitizeSelections({ ...current, [category]: id }, category);
        set({
          selections,
          notice: removed.length
            ? `Removemos ${removed.join(", ")} por incompatibilidade com a nova escolha. Selecione novamente.`
            : null,
        });
      },
      clear: (category) =>
        set((s) => {
          const selections = { ...s.selections };
          delete selections[category];
          return { selections };
        }),
      applyPreset: (selections) => set({ selections: { ...selections }, notice: null, step: STEPS.length - 1 }),
      setStep: (step) => set({ step: Math.max(0, Math.min(STEPS.length - 1, step)) }),
      nextStep: () => set((s) => ({ step: Math.min(STEPS.length - 1, s.step + 1) })),
      prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      setRgbColor: (rgbColor) => set({ rgbColor, rainbow: false }),
      toggleRainbow: () => set((s) => ({ rainbow: !s.rainbow })),
      dismissNotice: () => set({ notice: null }),
      reset: () => set({ selections: {}, step: 0, notice: null }),
    }),
    {
      name: "lnd-pc-builder",
      version: 1,
      // A reidratação é disparada manualmente no cliente para evitar mismatch de hidratação no SSR.
      skipHydration: true,
      partialize: (s) => ({ selections: s.selections, step: s.step, rgbColor: s.rgbColor, rainbow: s.rainbow }),
    },
  ),
);
