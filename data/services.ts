export type ServiceIcon = "wrench" | "cpu" | "thermometer" | "laptop" | "server" | "briefcase" | "hard-drive" | "shield";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: ServiceIcon;
  bullets: string[];
}

export const SERVICES: Service[] = [
  {
    id: "assistencia",
    title: "Assistência Técnica Especializada",
    description: "Diagnóstico preciso de desktops, notebooks e servidores. Você aprova o orçamento antes de qualquer serviço.",
    icon: "wrench",
    bullets: ["Diagnóstico detalhado", "Reparo de placa e fonte", "Troca de telas e teclados"],
  },
  {
    id: "montagem",
    title: "Montagem de PC Gamer e Workstation",
    description: "Configuração sob medida, cable management impecável e teste de estresse em todos os componentes.",
    icon: "cpu",
    bullets: ["Teste de estresse documentado", "BIOS e drivers configurados", "Envio para todo o Brasil"],
  },
  {
    id: "manutencao",
    title: "Manutenção Preventiva e Preditiva",
    description: "Limpeza pesada, troca de pasta térmica e monitoramento de temperaturas para evitar problemas antes que aconteçam.",
    icon: "thermometer",
    bullets: ["Limpeza completa", "Pasta térmica de alto desempenho", "Relatório de saúde do SSD/HD"],
  },
  {
    id: "seminovos",
    title: "Equipamentos e Seminovos com Garantia",
    description: "Computadores, notebooks e peças revisados, limpos e testados — com procedência e garantia.",
    icon: "laptop",
    bullets: ["Revisados e testados", "Procedência garantida", "Garantia LND"],
  },
  {
    id: "consultoria",
    title: "Consultoria em TI para Empresas",
    description: "Servidores, redes, backup e suporte recorrente para empresas da Grande Florianópolis e de todo o Brasil.",
    icon: "briefcase",
    bullets: ["Servidores e redes", "Rotinas de backup", "Suporte via WhatsApp"],
  },
];

export const QUICK_SERVICES = [
  { title: "Limpeza pesada + troca de pasta térmica", description: "O notebook ou PC voltou a esquentar e fazer barulho? Desmontamos, limpamos e aplicamos pasta térmica de qualidade.", icon: "thermometer" as ServiceIcon },
  { title: "Formatação com backup", description: "Sistema lento ou com vírus? Salvamos seus arquivos, reinstalamos o Windows e deixamos drivers e programas prontos.", icon: "hard-drive" as ServiceIcon },
  { title: "Upgrade de SSD e memória", description: "O jeito mais barato de dar vida nova ao computador. Indicamos só o que realmente faz diferença.", icon: "cpu" as ServiceIcon },
  { title: "Reparo de notebooks", description: "Tela, teclado, dobradiça, conector de carga e placa-mãe. Diagnóstico antes de qualquer custo.", icon: "laptop" as ServiceIcon },
  { title: "Manutenção de servidores", description: "Monitoramento, troca de discos, RAID e rotinas de backup para a sua empresa não parar.", icon: "server" as ServiceIcon },
  { title: "Remoção de vírus e segurança", description: "Limpeza de malwares, configuração de antivírus e boas práticas para proteger seus dados.", icon: "shield" as ServiceIcon },
];

export const SERVICE_AREAS = [
  "Palhoça",
  "São José",
  "Florianópolis",
  "Biguaçu",
  "Santo Amaro da Imperatriz",
  "Governador Celso Ramos",
  "Paulo Lopes",
  "Todo o Brasil (consultoria e envio)",
];
