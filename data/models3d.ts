/*
 * Registro de modelos 3D externos (.glb) — opcional. Guia completo: docs/modelos-3d.md
 *
 * Enquanto este arquivo estiver vazio, o site usa o modelo procedural em alta definição.
 * Para trocar uma peça por um modelo 3D realista LICENCIADO:
 *   1. Coloque o arquivo em /public/models/... (formato .glb, idealmente < 5 MB, comprimido com Draco/Meshopt)
 *   2. Registre abaixo — por peça específica (PART_MODELS, usando o id do catálogo) ou como padrão da categoria (DEFAULT_MODELS)
 *   3. O modelo é redimensionado e centralizado automaticamente no espaço daquela peça dentro do gabinete.
 *      Se precisar girar, use `rotation` (radianos). Se o arquivo falhar ao carregar, o procedural é usado.
 *
 * Use APENAS modelos com licença comercial (compra na CGTrader/TurboSquid/Sketchfab Store, CC-BY com crédito,
 * ou arquivos fornecidos pelo fabricante com autorização). Nunca extraia modelos de outros sites.
 * Modelos com `credit` aparecem automaticamente nos créditos do rodapé (exigência de licenças CC-BY).
 */

export type ModelSlotId = "case" | "motherboard" | "cpu" | "ram" | "gpu" | "cooler" | "pump" | "psu" | "storage" | "fan";

export interface Model3D {
  /** Caminho público, ex.: "/models/gpu/rtx-5080.glb" */
  url: string;
  rotation?: [number, number, number];
  /** Multiplicador sobre o ajuste automático (1 = ocupa exatamente o espaço da peça). */
  scale?: number;
  /** Crédito exigido pela licença (ex.: "“RTX Card” por Fulano — CC-BY 4.0"). */
  credit?: string;
}

/** Modelo padrão de cada tipo de peça (usado no Hero e quando a peça escolhida não tem modelo próprio). */
export const DEFAULT_MODELS: Partial<Record<ModelSlotId, Model3D>> = {
  // gpu: { url: "/models/gpu/generica-3fans.glb", credit: "Modelo por Autor — CC-BY 4.0" },
  // case: { url: "/models/case/gabinete-panoramico.glb", rotation: [0, Math.PI / 2, 0] },
};

/** Modelos por peça do catálogo (chave = id em data/hardwareCatalog.ts). */
export const PART_MODELS: Record<string, Model3D> = {
  // "rtx-5080-16": { url: "/models/gpu/rtx-5080.glb" },
  // "lancool-216": { url: "/models/case/lancool-216.glb" },
};

export const MODEL_CREDITS = [...Object.values(DEFAULT_MODELS), ...Object.values(PART_MODELS)]
  .map((m) => m?.credit)
  .filter((c): c is string => !!c);
