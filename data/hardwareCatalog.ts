// Catálogo com especificações públicas dos fabricantes (AMD, Intel, NVIDIA, ASUS, MSI, Gigabyte, Corsair etc.)
// e preços MÉDIOS ESTIMADOS de mercado nacional (R$, à vista, ref. 2026).
// Os valores são estimativas para o simulador — o orçamento final é sempre feito pela LND.
// TODO(LND): revisar preços periodicamente e conferir specs na página oficial antes de cotar.

export type Socket = "AM4" | "AM5" | "LGA1700" | "LGA1851";
export type MemoryType = "DDR4" | "DDR5";
export type FormFactor = "ATX" | "mATX";
export type GpuTier = "entry" | "mid" | "high" | "ultra";
export type StorageType = "nvme" | "sata" | "hdd";
export type CoolerType = "box" | "air" | "water";

interface BasePart {
  id: string;
  name: string;
  brand: string;
  price: number;
  /** Frase curta exibida no card para ajudar leigos a decidir. */
  highlight?: string;
  /** Cor predominante — usada no visual 3D (padrão: preto). */
  color?: "black" | "white";
}

export interface Cpu extends BasePart {
  vendor: "intel" | "amd";
  socket: Socket;
  cores: number;
  threads: number;
  boostGHz: number;
  /** Consumo de pico estimado (W) usado no cálculo da fonte. */
  power: number;
  integratedGraphics: boolean;
  includesCooler: boolean;
}

export interface Motherboard extends BasePart {
  socket: Socket;
  chipset: string;
  memoryType: MemoryType;
  formFactor: FormFactor;
  wifi: boolean;
}

export interface Ram extends BasePart {
  memoryType: MemoryType;
  capacityGB: number;
  modules: number;
  speedMHz: number;
  rgb: boolean;
}

export interface Gpu extends BasePart {
  vendor: "nvidia" | "amd" | "intel";
  vramGB: number;
  power: number;
  lengthMM: number;
  tier: GpuTier;
  recommendedPsu: number;
}

export interface Storage extends BasePart {
  type: StorageType;
  capacityGB: number;
  readMBs: number;
}

export interface Psu extends BasePart {
  watts: number;
  efficiency: "80+ Bronze" | "80+ Gold" | "80+ Platinum";
  modular: "Não modular" | "Semi-modular" | "Full modular";
}

export interface PcCase extends BasePart {
  formFactor: FormFactor;
  color: "black" | "white";
  maxGpuMM: number;
  maxCoolerMM: number;
  maxRadiatorMM: 240 | 280 | 360;
  includedFans: number;
}

export interface Cooler extends BasePart {
  type: CoolerType;
  /** Altura em mm (air cooler) ou tamanho do radiador em mm (water cooler). */
  sizeMM: number;
  maxTdp: number;
  rgb: boolean;
  /** Air cooler de torre dupla. */
  dualTower?: boolean;
}

export const CPUS: Cpu[] = [
  { id: "r5-5600", name: "Ryzen 5 5600", brand: "AMD", vendor: "amd", socket: "AM4", cores: 6, threads: 12, boostGHz: 4.4, power: 76, integratedGraphics: false, includesCooler: true, price: 699, highlight: "Custo-benefício imbatível para 1080p" },
  { id: "r7-5700x3d", name: "Ryzen 7 5700X3D", brand: "AMD", vendor: "amd", socket: "AM4", cores: 8, threads: 16, boostGHz: 4.1, power: 105, integratedGraphics: false, includesCooler: false, price: 1399, highlight: "Cache 3D: FPS alto na plataforma AM4" },
  { id: "r5-7600", name: "Ryzen 5 7600", brand: "AMD", vendor: "amd", socket: "AM5", cores: 6, threads: 12, boostGHz: 5.1, power: 88, integratedGraphics: true, includesCooler: true, price: 1199, highlight: "Porta de entrada no AM5 com DDR5" },
  { id: "r5-9600x", name: "Ryzen 5 9600X", brand: "AMD", vendor: "amd", socket: "AM5", cores: 6, threads: 12, boostGHz: 5.4, power: 88, integratedGraphics: true, includesCooler: false, price: 1549 },
  { id: "r7-7800x3d", name: "Ryzen 7 7800X3D", brand: "AMD", vendor: "amd", socket: "AM5", cores: 8, threads: 16, boostGHz: 5.0, power: 120, integratedGraphics: true, includesCooler: false, price: 2599, highlight: "Referência para jogos competitivos" },
  { id: "r7-9800x3d", name: "Ryzen 7 9800X3D", brand: "AMD", vendor: "amd", socket: "AM5", cores: 8, threads: 16, boostGHz: 5.2, power: 120, integratedGraphics: true, includesCooler: false, price: 3399, highlight: "O processador gamer mais rápido" },
  { id: "r5-5500", name: "Ryzen 5 5500", brand: "AMD", vendor: "amd", socket: "AM4", cores: 6, threads: 12, boostGHz: 4.2, power: 76, integratedGraphics: false, includesCooler: true, price: 529, highlight: "O mais barato para jogar com placa dedicada" },
  { id: "r7-5700x", name: "Ryzen 7 5700X", brand: "AMD", vendor: "amd", socket: "AM4", cores: 8, threads: 16, boostGHz: 4.6, power: 76, integratedGraphics: false, includesCooler: false, price: 899 },
  { id: "r5-8600g", name: "Ryzen 5 8600G", brand: "AMD", vendor: "amd", socket: "AM5", cores: 6, threads: 12, boostGHz: 5.0, power: 88, integratedGraphics: true, includesCooler: true, price: 1299, highlight: "Radeon 760M integrada: joga sem placa de vídeo" },
  { id: "r7-8700g", name: "Ryzen 7 8700G", brand: "AMD", vendor: "amd", socket: "AM5", cores: 8, threads: 16, boostGHz: 5.1, power: 88, integratedGraphics: true, includesCooler: true, price: 1899, highlight: "Radeon 780M: a integrada mais forte" },
  { id: "r7-9700x", name: "Ryzen 7 9700X", brand: "AMD", vendor: "amd", socket: "AM5", cores: 8, threads: 16, boostGHz: 5.5, power: 88, integratedGraphics: true, includesCooler: false, price: 2099 },
  { id: "r9-9900x", name: "Ryzen 9 9900X", brand: "AMD", vendor: "amd", socket: "AM5", cores: 12, threads: 24, boostGHz: 5.6, power: 162, integratedGraphics: true, includesCooler: false, price: 3199 },
  { id: "r9-9950x3d", name: "Ryzen 9 9950X3D", brand: "AMD", vendor: "amd", socket: "AM5", cores: 16, threads: 32, boostGHz: 5.7, power: 230, integratedGraphics: true, includesCooler: false, price: 5999, highlight: "Topo absoluto: jogos + produtividade" },
  { id: "r9-9950x", name: "Ryzen 9 9950X", brand: "AMD", vendor: "amd", socket: "AM5", cores: 16, threads: 32, boostGHz: 5.7, power: 230, integratedGraphics: true, includesCooler: false, price: 4299, highlight: "Workstation: render, edição e IA" },
  { id: "i3-12100f", name: "Core i3-12100F", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 4, threads: 8, boostGHz: 4.3, power: 89, integratedGraphics: false, includesCooler: true, price: 499, highlight: "Entrada econômica para eSports" },
  { id: "i5-12400f", name: "Core i5-12400F", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 6, threads: 12, boostGHz: 4.4, power: 117, integratedGraphics: false, includesCooler: true, price: 699 },
  { id: "i5-14400f", name: "Core i5-14400F", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 10, threads: 16, boostGHz: 4.7, power: 148, integratedGraphics: false, includesCooler: true, price: 1099, highlight: "Equilíbrio entre jogos e trabalho" },
  { id: "i7-14700k", name: "Core i7-14700K", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 20, threads: 28, boostGHz: 5.6, power: 253, integratedGraphics: true, includesCooler: false, price: 2399 },
  { id: "u5-245k", name: "Core Ultra 5 245K", brand: "Intel", vendor: "intel", socket: "LGA1851", cores: 14, threads: 14, boostGHz: 5.2, power: 159, integratedGraphics: true, includesCooler: false, price: 1799 },
  { id: "u7-265k", name: "Core Ultra 7 265K", brand: "Intel", vendor: "intel", socket: "LGA1851", cores: 20, threads: 20, boostGHz: 5.5, power: 250, integratedGraphics: true, includesCooler: false, price: 2499, highlight: "Multitarefa pesada com eficiência" },
  { id: "i5-13400f", name: "Core i5-13400F", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 10, threads: 16, boostGHz: 4.6, power: 148, integratedGraphics: false, includesCooler: true, price: 899 },
  { id: "i5-14600k", name: "Core i5-14600K", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 14, threads: 20, boostGHz: 5.3, power: 181, integratedGraphics: true, includesCooler: false, price: 1699, highlight: "Desbloqueado: ótimo para jogar e fazer stream" },
  { id: "i9-14900k", name: "Core i9-14900K", brand: "Intel", vendor: "intel", socket: "LGA1700", cores: 24, threads: 32, boostGHz: 6.0, power: 253, integratedGraphics: true, includesCooler: false, price: 3499 },
  { id: "u5-225f", name: "Core Ultra 5 225F", brand: "Intel", vendor: "intel", socket: "LGA1851", cores: 10, threads: 10, boostGHz: 4.9, power: 121, integratedGraphics: false, includesCooler: true, price: 1299 },
  { id: "u9-285k", name: "Core Ultra 9 285K", brand: "Intel", vendor: "intel", socket: "LGA1851", cores: 24, threads: 24, boostGHz: 5.7, power: 250, integratedGraphics: true, includesCooler: false, price: 3999, highlight: "24 núcleos para render e IA" },
];

export const MOTHERBOARDS: Motherboard[] = [
  { id: "asus-tuf-b550m-plus-wifi2", name: "ASUS TUF Gaming B550M-Plus WiFi II", brand: "ASUS", socket: "AM4", chipset: "B550", memoryType: "DDR4", formFactor: "mATX", wifi: true, price: 999 },
  { id: "asus-prime-a620m-e", name: "ASUS Prime A620M-E", brand: "ASUS", socket: "AM5", chipset: "A620", memoryType: "DDR5", formFactor: "mATX", wifi: false, price: 699, highlight: "Entrada mais barata no AM5" },
  { id: "gb-b650m-aorus-elite-ax", name: "Gigabyte B650M Aorus Elite AX", brand: "Gigabyte", socket: "AM5", chipset: "B650", memoryType: "DDR5", formFactor: "mATX", wifi: true, price: 1299 },
  { id: "msi-b850-tomahawk-max", name: "MSI MAG B850 Tomahawk Max WiFi", brand: "MSI", socket: "AM5", chipset: "B850", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 1899, highlight: "VRM parrudo para Ryzen 9" },
  { id: "asus-rog-strix-b650-a", name: "ASUS ROG Strix B650-A Gaming WiFi", brand: "ASUS", socket: "AM5", chipset: "B650", memoryType: "DDR5", formFactor: "ATX", wifi: true, color: "white", price: 1999, highlight: "Visual branco para builds clean" },
  { id: "asus-rog-strix-x870-a", name: "ASUS ROG Strix X870-A Gaming WiFi", brand: "ASUS", socket: "AM5", chipset: "X870", memoryType: "DDR5", formFactor: "ATX", wifi: true, color: "white", price: 3199 },
  { id: "asus-tuf-b760m-plus-wifi-d4", name: "ASUS TUF Gaming B760M-Plus WiFi D4", brand: "ASUS", socket: "LGA1700", chipset: "B760", memoryType: "DDR4", formFactor: "mATX", wifi: true, price: 1099 },
  { id: "msi-b760-tomahawk-wifi", name: "MSI MAG B760 Tomahawk WiFi", brand: "MSI", socket: "LGA1700", chipset: "B760", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 1599 },
  { id: "gb-b860m-aorus-elite-wifi", name: "Gigabyte B860M Aorus Elite WiFi6E", brand: "Gigabyte", socket: "LGA1851", chipset: "B860", memoryType: "DDR5", formFactor: "mATX", wifi: true, price: 1499 },
  { id: "msi-z890-tomahawk-wifi", name: "MSI MAG Z890 Tomahawk WiFi", brand: "MSI", socket: "LGA1851", chipset: "Z890", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 2599 },
  { id: "asrock-a520m-hdv", name: "ASRock A520M-HDV", brand: "ASRock", socket: "AM4", chipset: "A520", memoryType: "DDR4", formFactor: "mATX", wifi: false, price: 449 },
  { id: "gb-b550m-aorus-elite", name: "Gigabyte B550M Aorus Elite", brand: "Gigabyte", socket: "AM4", chipset: "B550", memoryType: "DDR4", formFactor: "mATX", wifi: false, price: 849, highlight: "PCIe 4.0 e VRM robusto" },
  { id: "msi-b550-tomahawk", name: "MSI MAG B550 Tomahawk", brand: "MSI", socket: "AM4", chipset: "B550", memoryType: "DDR4", formFactor: "ATX", wifi: false, price: 1099 },
  { id: "asrock-b650m-hdv", name: "ASRock B650M-HDV/M.2", brand: "ASRock", socket: "AM5", chipset: "B650", memoryType: "DDR5", formFactor: "mATX", wifi: false, price: 899, highlight: "Melhor custo no AM5" },
  { id: "gb-b650-aorus-elite-ax", name: "Gigabyte B650 Aorus Elite AX", brand: "Gigabyte", socket: "AM5", chipset: "B650", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 1599 },
  { id: "asus-tuf-x870-plus", name: "ASUS TUF Gaming X870-Plus WiFi", brand: "ASUS", socket: "AM5", chipset: "X870", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 2299, highlight: "USB4, Wi-Fi 7 e PCIe 5.0" },
  { id: "asus-h610m-e-d4", name: "ASUS Prime H610M-E D4", brand: "ASUS", socket: "LGA1700", chipset: "H610", memoryType: "DDR4", formFactor: "mATX", wifi: false, price: 549 },
  { id: "msi-b760m-p-ddr4", name: "MSI PRO B760M-P DDR4", brand: "MSI", socket: "LGA1700", chipset: "B760", memoryType: "DDR4", formFactor: "mATX", wifi: false, price: 799, highlight: "Ótima parceira para i5 da série F" },
  { id: "gb-b760-aorus-elite-ax", name: "Gigabyte B760 Aorus Elite AX DDR5", brand: "Gigabyte", socket: "LGA1700", chipset: "B760", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 1399 },
  { id: "asus-tuf-z790-plus", name: "ASUS TUF Gaming Z790-Plus WiFi", brand: "ASUS", socket: "LGA1700", chipset: "Z790", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 2199, highlight: "Overclock para processadores K" },
  { id: "msi-b860m-a-wifi", name: "MSI PRO B860M-A WiFi", brand: "MSI", socket: "LGA1851", chipset: "B860", memoryType: "DDR5", formFactor: "mATX", wifi: true, price: 1299 },
  { id: "asus-tuf-z890-plus", name: "ASUS TUF Gaming Z890-Plus WiFi", brand: "ASUS", socket: "LGA1851", chipset: "Z890", memoryType: "DDR5", formFactor: "ATX", wifi: true, price: 2699 },
];

export const RAMS: Ram[] = [
  { id: "ddr5-32-5600", name: "Kingston Fury Beast 32GB (2x16) 5600MHz", brand: "Kingston", memoryType: "DDR5", capacityGB: 32, modules: 2, speedMHz: 5600, rgb: false, price: 799 },
  { id: "ddr5-32-6000-white", name: "Corsair Vengeance RGB 32GB (2x16) 6000MHz Branca", brand: "Corsair", memoryType: "DDR5", capacityGB: 32, modules: 2, speedMHz: 6000, rgb: true, color: "white", price: 1049 },
  { id: "ddr5-32-6400-rgb", name: "G.Skill Trident Z5 RGB 32GB (2x16) 6400MHz", brand: "G.Skill", memoryType: "DDR5", capacityGB: 32, modules: 2, speedMHz: 6400, rgb: true, price: 1199 },
  { id: "ddr5-48-6000", name: "Corsair Vengeance 48GB (2x24) 6000MHz", brand: "Corsair", memoryType: "DDR5", capacityGB: 48, modules: 2, speedMHz: 6000, rgb: false, price: 1299 },
  { id: "ddr5-96-6000", name: "Kingston Fury Beast 96GB (2x48) 6000MHz", brand: "Kingston", memoryType: "DDR5", capacityGB: 96, modules: 2, speedMHz: 6000, rgb: false, price: 2699, highlight: "Para VMs, modelos de IA e edição 8K" },
  { id: "ddr4-16-3200", name: "Kingston Fury Beast 16GB (2x8) 3200MHz", brand: "Kingston", memoryType: "DDR4", capacityGB: 16, modules: 2, speedMHz: 3200, rgb: false, price: 349 },
  { id: "ddr4-16-3600-rgb", name: "XPG Spectrix D35G 16GB (2x8) 3600MHz RGB", brand: "XPG", memoryType: "DDR4", capacityGB: 16, modules: 2, speedMHz: 3600, rgb: true, price: 429 },
  { id: "ddr4-32-3200", name: "Kingston Fury Beast 32GB (2x16) 3200MHz", brand: "Kingston", memoryType: "DDR4", capacityGB: 32, modules: 2, speedMHz: 3200, rgb: false, price: 649, highlight: "Folga para jogos + Discord + navegador" },
  { id: "ddr4-32-3600-rgb", name: "Corsair Vengeance RGB Pro 32GB (2x16) 3600MHz", brand: "Corsair", memoryType: "DDR4", capacityGB: 32, modules: 2, speedMHz: 3600, rgb: true, price: 799 },
  { id: "ddr5-16-5600", name: "Kingston Fury Beast 16GB (2x8) 5600MHz", brand: "Kingston", memoryType: "DDR5", capacityGB: 16, modules: 2, speedMHz: 5600, rgb: false, price: 499 },
  { id: "ddr5-32-6000", name: "Kingston Fury Beast 32GB (2x16) 6000MHz CL30", brand: "Kingston", memoryType: "DDR5", capacityGB: 32, modules: 2, speedMHz: 6000, rgb: false, price: 899, highlight: "Ponto ideal para Ryzen AM5" },
  { id: "ddr5-32-6000-rgb", name: "Corsair Vengeance RGB 32GB (2x16) 6000MHz", brand: "Corsair", memoryType: "DDR5", capacityGB: 32, modules: 2, speedMHz: 6000, rgb: true, price: 999 },
  { id: "ddr5-64-6000", name: "G.Skill Trident Z5 RGB 64GB (2x32) 6000MHz", brand: "G.Skill", memoryType: "DDR5", capacityGB: 64, modules: 2, speedMHz: 6000, rgb: true, price: 1799, highlight: "Para edição 4K, VMs e IA local" },
];

export const GPUS: Gpu[] = [
  { id: "rtx-3050-6", name: "GeForce RTX 3050 6GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 6, power: 70, lengthMM: 200, tier: "entry", recommendedPsu: 300, price: 1199 },
  { id: "rtx-4060-8", name: "GeForce RTX 4060 8GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 8, power: 115, lengthMM: 250, tier: "entry", recommendedPsu: 550, price: 1899, highlight: "DLSS 3 com consumo baixíssimo" },
  { id: "rtx-5060-8", name: "GeForce RTX 5060 8GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 8, power: 145, lengthMM: 250, tier: "mid", recommendedPsu: 550, price: 2199 },
  { id: "rtx-5060ti-16", name: "GeForce RTX 5060 Ti 16GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 16, power: 180, lengthMM: 270, tier: "mid", recommendedPsu: 600, price: 3199, highlight: "16GB de VRAM: fôlego para anos" },
  { id: "rtx-5070-12", name: "GeForce RTX 5070 12GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 12, power: 250, lengthMM: 300, tier: "high", recommendedPsu: 650, price: 3999, highlight: "1440p no ultra com DLSS 4" },
  { id: "rtx-5070ti-16", name: "GeForce RTX 5070 Ti 16GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 16, power: 300, lengthMM: 320, tier: "high", recommendedPsu: 750, price: 5799 },
  { id: "rtx-5080-16", name: "GeForce RTX 5080 16GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 16, power: 360, lengthMM: 330, tier: "ultra", recommendedPsu: 850, price: 8499, highlight: "4K de alto nível" },
  { id: "rtx-5090-32", name: "GeForce RTX 5090 32GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 32, power: 575, lengthMM: 350, tier: "ultra", recommendedPsu: 1000, price: 17999, highlight: "Topo absoluto para 4K e IA" },
  { id: "rx-6600-8", name: "Radeon RX 6600 8GB", brand: "AMD", vendor: "amd", vramGB: 8, power: 132, lengthMM: 240, tier: "entry", recommendedPsu: 450, price: 1399, highlight: "Melhor custo para 1080p" },
  { id: "rx-7600-8", name: "Radeon RX 7600 8GB", brand: "AMD", vendor: "amd", vramGB: 8, power: 165, lengthMM: 250, tier: "entry", recommendedPsu: 550, price: 1699 },
  { id: "rx-9060xt-16", name: "Radeon RX 9060 XT 16GB", brand: "AMD", vendor: "amd", vramGB: 16, power: 160, lengthMM: 280, tier: "mid", recommendedPsu: 550, price: 2699, highlight: "16GB e FSR 4 com preço justo" },
  { id: "rx-9070-16", name: "Radeon RX 9070 16GB", brand: "AMD", vendor: "amd", vramGB: 16, power: 220, lengthMM: 300, tier: "high", recommendedPsu: 650, price: 4199 },
  { id: "rx-9070xt-16", name: "Radeon RX 9070 XT 16GB", brand: "AMD", vendor: "amd", vramGB: 16, power: 304, lengthMM: 320, tier: "high", recommendedPsu: 750, price: 4799, highlight: "Rival direta da RTX 5070 Ti" },
  { id: "rtx-5050-8", name: "GeForce RTX 5050 8GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 8, power: 130, lengthMM: 210, tier: "entry", recommendedPsu: 550, price: 1599, highlight: "DLSS 4 no orçamento mais enxuto" },
  { id: "rtx-5060ti-8", name: "GeForce RTX 5060 Ti 8GB", brand: "NVIDIA", vendor: "nvidia", vramGB: 8, power: 180, lengthMM: 250, tier: "mid", recommendedPsu: 600, price: 2699 },
  { id: "rtx-5070-12-white", name: "GeForce RTX 5070 12GB Branca", brand: "NVIDIA", vendor: "nvidia", vramGB: 12, power: 250, lengthMM: 305, tier: "high", recommendedPsu: 650, color: "white", price: 4199 },
  { id: "rtx-5070ti-16-white", name: "GeForce RTX 5070 Ti 16GB Branca", brand: "NVIDIA", vendor: "nvidia", vramGB: 16, power: 300, lengthMM: 325, tier: "high", recommendedPsu: 750, color: "white", price: 5999 },
  { id: "rtx-5080-16-white", name: "GeForce RTX 5080 16GB Branca", brand: "NVIDIA", vendor: "nvidia", vramGB: 16, power: 360, lengthMM: 335, tier: "ultra", recommendedPsu: 850, color: "white", price: 8899 },
  { id: "rx-7600xt-16", name: "Radeon RX 7600 XT 16GB", brand: "AMD", vendor: "amd", vramGB: 16, power: 190, lengthMM: 270, tier: "mid", recommendedPsu: 600, price: 2299 },
  { id: "rx-9060xt-8", name: "Radeon RX 9060 XT 8GB", brand: "AMD", vendor: "amd", vramGB: 8, power: 150, lengthMM: 250, tier: "mid", recommendedPsu: 500, price: 2199 },
  { id: "rx-7800xt-16", name: "Radeon RX 7800 XT 16GB", brand: "AMD", vendor: "amd", vramGB: 16, power: 263, lengthMM: 285, tier: "high", recommendedPsu: 700, price: 3499, highlight: "1440p com folga e 16GB" },
  { id: "arc-b580-12", name: "Intel Arc B580 12GB", brand: "Intel", vendor: "intel", vramGB: 12, power: 190, lengthMM: 272, tier: "mid", recommendedPsu: 600, price: 1999, highlight: "12GB de VRAM pelo preço de uma 8GB" },
];

export const STORAGES: Storage[] = [
  { id: "p3plus-1tb", name: "Crucial P3 Plus 1TB NVMe", brand: "Crucial", type: "nvme", capacityGB: 1000, readMBs: 5000, price: 429 },
  { id: "990evoplus-1tb", name: "Samsung 990 EVO Plus 1TB NVMe", brand: "Samsung", type: "nvme", capacityGB: 1000, readMBs: 7150, price: 599 },
  { id: "990evoplus-2tb", name: "Samsung 990 EVO Plus 2TB NVMe", brand: "Samsung", type: "nvme", capacityGB: 2000, readMBs: 7250, price: 1049, highlight: "2TB rápidos pelo melhor preço" },
  { id: "kc3000-2tb", name: "Kingston KC3000 2TB NVMe", brand: "Kingston", type: "nvme", capacityGB: 2000, readMBs: 7000, price: 1199 },
  { id: "sn850x-2tb", name: "WD Black SN850X 2TB NVMe", brand: "WD", type: "nvme", capacityGB: 2000, readMBs: 7300, price: 1349 },
  { id: "t705-2tb", name: "Crucial T705 2TB NVMe PCIe 5.0", brand: "Crucial", type: "nvme", capacityGB: 2000, readMBs: 14500, price: 2199, highlight: "PCIe 5.0: o dobro da velocidade" },
  { id: "870evo-1tb", name: "Samsung 870 EVO 1TB SATA", brand: "Samsung", type: "sata", capacityGB: 1000, readMBs: 560, price: 529 },
  { id: "barracuda-4tb", name: "Seagate Barracuda 4TB HDD", brand: "Seagate", type: "hdd", capacityGB: 4000, readMBs: 190, price: 799 },
  { id: "nv3-500", name: "Kingston NV3 500GB NVMe", brand: "Kingston", type: "nvme", capacityGB: 500, readMBs: 5000, price: 279 },
  { id: "nv3-1tb", name: "Kingston NV3 1TB NVMe", brand: "Kingston", type: "nvme", capacityGB: 1000, readMBs: 6000, price: 449, highlight: "O mínimo recomendado para jogos atuais" },
  { id: "nv3-2tb", name: "Kingston NV3 2TB NVMe", brand: "Kingston", type: "nvme", capacityGB: 2000, readMBs: 6000, price: 849 },
  { id: "sn850x-1tb", name: "WD Black SN850X 1TB NVMe", brand: "WD", type: "nvme", capacityGB: 1000, readMBs: 7300, price: 749, highlight: "Topo de linha PCIe 4.0" },
  { id: "990pro-2tb", name: "Samsung 990 Pro 2TB NVMe", brand: "Samsung", type: "nvme", capacityGB: 2000, readMBs: 7450, price: 1499 },
  { id: "a400-480", name: "Kingston A400 480GB SATA", brand: "Kingston", type: "sata", capacityGB: 480, readMBs: 500, price: 229 },
  { id: "mx500-1tb", name: "Crucial MX500 1TB SATA", brand: "Crucial", type: "sata", capacityGB: 1000, readMBs: 560, price: 459 },
  { id: "barracuda-1tb", name: "Seagate Barracuda 1TB HDD", brand: "Seagate", type: "hdd", capacityGB: 1000, readMBs: 190, price: 349 },
  { id: "barracuda-2tb", name: "Seagate Barracuda 2TB HDD", brand: "Seagate", type: "hdd", capacityGB: 2000, readMBs: 220, price: 469, highlight: "Bom para backup e arquivos grandes" },
];

export const PSUS: Psu[] = [
  { id: "msi-a650bn", name: "MSI MAG A650BN 650W", brand: "MSI", watts: 650, efficiency: "80+ Bronze", modular: "Não modular", price: 399 },
  { id: "cm-mwe-750-v3", name: "Cooler Master MWE 750 Bronze V3", brand: "Cooler Master", watts: 750, efficiency: "80+ Bronze", modular: "Não modular", price: 549 },
  { id: "corsair-rm750e", name: "Corsair RM750e 750W ATX 3.1", brand: "Corsair", watts: 750, efficiency: "80+ Gold", modular: "Full modular", price: 749 },
  { id: "bequiet-pp12m-850", name: "be quiet! Pure Power 12 M 850W", brand: "be quiet!", watts: 850, efficiency: "80+ Gold", modular: "Full modular", price: 949, highlight: "Silenciosa, com cabo 12V-2x6 nativo" },
  { id: "msi-a850g", name: "MSI MPG A850G PCIe 5", brand: "MSI", watts: 850, efficiency: "80+ Gold", modular: "Full modular", price: 999 },
  { id: "corsair-rm1000e", name: "Corsair RM1000e 1000W ATX 3.1", brand: "Corsair", watts: 1000, efficiency: "80+ Gold", modular: "Full modular", price: 1199 },
  { id: "msi-a550bn", name: "MSI MAG A550BN 550W", brand: "MSI", watts: 550, efficiency: "80+ Bronze", modular: "Não modular", price: 349 },
  { id: "corsair-cx650", name: "Corsair CX650 650W", brand: "Corsair", watts: 650, efficiency: "80+ Bronze", modular: "Não modular", price: 449 },
  { id: "xpg-core-reactor-750", name: "XPG Core Reactor II 750W", brand: "XPG", watts: 750, efficiency: "80+ Gold", modular: "Full modular", price: 649, highlight: "Gold + modular: cable management limpo" },
  { id: "corsair-rm850e", name: "Corsair RM850e 850W ATX 3.1", brand: "Corsair", watts: 850, efficiency: "80+ Gold", modular: "Full modular", price: 899 },
  { id: "msi-a1000g", name: "MSI MPG A1000G 1000W PCIe 5", brand: "MSI", watts: 1000, efficiency: "80+ Gold", modular: "Full modular", price: 1299 },
  { id: "corsair-hx1200i", name: "Corsair HX1200i 1200W", brand: "Corsair", watts: 1200, efficiency: "80+ Platinum", modular: "Full modular", price: 2199, highlight: "Para RTX 5090 com folga" },
];

export const CASES: PcCase[] = [
  { id: "cm-q300l", name: "Cooler Master Q300L", brand: "Cooler Master", formFactor: "mATX", color: "black", maxGpuMM: 360, maxCoolerMM: 159, maxRadiatorMM: 240, includedFans: 1, price: 299 },
  { id: "montech-xr-black", name: "Montech XR Preto (3 fans ARGB)", brand: "Montech", formFactor: "ATX", color: "black", maxGpuMM: 400, maxCoolerMM: 167, maxRadiatorMM: 360, includedFans: 3, price: 499, highlight: "Vidro panorâmico com ótimo fluxo de ar" },
  { id: "montech-xr-white", name: "Montech XR Branco (3 fans ARGB)", brand: "Montech", formFactor: "ATX", color: "white", maxGpuMM: 400, maxCoolerMM: 167, maxRadiatorMM: 360, includedFans: 3, price: 529 },
  { id: "nzxt-h5-flow", name: "NZXT H5 Flow", brand: "NZXT", formFactor: "ATX", color: "black", maxGpuMM: 365, maxCoolerMM: 165, maxRadiatorMM: 280, includedFans: 2, price: 649 },
  { id: "lancool-216", name: "Lian Li Lancool 216 RGB", brand: "Lian Li", formFactor: "ATX", color: "black", maxGpuMM: 392, maxCoolerMM: 180, maxRadiatorMM: 360, includedFans: 3, price: 799, highlight: "Referência em temperatura" },
  { id: "o11-evo-white", name: "Lian Li O11 Dynamic EVO Branco", brand: "Lian Li", formFactor: "ATX", color: "white", maxGpuMM: 426, maxCoolerMM: 167, maxRadiatorMM: 360, includedFans: 0, price: 1199, highlight: "Aquário premium para builds de vitrine" },
  { id: "deepcool-ch560", name: "DeepCool CH560 (4 fans ARGB)", brand: "DeepCool", formFactor: "ATX", color: "black", maxGpuMM: 380, maxCoolerMM: 175, maxRadiatorMM: 360, includedFans: 4, price: 549, highlight: "Fluxo de ar excelente pelo preço" },
  { id: "lancool-207", name: "Lian Li Lancool 207 (4 fans)", brand: "Lian Li", formFactor: "ATX", color: "black", maxGpuMM: 375, maxCoolerMM: 170, maxRadiatorMM: 360, includedFans: 4, price: 699 },
  { id: "corsair-3500x", name: "Corsair 3500X ARGB", brand: "Corsair", formFactor: "ATX", color: "black", maxGpuMM: 409, maxCoolerMM: 170, maxRadiatorMM: 360, includedFans: 3, price: 699 },
  { id: "fractal-north", name: "Fractal Design North", brand: "Fractal Design", formFactor: "ATX", color: "black", maxGpuMM: 355, maxCoolerMM: 170, maxRadiatorMM: 360, includedFans: 2, price: 1099, highlight: "Frente em madeira: visual premium e discreto" },
  { id: "hyte-y60", name: "HYTE Y60 (3 fans)", brand: "HYTE", formFactor: "ATX", color: "black", maxGpuMM: 375, maxCoolerMM: 160, maxRadiatorMM: 360, includedFans: 3, price: 1199 },
  { id: "nzxt-h9-flow-white", name: "NZXT H9 Flow Branco (4 fans)", brand: "NZXT", formFactor: "ATX", color: "white", maxGpuMM: 435, maxCoolerMM: 165, maxRadiatorMM: 360, includedFans: 4, price: 1299, highlight: "Câmara dupla: cable management perfeito" },
];

export const COOLERS: Cooler[] = [
  { id: "box", name: "Cooler Box (incluso no processador)", brand: "Original", type: "box", sizeMM: 55, maxTdp: 95, rgb: false, price: 0 },
  { id: "ak400", name: "DeepCool AK400", brand: "DeepCool", type: "air", sizeMM: 155, maxTdp: 220, rgb: false, price: 199, highlight: "Silencioso e eficiente para até i5/Ryzen 7" },
  { id: "pa120-se", name: "Thermalright Peerless Assassin 120 SE", brand: "Thermalright", type: "air", sizeMM: 157, maxTdp: 245, rgb: false, dualTower: true, price: 249, highlight: "Rende como water cooler 240mm" },
  { id: "nh-d15", name: "Noctua NH-D15", brand: "Noctua", type: "air", sizeMM: 168, maxTdp: 250, rgb: false, dualTower: true, price: 899 },
  { id: "le520", name: "Water Cooler DeepCool LE520 240mm ARGB", brand: "DeepCool", type: "water", sizeMM: 240, maxTdp: 260, rgb: true, price: 399 },
  { id: "lf3-360", name: "Water Cooler Arctic Liquid Freezer III 360mm", brand: "Arctic", type: "water", sizeMM: 360, maxTdp: 320, rgb: false, price: 749, highlight: "Melhor desempenho térmico da lista" },
  { id: "galahad2-360", name: "Water Cooler Lian Li Galahad II Trinity 360mm", brand: "Lian Li", type: "water", sizeMM: 360, maxTdp: 300, rgb: true, price: 999 },
  { id: "ak400-white", name: "DeepCool AK400 WH (Branco)", brand: "DeepCool", type: "air", sizeMM: 155, maxTdp: 220, rgb: false, color: "white", price: 219 },
  { id: "phantom-spirit-120-se", name: "Thermalright Phantom Spirit 120 SE", brand: "Thermalright", type: "air", sizeMM: 154, maxTdp: 265, rgb: false, dualTower: true, price: 299, highlight: "Torre dupla: nível topo por pouco" },
  { id: "ak620", name: "DeepCool AK620", brand: "DeepCool", type: "air", sizeMM: 160, maxTdp: 260, rgb: false, dualTower: true, price: 449 },
  { id: "dark-rock-pro-5", name: "be quiet! Dark Rock Pro 5", brand: "be quiet!", type: "air", sizeMM: 168, maxTdp: 270, rgb: false, dualTower: true, price: 999 },
  { id: "lf3-240", name: "Water Cooler Arctic Liquid Freezer III 240mm", brand: "Arctic", type: "water", sizeMM: 240, maxTdp: 280, rgb: false, price: 549 },
  { id: "lt720", name: "Water Cooler DeepCool LT720 360mm ARGB", brand: "DeepCool", type: "water", sizeMM: 360, maxTdp: 300, rgb: true, price: 899 },
  { id: "kraken-360", name: "Water Cooler NZXT Kraken 360 RGB", brand: "NZXT", type: "water", sizeMM: 360, maxTdp: 300, rgb: true, price: 1399, highlight: "Tela LCD na bomba" },
  { id: "galahad2-360-white", name: "Water Cooler Lian Li Galahad II Trinity 360mm Branco", brand: "Lian Li", type: "water", sizeMM: 360, maxTdp: 300, rgb: true, color: "white", price: 1049 },
];

/** Configurações prontas para quem quer um ponto de partida. */
export const PRESET_BUILDS = [
  {
    id: "esports-1080p",
    name: "Entrada eSports",
    description: "1080p alto FPS em Valorant, CS2, LoL e Fortnite",
    selections: { cpu: "r5-5600", motherboard: "asrock-a520m-hdv", ram: "ddr4-16-3200", gpu: "rx-6600-8", storage: "nv3-1tb", psu: "msi-a550bn", case: "cm-q300l", cooler: "box" },
  },
  {
    id: "equilibrado-1440p",
    name: "Equilibrado 1440p",
    description: "Jogos AAA no ultra em 1440p e streaming",
    selections: { cpu: "r7-7800x3d", motherboard: "asrock-b650m-hdv", ram: "ddr5-32-6000", gpu: "rtx-5070-12", storage: "sn850x-1tb", psu: "xpg-core-reactor-750", case: "montech-xr-black", cooler: "pa120-se" },
  },
  {
    id: "extremo-4k",
    name: "Extremo 4K",
    description: "4K com Ray Tracing, edição pesada e IA",
    selections: { cpu: "r7-9800x3d", motherboard: "asus-rog-strix-x870-a", ram: "ddr5-32-6000-white", gpu: "rtx-5080-16-white", storage: "990pro-2tb", psu: "corsair-rm850e", case: "montech-xr-white", cooler: "galahad2-360-white" },
  },
] as const;

export type PartCategory =
  | "cpu"
  | "motherboard"
  | "ram"
  | "gpu"
  | "storage"
  | "psu"
  | "case"
  | "cooler";

export interface CatalogMap {
  cpu: Cpu;
  motherboard: Motherboard;
  ram: Ram;
  gpu: Gpu;
  storage: Storage;
  psu: Psu;
  case: PcCase;
  cooler: Cooler;
}

export type AnyPart = CatalogMap[PartCategory];

export const CATALOG: { [K in PartCategory]: CatalogMap[K][] } = {
  cpu: CPUS,
  motherboard: MOTHERBOARDS,
  ram: RAMS,
  gpu: GPUS,
  storage: STORAGES,
  psu: PSUS,
  case: CASES,
  cooler: COOLERS,
};

export const CATEGORY_LABEL: Record<PartCategory, string> = {
  cpu: "Processador",
  motherboard: "Placa-Mãe",
  ram: "Memória RAM",
  gpu: "Placa de Vídeo",
  storage: "Armazenamento",
  psu: "Fonte",
  case: "Gabinete",
  cooler: "Refrigeração",
};

/** Especificações resumidas exibidas nos cards e no resumo do WhatsApp. */
export function describePart<K extends PartCategory>(category: K, part: CatalogMap[K]): string[] {
  switch (category) {
    case "cpu": {
      const p = part as Cpu;
      return [
        p.socket,
        `${p.cores}C/${p.threads}T`,
        `até ${p.boostGHz.toFixed(1)} GHz`,
        p.integratedGraphics ? "Vídeo integrado" : "Sem vídeo integrado",
        ...(p.includesCooler ? ["Cooler incluso"] : []),
      ];
    }
    case "motherboard": {
      const p = part as Motherboard;
      return [p.socket, p.chipset, p.memoryType, p.formFactor, ...(p.wifi ? ["Wi-Fi"] : []), ...(p.color === "white" ? ["Branca"] : [])];
    }
    case "ram": {
      const p = part as Ram;
      return [p.memoryType, `${p.capacityGB}GB`, `${p.speedMHz}MHz`, ...(p.rgb ? ["RGB"] : [])];
    }
    case "gpu": {
      const p = part as Gpu;
      return [`${p.vramGB}GB VRAM`, `${p.power}W`, `${p.lengthMM}mm`, ...(p.color === "white" ? ["Branca"] : [])];
    }
    case "storage": {
      const p = part as Storage;
      const cap = p.capacityGB >= 1000 ? `${p.capacityGB / 1000}TB` : `${p.capacityGB}GB`;
      const type = p.type === "nvme" ? "NVMe M.2" : p.type === "sata" ? "SSD SATA" : "HDD";
      return [type, cap, `${p.readMBs.toLocaleString("pt-BR")} MB/s`];
    }
    case "psu": {
      const p = part as Psu;
      return [`${p.watts}W`, p.efficiency, p.modular];
    }
    case "case": {
      const p = part as PcCase;
      return [
        p.formFactor === "ATX" ? "Mid Tower ATX" : "Micro ATX",
        p.color === "white" ? "Branco" : "Preto",
        `GPU até ${p.maxGpuMM}mm`,
        p.includedFans > 0 ? `${p.includedFans} fans inclusas` : "Sem fans inclusas",
      ];
    }
    case "cooler": {
      const p = part as Cooler;
      if (p.type === "water") return ["Water Cooler", `Radiador ${p.sizeMM}mm`, `até ${p.maxTdp}W`, ...(p.rgb ? ["ARGB"] : [])];
      if (p.type === "air")
        return [p.dualTower ? "Torre dupla" : "Air Cooler", `${p.sizeMM}mm de altura`, `até ${p.maxTdp}W`, ...(p.color === "white" ? ["Branco"] : [])];
      return ["Cooler original", `até ${p.maxTdp}W`];
    }
    default:
      return [];
  }
}
