// TODO(LND): substituir por depoimentos REAIS do Google Maps (copiados com autorização
// ou via Google Places API) antes de publicar. Os textos abaixo são apenas exemplos de layout.

export interface Review {
  author: string;
  initials: string;
  rating: number;
  when: string;
  service: string;
  text: string;
}

export const REVIEWS: Review[] = [
  { author: "Cliente Google", initials: "RM", rating: 5, when: "há 2 semanas", service: "PC Gamer", text: "Montaram meu PC gamer com um cable management impecável. O Leonardo explicou cada peça e ainda mandou o vídeo do teste de estresse antes da entrega." },
  { author: "Cliente Google", initials: "JS", rating: 5, when: "há 1 mês", service: "Notebook", text: "Notebook esquentando e desligando sozinho. Fizeram limpeza completa e troca de pasta térmica no mesmo dia. Voltou a funcionar silencioso." },
  { author: "Cliente Google", initials: "AP", rating: 5, when: "há 3 semanas", service: "Consultoria TI", text: "Atendem a nossa empresa há anos. Servidor sempre em dia e respostas rápidas pelo WhatsApp. Transparência total nos orçamentos." },
  { author: "Cliente Google", initials: "LF", rating: 5, when: "há 2 meses", service: "Envio para SP", text: "Comprei de São Paulo depois de ver as avaliações. O PC chegou muito bem embalado, tudo funcionando e com garantia. Recomendo demais." },
  { author: "Cliente Google", initials: "CT", rating: 5, when: "há 1 semana", service: "Formatação", text: "Atendimento excelente, preço justo e fizeram backup de todos os meus arquivos antes de formatar. Explicaram tudo com paciência." },
  { author: "Cliente Google", initials: "BK", rating: 5, when: "há 4 meses", service: "Upgrade", text: "Troquei o HD por um SSD NVMe e aumentei a memória. Parece outro computador! Me indicaram só o que realmente fazia diferença." },
  { author: "Cliente Google", initials: "GN", rating: 5, when: "há 5 dias", service: "Seminovo", text: "Comprei um seminovo com garantia e veio revisado, limpo e com Windows configurado. Loja de confiança no centro de Palhoça." },
  { author: "Cliente Google", initials: "MV", rating: 5, when: "há 3 meses", service: "PC Workstation", text: "Precisava de uma máquina para renderização e o Leonardo montou a configuração exata para o meu fluxo de trabalho, sem gastar à toa." },
];
