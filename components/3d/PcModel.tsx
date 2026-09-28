"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { HardwarePartId } from "@/data/hardwareEducation";
import { createRgbMaterials, getLabelMaterial, getMaterials, type RgbMaterials, type Theme } from "@/components/3d/materials";
import {
  AirCooler,
  Cable,
  Cpu,
  Fan,
  Gpu,
  gpuDimensions,
  Motherboard,
  Psu,
  Pump,
  RamKit,
  StorageDevice,
  WaterCooler,
} from "@/components/3d/parts";
import ModelSlot from "@/components/3d/ModelSlot";
import type { PcVisualConfig } from "@/components/3d/visualConfig";

export { DEFAULT_VISUAL_CONFIG, type PcVisualConfig } from "@/components/3d/visualConfig";

/*
 * Gabinete gamer panorâmico em alta definição.
 * x: traseira (-2.2) → frente (+2.2) | y: base (-2.5) → topo (+2.5) | z: lado sólido (-1.15) → vidro (+1.15)
 */

type V3 = [number, number, number];

interface PcModelProps {
  config: PcVisualConfig;
  onCaseClick?: () => void;
  onPartClick?: (id: HardwarePartId) => void;
}

/* --------------------------------------------------------------- Helpers */

/** Faz a peça "surgir" com escala suave (a partir do próprio centro) quando entra no build. */
function Appear({ show, pivot, children }: { show: boolean; pivot: V3; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const [initialScale] = useState(() => (show ? 1 : 0.0001));
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, show ? 1 : 0, 7, delta);
    g.scale.setScalar(Math.max(s, 0.0001));
    g.visible = s > 0.01;
  });
  return (
    <group ref={ref} position={pivot} scale={initialScale}>
      <group position={[-pivot[0], -pivot[1], -pivot[2]]}>{children}</group>
    </group>
  );
}

function usePartHandlers(id: HardwarePartId, onPartClick: PcModelProps["onPartClick"], enabled: boolean) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && enabled);
  if (!enabled || !onPartClick) return {};
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onPartClick(id);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
    },
    onPointerOut: () => setHovered(false),
  };
}

function Box({ args, position, rotation, material }: { args: V3; position?: V3; rotation?: V3; material: THREE.Material }) {
  return (
    <mesh position={position} rotation={rotation} material={material}>
      <boxGeometry args={args} />
    </mesh>
  );
}

/* ----------------------------------------------------------------- Chassis */

function Chassis({ theme, rgb, onClick }: { theme: Theme; rgb: RgbMaterials; onClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  const m = getMaterials(theme);
  const logo = getLabelMaterial("LND", "#f1f5f9", true);
  return (
    <group onClick={onClick}>
      {/* lateral sólida (bandeja da placa-mãe) */}
      <RoundedBox args={[4.4, 5, 0.06]} radius={0.025} position={[0, 0, -1.13]} material={m.powder} />
      {/* base e topo com filtro perfurado */}
      <RoundedBox args={[4.4, 0.08, 2.3]} radius={0.03} position={[0, -2.46, 0]} material={m.powder} />
      <Box args={[4.4, 0.06, 0.2]} position={[0, 2.47, -1.05]} material={m.powder} />
      <Box args={[4.4, 0.06, 0.2]} position={[0, 2.47, 1.05]} material={m.powder} />
      <Box args={[0.2, 0.06, 1.9]} position={[-2.1, 2.47, 0]} material={m.powder} />
      <Box args={[0.2, 0.06, 1.9]} position={[2.1, 2.47, 0]} material={m.powder} />
      <mesh position={[0, 2.48, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.perforated}>
        <planeGeometry args={[4.0, 1.9]} />
      </mesh>
      {/* traseira com tampas PCIe perfuradas */}
      <Box args={[0.05, 5, 2.3]} position={[-2.175, 0, 0]} material={m.powderInner} />
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-2.14, -0.02 - i * 0.2, -0.1]} rotation={[0, Math.PI / 2, 0]} material={m.perforatedFine}>
          <planeGeometry args={[0.9, 0.13]} />
        </mesh>
      ))}
      {/* colunas: só na traseira e no canto do lado sólido — frente/lateral em vidro sem coluna (panorâmico) */}
      <RoundedBox args={[0.09, 5, 0.09]} radius={0.02} position={[-2.155, 0, -1.105]} material={m.powder} />
      <RoundedBox args={[0.09, 5, 0.09]} radius={0.02} position={[-2.155, 0, 1.105]} material={m.powder} />
      <RoundedBox args={[0.09, 5, 0.09]} radius={0.02} position={[2.155, 0, -1.105]} material={m.powder} />
      {/* vidro frontal */}
      <mesh position={[2.19, 0.01, 0.02]} rotation={[0, Math.PI / 2, 0]} material={m.frontGlass}>
        <planeGeometry args={[2.22, 4.86]} />
      </mesh>
      {/* pés */}
      {[
        [-1.7, -0.85],
        [-1.7, 0.85],
        [1.7, -0.85],
        [1.7, 0.85],
      ].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, -2.57, z]}>
          <RoundedBox args={[0.55, 0.12, 0.34]} radius={0.04} material={m.aluminum} />
          <Box args={[0.5, 0.03, 0.3]} position={[0, -0.07, 0]} material={m.rubber} />
        </group>
      ))}
      {/* shroud da fonte */}
      <Box args={[1.7, 0.04, 2.2]} position={[-1.35, -1.58, 0]} material={m.powderInner} />
      <mesh position={[0.83, -1.58, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.perforatedFine}>
        <planeGeometry args={[2.6, 2.2]} />
      </mesh>
      <RoundedBox args={[2.6, 0.86, 0.05]} radius={0.015} position={[0.85, -2.02, 1.08]} material={m.powderInner} />
      <Box args={[0.04, 0.86, 2.2]} position={[-0.45, -2.02, 0]} material={m.powderInner} />
      <Box args={[2.5, 0.022, 0.022]} position={[0.85, -1.61, 1.11]} material={rgb.led} />
      <mesh position={[0.85, -2.02, 1.107]} material={logo}>
        <planeGeometry args={[1.25, 0.2]} />
      </mesh>
      {/* passa-cabos emborrachados */}
      <RoundedBox args={[0.14, 0.9, 0.05]} radius={0.02} position={[1.62, 0.55, -1.08]} material={m.rubber} />
      <RoundedBox args={[0.7, 0.05, 0.16]} radius={0.02} position={[1.2, -1.56, -0.8]} material={m.rubber} />
      {/* cabo 24 pinos sleeved (cable management caprichado) */}
      <Cable
        id="atx24"
        theme={theme}
        radius={0.085}
        points={[
          [1.26, 0.55, -0.88],
          [1.48, 0.5, -0.92],
          [1.58, 0.1, -1.0],
          [1.62, -0.2, -1.07],
        ]}
      />
      <Cable
        id="eps8"
        theme={theme}
        radius={0.05}
        points={[
          [-1.4, 1.91, -0.88],
          [-1.6, 2.05, -0.95],
          [-1.9, 2.2, -1.06],
        ]}
      />
    </group>
  );
}

function GlassDoor({ open, theme, onClick }: { open: boolean; theme: Theme; onClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  const m = getMaterials(theme);
  const pivot = useRef<THREE.Group>(null);
  const glass = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!pivot.current) return;
    pivot.current.rotation.y = THREE.MathUtils.damp(pivot.current.rotation.y, open ? -1.85 : 0, 3.5, delta);
    const glassMat = glass.current?.material as THREE.MeshPhysicalMaterial | undefined;
    if (glassMat) glassMat.opacity = THREE.MathUtils.damp(glassMat.opacity, open ? 0.02 : 0.035, 3, delta);
  });
  return (
    // dobradiça na aresta traseira do lado de vidro
    <group ref={pivot} position={[-2.2, 0, 1.16]}>
      <group position={[2.2, 0, 0]} onClick={onClick}>
        <mesh ref={glass} material={m.sideGlass}>
          <boxGeometry args={[4.36, 4.96, 0.025]} />
        </mesh>
        <Box args={[4.36, 0.05, 0.03]} position={[0, 2.46, 0]} material={m.powder} />
        <Box args={[4.36, 0.05, 0.03]} position={[0, -2.46, 0]} material={m.powder} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------- Model */

const rainbowColor = new THREE.Color();
const targetColor = new THREE.Color();

const FRONT_FANS_Y = [1.8, 0.6, -0.6];

export default function PcModel({ config, onCaseClick, onPartClick }: PcModelProps) {
  const rgb = useMemo(() => createRgbMaterials(), []);
  useEffect(
    () => () => {
      rgb.led.dispose();
      rgb.diffuser.dispose();
    },
    [rgb],
  );

  const lightA = useRef<THREE.PointLight>(null);
  const lightB = useRef<THREE.PointLight>(null);
  const lightC = useRef<THREE.PointLight>(null);

  useFrame(({ clock }, delta) => {
    if (config.rainbow) targetColor.copy(rainbowColor.setHSL((clock.elapsedTime * 0.08) % 1, 1, 0.55));
    else targetColor.set(config.rgbColor);
    const k = 1 - Math.exp(-6 * delta);
    rgb.led.emissive.lerp(targetColor, k);
    rgb.diffuser.emissive.copy(rgb.led.emissive);
    lightA.current?.color.copy(rgb.led.emissive);
    lightB.current?.color.copy(rgb.led.emissive);
    lightC.current?.color.copy(rgb.led.emissive);
  });

  const [caseHovered, setCaseHovered] = useState(false);
  useCursor(caseHovered && !!onCaseClick && !config.panelOpen);

  const partsInteractive = config.panelOpen && !!onPartClick;
  const handlers = {
    gpu: usePartHandlers("gpu", onPartClick, partsInteractive),
    cpu: usePartHandlers("cpu", onPartClick, partsInteractive),
    motherboard: usePartHandlers("motherboard", onPartClick, partsInteractive),
    ram: usePartHandlers("ram", onPartClick, partsInteractive),
    cooler: usePartHandlers("cooler", onPartClick, partsInteractive),
    psu: usePartHandlers("psu", onPartClick, partsInteractive),
    fans: usePartHandlers("fans", onPartClick, partsInteractive),
  };

  const handleCaseClick = onCaseClick
    ? (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onCaseClick();
      }
    : undefined;

  const { show, models, caseColor } = config;
  const boardH = config.motherboard.formFactor === "ATX" ? 3.5 : 2.9;
  const gpuDim = gpuDimensions(config.gpu.lengthMM, config.gpu.tier);
  const ramWidth = config.ram.sticks >= 4 ? 0.53 : 0.38;
  const storageBox: { center: V3; size: V3 } =
    config.storage === "nvme"
      ? { center: [-0.4, 0.58, -0.94], size: [1.05, 0.26, 0.06] }
      : config.storage === "sata"
        ? { center: [1.25, -1.52, 0.1], size: [0.75, 0.07, 1.0] }
        : { center: [1.2, -1.45, 0.1], size: [0.95, 0.22, 0.7] };
  const fanModel = models.fan;

  const caseFan = (key: string, position: V3, radius: number) => (
    <group key={key} position={position} rotation={[0, Math.PI / 2, 0]}>
      <ModelSlot model={fanModel} center={[0, 0, 0]} size={[radius * 2.26, radius * 2.26, 0.22]}>
        <Fan position={[0, 0, 0]} radius={radius} rgb={rgb} theme={caseColor} />
      </ModelSlot>
    </group>
  );

  return (
    <group onPointerOver={() => setCaseHovered(true)} onPointerOut={() => setCaseHovered(false)}>
      {/* luz RGB interna: "banha" as peças com a cor escolhida, como num PC real */}
      <pointLight ref={lightA} position={[0.6, 1.2, 0.2]} intensity={11} distance={6} decay={1.5} />
      <pointLight ref={lightB} position={[0.4, -1.0, 0.5]} intensity={6} distance={4.5} decay={1.5} />
      <pointLight ref={lightC} position={[1.7, 0.5, 0.2]} intensity={7} distance={4} decay={1.5} />

      {models.case ? (
        <>
          <ModelSlot model={models.case} center={[0, 0, 0]} size={[4.4, 5.0, 2.3]}>
            <Chassis theme={caseColor} rgb={rgb} onClick={handleCaseClick} />
          </ModelSlot>
          {/* área clicável invisível para abrir o "raio-x" */}
          <mesh onClick={handleCaseClick} visible={!config.panelOpen}>
            <boxGeometry args={[4.4, 5, 2.3]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <>
          <Chassis theme={caseColor} rgb={rgb} onClick={handleCaseClick} />
          <GlassDoor open={config.panelOpen} theme={caseColor} onClick={handleCaseClick} />
        </>
      )}

      <group {...handlers.motherboard}>
        <Appear show={show.motherboard} pivot={[-0.3, 2.0 - boardH / 2, -1.0]}>
          <ModelSlot model={models.motherboard} center={[-0.3, 2.0 - boardH / 2, -0.85]} size={[3.2, boardH, 0.5]}>
            <group position={[-0.3, 0.25, -1.0]}>
              <Motherboard theme={config.motherboard.theme} formFactor={config.motherboard.formFactor} label={config.motherboard.label} rgb={rgb} />
            </group>
          </ModelSlot>
        </Appear>
      </group>

      <group {...handlers.cpu}>
        <Appear show={show.cpu} pivot={[-0.5, 1.2, -0.93]}>
          <ModelSlot model={models.cpu} center={[-0.5, 1.2, -0.93]} size={[0.44, 0.44, 0.05]}>
            <group position={[-0.5, 1.2, -0.93]}>
              <Cpu label={config.cpuLabel} />
            </group>
          </ModelSlot>
        </Appear>
      </group>

      <group {...handlers.ram}>
        <Appear show={show.ram} pivot={[0.48, 1.2, -0.83]}>
          <ModelSlot model={models.ram} center={[config.ram.sticks >= 4 ? 0.475 : 0.55, 1.2, -0.83]} size={[ramWidth, 1.34, 0.3]}>
            <group position={[0, 1.2, -0.975]}>
              <RamKit sticks={config.ram.sticks} rgbLit={config.ram.rgb} theme={config.ram.theme} rgb={rgb} />
            </group>
          </ModelSlot>
        </Appear>
      </group>

      <group {...handlers.gpu}>
        <Appear show={show.gpu} pivot={[-1.85 + gpuDim.L / 2, gpuDim.top - gpuDim.T / 2, -0.95 + gpuDim.H / 2]}>
          <ModelSlot
            model={models.gpu}
            center={[-1.85 + gpuDim.L / 2, gpuDim.top - gpuDim.T / 2, -0.95 + gpuDim.H / 2]}
            size={[gpuDim.L, gpuDim.T, gpuDim.H]}
          >
            <group position={[-1.85, 0, -0.95]}>
              <Gpu {...config.gpu} rgb={rgb} />
            </group>
          </ModelSlot>
        </Appear>
      </group>

      <group {...handlers.cooler}>
        <Appear show={show.cooler} pivot={config.cooler.type === "water" ? [0.3, 1.7, -0.3] : [-0.5, 1.2, -0.5]}>
          {config.cooler.type === "water" ? (
            <>
              <WaterCooler radiatorMM={config.cooler.radiatorMM} theme={config.cooler.theme} rgb={rgb} hidePump={!!models.pump} />
              {models.pump && (
                <ModelSlot model={models.pump} center={[-0.5, 1.2, -0.84]} size={[0.76, 0.76, 0.3]}>
                  <Pump theme={config.cooler.theme} rgb={rgb} />
                </ModelSlot>
              )}
            </>
          ) : (
            <ModelSlot
              model={models.cooler}
              center={config.cooler.type === "box" ? [-0.5, 1.2, -0.85] : [-0.5 + (config.cooler.dual ? 0.18 : 0.05), 1.2, -0.47]}
              size={config.cooler.type === "box" ? [0.9, 0.9, 0.3] : [config.cooler.dual ? 1.35 : 0.9, 1.25, 0.98]}
            >
              <AirCooler type={config.cooler.type} dual={config.cooler.dual} theme={config.cooler.theme} rgb={rgb} label={config.cooler.label} />
            </ModelSlot>
          )}
        </Appear>
      </group>

      <Appear show={show.storage} pivot={storageBox.center}>
        <ModelSlot model={models.storage} center={storageBox.center} size={storageBox.size}>
          <StorageDevice type={config.storage} theme={caseColor} rgb={rgb} />
        </ModelSlot>
      </Appear>

      <group {...handlers.psu}>
        <Appear show={show.psu} pivot={[-1.32, -2.03, 0]}>
          <ModelSlot model={models.psu} center={[-1.32, -2.03, 0]} size={[1.5, 0.78, 1.45]}>
            <Psu label={config.psu.label} efficiency={config.psu.efficiency} />
          </ModelSlot>
        </Appear>
      </group>

      <group {...handlers.fans}>
        {FRONT_FANS_Y.slice(0, config.frontFans).map((y) => caseFan(`front-${y}`, [2.02, y, 0.02], 0.52))}
        {caseFan("rear", [-2.03, 1.3, 0], 0.48)}
      </group>
    </group>
  );
}
