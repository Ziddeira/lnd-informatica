"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { WhatsappCta } from "@/components/ui/WhatsappButton";
import { COMPANY, NAV_LINKS } from "@/data/company";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu mobile ao navegar
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled || open ? "border-b border-white/5 bg-night/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8" aria-label="Principal">
        <Link href="/" aria-label="LND Informática — página inicial" className="shrink-0">
          <Logo className="h-8 sm:h-9" />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors xl:px-3.5",
                  isActive(link.href) ? "text-white" : "text-slate-400 hover:text-white",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${COMPANY.phoneE164}`}
            className="hidden items-center gap-1.5 text-sm text-slate-400 transition hover:text-white xl:flex"
          >
            <Phone className="h-4 w-4" />
            {COMPANY.phoneDisplay}
          </a>
          <WhatsappCta label="WhatsApp" />
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 lg:hidden"
          >
            <ul className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-medium transition",
                      isActive(link.href) ? "bg-brand/10 text-brand" : "text-slate-300 hover:bg-white/5",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="grid gap-2 pt-3">
                <WhatsappCta label="Orçamento no WhatsApp" size="lg" className="w-full" />
                <a
                  href={`tel:${COMPANY.phoneE164}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-slate-300"
                >
                  <Phone className="h-4 w-4" /> Ligar {COMPANY.phoneDisplay}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
