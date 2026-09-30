// Conteúdo das áreas corporativas (Para Empresas e Servidores & Redes).
// Base: serviços publicados em lndinformatica.com.br (Infraestrutura, Manutenção, Cloud) — reorganizados e ampliados.
// TODO(LND): confirmar o escopo de cada plano e os tempos de resposta antes de publicar.

export type B2BIcon =
  | "headset"
  | "server"
  | "shield"
  | "network"
  | "cloud"
  | "database"
  | "monitor"
  | "printer"
  | "wrench"
  | "activity"
  | "lock"
  | "users";

export interface Feature {
  icon: B2BIcon;
  title: string;
  text: string;
}

/** Serviços para empresas (cards da página /empresas e da home). */
export const B2B_SERVICES: Feature[] = [
  { icon: "headset", title: "Help desk remoto e presencial", text: "Chamados por WhatsApp, telefone ou e-mail. Resolvemos remotamente e, quando precisa, vamos até a sua empresa." },
  { icon: "wrench", title: "Contrato de manutenção", text: "Manutenção preventiva programada de computadores, notebooks, impressoras e nobreaks, com relatório de cada visita." },
  { icon: "server", title: "Gestão de servidores", text: "Windows Server e Linux administrados, atualizados e monitorados — com a documentação do seu ambiente em dia." },
  { icon: "shield", title: "Firewall e segurança", text: "pfSense com bloqueio de sites, VPN, relatórios de acesso por usuário e proteção contra ataques e invasões." },
  { icon: "database", title: "Backup e recuperação", text: "Rotinas automáticas locais e em nuvem, com testes de restauração. Seu dado protegido contra falhas e ransomware." },
  { icon: "cloud", title: "Cloud e Google Workspace", text: "Implantação e migração para Google Workspace, e-mail corporativo, Drive compartilhado e soluções em nuvem." },
  { icon: "network", title: "Redes e Wi-Fi corporativo", text: "Projeto, cabeamento estruturado, switches e Wi-Fi com cobertura real — rede estável para a equipe trabalhar." },
  { icon: "monitor", title: "Equipamentos corporativos", text: "Especificação e fornecimento de desktops, notebooks, workstations, servidores e nobreaks para o seu negócio." },
];

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  forWho: string;
  highlight?: boolean;
  features: string[];
  response: string;
}

/** Planos de suporte recorrente (valores sob consulta, conforme o parque de máquinas). */
export const PLANS: Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    tagline: "Suporte sob demanda com prioridade",
    forWho: "Escritórios e pequenos comércios, até ~10 computadores",
    features: [
      "Help desk remoto em horário comercial",
      "Banco de horas para atendimento presencial",
      "Manutenção preventiva semestral",
      "Inventário de equipamentos e licenças",
    ],
    response: "Atendimento prioritário no mesmo dia útil",
  },
  {
    id: "profissional",
    name: "Profissional",
    tagline: "TI gerenciada para a empresa não parar",
    forWho: "Empresas com servidor e equipe de 10 a 50 pessoas",
    highlight: true,
    features: [
      "Tudo do Essencial",
      "Gestão e monitoramento do servidor",
      "Backup gerenciado com teste de restauração",
      "Firewall pfSense administrado",
      "Visitas preventivas mensais",
      "Relatório mensal de chamados e saúde do ambiente",
    ],
    response: "Resposta em até 4 horas úteis",
  },
  {
    id: "completo",
    name: "Gestão Completa",
    tagline: "Seu departamento de TI terceirizado",
    forWho: "Operações críticas, filiais e ambientes com vários servidores",
    features: [
      "Tudo do Profissional",
      "Atendimento presencial ilimitado na Grande Florianópolis",
      "Consultoria e planejamento de TI (roadmap anual)",
      "Gestão de fornecedores, links e licenças",
      "Plano de contingência e recuperação de desastres",
    ],
    response: "Resposta em até 2 horas úteis",
  },
];

/** Tecnologias de servidor (lista do site atual da LND). */
export const SERVER_STACK = [
  "Windows Server",
  "Linux",
  "Active Directory (AD)",
  "Servidor de Arquivos",
  "DHCP e DNS",
  "Área de Trabalho Remota (RDS)",
  "Servidor de Aplicativos",
  "Clustering de Failover",
  "Virtualização de servidores",
  "Acesso e Política de Rede",
  "Serviços de Impressão",
  "Backup",
];

export const SERVER_SERVICES: Feature[] = [
  { icon: "server", title: "Implantação de servidores", text: "Dimensionamos o hardware certo, instalamos e configuramos Windows Server ou Linux do zero, com documentação entregue." },
  { icon: "users", title: "Active Directory e permissões", text: "Usuários, grupos, políticas (GPO) e pastas compartilhadas com o acesso certo para cada pessoa." },
  { icon: "activity", title: "Virtualização e alta disponibilidade", text: "Consolide serviços em máquinas virtuais e use clustering de failover para o sistema continuar no ar se algo falhar." },
  { icon: "wrench", title: "Manutenção de servidores", text: "Troca de discos, RAID, fontes redundantes, atualizações e monitoramento para evitar parada inesperada." },
  { icon: "monitor", title: "Acesso remoto seguro", text: "Área de Trabalho Remota e VPN para a equipe trabalhar de qualquer lugar sem expor a rede." },
  { icon: "printer", title: "Impressão e documentos", text: "Servidor de impressão centralizado, cotas e digitalização integrada às pastas da empresa." },
];

/** Recursos do firewall pfSense (lista do site atual da LND). */
export const FIREWALL_FEATURES = [
  "Bloqueio de sites e categorias",
  "Relatório de acesso à rede por usuário",
  "Proteção contra ataques e invasões",
  "VPN para acesso remoto e entre filiais",
  "Balanceamento de links de internet",
  "Priorização de tráfego (QoS)",
  "Estabilidade e segmentação da rede",
];

export const NETWORK_STEPS = [
  { title: "Projeto", text: "Levantamento do ambiente e desenho da rede ideal para o seu espaço e a sua equipe." },
  { title: "Implantação", text: "Cabeamento estruturado, racks, switches, Wi-Fi e firewall instalados e identificados." },
  { title: "Administração", text: "Monitoramento, expansões, novos sistemas, rotinas de backup e ajustes de performance." },
];

export const CLOUD_SERVICES: Feature[] = [
  { icon: "cloud", title: "Google Workspace", text: "Implantação, migração de e-mails e arquivos, domínio próprio e treinamento da equipe." },
  { icon: "database", title: "Backup em nuvem", text: "Cópia automática e criptografada fora da empresa — a proteção que falta contra ransomware e incêndio." },
  { icon: "lock", title: "Segurança da informação", text: "Antivírus gerenciado, atualizações, senhas e boas práticas alinhadas à LGPD." },
];

export const SEGMENTS = [
  "Escritórios de contabilidade",
  "Clínicas e consultórios",
  "Advocacia",
  "Comércio e varejo",
  "Indústria",
  "Escolas",
  "Construtoras e imobiliárias",
  "Transportadoras",
];

export const ONBOARDING = [
  { title: "Diagnóstico", text: "Visitamos a empresa, mapeamos equipamentos, servidores, rede, backups e os pontos de risco." },
  { title: "Proposta sob medida", text: "Plano de ação e contrato com escopo claro — você sabe exatamente o que está contratando." },
  { title: "Implantação", text: "Corrigimos o que é urgente, organizamos o ambiente e documentamos tudo." },
  { title: "Suporte contínuo", text: "Chamados atendidos, preventivas programadas e relatório mensal da saúde da sua TI." },
];

export const B2B_FAQ = [
  {
    q: "Vocês atendem empresas fora da Grande Florianópolis?",
    a: "Sim. O suporte remoto, a gestão de servidores, firewall e nuvem funcionam para todo o Brasil. O atendimento presencial cobre Palhoça, São José, Florianópolis, Biguaçu e região.",
  },
  {
    q: "Preciso de contrato para ser atendido?",
    a: "Não. Atendemos chamados avulsos, mas empresas com contrato têm prioridade, preventivas programadas e custo previsível todo mês.",
  },
  {
    q: "Como é calculado o valor do plano?",
    a: "Pelo número de computadores, servidores e filiais, e pelo nível de atendimento desejado. Após o diagnóstico enviamos uma proposta fechada, sem surpresas.",
  },
  {
    q: "Vocês fornecem os equipamentos e servidores?",
    a: "Sim. Especificamos e fornecemos desktops, notebooks, servidores, nobreaks e equipamentos de rede com nota fiscal e garantia — e cuidamos da instalação.",
  },
  {
    q: "Meu servidor parou. Vocês atendem emergências?",
    a: "Sim. Chame no WhatsApp: clientes com contrato têm prioridade, e fazemos o possível para atender emergências de qualquer empresa.",
  },
];
