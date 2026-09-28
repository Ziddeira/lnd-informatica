"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { buildWhatsappUrl, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsappCtaProps {
  message?: string;
  label?: string;
  className?: string;
  size?: "md" | "lg";
  variant?: "solid" | "outline";
}

/** Botão de CTA inline para o WhatsApp da LND. */
export function WhatsappCta({
  message = DEFAULT_WHATSAPP_MESSAGE,
  label = "Falar com o Leonardo",
  className,
  size = "md",
  variant = "solid",
}: WhatsappCtaProps) {
  return (
    <a
      href={buildWhatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp",
        size === "lg" ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm",
        variant === "solid"
          ? "bg-whatsapp text-night shadow-lg shadow-whatsapp/20 hover:bg-whatsapp-strong"
          : "border border-whatsapp/40 text-whatsapp hover:bg-whatsapp/10",
        className,
      )}
    >
      <MessageCircle className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {label}
    </a>
  );
}

/** Botão flutuante fixo (presente em todas as páginas). */
export default function WhatsappButton() {
  const pathname = usePathname();
  // No montador a barra fixa inferior (mobile) já tem o CTA de WhatsApp — o flutuante só aparece no desktop.
  const onBuilder = pathname.startsWith("/monte-seu-pc");

  return (
    <motion.a
      href={buildWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com a LND Informática no WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
      className={cn(
        "group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-whatsapp p-3.5 text-night shadow-xl shadow-black/40 transition hover:bg-whatsapp-strong sm:bottom-6 sm:right-6",
        onBuilder && "max-lg:hidden",
      )}
    >
      <span className="absolute inset-0 -z-10 rounded-full bg-whatsapp/60 animate-ping-slow" />
      <MessageCircle className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-40 group-hover:pr-1 sm:inline">
        Fale no WhatsApp
      </span>
    </motion.a>
  );
}
