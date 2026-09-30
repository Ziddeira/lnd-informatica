export type ServiceIcon =
  | "wrench"
  | "cpu"
  | "thermometer"
  | "laptop"
  | "server"
  | "briefcase"
  | "hard-drive"
  | "shield"
  | "printer"
  | "battery";

export const QUICK_SERVICES = [
  { title: "Limpeza pesada + troca de pasta térmica", description: "O notebook ou PC voltou a esquentar e fazer barulho? Desmontamos, limpamos e aplicamos pasta térmica de qualidade.", icon: "thermometer" as ServiceIcon },
  { title: "Formatação com backup", description: "Sistema lento ou com vírus? Salvamos seus arquivos, reinstalamos o Windows e deixamos drivers e programas prontos.", icon: "hard-drive" as ServiceIcon },
  { title: "Upgrade de SSD e memória", description: "O jeito mais barato de dar vida nova ao computador. Indicamos só o que realmente faz diferença.", icon: "cpu" as ServiceIcon },
  { title: "Reparo de notebooks", description: "Tela, teclado, dobradiça, conector de carga e placa-mãe. Diagnóstico antes de qualquer custo.", icon: "laptop" as ServiceIcon },
  { title: "Manutenção de servidores", description: "Monitoramento, troca de discos, RAID e rotinas de backup para a sua empresa não parar.", icon: "server" as ServiceIcon },
  { title: "Remoção de vírus e segurança", description: "Limpeza de malwares, configuração de antivírus e boas práticas para proteger seus dados.", icon: "shield" as ServiceIcon },
  { title: "Impressoras e suprimentos", description: "Manutenção, configuração em rede e suprimentos para impressoras de escritório e multifuncionais.", icon: "printer" as ServiceIcon },
  { title: "Nobreaks", description: "Troca de baterias, testes de autonomia e dimensionamento para proteger computadores e servidores.", icon: "battery" as ServiceIcon },
  { title: "Monitores e periféricos", description: "Diagnóstico e reparo de monitores, fontes e periféricos, com orçamento antes de qualquer custo.", icon: "wrench" as ServiceIcon },
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
