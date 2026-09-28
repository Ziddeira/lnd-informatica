"use client";

import { Html } from "@react-three/drei";
import type { HardwareEducation } from "@/data/hardwareEducation";
import { use3DStore } from "@/store/use3DStore";
import { cn } from "@/lib/utils";

interface HardwareHotspotProps {
  part: HardwareEducation;
  index: number;
}

export default function HardwareHotspot({ part, index }: HardwareHotspotProps) {
  const isActive = use3DStore((s) => s.activePart === part.id);
  const someoneActive = use3DStore((s) => s.activePart !== null);
  const isHovered = use3DStore((s) => s.hoveredPart === part.id);
  const setActivePart = use3DStore((s) => s.setActivePart);
  const setHoveredPart = use3DStore((s) => s.setHoveredPart);

  return (
    <Html position={part.anchor} center zIndexRange={[30, 10]}>
      <div className="animate-[hotspot-in_0.5s_ease-out_both]" style={{ animationDelay: `${index * 70}ms` }}>
      <button
        type="button"
        onClick={() => setActivePart(isActive ? null : part.id)}
        onPointerEnter={() => setHoveredPart(part.id)}
        onPointerLeave={() => setHoveredPart(null)}
        aria-label={`Ver detalhes: ${part.name}`}
        aria-pressed={isActive}
        className={cn(
          "group relative flex h-9 w-9 items-center justify-center rounded-full outline-none transition-opacity duration-300",
          "focus-visible:ring-2 focus-visible:ring-white",
          someoneActive && !isActive && "opacity-35 hover:opacity-100",
        )}
      >
        <span className="absolute inset-1 rounded-full bg-brand/40 animate-ping-slow" />
        <span
          className={cn(
            "relative h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_14px_rgba(34,211,238,0.9)] transition-transform duration-200",
            isActive ? "scale-125 bg-accent" : "bg-brand group-hover:scale-125",
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-night/85 px-2 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur transition-all duration-200",
            isActive || isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1 md:opacity-80 md:translate-x-0",
          )}
        >
          {part.shortName}
        </span>
      </button>
      </div>
    </Html>
  );
}
