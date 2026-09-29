// Cliente das rotas de API do site (usado pelos formulários no navegador).

/** No build estático (HTML sem servidor) não há API: os formulários vão direto para o WhatsApp. */
export const STATIC_MODE = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export type ApiResult<T> =
  | ({ ok: true } & T)
  | { ok: false; error: string; fields?: Record<string, string>; details?: string[]; network?: boolean };

async function postJson<T>(url: string, body: unknown, timeoutMs = 10_000): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.ok) return data;
    return { ok: false, error: data?.error ?? "Não foi possível enviar agora.", fields: data?.fields, details: data?.details };
  } catch {
    return { ok: false, error: "Sem conexão com o servidor.", network: true };
  }
}

export const submitLead = (data: unknown) => postJson<{ protocol: string }>("/api/contato/", data);

export const saveQuote = (data: unknown) => postJson<{ id: string; url: string; total: number }>("/api/orcamentos/", data, 5000);
