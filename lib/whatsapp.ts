import { COMPANY } from "@/data/company";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, Leonardo! Vim pelo site da LND Informática e gostaria de um atendimento.";

export function buildWhatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Abre uma aba vazia de forma síncrona (ainda no clique). Use antes de um `await`
 * e depois passe para `openWhatsapp`, assim o navegador não bloqueia como pop-up.
 */
export function prepareWhatsappWindow(): Window | null {
  const win = window.open("about:blank", "_blank");
  if (win) win.opener = null;
  return win;
}

/** Abre a conversa do WhatsApp da LND com a mensagem (na aba preparada, se houver). */
export function openWhatsapp(message: string, win: Window | null = null) {
  const url = buildWhatsappUrl(message);
  if (win && !win.closed) win.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}
