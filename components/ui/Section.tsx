import type { ReactNode } from "react";
import {
  Activity,
  Cloud,
  Database,
  Headset,
  Lock,
  Monitor,
  Network,
  Printer,
  Server,
  ShieldCheck,
  Users,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { B2BIcon } from "@/data/b2b";
import { cn } from "@/lib/utils";

/** Título padrão das seções: sobretítulo âmbar + título + texto de apoio. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "left",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>}
      <Heading
        id={id}
        className={cn(
          "font-display font-bold tracking-tight text-white",
          Heading === "h1" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl",
        )}
      >
        {title}
      </Heading>
      {description && <p className="mt-5 text-lg leading-relaxed text-slate-400">{description}</p>}
    </div>
  );
}

const FEATURE_ICONS = {
  headset: Headset,
  server: Server,
  shield: ShieldCheck,
  network: Network,
  cloud: Cloud,
  database: Database,
  monitor: Monitor,
  printer: Printer,
  wrench: Wrench,
  activity: Activity,
  lock: Lock,
  users: Users,
} satisfies Record<B2BIcon, unknown>;

export function FeatureIcon({ name, ...props }: { name: B2BIcon } & LucideProps) {
  const Icon = FEATURE_ICONS[name];
  return <Icon {...props} />;
}

/** Card de serviço/recurso com ícone. */
export function FeatureCard({ icon, title, text, className }: { icon: B2BIcon; title: string; text: string; className?: string }) {
  return (
    <article className={cn("group rounded-3xl border border-white/8 bg-panel/70 p-6 transition hover:border-brand/30 hover:bg-panel", className)}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20 transition group-hover:bg-brand group-hover:text-night">
        <FeatureIcon name={icon} className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
    </article>
  );
}

/** Topo das páginas internas. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000,transparent)]" />
      <div className="absolute -left-24 top-0 -z-10 h-96 w-96 rounded-full bg-brand/15 blur-[130px]" />
      <div className="absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-[130px]" />
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20",
          aside && "grid items-center gap-12 lg:grid-cols-12",
        )}
      >
        <div className={cn(aside && "lg:col-span-7")}>
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">{description}</p>
          {children && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div>}
        </div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </div>
    </section>
  );
}
