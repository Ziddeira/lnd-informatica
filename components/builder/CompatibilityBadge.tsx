import { CircleAlert, CircleCheck, CircleX, Sparkles } from "lucide-react";
import type { CompatStatus } from "@/lib/builder";
import { cn } from "@/lib/utils";

const STYLES: Record<CompatStatus, { className: string; icon: typeof CircleCheck; fallback: string }> = {
  ok: { className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", icon: CircleCheck, fallback: "Compatível" },
  recommended: { className: "border-sky-400/30 bg-sky-400/10 text-sky-300", icon: Sparkles, fallback: "Recomendado" },
  warning: { className: "border-amber-400/25 bg-amber-400/10 text-amber-300", icon: CircleAlert, fallback: "Atenção" },
  error: { className: "border-rose-400/25 bg-rose-400/10 text-rose-300", icon: CircleX, fallback: "Incompatível" },
};

export default function CompatibilityBadge({
  status,
  message,
  className,
}: {
  status: CompatStatus;
  message?: string;
  className?: string;
}) {
  const { className: tone, icon: Icon, fallback } = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
        tone,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{message ?? fallback}</span>
    </span>
  );
}
