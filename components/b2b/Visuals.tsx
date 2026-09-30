import { Activity, CircleCheck, DatabaseBackup, HardDrive, Server, ShieldCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const RACK_UNITS = [
  { label: "FIREWALL · pfSense", leds: 4, kind: "net" },
  { label: "SWITCH 24P", leds: 12, kind: "net" },
  { label: "SRV-01 · Windows Server", leds: 3, kind: "srv" },
  { label: "SRV-02 · Linux / VMs", leds: 3, kind: "srv" },
  { label: "NAS · Backup", leds: 4, kind: "disk" },
  { label: "NOBREAK 3kVA", leds: 2, kind: "ups" },
] as const;

/** Ilustração de rack de servidores (CSS puro, sem imagens). */
export function ServerRack({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b1e25] to-[#0c0d11] p-3 shadow-2xl shadow-black/60",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute -inset-10 -z-10 rounded-full bg-brand/10 blur-3xl" />
      <div className="flex justify-between px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
        <span>Rack 42U</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
        </span>
      </div>
      <div className="space-y-1.5 rounded-xl border border-white/5 bg-black/40 p-2">
        {RACK_UNITS.map((unit, i) => (
          <div
            key={unit.label}
            className={cn(
              "flex items-center gap-3 rounded-md border border-white/5 bg-gradient-to-r from-[#22262e] to-[#16181e] px-3",
              unit.kind === "srv" ? "h-12" : "h-9",
            )}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] tracking-wider text-slate-400">{unit.label}</span>
            <span className="flex gap-1">
              {Array.from({ length: unit.leds }, (_, led) => (
                <span
                  key={led}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    unit.kind === "ups" ? "bg-emerald-400" : led % 3 === 0 ? "bg-brand" : "bg-emerald-400/80",
                    (led + i) % 2 === 0 && "animate-pulse",
                  )}
                  style={{ animationDelay: `${(led * 170 + i * 90) % 1400}ms` }}
                />
              ))}
            </span>
            {unit.kind === "srv" && (
              <span className="hidden gap-0.5 sm:flex">
                {Array.from({ length: 4 }, (_, d) => (
                  <span key={d} className="h-6 w-2.5 rounded-sm border border-white/10 bg-[#0f1116]" />
                ))}
              </span>
            )}
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_ROWS = [
  { icon: Server, label: "Servidor de arquivos", value: "Online · 99,9%" },
  { icon: DatabaseBackup, label: "Backup noturno", value: "Concluído 02:00" },
  { icon: ShieldCheck, label: "Firewall pfSense", value: "1.284 ameaças bloqueadas" },
  { icon: HardDrive, label: "Discos (RAID 1)", value: "Saudáveis" },
  { icon: Ticket, label: "Chamados do mês", value: "18 resolvidos · 0 abertos" },
];

/** Cartão ilustrativo do relatório mensal entregue aos clientes com contrato. */
export function StatusPanel({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-panel/90 p-5 shadow-2xl shadow-black/50 backdrop-blur", className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Activity className="h-4 w-4 text-brand" /> Saúde da TI · Relatório mensal
        </p>
        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">Tudo certo</span>
      </div>
      <ul className="space-y-2">
        {STATUS_ROWS.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-night/60 px-3 py-2.5">
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="flex-1 text-sm text-slate-300">{label}</span>
            <span className="text-right text-xs text-slate-400">{value}</span>
            <CircleCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[11px] text-slate-500">Exemplo ilustrativo do relatório enviado aos clientes com contrato.</p>
    </div>
  );
}
