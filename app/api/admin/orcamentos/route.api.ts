import { NextResponse, type NextRequest } from "next/server";
import { isAdmin, jsonError } from "@/lib/server/http";
import { list } from "@/lib/server/store";

/** Configurações salvas no montador de PC (mais recentes primeiro). */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return jsonError(401, "Não autorizado");
  const quotes = await list("orcamentos");
  return NextResponse.json({ ok: true, quotes: quotes.slice(0, 200), total: quotes.length }, { headers: { "cache-control": "no-store" } });
}
