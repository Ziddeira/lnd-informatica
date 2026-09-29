import { randomUUID } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { fieldErrors, leadSchema } from "@/lib/schemas";
import { clientIp, isAllowedOrigin, jsonError, protocolCode, rateLimit, readJson, siteOrigin } from "@/lib/server/http";
import { notifyLead } from "@/lib/server/notify";
import { insert, type LeadRecord } from "@/lib/server/store";

/** Recebe os formulários de contato/orçamento do site. */
export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return jsonError(403, "Origem não permitida");

  const ip = clientIp(request);
  const limit = rateLimit(`lead:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return jsonError(429, "Muitos envios em sequência. Tente novamente em alguns minutos ou fale pelo WhatsApp.", {}, {
      "retry-after": String(limit.retryAfter),
    });
  }

  const body = await readJson(request);
  if (body === undefined) return jsonError(400, "Requisição inválida");

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return jsonError(422, "Confira os campos destacados", { fields: fieldErrors(parsed.error) });

  const { consent: _consent, website, ...data } = parsed.data;
  const protocol = protocolCode();

  // Robôs preenchem o campo invisível: respondemos "ok" sem gravar nada.
  if (website) return NextResponse.json({ ok: true, protocol }, { status: 201 });

  const lead: LeadRecord = {
    ...data,
    id: randomUUID(),
    protocol,
    createdAt: new Date().toISOString(),
    status: "novo",
    note: "",
    ip,
    userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    source: (request.headers.get("referer") ?? "").slice(0, 300),
  };

  try {
    await insert("leads", lead);
  } catch (error) {
    console.error("[api/contato] falha ao gravar", error);
    return jsonError(500, "Não foi possível registrar agora. Fale com a gente pelo WhatsApp.");
  }

  const origin = siteOrigin(request);
  after(() => notifyLead(lead, origin));

  return NextResponse.json({ ok: true, protocol }, { status: 201 });
}
