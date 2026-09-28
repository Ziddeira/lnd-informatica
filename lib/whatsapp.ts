import { COMPANY } from "@/data/company";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, Leonardo! Vim pelo site da LND Informática e gostaria de um atendimento.";

export function buildWhatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
