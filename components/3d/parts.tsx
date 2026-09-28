"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { getLabelMaterial, getMaterials, type RgbMaterials, type Theme } from "@/components/3d/materials";

/*
 * Peças do PC em alta definição (geometria procedural + PBR).
 * Coordenadas do mundo: x traseira(-)→frente(+), y base(-)→topo(+), z lado sólido(-)→vidro(+).
 */

type V3 = [number, number, number];

/* ---------------------------------------------------------- Geometrias */

const geoCache = new Map<string, THREE.BufferGeometry>();
function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Moldura quadrada da fan com furo circular (extrudada, com chanfro). */
function fanFrameGeometry(r: number) {
  return cached(`fan-frame-${r}`, () => {
    const side = r * 2.26;
    const shape = roundedRectShape(side, side, r * 0.2);
    const hole = new THREE.Path();
    hole.absarc(0, 0, r * 1.01, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 48,
    });
    g.translate(0, 0, -0.1);
    return g;
  });
}

/** Pá curva (com varredura) da ventoinha. */
function bladeGeometry(r: number) {
  return cached(`fan-blade-${r}`, () => {
    const ri = r * 0.35;
    const ro = r * 0.97;
    const n = 12;
    const shape = new THREE.Shape();
    const point = (t: number, side: 1 | -1) => {
      const rad = ri + (ro - ri) * t;
      const center = 0.38 * t * t;
      const half = 0.2 + 0.13 * t;
      const a = center + side * half;
      return new THREE.Vector2(rad * Math.cos(a), rad * Math.sin(a));
    };
    const first = point(0, -1);
    shape.moveTo(first.x, first.y);
    for (let i = 1; i <= n; i++) {
      const p = point(i / n, -1);
      shape.lineTo(p.x, p.y);
    }
    for (let i = n; i >= 0; i--) {
      const p = point(i / n, 1);
      shape.lineTo(p.x, p.y);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
    g.translate(0, 0, -0.006);
    return g;
  });
}

/** Perfil angular do dissipador da memória RAM (extrudado na espessura do pente). */
function ramSpreaderGeometry() {
  return cached("ram-spreader", () => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [-0.66, 0],
      [0.66, 0],
      [0.66, 0.2],
      [0.46, 0.25],
      [-0.2, 0.25],
      [-0.34, 0.21],
      [-0.66, 0.21],
    ];
    s.moveTo(...pts[0]);
    pts.slice(1).forEach((p) => s.lineTo(...p));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 });
    // (x,y,z) do shape → mundo (y, z, x): comprimento na vertical, altura saindo da placa
    g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
    g.translate(-0.035, 0, 0);
    return g;
  });
}

/** Tampa angular do I/O traseiro da placa-mãe. */
function ioShroudGeometry() {
  return cached("io-shroud", () => {
    const s = new THREE.Shape();
    const pts: [number, number][] = [
      [-0.2, -0.66],
      [0.2, -0.66],
      [0.2, 0.36],
      [0.04, 0.66],
      [-0.2, 0.66],
    ];
    s.moveTo(...pts[0]);
    pts.slice(1).forEach((p) => s.lineTo(...p));
    return new THREE.ExtrudeGeometry(s, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  });
}

/** Placa inferior do cooler da GPU com os furos das fans. */
function gpuShroudPlate(L: number, H: number, fans: number, fanR: number) {
  return cached(`gpu-plate-${L}-${H}-${fans}-${fanR}`, () => {
    const s = new THREE.Shape();
    const c = 0.06;
    s.moveTo(c, 0);
    s.lineTo(L - c, 0);
    s.lineTo(L, c);
    s.lineTo(L, H - c);
    s.lineTo(L - c, H);
    s.lineTo(c, H);
    s.lineTo(0, H - c);
    s.lineTo(0, c);
    s.lineTo(c, 0);
    for (let i = 0; i < fans; i++) {
      const hole = new THREE.Path();
      hole.absarc((L * (i + 0.5)) / fans, H / 2, fanR * 1.03, 0, Math.PI * 2, true);
      s.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 40 });
    g.rotateX(Math.PI / 2); // shape y → z, extrusão → -y
    return g;
  });
}

function tube(points: V3[], radius: number, key: string) {
  return cached(`tube-${key}-${radius}`, () => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 64, radius, 12, false);
  });
}

/* --------------------------------------------------------------- Helpers */

function Box({ args, position, rotation, material }: { args: V3; position?: V3; rotation?: V3; material: THREE.Material | THREE.Material[] }) {
  return (
    <mesh position={position} rotation={rotation} material={material}>
      <boxGeometry args={args} />
    </mesh>
  );
}

function Label({ text, size, position, rotation, color, glow }: { text: string; size: [number, number]; position: V3; rotation?: V3; color?: string; glow?: boolean }) {
  return (
    <mesh position={position} rotation={rotation} material={getLabelMaterial(text, color, glow)}>
      <planeGeometry args={size} />
    </mesh>
  );
}

export function Cable({ points, radius = 0.05, theme, id }: { points: V3[]; radius?: number; theme: Theme; id: string }) {
  const m = getMaterials(theme);
  return <mesh geometry={tube(points, radius, id)} material={m.sleeve} />;
}

/* ------------------------------------------------------------------- Fan */

export function Fan({
  position,
  rotation,
  radius = 0.52,
  speed = 7,
  rgb,
  theme,
  lit = true,
  frame = true,
}: {
  position: V3;
  rotation?: V3;
  radius?: number;
  speed?: number;
  rgb: RgbMaterials;
  theme: Theme;
  lit?: boolean;
  frame?: boolean;
}) {
  const m = getMaterials(theme);
  const rotor = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotor.current) rotor.current.rotation.z += delta * speed;
  });
  const blades = 9;
  return (
    <group position={position} rotation={rotation}>
      {frame && <mesh geometry={fanFrameGeometry(radius)} material={m.plastic} />}
      {/* moldura octogonal iluminada (estilo fans ARGB "infinity") */}
      {lit && frame && (
        <>
          <mesh position={[0, 0, 0.105]} rotation={[0, 0, Math.PI / 8]} material={rgb.led}>
            <torusGeometry args={[radius * 1.1, 0.03, 6, 8]} />
          </mesh>
          <mesh position={[0, 0, -0.105]} rotation={[0, 0, Math.PI / 8]} material={rgb.diffuser}>
            <torusGeometry args={[radius * 1.1, 0.022, 6, 8]} />
          </mesh>
        </>
      )}
      {lit && (
        <>
          <mesh position={[0, 0, 0.085]} material={rgb.diffuser}>
            <torusGeometry args={[radius * 1.0, 0.026, 12, 72]} />
          </mesh>
          <mesh position={[0, 0, -0.085]} material={rgb.diffuser}>
            <torusGeometry args={[radius * 1.0, 0.02, 10, 72]} />
          </mesh>
        </>
      )}
      {/* suportes do motor */}
      {frame &&
        [0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2 + Math.PI / 4]} position={[0, 0, -0.08]} material={m.plastic}>
            <boxGeometry args={[radius * 2.1, 0.035, 0.02]} />
          </mesh>
        ))}
      <group ref={rotor}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.plastic}>
          <cylinderGeometry args={[radius * 0.34, radius * 0.36, 0.15, 36]} />
        </mesh>
        <mesh position={[0, 0, 0.077]} material={lit ? rgb.diffuser : m.aluminumLight}>
          <circleGeometry args={[radius * 0.3, 36]} />
        </mesh>
        {Array.from({ length: blades }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / blades) * Math.PI * 2]}>
            <mesh geometry={bladeGeometry(radius)} rotation={[0.5, 0, 0]} material={m.blades} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------ Placa-mãe */

export function Motherboard({
  theme,
  formFactor,
  label,
  rgb,
}: {
  theme: Theme;
  formFactor: "ATX" | "mATX";
  label: string;
  rgb: RgbMaterials;
}) {
  const m = getMaterials(theme);
  const H = formFactor === "ATX" ? 3.5 : 2.9;
  const top = 1.75;
  const bottom = top - H;
  const pcbFaces = useMemo(() => [m.pcbEdge, m.pcbEdge, m.pcbEdge, m.pcbEdge, m.pcb, m.pcbEdge], [m]);

  return (
    // origem = centro de referência da placa ATX no mundo (-0.3, 0.25, -1.0)
    <group>
      <Box args={[3.2, H, 0.05]} position={[0, top - H / 2, 0]} material={pcbFaces} />

      {/* tampa do I/O traseiro com logo e LED */}
      <mesh geometry={ioShroudGeometry()} position={[-1.38, 0.95, 0.03]} material={m.aluminum} />
      <Label text={label} size={[1.05, 0.15]} position={[-1.38, 0.9, 0.475]} rotation={[0, 0, Math.PI / 2]} color="#e5e9f0" />
      <Box args={[0.02, 0.28, 0.02]} position={[-1.26, 1.52, 0.47]} rotation={[0, 0, -1.08]} material={rgb.led} />

      {/* VRM com aletas */}
      <RoundedBox args={[0.32, 1.1, 0.26]} radius={0.03} position={[-0.95, 0.95, 0.15]} material={m.aluminum} />
      {[-0.4, -0.2, 0, 0.2, 0.4].map((y) => (
        <Box key={y} args={[0.33, 0.035, 0.02]} position={[-0.95, 0.95 + y, 0.285]} material={m.black} />
      ))}
      <RoundedBox args={[1.0, 0.3, 0.26]} radius={0.03} position={[-0.25, 1.55, 0.15]} material={m.aluminum} />
      {[-0.35, -0.15, 0.05, 0.25].map((x) => (
        <Box key={x} args={[0.035, 0.31, 0.02]} position={[-0.25 + x, 1.55, 0.285]} material={m.black} />
      ))}

      {/* soquete + mecanismo de retenção */}
      <Box args={[0.66, 0.66, 0.035]} position={[-0.2, 0.95, 0.04]} material={m.plasticMatte} />
      {[
        [0, 0.34, 0.66, 0.035],
        [0, -0.34, 0.66, 0.035],
        [0.34, 0, 0.035, 0.66],
        [-0.34, 0, 0.035, 0.66],
      ].map(([x, y, w, h]) => (
        <Box key={`${x}${y}`} args={[w, h, 0.06]} position={[-0.2 + x, 0.95 + y, 0.06]} material={m.nickel} />
      ))}
      <mesh position={[0.18, 0.95, 0.07]} material={m.nickel}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
      </mesh>

      {/* slots DIMM com travas */}
      {[0.55, 0.7, 0.85, 1.0].map((x) => (
        <group key={x} position={[x, 0.95, 0.045]}>
          <Box args={[0.07, 1.34, 0.06]} material={m.plasticMatte} />
          <Box args={[0.075, 0.07, 0.1]} position={[0, 0.7, 0.02]} material={m.plastic} />
          <Box args={[0.075, 0.07, 0.1]} position={[0, -0.7, 0.02]} material={m.plastic} />
        </group>
      ))}

      {/* 24 pinos e EPS 8 pinos */}
      <Box args={[0.13, 0.6, 0.1]} position={[1.5, 0.3, 0.075]} material={m.black} />
      <Box args={[0.26, 0.1, 0.1]} position={[-1.1, 1.64, 0.075]} material={m.black} />

      {/* M.2 inferior, chipset, PCIe */}
      <RoundedBox args={[1.1, 0.26, 0.06]} radius={0.015} position={[-0.35, bottom + 0.78, 0.055]} material={m.aluminum} />
      <Label text="M.2" size={[0.3, 0.06]} position={[-0.7, bottom + 0.78, 0.087]} color="#9aa3b2" />
      <RoundedBox args={[0.82, 0.62, 0.11]} radius={0.03} position={[0.95, bottom + 0.5, 0.08]} material={m.aluminum} />
      <Label text={label} size={[0.7, 0.1]} position={[0.95, bottom + 0.5, 0.137]} color="#e5e9f0" />
      <Box args={[0.66, 0.014, 0.014]} position={[0.95, bottom + 0.76, 0.14]} material={rgb.diffuser} />

      <Box args={[2.3, 0.085, 0.065]} position={[-0.3, -0.35, 0.055]} material={m.plasticMatte} />
      <Box args={[2.32, 0.095, 0.02]} position={[-0.3, -0.35, 0.085]} material={m.chrome} />
      <Box args={[2.3, 0.08, 0.06]} position={[-0.3, bottom + 0.28, 0.05]} material={m.plasticMatte} />

      {/* áudio, bateria CMOS, SATA */}
      {[-1.4, -1.28, -1.16, -1.04].map((x) => (
        <mesh key={x} position={[x, bottom + 0.4, 0.085]} rotation={[Math.PI / 2, 0, 0]} material={m.gold}>
          <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
        </mesh>
      ))}
      <mesh position={[0.35, bottom + 0.45, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
        <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} args={[0.1, 0.07, 0.12]} position={[1.52, bottom + 0.9 + i * 0.1, 0.07]} material={m.black} />
      ))}

      {/* parafusos de fixação */}
      {[
        [-1.5, top - 0.1],
        [0.2, top - 0.1],
        [1.5, top - 0.1],
        [-1.5, bottom + 0.15],
        [1.5, bottom + 0.15],
        [0.2, bottom + 0.15],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={m.chrome}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ CPU */

export function Cpu({ label }: { label: string }) {
  const m = getMaterials("black");
  return (
    <group>
      <Box args={[0.44, 0.44, 0.04]} material={m.nickel} />
      <Label text={label} size={[0.36, 0.06]} position={[0, 0.05, 0.021]} color="#3a3f47" />
    </group>
  );
}

/* ------------------------------------------------------------------ RAM */

export function RamKit({ sticks, rgbLit, theme, rgb }: { sticks: number; rgbLit: boolean; theme: Theme; rgb: RgbMaterials }) {
  const m = getMaterials(theme);
  const slots = sticks >= 4 ? [0.25, 0.4, 0.55, 0.7] : [0.4, 0.7];
  return (
    <group>
      {slots.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Box args={[0.022, 1.3, 0.28]} position={[0, 0, 0.14]} material={m.pcbEdge} />
          <mesh geometry={ramSpreaderGeometry()} material={m.aluminum} />
          <Box args={[0.05, 0.86, 0.05]} position={[0, 0.12, 0.275]} material={rgbLit ? rgb.diffuser : m.aluminumLight} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ GPU */

export interface GpuProps {
  lengthMM: number;
  tier: "entry" | "mid" | "high" | "ultra";
  fans: 2 | 3;
  vendor: "nvidia" | "amd" | "intel";
  label: string;
  theme: Theme;
  rgb: RgbMaterials;
}

export function gpuDimensions(lengthMM: number, tier: GpuProps["tier"]) {
  const L = THREE.MathUtils.mapLinear(THREE.MathUtils.clamp(lengthMM, 170, 360), 170, 360, 2.0, 3.5);
  const T = { entry: 0.42, mid: 0.5, high: 0.6, ultra: 0.72 }[tier];
  const H = tier === "ultra" ? 1.16 : tier === "high" ? 1.1 : 1.04;
  const top = 0.15;
  return { L, T, H, top, bottom: top - T };
}

export function Gpu({ lengthMM, tier, fans, vendor, label, theme, rgb }: GpuProps) {
  const m = getMaterials(theme);
  const { L, T, H, top, bottom } = gpuDimensions(lengthMM, tier);
  const fanR = Math.min(0.46, (L / fans) * 0.43, H * 0.43);
  const accent = vendor === "nvidia" ? "#76b900" : vendor === "amd" ? "#e3202a" : "#0071c5";
  const finFaces = useMemo(() => [m.black, m.black, m.black, m.black, m.fins, m.fins], [m]);
  const cableX = L * 0.7;

  return (
    // origem: início da placa (lado do slot), na superfície da placa-mãe
    <group>
      {/* backplate + respiro */}
      <Box args={[L, 0.03, H]} position={[L / 2, top - 0.015, H / 2]} material={m.aluminum} />
      <mesh position={[L * 0.86, top + 0.002, H / 2]} rotation={[-Math.PI / 2, 0, 0]} material={m.perforatedFine}>
        <planeGeometry args={[L * 0.24, H * 0.8]} />
      </mesh>
      {/* PCB e bloco de aletas */}
      <Box args={[L * 0.72, 0.025, H * 0.94]} position={[L * 0.36, top - 0.045, H / 2]} material={m.pcbEdge} />
      <Box args={[L * 0.97, T * 0.5, H * 0.94]} position={[L / 2, top - 0.06 - T * 0.25, H / 2]} material={finFaces} />
      {/* shroud inferior com furos das fans */}
      <mesh geometry={gpuShroudPlate(L, H, fans, fanR)} position={[0, bottom + 0.05, 0]} material={m.plastic} />
      {/* saias laterais do shroud */}
      <Box args={[L, T * 0.42, 0.05]} position={[L / 2, bottom + T * 0.21, H - 0.02]} material={m.plastic} />
      <Box args={[L, T * 0.42, 0.05]} position={[L / 2, bottom + T * 0.21, 0.02]} material={m.plastic} />
      <Box args={[0.06, T, H]} position={[L - 0.03, bottom + T / 2, H / 2]} material={m.plastic} />
      {/* face voltada ao vidro: logo iluminado, LED e detalhe da marca */}
      <Label text={label} size={[Math.min(1.7, L * 0.55), 0.17]} position={[L * 0.34, bottom + T * 0.2, H + 0.007]} color="#f1f5f9" glow />
      <Box args={[L * 0.34, 0.03, 0.012]} position={[L * 0.76, bottom + T * 0.3, H + 0.007]} material={rgb.led} />
      <mesh position={[L * 0.76, bottom + T * 0.13, H + 0.008]}>
        <planeGeometry args={[L * 0.2, 0.035]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {/* bracket PCIe com saídas de vídeo */}
      <Box args={[0.03, T + 0.18, H + 0.08]} position={[-0.03, top - (T + 0.18) / 2 + 0.06, H / 2]} material={m.chrome} />
      {[0.2, 0.42, 0.64, 0.86].map((z) => (
        <Box key={z} args={[0.03, 0.08, 0.14]} position={[-0.05, top - 0.12, H * z]} material={m.black} />
      ))}
      {/* conector de energia 12V-2x6 + cabo passando por trás até o passa-cabos da bandeja */}
      <Box args={[0.24, 0.1, 0.1]} position={[cableX, top - 0.1, H + 0.04]} material={m.black} />
      <Cable
        id={`gpu-${L.toFixed(2)}-${H}-${T}`}
        theme={theme}
        radius={0.045}
        points={[
          [cableX, top - 0.1, H + 0.08],
          [cableX + 0.04, top + 0.12, H * 0.72],
          [cableX + 0.35, top + 0.22, H * 0.3],
          [3.45, 0.45, 0.06],
        ]}
      />
      {/* fans */}
      {Array.from({ length: fans }, (_, i) => (
        <Fan
          key={i}
          position={[(L * (i + 0.5)) / fans, bottom + 0.1, H / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          radius={fanR}
          speed={10}
          rgb={rgb}
          theme={theme}
          lit={false}
          frame={false}
        />
      ))}
    </group>
  );
}

/* --------------------------------------------------------------- Coolers */

/** Bomba do water cooler com efeito de espelho infinito. */
export function Pump({ theme, rgb }: { theme: Theme; rgb: RgbMaterials }) {
  const m = getMaterials(theme);
  return (
      <group position={[-0.5, 1.2, -0.84]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.plastic}>
          <cylinderGeometry args={[0.36, 0.38, 0.26, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.131]} material={m.chrome}>
          <torusGeometry args={[0.345, 0.018, 12, 64]} />
        </mesh>
        <mesh position={[0, 0, 0.128]}>
          <circleGeometry args={[0.33, 48]} />
          <meshStandardMaterial color="#030405" metalness={0.9} roughness={0.08} />
        </mesh>
        {[0.29, 0.23, 0.17].map((r, i) => (
          <mesh key={r} position={[0, 0, 0.13 - i * 0.012]} material={i === 0 ? rgb.led : rgb.diffuser}>
            <torusGeometry args={[r, 0.012 - i * 0.002, 8, 64]} />
          </mesh>
        ))}
        <Label text="LND" size={[0.26, 0.11]} position={[0, 0, 0.134]} color="#f8fafc" glow />
        {/* conexões */}
        {[0.12, -0.12].map((y) => (
          <mesh key={y} position={[0.33, y, 0.02]} rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
            <cylinderGeometry args={[0.055, 0.055, 0.12, 16]} />
          </mesh>
        ))}
      </group>
  );
}

export function WaterCooler({ radiatorMM, theme, rgb, hidePump = false }: { radiatorMM: number; theme: Theme; rgb: RgbMaterials; hidePump?: boolean }) {
  const m = getMaterials(theme);
  const fans = radiatorMM >= 360 ? 3 : 2;
  const radLength = fans * 1.1 + 0.3;
  const radX = 1.85 - radLength / 2;
  const finFaces = useMemo(() => [m.black, m.black, m.finsDense, m.finsDense, m.fins, m.fins], [m]);
  const endX = radX + radLength / 2 - 0.3;

  return (
    <group>
      {!hidePump && <Pump theme={theme} rgb={rgb} />}
      {/* mangueiras sleeved */}
      <Cable id={`aio-a-${radiatorMM}`} theme={theme} radius={0.055} points={[[-0.12, 1.32, -0.82], [0.2, 1.4, -0.6], [1.0, 1.62, -0.28], [endX, 1.98, -0.18]]} />
      <Cable id={`aio-b-${radiatorMM}`} theme={theme} radius={0.055} points={[[-0.12, 1.08, -0.82], [0.25, 1.15, -0.5], [1.1, 1.5, -0.05], [endX, 1.98, 0.08]]} />
      {/* radiador */}
      <group position={[radX, 2.21, 0.05]}>
        <Box args={[radLength - 0.3, 0.14, 1.12]} material={finFaces} />
        <RoundedBox args={[0.18, 0.2, 1.18]} radius={0.02} position={[-(radLength - 0.12) / 2, 0, 0]} material={m.plastic} />
        <RoundedBox args={[0.18, 0.2, 1.18]} radius={0.02} position={[(radLength - 0.12) / 2, 0, 0]} material={m.plastic} />
        <Box args={[radLength - 0.3, 0.02, 0.04]} position={[0, -0.08, 0.57]} material={m.powder} />
      </group>
      {Array.from({ length: fans }, (_, i) => (
        <Fan
          key={i}
          position={[radX - radLength / 2 + 0.15 + 0.55 + i * 1.1, 1.99, 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
          radius={0.48}
          rgb={rgb}
          theme={theme}
        />
      ))}
    </group>
  );
}

function FinStack({ position, count = 44, width = 0.46, depth = 0.95, height = 1.1, material }: { position: V3; count?: number; width?: number; depth?: number; height?: number; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      mtx.makeTranslation(0, -height / 2 + (i / (count - 1)) * height, 0);
      mesh.setMatrixAt(i, mtx);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, height]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} position={position} material={material}>
      <boxGeometry args={[width, 0.012, depth]} />
    </instancedMesh>
  );
}

export function AirCooler({ type, dual, theme, rgb, label }: { type: "air" | "box"; dual: boolean; theme: Theme; rgb: RgbMaterials; label: string }) {
  const m = getMaterials(theme);
  if (type === "box") {
    return (
      <group position={[-0.5, 1.2, -0.85]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.fins}>
          <cylinderGeometry args={[0.44, 0.44, 0.2, 48]} />
        </mesh>
        <Fan position={[0, 0, 0.12]} radius={0.34} rgb={rgb} theme="black" lit={false} frame={false} />
        <mesh position={[0, 0, 0.11]} material={m.plastic}>
          <torusGeometry args={[0.38, 0.03, 8, 48]} />
        </mesh>
      </group>
    );
  }
  const towers = dual ? [-0.36, 0.36] : [0];
  const pipes = [-0.3, -0.18, -0.06, 0.06, 0.18, 0.3];
  return (
    <group position={[-0.5, 1.2, -0.47]}>
      {/* base de contato e heatpipes */}
      <Box args={[0.5, 0.5, 0.08]} position={[0, 0, -0.44]} material={m.nickel} />
      {towers.map((tx) => (
        <group key={tx} position={[tx, 0, 0]}>
          <FinStack position={[0, 0.05, 0]} width={dual ? 0.4 : 0.48} material={m.aluminumLight} />
          <RoundedBox args={[dual ? 0.44 : 0.52, 0.06, 0.98]} radius={0.02} position={[0, 0.63, 0]} material={m.aluminum} />
          {pipes.map((pz) => (
            <mesh key={pz} position={[0, 0.69, pz * 2.2]} material={m.nickel}>
              <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      {pipes.map((pz) => (
        <mesh key={pz} position={[0, -0.5, pz * 2.2 * 0.4 - 0.2]} rotation={[0, 0, Math.PI / 2]} material={m.copper}>
          <cylinderGeometry args={[0.03, 0.03, dual ? 0.9 : 0.4, 12]} />
        </mesh>
      ))}
      <Label text={label} size={[0.42, 0.08]} position={[towers[towers.length - 1], 0.66, 0.1]} rotation={[-Math.PI / 2, 0, 0]} color="#e5e9f0" />
      {/* fan(s) */}
      <Fan position={[dual ? 0 : 0.36, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} radius={0.46} rgb={rgb} theme={theme} />
      {dual && <Fan position={[0.72, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} radius={0.46} rgb={rgb} theme={theme} />}
    </group>
  );
}

/* --------------------------------------------------------- Fonte / Storage */

export function Psu({ label, efficiency }: { label: string; efficiency: "bronze" | "gold" | "platinum" }) {
  const m = getMaterials("black");
  const badge = { bronze: "#b0703c", gold: "#d4a93a", platinum: "#cfd6de" }[efficiency];
  const cables: V3[][] = [
    [
      [0.76, 0.18, -0.2],
      [0.95, 0.26, -0.3],
      [1.05, 0.34, -0.6],
    ],
    [
      [0.76, 0.05, 0.1],
      [0.98, 0.18, 0.0],
      [1.12, 0.32, -0.4],
    ],
  ];
  return (
    <group position={[-1.32, -2.03, 0]}>
      <RoundedBox args={[1.5, 0.78, 1.45]} radius={0.04} material={m.powder} />
      <mesh position={[0, 0, 0.727]} material={m.honeycomb}>
        <planeGeometry args={[0.5, 0.6]} />
      </mesh>
      <Label text={label} size={[0.9, 0.14]} position={[0.2, 0.18, 0.728]} color="#e2e8f0" />
      <mesh position={[0.2, -0.05, 0.728]}>
        <planeGeometry args={[0.46, 0.12]} />
        <meshStandardMaterial color={badge} metalness={0.8} roughness={0.3} />
      </mesh>
      <Label text="80 PLUS" size={[0.42, 0.08]} position={[0.2, -0.05, 0.73]} color="#111" />
      {[-0.25, 0.05, 0.35].map((z) => (
        <Box key={z} args={[0.04, 0.22, 0.18]} position={[0.76, 0.1, z]} material={m.black} />
      ))}
      {cables.map((pts, i) => (
        <Cable key={i} id={`psu-${i}`} theme="black" radius={0.05} points={pts} />
      ))}
    </group>
  );
}

export function StorageDevice({ type, theme, rgb }: { type: "nvme" | "sata" | "hdd"; theme: Theme; rgb: RgbMaterials }) {
  const m = getMaterials(theme);
  if (type === "nvme") {
    return (
      <group position={[-0.4, 0.58, -0.94]}>
        <RoundedBox args={[1.05, 0.26, 0.06]} radius={0.015} material={m.aluminum} />
        {[-0.3, -0.1, 0.1, 0.3].map((x) => (
          <Box key={x} args={[0.03, 0.27, 0.01]} position={[x, 0, 0.032]} material={m.black} />
        ))}
        <Box args={[0.9, 0.014, 0.01]} position={[0, 0.11, 0.034]} material={rgb.led} />
      </group>
    );
  }
  if (type === "sata") {
    return (
      <group position={[1.25, -1.52, 0.1]}>
        <RoundedBox args={[0.75, 0.07, 1.0]} radius={0.015} material={m.aluminum} />
        <Label text="SSD" size={[0.4, 0.12]} position={[0, 0.037, 0.1]} rotation={[-Math.PI / 2, 0, 0]} color="#cbd5e1" />
      </group>
    );
  }
  return (
    <group position={[1.2, -1.45, 0.1]}>
      <RoundedBox args={[0.95, 0.22, 0.7]} radius={0.02} material={m.nickel} />
      <Label text="HDD" size={[0.4, 0.12]} position={[0, 0.112, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#1f2937" />
    </group>
  );
}
