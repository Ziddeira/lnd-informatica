"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CameraControls,
  CameraControlsImpl,
  ContactShadows,
  Environment,
  Grid,
  Html,
  Lightformer,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useInView } from "framer-motion";
import PcModel from "@/components/3d/PcModel";
import HardwareHotspot from "@/components/3d/HardwareHotspot";
import { buildToVisualConfig, DEFAULT_VISUAL_CONFIG, type PcVisualConfig } from "@/components/3d/visualConfig";
import { EDUCATION_BY_ID, HARDWARE_EDUCATION } from "@/data/hardwareEducation";
import { use3DStore } from "@/store/use3DStore";
import { useBuilderStore } from "@/store/useBuilderStore";
import { resolveBuild } from "@/lib/builder";
import { cn } from "@/lib/utils";

export { buildToVisualConfig };

type Vec3 = [number, number, number];
type Mode = "hero" | "builder";
type Quality = "high" | "low";

const BACKGROUND = "#0a0a0c";

const VIEWS: Record<"closed" | "open" | "builder", { position: Vec3; target: Vec3 }> = {
  closed: { position: [4.7, 1.6, 7.3], target: [0, -0.05, 0] },
  open: { position: [2.2, 1.2, 7.6], target: [-0.1, 0.0, 0] },
  builder: { position: [5.6, 2.0, 10.0], target: [0, -0.15, 0] },
};

const { ACTION } = CameraControlsImpl;

/* ------------------------------------------------------------ Loader 3D */

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-xs font-medium text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        Carregando 3D… {Math.round(progress)}%
      </div>
    </Html>
  );
}

/* ---------------------------------------------------- Estúdio de iluminação */

function Studio({ quality }: { quality: Quality }) {
  return (
    <>
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 16, 34]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[6, 9, 7]} intensity={1.3} />
      <directionalLight position={[-7, 4, -6]} intensity={0.5} />
      <spotLight position={[0, 10, 4]} angle={0.45} penumbra={1} intensity={quality === "high" ? 26 : 22} />

      {/* Environment local e neutro (sem baixar HDR): softboxes de estúdio para reflexos em vidro e metal */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 7, 0]} scale={[14, 6, 1]} />
        <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-8, 1.5, 0]} scale={[18, 2, 1]} />
        <Lightformer intensity={1.6} rotation-y={-Math.PI / 2} position={[8, 1.5, 3]} scale={[18, 1, 1]} />
        <Lightformer intensity={1} position={[0, 1, 10]} scale={[10, 4, 1]} />
      </Environment>

      {/* Piso de estúdio escuro com grade técnica */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.645, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0b0b0d" roughness={0.95} metalness={0} />
      </mesh>
      <Grid
        position={[0, -2.64, 0]}
        args={[60, 60]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#1c1d21"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#2a2c31"
        fadeDistance={26}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows position={[0, -2.63, 0]} opacity={0.85} scale={12} blur={2.2} far={3} resolution={512} frames={1} color="#000000" />
    </>
  );
}

function Effects({ quality }: { quality: Quality }) {
  if (quality === "low") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.AGX} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0}>
      <N8AO halfRes aoRadius={0.6} distanceFalloff={0.6} intensity={2.4} quality="medium" />
      <Bloom mipmapBlur luminanceThreshold={1.15} intensity={1.0} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.3} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}

/* --------------------------------------------------------------- Câmera */

function CameraRig({ mode }: { mode: Mode }) {
  const controls = useRef<CameraControlsImpl>(null);
  const lastInteraction = useRef(0);
  const swayDir = useRef(1);
  const activePart = use3DStore((s) => (mode === "hero" ? s.activePart : null));
  const isOpen = use3DStore((s) => (mode === "hero" ? s.isOpen : false));
  const resetToken = use3DStore((s) => s.resetToken);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const portrait = width / height < 1.05;

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const view =
      mode === "builder"
        ? VIEWS.builder
        : activePart
          ? EDUCATION_BY_ID[activePart].camera
          : isOpen
            ? VIEWS.open
            : VIEWS.closed;
    const k = portrait ? (activePart ? 1.3 : 1.7) : 1;
    const [px, py, pz] = view.position;
    const [tx, ty, tz] = view.target;
    lastInteraction.current = performance.now();
    void c.setLookAt(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k, tx, ty, tz, true);
    const compact = typeof window !== "undefined" && window.innerWidth < 1024;
    void c.setFocalOffset(0, activePart && compact ? -0.55 : 0, 0, true);
  }, [mode, activePart, isOpen, resetToken, portrait]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const mark = () => (lastInteraction.current = performance.now());
    c.addEventListener("controlstart", mark);
    c.addEventListener("control", mark);
    return () => {
      c.removeEventListener("controlstart", mark);
      c.removeEventListener("control", mark);
    };
  }, []);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c || activePart || isOpen) return;
    if (performance.now() - lastInteraction.current < 3500) return;
    const view = mode === "builder" ? VIEWS.builder : VIEWS.closed;
    const base = Math.atan2(view.position[0] - view.target[0], view.position[2] - view.target[2]);
    if (c.azimuthAngle > base + 0.5) swayDir.current = -1;
    if (c.azimuthAngle < base - 0.5) swayDir.current = 1;
    // delta limitado: ao voltar de uma aba em segundo plano o delta acumulado giraria a câmera de uma vez
    void c.rotate(swayDir.current * Math.min(delta, 0.05) * 0.12, 0, true);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2.2}
      maxDistance={16}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 1.95}
      smoothTime={0.55}
      draggingSmoothTime={0.12}
      mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.DOLLY, right: ACTION.TRUCK, wheel: ACTION.NONE }}
      touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
    />
  );
}

/* --------------------------------------------------------------- Cenas */

function HeroScene() {
  const isOpen = use3DStore((s) => s.isOpen);
  const rgbColor = use3DStore((s) => s.rgbColor);
  const rainbow = use3DStore((s) => s.rainbow);
  const setOpen = use3DStore((s) => s.setOpen);
  const setActivePart = use3DStore((s) => s.setActivePart);

  const config = useMemo<PcVisualConfig>(
    () => ({ ...DEFAULT_VISUAL_CONFIG, rgbColor, rainbow, panelOpen: isOpen }),
    [rgbColor, rainbow, isOpen],
  );

  return (
    <>
      <PcModel config={config} onCaseClick={() => !isOpen && setOpen(true)} onPartClick={setActivePart} />
      {isOpen && HARDWARE_EDUCATION.map((part, i) => <HardwareHotspot key={part.id} part={part} index={i} />)}
    </>
  );
}

function BuilderScene() {
  const selections = useBuilderStore((s) => s.selections);
  const rgbColor = useBuilderStore((s) => s.rgbColor);
  const rainbow = useBuilderStore((s) => s.rainbow);
  const config = useMemo(
    () => buildToVisualConfig(resolveBuild(selections), rgbColor, rainbow),
    [selections, rgbColor, rainbow],
  );
  return <PcModel config={config} />;
}

/* -------------------------------------------------------------- Canvas */

function initialQuality(): Quality {
  if (typeof window === "undefined") return "low";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  return coarse || small || weak ? "low" : "high";
}

export default function PcCanvas({ mode, className }: { mode: Mode; className?: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper, { margin: "150px 0px" });
  const [quality, setQuality] = useState<Quality>(initialQuality);

  return (
    <div ref={wrapper} className={cn("canvas-touch-scroll relative h-full w-full", className)}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
        camera={{ position: VIEWS[mode === "hero" ? "closed" : "builder"].position, fov: 35, near: 0.1, far: 60 }}
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        aria-label={mode === "hero" ? "Gabinete gamer 3D interativo" : "Pré-visualização 3D do PC montado"}
      >
        {/* Reduz a qualidade automaticamente se o FPS cair */}
        <PerformanceMonitor onDecline={() => setQuality("low")} flipflops={2} />
        <Suspense fallback={<CanvasLoader />}>
          <Studio quality={quality} />
          {mode === "hero" ? <HeroScene /> : <BuilderScene />}
          <CameraRig mode={mode} />
          <Effects quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
