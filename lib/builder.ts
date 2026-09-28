import {
  CATALOG,
  CATEGORY_LABEL,
  describePart,
  type CatalogMap,
  type PartCategory,
} from "@/data/hardwareCatalog";
import { COMPANY } from "@/data/company";
import { formatBRL } from "@/lib/utils";

export type Selections = Partial<Record<PartCategory, string>>;
export type ResolvedBuild = Partial<{ [K in PartCategory]: CatalogMap[K] }>;

export interface BuilderStep {
  id: string;
  title: string;
  short: string;
  description: string;
  categories: PartCategory[];
}

export const STEPS: BuilderStep[] = [
  { id: "cpu", title: "Processador", short: "CPU", categories: ["cpu"], description: "O cérebro da máquina. Define a plataforma (socket) e o tipo de memória." },
  { id: "motherboard", title: "Placa-Mãe", short: "Placa-Mãe", categories: ["motherboard"], description: "Mostramos apenas o que é compatível com o socket do seu processador." },
  { id: "ram", title: "Memória RAM", short: "RAM", categories: ["ram"], description: "Capacidade e frequência. Sempre em dual channel (2 pentes) para mais FPS." },
  { id: "gpu", title: "Placa de Vídeo", short: "GPU", categories: ["gpu"], description: "A peça que mais pesa no FPS. Escolha pela resolução em que você joga." },
  { id: "storage", title: "Armazenamento", short: "SSD/HD", categories: ["storage"], description: "SSD NVMe para sistema e jogos; HDD para arquivos e backup." },
  { id: "psu", title: "Fonte de Alimentação", short: "Fonte", categories: ["psu"], description: "Calculamos o consumo estimado da sua configuração e indicamos a potência ideal." },
  { id: "case", title: "Gabinete & Refrigeração", short: "Gabinete", categories: ["case", "cooler"], description: "Validamos tamanho da placa de vídeo, altura do cooler e suporte a radiador." },
];

export const STEP_CATEGORY_ORDER: PartCategory[] = STEPS.flatMap((s) => s.categories);

export function findPart<K extends PartCategory>(category: K, id?: string): CatalogMap[K] | undefined {
  if (!id) return undefined;
  return (CATALOG[category] as CatalogMap[K][]).find((p) => p.id === id);
}

export function resolveBuild(selections: Selections): ResolvedBuild {
  const build: ResolvedBuild = {};
  for (const category of STEP_CATEGORY_ORDER) {
    const part = findPart(category, selections[category]);
    if (part) (build as Record<PartCategory, unknown>)[category] = part;
  }
  return build;
}

/* ---------------------------------------------------------------- Energia */

/** Consumo de pico estimado da máquina em Watts. */
export function estimateWattage(build: ResolvedBuild): number {
  const base = 45; // placa-mãe + chipset
  const ram = build.ram ? build.ram.modules * 5 : 0;
  const storage = build.storage ? (build.storage.type === "hdd" ? 10 : 6) : 0;
  const fans = 3 * 4;
  const cooler = build.cooler?.type === "water" ? 10 : 3;
  return (build.cpu?.power ?? 0) + (build.gpu?.power ?? 0) + base + ram + storage + fans + cooler;
}

/** Potência de fonte recomendada: ~35% de margem, arredondada, respeitando a indicação do fabricante da GPU. */
export function recommendedPsuWatts(build: ResolvedBuild): number {
  const withMargin = Math.ceil((estimateWattage(build) * 1.35) / 50) * 50;
  return Math.max(450, withMargin, build.gpu?.recommendedPsu ?? 0);
}

/* ---------------------------------------------------------- Compatibilidade */

export type CompatStatus = "ok" | "recommended" | "warning" | "error";

export interface CompatResult {
  status: CompatStatus;
  message?: string;
}

const OK: CompatResult = { status: "ok" };

function requiredMemoryForSocket(socket: string): "DDR4" | "DDR5" | null {
  if (socket === "AM4") return "DDR4";
  if (socket === "AM5" || socket === "LGA1851") return "DDR5";
  return null; // LGA1700 aceita os dois, depende da placa-mãe
}

export function getCompatibility<K extends PartCategory>(
  category: K,
  part: CatalogMap[K],
  build: ResolvedBuild,
): CompatResult {
  switch (category) {
    case "cpu": {
      const cpu = part as CatalogMap["cpu"];
      if (build.motherboard && build.motherboard.socket !== cpu.socket)
        return { status: "warning", message: `Exige placa-mãe ${cpu.socket}` };
      return OK;
    }
    case "motherboard": {
      const mb = part as CatalogMap["motherboard"];
      if (build.cpu && build.cpu.socket !== mb.socket)
        return { status: "error", message: `Socket ${mb.socket} ≠ CPU ${build.cpu.socket}` };
      if (build.case && build.case.formFactor === "mATX" && mb.formFactor === "ATX")
        return { status: "warning", message: "Não cabe no gabinete escolhido" };
      if (build.ram && build.ram.memoryType !== mb.memoryType)
        return { status: "warning", message: `Exige memória ${mb.memoryType}` };
      return { status: "ok", message: "Compatível" };
    }
    case "ram": {
      const ram = part as CatalogMap["ram"];
      const required = build.motherboard?.memoryType ?? (build.cpu ? requiredMemoryForSocket(build.cpu.socket) : null);
      if (required && ram.memoryType !== required)
        return { status: "error", message: `Plataforma aceita apenas ${required}` };
      if (ram.memoryType === "DDR5" && ram.speedMHz === 6000 && build.cpu?.vendor === "amd")
        return { status: "recommended", message: "Frequência ideal p/ Ryzen" };
      return OK;
    }
    case "gpu": {
      const gpu = part as CatalogMap["gpu"];
      if (build.case && gpu.lengthMM > build.case.maxGpuMM)
        return { status: "error", message: `Não cabe no gabinete (máx. ${build.case.maxGpuMM}mm)` };
      if (build.psu && build.psu.watts < Math.max(gpu.recommendedPsu, recommendedPsuWatts({ ...build, gpu })))
        return { status: "warning", message: "Exigirá uma fonte mais forte" };
      return OK;
    }
    case "storage":
      return OK;
    case "psu": {
      const psu = part as CatalogMap["psu"];
      const draw = estimateWattage(build);
      const recommended = recommendedPsuWatts(build);
      if (!build.cpu && !build.gpu) return OK;
      if (psu.watts < draw * 1.1) return { status: "error", message: `Insuficiente (consumo ~${draw}W)` };
      if (psu.watts < recommended) return { status: "warning", message: `Abaixo dos ${recommended}W recomendados` };
      const smallestAdequate = CATALOG.psu
        .filter((p) => p.watts >= recommended)
        .sort((a, b) => a.watts - b.watts || a.price - b.price)[0];
      if (smallestAdequate?.id === psu.id) return { status: "recommended", message: "Potência ideal" };
      return { status: "ok", message: "Com folga para upgrades" };
    }
    case "case": {
      const pcCase = part as CatalogMap["case"];
      if (build.motherboard?.formFactor === "ATX" && pcCase.formFactor === "mATX")
        return { status: "error", message: "Não comporta placa-mãe ATX" };
      if (build.gpu && build.gpu.lengthMM > pcCase.maxGpuMM)
        return { status: "error", message: `GPU de ${build.gpu.lengthMM}mm não cabe` };
      if (build.cooler?.type === "air" && build.cooler.sizeMM > pcCase.maxCoolerMM)
        return { status: "error", message: "Air cooler alto demais" };
      if (build.cooler?.type === "water" && build.cooler.sizeMM > pcCase.maxRadiatorMM)
        return { status: "error", message: `Radiador máx. ${pcCase.maxRadiatorMM}mm` };
      if (pcCase.includedFans === 0) return { status: "warning", message: "Fans vendidas à parte" };
      return OK;
    }
    case "cooler": {
      const cooler = part as CatalogMap["cooler"];
      if (cooler.type === "box" && build.cpu && !build.cpu.includesCooler)
        return { status: "error", message: "Este processador não acompanha cooler" };
      if (cooler.type === "box" && !build.cpu) return { status: "warning", message: "Depende do processador" };
      if (cooler.type === "air" && build.case && cooler.sizeMM > build.case.maxCoolerMM)
        return { status: "error", message: `Altura máx. do gabinete: ${build.case.maxCoolerMM}mm` };
      if (cooler.type === "water" && build.case && cooler.sizeMM > build.case.maxRadiatorMM)
        return { status: "error", message: `Gabinete suporta até ${build.case.maxRadiatorMM}mm` };
      if (build.cpu && build.cpu.power > cooler.maxTdp)
        return { status: "warning", message: `Limita CPU de ${build.cpu.power}W` };
      if (build.cpu && build.cpu.power >= 150 && cooler.type === "water")
        return { status: "recommended", message: "Ideal para esse processador" };
      return OK;
    }
    default:
      return OK;
  }
}

/**
 * Remove seleções que ficaram incompatíveis depois de uma troca de peça.
 * Retorna as seleções limpas e os nomes das peças removidas (para avisar o usuário).
 */
export function sanitizeSelections(selections: Selections, changed: PartCategory): { selections: Selections; removed: string[] } {
  const next: Selections = { ...selections };
  const removed: string[] = [];
  for (const category of STEP_CATEGORY_ORDER) {
    if (category === changed) continue;
    const part = findPart(category, next[category]);
    if (!part) continue;
    const build = resolveBuild({ ...next, [category]: undefined });
    if (getCompatibility(category, part, build).status === "error") {
      delete next[category];
      removed.push(CATEGORY_LABEL[category]);
    }
  }
  return { selections: next, removed };
}

/* -------------------------------------------------------------- Resumo */

export function totalPrice(build: ResolvedBuild): number {
  return Object.values(build).reduce((sum, part) => sum + (part?.price ?? 0), 0);
}

export function missingRequired(build: ResolvedBuild): PartCategory[] {
  const missing = STEP_CATEGORY_ORDER.filter((c) => !build[c]);
  // Sem GPU é permitido quando o processador tem vídeo integrado
  return missing.filter((c) => !(c === "gpu" && build.cpu?.integratedGraphics));
}

export function buildSummaryText(build: ResolvedBuild, options: { forWhatsapp?: boolean } = {}): string {
  const lines: string[] = [];
  const bold = (s: string) => (options.forWhatsapp ? `*${s}*` : s);

  lines.push(options.forWhatsapp ? "Olá, Leonardo! Montei esta configuração no site da LND e gostaria de uma cotação final:" : `${COMPANY.name} — Orçamento preliminar`);
  lines.push("");
  for (const category of STEP_CATEGORY_ORDER) {
    const part = build[category];
    const label = CATEGORY_LABEL[category];
    if (!part) {
      if (category === "gpu" && build.cpu?.integratedGraphics) lines.push(`• ${bold(label)}: Vídeo integrado do processador`);
      continue;
    }
    const specs = describePart(category, part as never).slice(0, 3).join(" · ");
    lines.push(`• ${bold(label)}: ${part.name} (${specs}) — ${part.price === 0 ? "incluso" : formatBRL(part.price)}`);
  }
  lines.push("");
  lines.push(`⚡ Consumo estimado: ~${estimateWattage(build)}W (fonte recomendada: ${recommendedPsuWatts(build)}W)`);
  lines.push(`💰 ${bold(`Valor estimado de mercado: ${formatBRL(totalPrice(build))}`)}`);
  lines.push("");
  if (options.forWhatsapp) {
    lines.push("Pode me passar o valor final com montagem, teste de estresse, garantia e as condições de parcelamento?");
  } else {
    lines.push("Valores estimados com base na média do mercado nacional.");
    lines.push("Solicite o orçamento exato com a LND no WhatsApp para garantir valores promocionais,");
    lines.push("condições de parcelamento e montagem com teste de estresse inclusos.");
    lines.push("");
    lines.push(`WhatsApp: ${COMPANY.phoneDisplay}`);
    lines.push(COMPANY.address.full);
    lines.push(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
  }
  return lines.join("\n");
}
