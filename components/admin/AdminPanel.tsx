"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Building2, Cpu, Download, LogOut, MessageCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { CATEGORY_LABEL } from "@/data/hardwareCatalog";
import { INTEREST_LABEL, INTERESTS, LEAD_STATUS_LABEL, LEAD_STATUSES, type LeadStatus } from "@/lib/schemas";
import type { LeadRecord, QuoteRecord } from "@/lib/server/store";
import { cn, formatBRL } from "@/lib/utils";

const TOKEN_KEY = "lnd-admin-token";

const STATUS_STYLE: Record<LeadStatus, string> = {
  novo: "bg-brand/15 text-brand",
  em_atendimento: "bg-sky-400/15 text-sky-300",
  concluido: "bg-emerald-400/15 text-emerald-300",
  descartado: "bg-white/5 text-slate-500",
};

const dateBR = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const waLink = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
};

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function Login({ onLogin, error }: { onLogin: (token: string) => void; error: string }) {
  const [value, setValue] = useState("");
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <Logo className="mx-auto h-10" />
      <form
        className="mt-8 rounded-3xl border border-white/8 bg-panel/80 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(value.trim());
        }}
      >
        <h1 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <ShieldCheck className="h-5 w-5 text-brand" /> Painel de contatos
        </h1>
        <label htmlFor="admin-token" className="mt-4 block text-sm text-slate-400">
          Chave de acesso (LND_ADMIN_TOKEN)
        </label>
        <input
          id="admin-token"
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-night px-3 py-2.5 text-white outline-none focus:border-brand"
        />
        {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
        <button type="submit" className="mt-4 w-full rounded-xl bg-brand py-2.5 font-semibold text-night hover:bg-brand-light">
          Entrar
        </button>
      </form>
    </div>
  );
}

const noopSubscribe = () => () => {};

export default function AdminPanel() {
  // O painel depende do sessionStorage: renderiza só no navegador (evita divergência com o HTML do servidor).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : readToken()));
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<"leads" | "orcamentos">("leads");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [filters, setFilters] = useState({ status: "", interest: "", q: "" });
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const api = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const res = await fetch(path, { ...init, headers: { ...init.headers, authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        setToken("");
        setAuthError("Chave inválida ou painel não configurado no servidor.");
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {}
        throw new Error("unauthorized");
      }
      return res;
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
        const [l, o] = await Promise.all([api(`/api/admin/leads/?${qs}`), api("/api/admin/orcamentos/")]);
        const [leadsJson, quotesJson] = await Promise.all([l.json(), o.json()]);
        if (cancelled) return;
        setLeads(leadsJson.leads ?? []);
        setCounts(leadsJson.counts ?? {});
        setQuotes(quotesJson.quotes ?? []);
      } catch {
        /* 401 já tratado em api() */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, filters, token, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const login = (value: string) => {
    setAuthError("");
    try {
      sessionStorage.setItem(TOKEN_KEY, value);
    } catch {}
    setToken(value);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken("");
  };

  const setStatus = async (lead: LeadRecord, status: LeadStatus, note = lead.note) => {
    const res = await api(`/api/admin/leads/${lead.id}/`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) reload();
  };

  const exportCsv = async () => {
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), format: "csv" });
    const res = await api(`/api/admin/leads/?${qs}`);
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos-lnd-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (!token) return <Login onLogin={login} error={authError} />;

  const select = "rounded-xl border border-white/10 bg-night px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Painel de contatos</h1>
          <p className="text-sm text-slate-400">Contatos do site e configurações salvas no montador.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reload} className={cn(select, "flex items-center gap-2")}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Atualizar
          </button>
          <button type="button" onClick={logout} className={cn(select, "flex items-center gap-2")}>
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LEAD_STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-white/8 bg-panel/70 p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-500">{LEAD_STATUS_LABEL[s]}</dt>
            <dd className="font-display text-2xl font-bold text-white">{counts[s] ?? 0}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex gap-2 border-b border-white/8" role="tablist">
        {(
          [
            ["leads", "Contatos", Building2],
            ["orcamentos", "Configurações de PC", Cpu],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium",
              tab === id ? "border-brand text-white" : "border-transparent text-slate-400 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "leads" ? (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            <label className="relative flex-1 basis-60">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <span className="sr-only">Buscar</span>
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Buscar por nome, empresa, telefone, protocolo…"
                className={cn(select, "w-full pl-9")}
              />
            </label>
            <select aria-label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className={select}>
              <option value="">Todos os status</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select aria-label="Assunto" value={filters.interest} onChange={(e) => setFilters((f) => ({ ...f, interest: e.target.value }))} className={select}>
              <option value="">Todos os assuntos</option>
              {INTERESTS.map((i) => (
                <option key={i} value={i}>
                  {INTEREST_LABEL[i]}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void exportCsv()} className={cn(select, "flex items-center gap-2")}>
              <Download className="h-4 w-4" /> Exportar CSV
            </button>
          </div>

          <ul className="mt-5 space-y-3">
            {leads.length === 0 && <li className="rounded-2xl border border-white/8 p-8 text-center text-slate-500">Nenhum contato encontrado.</li>}
            {leads.map((lead) => (
              <li key={lead.id} className="rounded-2xl border border-white/8 bg-panel/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      {lead.protocol} · {dateBR(lead.createdAt)} · {INTEREST_LABEL[lead.interest]}
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {lead.name}
                      {lead.company && <span className="font-normal text-slate-400"> — {lead.company}{lead.companySize && ` (${lead.companySize})`}</span>}
                    </p>
                    <p className="text-sm text-slate-400">
                      {lead.phone}
                      {lead.email && ` · ${lead.email}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[lead.status])}>
                      {LEAD_STATUS_LABEL[lead.status]}
                    </span>
                    <select
                      aria-label="Alterar status"
                      value={lead.status}
                      onChange={(e) => void setStatus(lead, e.target.value as LeadStatus)}
                      className={select}
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {LEAD_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <a
                      href={waLink(lead.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-whatsapp px-3 py-2 text-sm font-semibold text-night"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{lead.message}</p>
                <input
                  defaultValue={lead.note}
                  placeholder="Observação interna (salva ao sair do campo)"
                  aria-label="Observação interna"
                  onBlur={(e) => e.target.value !== lead.note && void setStatus(lead, lead.status, e.target.value)}
                  className={cn(select, "mt-3 w-full")}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {quotes.length === 0 && <li className="rounded-2xl border border-white/8 p-8 text-center text-slate-500 md:col-span-2">Nenhuma configuração salva.</li>}
          {quotes.map((quote) => (
            <li key={quote.id} className="rounded-2xl border border-white/8 bg-panel/70 p-5">
              <div className="flex items-center justify-between">
                <a href={`/orcamento/${quote.id}/`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
                  {quote.id}
                </a>
                <span className="text-xs text-slate-500">{dateBR(quote.createdAt)}</span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                {quote.parts.map((p) => (
                  <li key={p.category} className="flex justify-between gap-3">
                    <span className="truncate">
                      <span className="text-slate-500">{CATEGORY_LABEL[p.category]}:</span> {p.name}
                    </span>
                    <span className="shrink-0">{p.price === 0 ? "incluso" : formatBRL(p.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-white/5 pt-3 text-right font-display text-lg font-bold text-white">{formatBRL(quote.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
