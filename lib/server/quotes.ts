import "server-only";
import { CATEGORY_LABEL, type PartCategory } from "@/data/hardwareCatalog";
import {
  estimateWattage,
  getCompatibility,
  missingRequired,
  recommendedPsuWatts,
  resolveBuild,
  STEP_CATEGORY_ORDER,
  totalPrice,
  type Selections,
} from "@/lib/builder";
import type { QuoteRecord } from "@/lib/server/store";

export type QuoteBuildResult =
  | { ok: true; quote: Omit<QuoteRecord, "id" | "createdAt"> }
  | { ok: false; error: string; details?: string[] };

/**
 * Recalcula a configuração no servidor a partir do catálogo oficial —
 * preços e compatibilidade nunca são aceitos do navegador.
 */
export function buildQuote(
  selections: Partial<Record<PartCategory, string>>,
  options: { rgbColor?: string; rainbow?: boolean } = {},
): QuoteBuildResult {
  const build = resolveBuild(selections as Selections);

  const unknown = Object.entries(selections)
    .filter(([category, id]) => id && !build[category as PartCategory])
    .map(([category]) => CATEGORY_LABEL[category as PartCategory]);
  if (unknown.length) return { ok: false, error: "Peça inexistente no catálogo", details: unknown };

  const parts = STEP_CATEGORY_ORDER.flatMap((category) => {
    const part = build[category];
    return part ? [{ category, id: part.id, name: part.name, price: part.price }] : [];
  });
  if (parts.length === 0) return { ok: false, error: "Selecione ao menos uma peça" };

  const warnings: string[] = [];
  const errors: string[] = [];
  for (const { category } of parts) {
    const others = { ...build };
    delete others[category];
    const result = getCompatibility(category, build[category] as never, others);
    const message = `${CATEGORY_LABEL[category]}: ${result.message ?? ""}`.trim();
    if (result.status === "error") errors.push(message);
    else if (result.status === "warning") warnings.push(message);
  }
  if (errors.length) return { ok: false, error: "Configuração com peças incompatíveis", details: errors };

  return {
    ok: true,
    quote: {
      parts,
      total: totalPrice(build),
      wattage: estimateWattage(build),
      recommendedPsu: recommendedPsuWatts(build),
      warnings,
      missing: missingRequired(build),
      rgbColor: options.rainbow ? null : (options.rgbColor ?? null),
      rainbow: !!options.rainbow,
    },
  };
}
