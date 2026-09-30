import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/* ------------------------------------------------------------- Respostas */

export function jsonError(status: number, message: string, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status, headers });
}

/** Lê o corpo JSON com limite de tamanho. Retorna undefined se inválido. */
export async function readJson(request: NextRequest, maxBytes = 16_000): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return undefined;
  const text = await request.text();
  if (text.length > maxBytes) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------ Requisição */

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "desconhecido";
}

/**
 * Proteção contra envios de outros sites: se o navegador informar a origem,
 * ela precisa ser o próprio site (ou uma das origens liberadas em LND_ALLOWED_ORIGINS).
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // chamadas server-to-server / curl
  const allowed = new Set([
    request.nextUrl.origin,
    ...(process.env.LND_ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
  ]);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }
  return allowed.has(origin);
}

/** URL pública do site (para links enviados no WhatsApp/e-mail). */
export function siteOrigin(request: NextRequest): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : request.nextUrl.origin)).replace(/\/$/, "");
}

/* ------------------------------------------------------------ Rate limit */

const hits = new Map<string, number[]>();

/**
 * Limite de requisições em memória (janela deslizante). Suficiente para um único servidor;
 * em múltiplas instâncias, troque por um armazenamento compartilhado (ex.: Redis).
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

/* ------------------------------------------------------------ Identificadores */

// Base32 sem caracteres ambíguos (0/O, 1/I/L) — fácil de ditar por telefone.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function protocolCode(prefix = "LND", length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length];
  return `${prefix}-${code}`;
}

/* ------------------------------------------------------------ Admin */

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Autenticação do painel/API admin via "Authorization: Bearer <LND_ADMIN_TOKEN>". */
export function isAdmin(request: NextRequest): boolean {
  const expected = process.env.LND_ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return false;
  return timingSafeEqual(digest(token), digest(expected));
}
