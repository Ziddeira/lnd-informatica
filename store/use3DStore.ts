"use client";

import { create } from "zustand";
import type { HardwarePartId } from "@/data/hardwareEducation";

interface Scene3DState {
  /** Painel lateral de vidro aberto (exploded view). */
  isOpen: boolean;
  /** Peça em foco (câmera + modal educativo). */
  activePart: HardwarePartId | null;
  hoveredPart: HardwarePartId | null;
  rgbColor: string;
  rainbow: boolean;
  /** Incrementado para pedir que a câmera volte à posição inicial. */
  resetToken: number;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setActivePart: (part: HardwarePartId | null) => void;
  setHoveredPart: (part: HardwarePartId | null) => void;
  setRgbColor: (color: string) => void;
  toggleRainbow: () => void;
  resetView: () => void;
}

export const use3DStore = create<Scene3DState>()((set) => ({
  isOpen: false,
  activePart: null,
  hoveredPart: null,
  rgbColor: "#22d3ee",
  rainbow: false,
  resetToken: 0,
  setOpen: (isOpen) => set(isOpen ? { isOpen } : { isOpen, activePart: null }),
  toggleOpen: () => set((s) => (s.isOpen ? { isOpen: false, activePart: null } : { isOpen: true })),
  setActivePart: (activePart) => set(activePart ? { activePart, isOpen: true } : { activePart }),
  setHoveredPart: (hoveredPart) => set({ hoveredPart }),
  setRgbColor: (rgbColor) => set({ rgbColor, rainbow: false }),
  toggleRainbow: () => set((s) => ({ rainbow: !s.rainbow })),
  resetView: () => set((s) => ({ activePart: null, resetToken: s.resetToken + 1 })),
}));
