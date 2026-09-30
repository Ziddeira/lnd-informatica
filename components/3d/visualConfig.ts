import type { CoolerType, GpuTier, StorageType } from "@/data/hardwareCatalog";
import { DEFAULT_MODELS, PART_MODELS, type Model3D, type ModelSlotId } from "@/data/models3d";
import type { ResolvedBuild } from "@/lib/builder";
import type { Theme } from "@/components/3d/materials";

export interface PcVisualConfig {
  caseColor: Theme;
  rgbColor: string;
  rainbow: boolean;
  show: Record<"motherboard" | "cpu" | "ram" | "gpu" | "storage" | "psu" | "cooler", boolean>;
  motherboard: { formFactor: "ATX" | "mATX"; theme: Theme; label: string };
  cpuLabel: string;
  gpu: { lengthMM: number; tier: GpuTier; fans: 2 | 3; vendor: "nvidia" | "amd" | "intel"; label: string; theme: Theme };
  cooler: { type: CoolerType; radiatorMM: number; dual: boolean; theme: Theme; label: string };
  ram: { sticks: number; rgb: boolean; theme: Theme };
  frontFans: number;
  storage: StorageType;
  psu: { label: string; efficiency: "bronze" | "gold" | "platinum" };
  panelOpen: boolean;
  /** Modelos .glb licenciados que substituem as peças procedurais (opcional). */
  models: Partial<Record<ModelSlotId, Model3D>>;
}

export const DEFAULT_VISUAL_CONFIG: PcVisualConfig = {
  caseColor: "black",
  rgbColor: "#ffaa01",
  rainbow: false,
  show: { motherboard: true, cpu: true, ram: true, gpu: true, storage: true, psu: true, cooler: true },
  motherboard: { formFactor: "ATX", theme: "black", label: "LND GAMING" },
  cpuLabel: "AMD RYZEN",
  gpu: { lengthMM: 330, tier: "ultra", fans: 3, vendor: "nvidia", label: "GEFORCE RTX", theme: "black" },
  cooler: { type: "water", radiatorMM: 360, dual: false, theme: "black", label: "LND" },
  ram: { sticks: 4, rgb: true, theme: "black" },
  frontFans: 3,
  storage: "nvme",
  psu: { label: "LND 850W", efficiency: "gold" },
  panelOpen: false,
  models: { ...DEFAULT_MODELS },
};

/** "GeForce RTX 5070 12GB Branca" → "GEFORCE RTX 5070" */
export function gpuLabel(name: string) {
  return name.replace(/\s*\d+GB.*$/i, "").toUpperCase();
}

/** Nome da linha da placa-mãe para a serigrafia (TUF GAMING, ROG STRIX, AORUS…). */
export function boardLabel(name: string) {
  const n = name.toUpperCase();
  if (n.includes("ROG")) return "ROG STRIX";
  if (n.includes("TUF")) return "TUF GAMING";
  if (n.includes("AORUS")) return "AORUS";
  if (n.includes("TOMAHAWK")) return "MAG TOMAHAWK";
  if (n.includes("MSI PRO")) return "MSI PRO";
  if (n.includes("PRIME")) return "PRIME";
  if (n.includes("ASROCK")) return "ASROCK";
  return n.split(" ")[0];
}

function slotModel(slot: ModelSlotId, partId?: string): Model3D | undefined {
  return (partId ? PART_MODELS[partId] : undefined) ?? DEFAULT_MODELS[slot];
}

/** Converte a configuração do montador nos parâmetros visuais do PC 3D. */
export function buildToVisualConfig(build: ResolvedBuild, rgbColor: string, rainbow: boolean): PcVisualConfig {
  const { cpu, motherboard, ram, gpu, storage, psu, cooler } = build;
  const pcCase = build.case;
  const coolerType: CoolerType = cooler?.type ?? "air";

  return {
    ...DEFAULT_VISUAL_CONFIG,
    rgbColor,
    rainbow,
    caseColor: pcCase?.color ?? "black",
    show: {
      motherboard: !!motherboard,
      cpu: !!cpu,
      ram: !!ram,
      gpu: !!gpu,
      storage: !!storage,
      psu: !!psu,
      cooler: !!cooler,
    },
    motherboard: motherboard
      ? { formFactor: motherboard.formFactor, theme: motherboard.color ?? "black", label: boardLabel(motherboard.name) }
      : DEFAULT_VISUAL_CONFIG.motherboard,
    cpuLabel: cpu ? (cpu.vendor === "amd" ? "AMD RYZEN" : "INTEL CORE") : DEFAULT_VISUAL_CONFIG.cpuLabel,
    gpu: gpu
      ? {
          lengthMM: gpu.lengthMM,
          tier: gpu.tier,
          fans: gpu.lengthMM < 255 ? 2 : 3,
          vendor: gpu.vendor,
          label: gpuLabel(gpu.name),
          theme: gpu.color ?? "black",
        }
      : DEFAULT_VISUAL_CONFIG.gpu,
    cooler: {
      type: coolerType,
      radiatorMM: cooler?.type === "water" ? cooler.sizeMM : 360,
      dual: !!cooler?.dualTower,
      theme: cooler?.color ?? "black",
      label: cooler ? cooler.brand.toUpperCase() : "LND",
    },
    ram: { sticks: ram?.modules ?? 2, rgb: ram?.rgb ?? false, theme: ram?.color ?? "black" },
    frontFans: pcCase ? Math.min(3, pcCase.includedFans) : 3,
    storage: storage?.type ?? "nvme",
    psu: psu
      ? {
          label: `${psu.brand.toUpperCase()} ${psu.watts}W`,
          efficiency: psu.efficiency.includes("Platinum") ? "platinum" : psu.efficiency.includes("Gold") ? "gold" : "bronze",
        }
      : DEFAULT_VISUAL_CONFIG.psu,
    panelOpen: false,
    models: {
      case: slotModel("case", pcCase?.id),
      motherboard: slotModel("motherboard", motherboard?.id),
      cpu: slotModel("cpu", cpu?.id),
      ram: slotModel("ram", ram?.id),
      gpu: slotModel("gpu", gpu?.id),
      cooler: coolerType !== "water" ? slotModel("cooler", cooler?.id) : undefined,
      pump: coolerType === "water" ? slotModel("pump", cooler?.id) : undefined,
      psu: slotModel("psu", psu?.id),
      storage: slotModel("storage", storage?.id),
      fan: DEFAULT_MODELS.fan,
    },
  };
}
