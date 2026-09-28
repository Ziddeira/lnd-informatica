import { cn } from "@/lib/utils";

export default function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="lnd-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {/* "chip" com pinos */}
        <rect x="6" y="6" width="28" height="28" rx="7" fill="#0a0e16" stroke="url(#lnd-logo-grad)" strokeWidth="2" />
        {[12, 20, 28].map((p) => (
          <g key={p} stroke="url(#lnd-logo-grad)" strokeWidth="2" strokeLinecap="round">
            <line x1={p} y1="1.5" x2={p} y2="5" />
            <line x1={p} y1="35" x2={p} y2="38.5" />
            <line x1="1.5" y1={p} x2="5" y2={p} />
            <line x1="35" y1={p} x2="38.5" y2={p} />
          </g>
        ))}
        <text x="20" y="24.5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="var(--font-space), sans-serif">
          LND
        </text>
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-lg font-bold tracking-tight text-white">LND</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Informática</span>
        </span>
      )}
    </span>
  );
}
