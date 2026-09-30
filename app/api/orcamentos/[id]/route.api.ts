import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/server/http";
import { findById } from "@/lib/server/store";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^PC-[A-Z0-9]{6}$/.test(id)) return jsonError(404, "Configuração não encontrada");
  const quote = await findById("orcamentos", id);
  if (!quote) return jsonError(404, "Configuração não encontrada");
  return NextResponse.json({ ok: true, quote });
}
