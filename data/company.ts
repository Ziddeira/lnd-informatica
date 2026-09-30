// Dados institucionais centralizados — altere aqui e o site inteiro é atualizado.

export const COMPANY = {
  name: "LND - Informática",
  shortName: "LND",
  legalName: "LND Soluções",
  cnpj: "24.632.577/0001-84",
  founder: "Leonardo",
  foundedYear: 2016,
  yearsOfExperience: 20,
  email: "leonardo@lnd.inf.br",
  siteUrl: "https://lndinformatica.com.br",
  social: {
    facebook: "https://www.facebook.com/LND.informatica/",
    linkedin: "https://www.linkedin.com/in/leonardo-alves-de-medeiros-a9024322/",
  },
  phoneDisplay: "(48) 3093-2003",
  phoneE164: "+554830932003",
  whatsappNumber: "554830932003",
  rating: 4.9,
  reviewCount: 4900,
  reviewCountLabel: "quase 5.000",
  address: {
    street: "R. Ver. Osvaldo de Oliveira, 3723 - Sala 2",
    district: "Centro",
    city: "Palhoça",
    state: "SC",
    zip: "88131-200",
    full: "R. Ver. Osvaldo de Oliveira, 3723 - Sala 2 - Centro, Palhoça - SC, 88131-200",
  },
  // TODO(LND): confirmar os horários reais de funcionamento antes de publicar.
  hours: [
    { days: "Segunda a Sexta", time: "08h30 às 18h00" },
    { days: "Sábado", time: "09h00 às 12h00" },
    { days: "Domingo e feriados", time: "Fechado" },
  ],
  serviceArea:
    "Grande Florianópolis (presencial) e todo o Brasil (consultoria e envio de PCs montados)",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=R.+Ver.+Osvaldo+de+Oliveira,+3723+-+Centro,+Palho%C3%A7a+-+SC,+88131-200&output=embed",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=LND+Inform%C3%A1tica+R.+Ver.+Osvaldo+de+Oliveira+3723+Palho%C3%A7a+SC",
} as const;

/** Menu principal: organizado por público (empresas → gamer → assistência). */
export const NAV_LINKS = [
  { href: "/empresas", label: "Para Empresas" },
  { href: "/servidores", label: "Servidores & Redes" },
  { href: "/monte-seu-pc", label: "PC Gamer" },
  { href: "/assistencia", label: "Assistência" },
  { href: "/contato", label: "Contato" },
] as const;

/** Links do rodapé agrupados. */
export const FOOTER_GROUPS = [
  {
    title: "Empresas",
    links: [
      { href: "/empresas", label: "Suporte de TI B2B" },
      { href: "/empresas#planos", label: "Planos de suporte" },
      { href: "/servidores", label: "Servidores" },
      { href: "/servidores#firewall", label: "Firewall e segurança" },
      { href: "/servidores#cloud", label: "Cloud e Google Workspace" },
    ],
  },
  {
    title: "Pessoas",
    links: [
      { href: "/monte-seu-pc", label: "Monte seu PC Gamer" },
      { href: "/assistencia", label: "Assistência técnica" },
      { href: "/#sobre", label: "Sobre a LND" },
      { href: "/contato", label: "Contato e orçamento" },
    ],
  },
] as const;
