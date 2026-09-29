import { after, NextResponse, type NextRequest } from "next/server";
import { quoteSchema } from "@/lib/schemas";
import { clientIp, isAllowedOrigin, jsonError, protocolCode, rateLimit, readJson, siteOrigin } from "@/lib/server/http";
import { notifyQuote } from "@/lib/server/notify";
import { buildQuote } from "@/lib/server/quotes";
import { insert, type QuoteRecord } from "@/lib/server/store";

/** Salva uma configuração do "Monte seu PC" e devolve um link compartilhável. */
export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return jsonError(403, "Origem não permitida");

  const limit = rateLimit(`quote:${clientIp(request)}`, 20, 10 * 60_000);
  if (!limit.ok) return jsonError(429, "Muitas configurações salvas em sequência. Aguarde alguns minutos.");

  const parsed = quoteSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Configuração inválida");

  const result = buildQuote(parsed.data.selections, parsed.data);
  if (!result.ok) return jsonError(422, result.error, { details: result.details ?? [] });

  const quote: QuoteRecord = { id: protocolCode("PC"), createdAt: new Date().toISOString(), ...result.quote };
  try {
    await insert("orcamentos", quote);
  } catch (error) {
    console.error("[api/orcamentos] falha ao gravar", error);
    return jsonError(500, "Não foi possível salvar a configuração agora.");
  }

  const origin = siteOrigin(request);
  after(() => notifyQuote(quote, origin));

  return NextResponse.json(
    { ok: true, id: quote.id, total: quote.total, url: `${origin}/orcamento/${quote.id}/` },
    { status: 201 },
  );
}
