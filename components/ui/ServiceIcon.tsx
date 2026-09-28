import { Briefcase, Cpu, HardDrive, Laptop, Server, ShieldCheck, Thermometer, Wrench, type LucideProps } from "lucide-react";
import type { ServiceIcon as ServiceIconName } from "@/data/services";

const ICONS = {
  wrench: Wrench,
  cpu: Cpu,
  thermometer: Thermometer,
  laptop: Laptop,
  server: Server,
  briefcase: Briefcase,
  "hard-drive": HardDrive,
  shield: ShieldCheck,
} satisfies Record<ServiceIconName, unknown>;

export default function ServiceIcon({ name, ...props }: { name: ServiceIconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
