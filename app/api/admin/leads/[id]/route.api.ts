import { NextResponse, type NextRequest } from "next/server";
import { leadStatusSchema } from "@/lib/schemas";
import { isAdmin, jsonError, readJson } from "@/lib/server/http";
import { update } from "@/lib/server/store";

/** Atualiza o status/observação de um contato. */
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return jsonError(401, "Não autorizado");
  const { id } = await ctx.params;
  const parsed = leadStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Status inválido");
  const lead = await update("leads", id, parsed.data);
  if (!lead) return jsonError(404, "Contato não encontrado");
  return NextResponse.json({ ok: true, lead });
}
