import { NextResponse, type NextRequest } from "next/server";
import { INTEREST_LABEL, INTERESTS, LEAD_STATUS_LABEL, LEAD_STATUSES, type Interest, type LeadStatus } from "@/lib/schemas";
import { isAdmin, jsonError } from "@/lib/server/http";
import { list, type LeadRecord } from "@/lib/server/store";

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  // Neutraliza fórmulas ao abrir no Excel/Sheets (CSV injection).
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

function toCsv(leads: LeadRecord[]) {
  const header = ["Protocolo", "Data", "Status", "Assunto", "Nome", "Empresa", "Porte", "Telefone", "E-mail", "Mensagem", "Observação"];
  const rows = leads.map((l) => [
    l.protocol,
    new Date(l.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    LEAD_STATUS_LABEL[l.status],
    INTEREST_LABEL[l.interest],
    l.name,
    l.company,
    l.companySize,
    l.phone,
    l.email,
    l.message,
    l.note,
  ]);
  return "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
}

/** Lista os contatos recebidos. Filtros: ?status=novo&interest=empresa&q=texto&format=csv */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return jsonError(401, "Não autorizado");

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const interest = params.get("interest");
  const q = params.get("q")?.trim().toLowerCase();

  let leads = await list("leads");
  if (status && LEAD_STATUSES.includes(status as LeadStatus)) leads = leads.filter((l) => l.status === status);
  if (interest && INTERESTS.includes(interest as Interest)) leads = leads.filter((l) => l.interest === interest);
  if (q) {
    leads = leads.filter((l) =>
      [l.protocol, l.name, l.company, l.phone, l.email, l.message].some((field) => field?.toLowerCase().includes(q)),
    );
  }

  if (params.get("format") === "csv") {
    return new NextResponse(toCsv(leads), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="contatos-lnd-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "no-store",
      },
    });
  }

  const all = await list("leads");
  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, all.filter((l) => l.status === s).length]));
  return NextResponse.json({ ok: true, leads, counts, total: all.length }, { headers: { "cache-control": "no-store" } });
}
