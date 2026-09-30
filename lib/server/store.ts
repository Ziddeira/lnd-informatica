import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LeadData, LeadStatus } from "@/lib/schemas";
import type { PartCategory } from "@/data/hardwareCatalog";

/*
 * Armazenamento de contatos e orçamentos, com dois motores e a mesma interface:
 *
 *  - Redis (Upstash) — usado automaticamente quando existem as variáveis KV_REST_API_URL/KV_REST_API_TOKEN
 *    (criadas pela integração Upstash do Marketplace da Vercel) ou UPSTASH_REDIS_REST_URL/_TOKEN.
 *    É o recomendado na Vercel, onde o disco das funções é somente leitura.
 *  - Arquivos JSON — padrão em servidor próprio (pasta LND_DATA_DIR ou ./.data). Escritas atômicas
 *    (arquivo temporário + rename) e serializadas por coleção. Na Vercel sem Redis, cai para /tmp:
 *    funciona, mas é temporário — os avisos por e-mail/webhook passam a ser o registro principal.
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

export type StorageKind = "redis" | "file" | "tmp";

/* ---------------------------------------------------------------- Redis (Upstash REST) */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const PREFIX = process.env.LND_REDIS_PREFIX || "lnd";

type RedisCommand = (string | number)[];

async function redis(commands: RedisCommand[]): Promise<unknown[]> {
  const res = await fetch(`${REDIS_URL!.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${REDIS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Redis respondeu ${res.status}`);
  const replies = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = replies.find((r) => r.error);
  if (failed) throw new Error(`Redis: ${failed.error}`);
  return replies.map((r) => r.result);
}

const itemsKey = (name: CollectionName) => `${PREFIX}:${name}:items`;
const indexKey = (name: CollectionName) => `${PREFIX}:${name}:index`;
const parse = <T,>(raw: unknown): T | undefined => (typeof raw === "string" ? (JSON.parse(raw) as T) : undefined);

const redisStore = {
  async list<K extends CollectionName>(name: K): Promise<Collections[K][]> {
    const [ids] = (await redis([["ZREVRANGE", indexKey(name), 0, MAX_ITEMS - 1]])) as [string[]];
    if (!ids.length) return [];
    const [values] = (await redis([["HMGET", itemsKey(name), ...ids]])) as [unknown[]];
    return values.map((v) => parse<Collections[K]>(v)).filter((v): v is Collections[K] => !!v);
  },
  async insert<K extends CollectionName>(name: K, item: Collections[K]): Promise<Collections[K]> {
    await redis([
      ["HSET", itemsKey(name), item.id, JSON.stringify(item)],
      ["ZADD", indexKey(name), Date.parse(item.createdAt) || Date.now(), item.id],
    ]);
    return item;
  },
  async findById<K extends CollectionName>(name: K, id: string): Promise<Collections[K] | undefined> {
    const [raw] = await redis([["HGET", itemsKey(name), id]]);
    return parse<Collections[K]>(raw);
  },
  async update<K extends CollectionName>(name: K, id: string, patch: Partial<Collections[K]>) {
    const current = await redisStore.findById(name, id);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    await redis([["HSET", itemsKey(name), id, JSON.stringify(next)]]);
    return next;
  },
  async healthy() {
    const [pong] = await redis([["PING"]]);
    return pong === "PONG";
  },
};

/* ---------------------------------------------------------------- Arquivos JSON */
const onVercel = !!process.env.VERCEL;
export const DATA_DIR =
  process.env.LND_DATA_DIR || (onVercel ? path.join("/tmp", "lnd-data") : path.join(process.cwd(), ".data"));
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

const fileStore = {
  list<K extends CollectionName>(name: K): Promise<Collections[K][]> {
    return enqueue(name, () => load(name));
  },
  insert<K extends CollectionName>(name: K, item: Collections[K]): Promise<Collections[K]> {
    return enqueue(name, async () => {
      const items = await load(name);
      items.unshift(item);
      await save(name, items.slice(0, MAX_ITEMS));
      return item;
    });
  },
  async findById<K extends CollectionName>(name: K, id: string): Promise<Collections[K] | undefined> {
    return (await fileStore.list(name)).find((item) => item.id === id);
  },
  update<K extends CollectionName>(name: K, id: string, patch: Partial<Collections[K]>) {
    return enqueue(name, async () => {
      const items = await load(name);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      items[index] = { ...items[index], ...patch };
      await save(name, items);
      return items[index];
    });
  },
  async healthy() {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      const probe = path.join(DATA_DIR, `.probe-${process.pid}`);
      await writeFile(probe, "ok");
      await unlink(probe);
      return true;
    } catch {
      return false;
    }
  },
};

/* ---------------------------------------------------------------- Interface pública */
export const STORAGE_KIND: StorageKind = REDIS_URL && REDIS_TOKEN ? "redis" : onVercel && !process.env.LND_DATA_DIR ? "tmp" : "file";
const store = STORAGE_KIND === "redis" ? redisStore : fileStore;

if (STORAGE_KIND === "tmp") {
  console.warn("[store] Vercel sem Redis: contatos gravados em /tmp (temporário). Conecte o Upstash para guardar de vez.");
}

export const list = store.list;
export const insert = store.insert;
export const findById = store.findById;
export const update = store.update;

/** Verifica se o armazenamento está acessível (usado no health check). */
export async function storageWritable(): Promise<boolean> {
  try {
    return await store.healthy();
  } catch {
    return false;
  }
}
