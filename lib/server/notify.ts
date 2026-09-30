import "server-only";
import { INTEREST_LABEL } from "@/lib/schemas";
import type { LeadRecord, QuoteRecord } from "@/lib/server/store";
import { formatBRL } from "@/lib/utils";

/*
 * Notificações opcionais, ativadas por variáveis de ambiente (veja .env.example):
 *  - LND_WEBHOOK_URL: recebe um POST JSON (compatível com Slack, Discord, n8n, Make, Zapier…)
 *  - RESEND_API_KEY + LND_NOTIFY_EMAIL_TO: envia um e-mail pela API da Resend (https://resend.com)
 * Falhas aqui nunca impedem o registro do contato — apenas ficam no log do servidor.
 */

const TIMEOUT_MS = 8000;

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} respondeu ${response.status}`);
}

async function sendWebhook(event: string, text: string, data: unknown) {
  const url = process.env.LND_WEBHOOK_URL;
  if (!url) return;
  // "text" (Slack), "content" (Discord) e "data" (automação) no mesmo payload.
  await postJson(url, { event, text, content: text.slice(0, 1900), data });
}

async function sendEmail(subject: string, text: string, replyTo?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LND_NOTIFY_EMAIL_TO;
  if (!apiKey || !to) return;
  await postJson(
    "https://api.resend.com/emails",
    {
      from: process.env.LND_NOTIFY_EMAIL_FROM || "Site LND <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    },
    { authorization: `Bearer ${apiKey}` },
  );
}

async function dispatch(label: string, tasks: Promise<void>[]) {
  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === "rejected") console.error(`[notify:${label}]`, r.reason);
}

/** Link wa.me para o telefone informado (acrescenta o DDI 55 quando falta). */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
}

export function leadText(lead: LeadRecord, adminUrl?: string): string {
  const lines: (string | false | undefined)[] = [
    `Novo contato pelo site — ${lead.protocol}`,
    `Assunto: ${INTEREST_LABEL[lead.interest]}`,
    `Nome: ${lead.name}`,
    !!lead.company && `Empresa: ${lead.company}${lead.companySize ? ` (${lead.companySize} colaboradores)` : ""}`,
    `Telefone/WhatsApp: ${lead.phone}`,
    !!lead.email && `E-mail: ${lead.email}`,
    "",
    lead.message,
    "",
    `Responder no WhatsApp: ${whatsappLink(lead.phone)}`,
    adminUrl && `Painel: ${adminUrl}`,
  ];
  return lines.filter((line): line is string => typeof line === "string").join("\n");
}

export function notifyLead(lead: LeadRecord, origin: string) {
  const text = leadText(lead, `${origin}/admin/`);
  // IP e navegador ficam só no registro interno, não vão para serviços externos.
  const { ip: _ip, userAgent: _ua, ...shared } = lead;
  return dispatch("lead", [
    sendWebhook("lead.created", text, shared),
    sendEmail(`[Site LND] ${INTEREST_LABEL[lead.interest]} — ${lead.company || lead.name}`, text, lead.email || undefined),
  ]);
}

export function notifyQuote(quote: QuoteRecord, origin: string) {
  const text = [
    `Nova configuração no montador — ${quote.id}`,
    ...quote.parts.map((p) => `• ${p.name} — ${p.price === 0 ? "incluso" : formatBRL(p.price)}`),
    `Total estimado: ${formatBRL(quote.total)}`,
    `Ver: ${origin}/orcamento/${quote.id}/`,
  ].join("\n");
  return dispatch("quote", [sendWebhook("quote.created", text, quote)]);
}
