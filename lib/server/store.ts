import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LeadData, LeadStatus } from "@/lib/schemas";
import type { PartCategory } from "@/data/hardwareCatalog";

/*
 * Armazenamento simples em arquivos JSON (um por coleção) — sem banco de dados para instalar.
 * Escritas são atômicas (arquivo temporário + rename) e serializadas por coleção.
 * Em hospedagens com disco efêmero (ex.: Vercel), configure LND_DATA_DIR para um volume persistente
 * ou use as notificações (e-mail/webhook) como registro principal dos contatos.
 */

export interface LeadRecord extends Omit<LeadData, "consent" | "website"> {
  id: string;
  protocol: string;
  createdAt: string;
  status: LeadStatus;
  note: string;
  ip: string;
  userAgent: string;
  source: string;
}

export interface QuotePart {
  category: PartCategory;
  id: string;
  name: string;
  price: number;
}

export interface QuoteRecord {
  id: string;
  createdAt: string;
  parts: QuotePart[];
  total: number;
  wattage: number;
  recommendedPsu: number;
  warnings: string[];
  missing: PartCategory[];
  rgbColor: string | null;
  rainbow: boolean;
}

interface Collections {
  leads: LeadRecord;
  orcamentos: QuoteRecord;
}
type CollectionName = keyof Collections;

const MAX_ITEMS = 5000;

export const DATA_DIR = process.env.LND_DATA_DIR || path.join(process.cwd(), ".data");
const fileOf = (name: CollectionName) => path.join(DATA_DIR, `${name}.json`);

const queues = new Map<CollectionName, Promise<unknown>>();

/** Executa as operações de uma coleção em fila, evitando escritas concorrentes. */
function enqueue<T>(name: CollectionName, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(name) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(task);
  queues.set(name, run);
  return run;
}

async function load<K extends CollectionName>(name: K): Promise<Collections[K][]> {
  try {
    const raw = await readFile(fileOf(name), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function save<K extends CollectionName>(name: K, items: Collections[K][]) {
  await mkdir(DATA_DIR, { recursive: true });
  const target = fileOf(name);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(items, null, 1), "utf8");
  await rename(tmp, target);
}

export function list<K extends CollectionName>(name: K): Promise<Collections[K][]> {
  return enqueue(name, () => load(name));
}

export function insert<K extends CollectionName>(name: K, item: Collections[K]): Promise<Collections[K]> {
  return enqueue(name, async () => {
    const items = await load(name);
    items.unshift(item);
    await save(name, items.slice(0, MAX_ITEMS));
    return item;
  });
}

export async function findById<K extends CollectionName>(name: K, id: string): Promise<Collections[K] | undefined> {
  return (await list(name)).find((item) => item.id === id);
}

export function update<K extends CollectionName>(
  name: K,
  id: string,
  patch: Partial<Collections[K]>,
): Promise<Collections[K] | undefined> {
  return enqueue(name, async () => {
    const items = await load(name);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...patch };
    await save(name, items);
    return items[index];
  });
}

/** Verifica se o diretório de dados aceita escrita (usado no health check). */
export async function storageWritable(): Promise<boolean> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const probe = path.join(DATA_DIR, `.probe-${process.pid}`);
    await writeFile(probe, "ok");
    await unlink(probe);
    return true;
  } catch {
    return false;
  }
}
