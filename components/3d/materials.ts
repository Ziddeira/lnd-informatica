"use client";

import * as THREE from "three";

/*
 * Texturas procedurais (geradas em <canvas>, sem downloads) e materiais PBR compartilhados.
 * Tudo fica em cache de módulo: criado uma única vez e reaproveitado por todos os modelos.
 */

export type Theme = "black" | "white";

const texCache = new Map<string, THREE.Texture>();

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function canvasTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  options: { color?: boolean; repeat?: [number, number] } = {},
) {
  const cached = texCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (options.color) tex.colorSpace = THREE.SRGBColorSpace;
  if (options.repeat) tex.repeat.set(...options.repeat);
  texCache.set(key, tex);
  return tex;
}

/** Chapa perfurada (alphaMap): branco = metal, preto = furo. */
function perforatedTexture(repeat: [number, number], key: string) {
  return canvasTexture(
    key,
    64,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      const r = 11;
      for (const [x, y] of [
        [16, 16],
        [48, 48],
        [48, -16],
        [-16, 48],
        [16, 80],
        [80, 16],
      ]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { repeat },
  );
}

/** Colmeia hexagonal (alphaMap) para ventilação da fonte e shroud. */
function honeycombTexture(repeat: [number, number]) {
  return canvasTexture(
    `honeycomb-${repeat.join("x")}`,
    96,
    84,
    (ctx, w, h) => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      const hex = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        }
        ctx.closePath();
        ctx.fill();
      };
      for (const [x, y] of [
        [0, 0],
        [48, 0],
        [96, 0],
        [24, 42],
        [72, 42],
        [0, 84],
        [48, 84],
        [96, 84],
      ])
        hex(x, y, 19);
    },
    { repeat },
  );
}

/** Placa de circuito com trilhas, pads e serigrafia. */
function pcbTexture(theme: Theme) {
  return canvasTexture(
    `pcb-${theme}`,
    1024,
    1024,
    (ctx, w, h) => {
      const rand = seeded(theme === "white" ? 7 : 3);
      ctx.fillStyle = theme === "white" ? "#b3b9c2" : "#101318";
      ctx.fillRect(0, 0, w, h);
      ctx.lineCap = "round";
      // trilhas em 45°
      for (let i = 0; i < 260; i++) {
        ctx.strokeStyle = theme === "white" ? `rgba(120,128,140,${0.25 + rand() * 0.3})` : `rgba(58,68,82,${0.35 + rand() * 0.4})`;
        ctx.lineWidth = 1 + rand() * 2.5;
        let x = rand() * w;
        let y = rand() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < 4; s++) {
          const len = 20 + rand() * 120;
          const dir = Math.floor(rand() * 8) * (Math.PI / 4);
          x += Math.cos(dir) * len;
          y += Math.sin(dir) * len;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // pads e componentes SMD
      for (let i = 0; i < 900; i++) {
        const gold = rand() > 0.82;
        ctx.fillStyle = gold ? "rgba(196,160,80,0.75)" : theme === "white" ? "rgba(80,88,98,0.55)" : "rgba(34,38,44,0.95)";
        const sw = 3 + rand() * 9;
        const sh = 2 + rand() * 5;
        ctx.fillRect(rand() * w, rand() * h, rand() > 0.5 ? sw : sh, rand() > 0.5 ? sh : sw);
      }
      // serigrafia
      ctx.fillStyle = theme === "white" ? "rgba(40,44,52,0.55)" : "rgba(220,226,235,0.45)";
      ctx.font = "bold 14px monospace";
      const labels = ["PCIE_E1", "M2_1", "CPU_FAN", "SYS_FAN1", "ATX_PWR", "EPS_12V", "USB3_E12", "SATA6G", "CHA_FAN2", "AUDIO", "CLR_CMOS", "M2_2"];
      for (let i = 0; i < 40; i++) ctx.fillText(labels[i % labels.length], rand() * w, rand() * h);
    },
    { color: true },
  );
}

/** Metal escovado (roughnessMap). */
function brushedTexture() {
  return canvasTexture(
    "brushed",
    512,
    512,
    (ctx, w, h) => {
      const rand = seeded(11);
      ctx.fillStyle = "#8a8a8a";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        const v = Math.floor(90 + rand() * 90);
        ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
        ctx.fillRect(0, rand() * h, w, 1 + rand() * 1.5);
      }
    },
  );
}

/** Aletas de dissipador (listras). */
function finTexture(repeatX: number, key = "fins") {
  return canvasTexture(
    `${key}-${repeatX}`,
    64,
    8,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#1a1d22");
      g.addColorStop(0.2, "#c9ced6");
      g.addColorStop(0.5, "#8d949e");
      g.addColorStop(0.8, "#c9ced6");
      g.addColorStop(1, "#1a1d22");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    { color: true, repeat: [repeatX, 1] },
  );
}

/** Malha trançada de cabos sleeved. */
function sleeveTexture() {
  return canvasTexture(
    "sleeve",
    64,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = "#2a2d33";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#f2f4f7";
      ctx.lineWidth = 5;
      for (let i = -64; i < 128; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 64, h);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 3;
      for (let i = -64; i < 128; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i + 64, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
    },
    { color: true, repeat: [2, 24] },
  );
}

export function createLabelTexture(text: string, opts: { width?: number; height?: number; color?: string; weight?: number; font?: string } = {}) {
  const { width = 1024, height = 160, color = "#ffffff", weight = 800, font = '"Arial Black", Arial, sans-serif' } = opts;
  const key = `label-${text}-${width}-${height}-${color}-${weight}`;
  return canvasTexture(
    key,
    width,
    height,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      let size = Math.round(h * 0.62);
      ctx.font = `${weight} ${size}px ${font}`;
      while (ctx.measureText(text).width > w * 0.94 && size > 10) {
        size -= 4;
        ctx.font = `${weight} ${size}px ${font}`;
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, w / 2, h / 2 + 4);
    },
    { color: true },
  ) as THREE.CanvasTexture;
}

/* ------------------------------------------------------------ Materiais */

export type MaterialSet = ReturnType<typeof buildMaterials>;

function buildMaterials(theme: Theme) {
  const white = theme === "white";
  const brushed = brushedTexture();
  const physical = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  const standard = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);

  return {
    /** Chapa pintada eletrostática do gabinete. */
    powder: physical({
      color: white ? "#c9ced5" : "#060708",
      metalness: white ? 0.1 : 0.35,
      roughness: 0.55,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6,
      envMapIntensity: white ? 1 : 0.55,
    }),
    powderInner: standard({ color: white ? "#bfc5cd" : "#08090b", metalness: 0.3, roughness: 0.7, envMapIntensity: white ? 1 : 0.5 }),
    perforated: standard({
      color: white ? "#c3c8cf" : "#0c0d10",
      metalness: 0.5,
      roughness: 0.5,
      alphaMap: perforatedTexture([34, 18], "perf-top"),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    }),
    perforatedFine: standard({
      color: white ? "#c3c8cf" : "#0c0d10",
      metalness: 0.5,
      roughness: 0.5,
      alphaMap: perforatedTexture([22, 8], "perf-fine"),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    }),
    honeycomb: standard({
      color: white ? "#dfe3e8" : "#0d0e11",
      metalness: 0.6,
      roughness: 0.4,
      alphaMap: honeycombTexture([10, 6]),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    }),
    /** Alumínio anodizado escovado (dissipadores, capas). */
    aluminum: physical({ color: white ? "#b8bec6" : "#2b2f37", metalness: white ? 0.7 : 1, roughness: 0.42, roughnessMap: brushed, clearcoat: 0.3 }),
    aluminumLight: physical({ color: "#c7ccd4", metalness: 1, roughness: 0.3, roughnessMap: brushed }),
    chrome: standard({ color: "#d9dde3", metalness: 1, roughness: 0.14 }),
    gold: standard({ color: "#c9a44a", metalness: 1, roughness: 0.3 }),
    copper: standard({ color: "#c27a4a", metalness: 1, roughness: 0.28 }),
    nickel: standard({ color: "#b9bec6", metalness: 1, roughness: 0.22 }),
    plastic: physical({ color: white ? "#d3d7dd" : "#0b0c0e", metalness: 0, roughness: white ? 0.5 : 0.55, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    plasticMatte: standard({ color: white ? "#c6cbd2" : "#0e0f12", metalness: 0, roughness: 0.8 }),
    pcb: standard({ map: pcbTexture(theme), metalness: 0.2, roughness: 0.55 }),
    pcbEdge: standard({ color: white ? "#b8bec7" : "#0d1014", metalness: 0.2, roughness: 0.6 }),
    rubber: standard({ color: "#0a0a0c", metalness: 0, roughness: 0.9 }),
    sleeve: standard({ map: sleeveTexture(), color: white ? "#ffffff" : "#3a3e46", metalness: 0.1, roughness: 0.75 }),
    fins: standard({ map: finTexture(60), metalness: 0.9, roughness: 0.35 }),
    finsDense: standard({ map: finTexture(28, "fins-d"), metalness: 0.9, roughness: 0.35 }),
    black: standard({ color: "#08090b", metalness: 0.2, roughness: 0.6 }),
    blades: physical({
      color: white ? "#dde1e6" : "#20242b",
      metalness: 0,
      roughness: 0.35,
      transparent: true,
      opacity: white ? 0.92 : 0.88,
      transmission: 0,
      side: THREE.DoubleSide,
    }),
    sideGlass: physical({
      color: "#56626b",
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.035,
      clearcoat: 0.6,
      clearcoatRoughness: 0.05,
      envMapIntensity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    frontGlass: physical({
      color: white ? "#dbe5ee" : "#56626b",
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.04,
      clearcoat: 0.6,
      envMapIntensity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  };
}

const matCache = new Map<Theme, MaterialSet>();

export function getMaterials(theme: Theme): MaterialSet {
  let set = matCache.get(theme);
  if (!set) {
    set = buildMaterials(theme);
    matCache.set(theme, set);
  }
  return set;
}

/** Material "difusor" do RGB — cada instância do PC tem o seu (a cor é animada). */
export function createRgbMaterials() {
  return {
    /** Faixa de LED direta (brilho máximo, alimenta o bloom). */
    led: new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#22d3ee", emissiveIntensity: 4, roughness: 0.4 }),
    /** Difusor leitoso (anéis de fans, barras da RAM). */
    diffuser: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      emissive: "#22d3ee",
      emissiveIntensity: 2.2,
      roughness: 0.35,
      transparent: true,
      opacity: 0.95,
    }),
  };
}

export type RgbMaterials = ReturnType<typeof createRgbMaterials>;

const labelMatCache = new Map<string, THREE.MeshBasicMaterial>();

/** Material de "serigrafia"/logo, com emissão opcional (para logos iluminados). */
export function getLabelMaterial(text: string, color = "#e8edf5", glow = false) {
  const key = `${text}|${color}|${glow}`;
  let mat = labelMatCache.get(key);
  if (!mat) {
    mat = new THREE.MeshBasicMaterial({
      map: createLabelTexture(text),
      transparent: true,
      color: new THREE.Color(color).multiplyScalar(glow ? 2.2 : 1),
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    labelMatCache.set(key, mat);
  }
  return mat;
}
