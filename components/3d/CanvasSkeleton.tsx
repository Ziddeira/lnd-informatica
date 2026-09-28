export default function CanvasSkeleton({ label = "Preparando o PC 3D…" }: { label?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-40 w-24 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="absolute inset-2 animate-pulse rounded-lg bg-gradient-to-br from-brand/10 to-accent/10" />
          <div className="absolute bottom-3 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-brand/60 shadow-[0_0_12px_#22d3ee]" />
        </div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
