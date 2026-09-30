import { cn } from "@/lib/utils";

/** Âmbar oficial da marca LND (extraído do logotipo). */
export const BRAND_AMBER = "#ffaa01";

const GEAR = { cx: 21.5, cy: 18.5 };
const TEETH = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

/** Símbolo da LND: monitor com engrenagem. */
function MarkPaths({ color }: { color: string }) {
  return (
    <g fill="none">
      <rect x="3" y="3" width="37" height="31" rx="6.5" stroke={color} strokeWidth="5" />
      <rect x="16.5" y="33" width="10" height="7.5" rx="2" fill={color} />
      <g stroke={color}>
        <circle cx={GEAR.cx} cy={GEAR.cy} r="4.6" strokeWidth="2.6" />
        {TEETH.map((a) => (
          <line
            key={a}
            x1={GEAR.cx + Math.cos(a) * 6.2}
            y1={GEAR.cy + Math.sin(a) * 6.2}
            x2={GEAR.cx + Math.cos(a) * 8.9}
            y2={GEAR.cy + Math.sin(a) * 8.9}
            strokeWidth="3"
          />
        ))}
      </g>
    </g>
  );
}

export function LogoMark({ className, color = BRAND_AMBER }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 43 44" className={cn("h-9 w-9", className)} aria-hidden="true">
      <MarkPaths color={color} />
    </svg>
  );
}

/** Logotipo oficial "[monitor] LND". */
export default function Logo({ className, color = BRAND_AMBER }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 140 44" className={cn("h-9 w-auto", className)} role="img" aria-label="LND Informática">
      <MarkPaths color={color} />
      <g fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M53 8.5 V31.5 H69" />
        <path d="M78 31.5 V8.5 L97 31.5 V8.5" />
        {/* D com a barra superior avançada, como no logotipo original */}
        <path d="M106 8.5 H121 A12 12 0 0 1 133 20.5 A11 11 0 0 1 122 31.5 H113 V16" />
      </g>
    </svg>
  );
}
