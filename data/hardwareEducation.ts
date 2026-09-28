// Conteúdo educativo exibido ao clicar nos hotspots do PC 3D.
// As coordenadas (anchor/camera) seguem o sistema do modelo em components/3d/PcModel.tsx:
// x = traseira(-) → frente(+), y = base(-) → topo(+), z = lado sólido(-) → vidro(+).

export type HardwarePartId = "gpu" | "cpu" | "motherboard" | "ram" | "cooler" | "psu" | "fans";

type Vec3 = [number, number, number];

export interface HardwareEducation {
  id: HardwarePartId;
  name: string;
  shortName: string;
  tagline: string;
  whatItIs: string;
  performanceImpact: string;
  expertTip: string;
  quickFacts: string[];
  anchor: Vec3;
  camera: { position: Vec3; target: Vec3 };
}

export const HARDWARE_EDUCATION: HardwareEducation[] = [
  {
    id: "gpu",
    name: "Placa de Vídeo (GPU)",
    shortName: "GPU",
    tagline: "A maior responsável pelo FPS nos jogos",
    whatItIs:
      "É um processador especializado em desenhar imagens. Ela calcula milhões de pixels, luzes, sombras e texturas a cada segundo e envia o resultado para o monitor. Também acelera edição de vídeo, renderização 3D e IA.",
    performanceImpact:
      "Em jogos, é a peça que mais influencia o FPS — especialmente em 1440p e 4K. A quantidade de VRAM define quão pesadas podem ser as texturas: hoje, 8GB é o mínimo para 1080p e 12–16GB é o ideal para jogar com folga pelos próximos anos.",
    expertTip:
      "Escolha a placa pela resolução do seu monitor, não pelo nome. Para 1080p, uma RTX 5060 ou RX 9060 XT já entrega muito. Não adianta colocar uma placa topo de linha com um processador fraco — o conjunto precisa ser equilibrado. E cuidado com placas usadas de mineração sem procedência!",
    quickFacts: ["Define o FPS em jogos", "VRAM: 8GB mín. / 16GB ideal", "Consome 70W a 575W"],
    anchor: [0.75, 0.05, 0.3],
    camera: { position: [1.2, 0.8, 4.6], target: [-0.2, -0.15, 0] },
  },
  {
    id: "cpu",
    name: "Processador (CPU)",
    shortName: "CPU",
    tagline: "O cérebro que coordena tudo",
    whatItIs:
      "Executa as instruções do sistema, dos programas e da lógica dos jogos (física, IA dos personagens, rede). Fica encaixado no soquete da placa-mãe, embaixo do cooler.",
    performanceImpact:
      "Um processador fraco \"segura\" a placa de vídeo (gargalo) e causa quedas bruscas de FPS, principalmente em jogos competitivos e mundos abertos. Para trabalho, mais núcleos significam renderizações e exportações muito mais rápidas.",
    expertTip:
      "Para jogos, 6 a 8 núcleos modernos são suficientes — os modelos X3D da AMD são os campeões de FPS. Para edição e render, aí sim vale investir em 12+ núcleos. Pense também na plataforma: o AM5 ainda vai receber upgrades, o que protege seu investimento.",
    quickFacts: ["Evita gargalos na GPU", "Jogos: 6–8 núcleos", "Plataforma define upgrades"],
    anchor: [-0.5, 1.2, -0.5],
    camera: { position: [0.4, 1.8, 2.4], target: [-0.5, 1.2, -0.7] },
  },
  {
    id: "motherboard",
    name: "Placa-Mãe",
    shortName: "Placa-Mãe",
    tagline: "A base que conecta todas as peças",
    whatItIs:
      "É a placa onde todos os componentes se conectam: processador, memória, placa de vídeo, SSDs e fonte. Ela define o soquete, o tipo de memória (DDR4 ou DDR5), as conexões USB, rede e Wi-Fi.",
    performanceImpact:
      "Não aumenta o FPS diretamente, mas um VRM (circuito de energia) fraco faz o processador superaquecer e perder desempenho. Ela também limita upgrades futuros e a velocidade dos SSDs (PCIe 3.0, 4.0 ou 5.0).",
    expertTip:
      "Não economize demais aqui nem exagere: um chipset intermediário (B650, B760, B860) atende 90% das pessoas. Só vale uma X870/Z890 se você for fazer overclock ou precisar de muitas conexões. Verifique se tem slots M.2 suficientes e Wi-Fi, se precisar.",
    quickFacts: ["Define soquete e memória", "VRM de qualidade = estabilidade", "Chipset B atende a maioria"],
    anchor: [-1.2, -0.95, -0.88],
    camera: { position: [0.3, 0.1, 3.3], target: [-0.6, 0.1, -0.95] },
  },
  {
    id: "ram",
    name: "Memória RAM",
    shortName: "RAM",
    tagline: "A mesa de trabalho do processador",
    whatItIs:
      "Guarda temporariamente os dados que estão em uso: o jogo aberto, as abas do navegador, o Discord. É muito mais rápida que o SSD, mas perde tudo quando o PC desliga.",
    performanceImpact:
      "Pouca memória causa travadas (stuttering) quando o sistema precisa recorrer ao SSD. Usar dois pentes (dual channel) em vez de um pode aumentar o FPS em até 20–30% em alguns jogos. A frequência e a latência também influenciam, principalmente em Ryzen.",
    expertTip:
      "Hoje, 16GB é o mínimo e 32GB é o ponto ideal para jogar e deixar tudo aberto. SEMPRE compre em kit de 2 pentes. Em Ryzen AM5, DDR5 6000MHz CL30 é a combinação perfeita. E lembre de ativar o perfil EXPO/XMP na BIOS — nós já entregamos configurado!",
    quickFacts: ["32GB é o ponto ideal", "Dual channel = mais FPS", "Ative XMP/EXPO na BIOS"],
    anchor: [0.48, 1.35, -0.6],
    camera: { position: [1.4, 1.7, 2.2], target: [0.45, 1.2, -0.8] },
  },
  {
    id: "cooler",
    name: "Water Cooler / Air Cooler",
    shortName: "Cooler",
    tagline: "Mantém o processador frio e silencioso",
    whatItIs:
      "Retira o calor do processador. O air cooler usa um dissipador de metal com ventoinha; o water cooler usa líquido que circula até um radiador com fans, normalmente no topo ou na frente do gabinete.",
    performanceImpact:
      "Processadores modernos reduzem a própria velocidade quando esquentam (thermal throttling). Um cooler adequado mantém o clock máximo por mais tempo, o que significa mais desempenho constante e menos barulho.",
    expertTip:
      "Um bom air cooler de torre dupla custa pouco e rende tanto quanto muitos water coolers de 240mm — para i5 e Ryzen 5/7 é mais que suficiente. Water cooler 360mm vale para processadores acima de 150W. E a pasta térmica precisa ser trocada periodicamente: fazemos isso na manutenção preventiva.",
    quickFacts: ["Evita thermal throttling", "Air cooler: ótimo custo", "WC 360mm p/ CPUs +150W"],
    anchor: [0.2, 2.05, 0.3],
    camera: { position: [1.6, 3.4, 3.2], target: [0.1, 2.0, 0] },
  },
  {
    id: "psu",
    name: "Fonte de Alimentação",
    shortName: "Fonte",
    tagline: "O coração elétrico do sistema",
    whatItIs:
      "Converte a energia da tomada em tensões estáveis e limpas para cada componente. Fica na parte de baixo do gabinete, geralmente escondida por uma cobertura (shroud).",
    performanceImpact:
      "Não aumenta FPS, mas uma fonte ruim causa desligamentos, reinícios em jogos pesados e pode queimar peças caras. A eficiência (80 Plus Bronze, Gold, Platinum) reduz o desperdício de energia em forma de calor e na conta de luz.",
    expertTip:
      "É a peça em que eu mais vejo as pessoas economizando errado. Nunca compre fonte genérica! Calcule o consumo e some uns 30% de margem — nosso montador já faz isso por você. Uma fonte Gold modular de marca confiável dura anos e acompanha vários upgrades.",
    quickFacts: ["Protege todas as peças", "Margem de ~30% no consumo", "Prefira 80 Plus Gold"],
    anchor: [-1.3, -2.0, 0.85],
    camera: { position: [0.4, -1.2, 3.6], target: [-1.2, -2.0, 0] },
  },
  {
    id: "fans",
    name: "Fans / Ventoinhas RGB",
    shortName: "Fans",
    tagline: "Fluxo de ar e estilo",
    whatItIs:
      "Movimentam o ar dentro do gabinete: as da frente puxam ar frio (intake) e as de trás/topo expulsam o ar quente (exhaust). As versões ARGB permitem sincronizar cores e efeitos.",
    performanceImpact:
      "Um fluxo de ar bem planejado reduz a temperatura da placa de vídeo e do processador em vários graus, evitando perda de desempenho e aumentando a vida útil dos componentes. Também reduz o barulho, porque as peças não precisam girar tão rápido.",
    expertTip:
      "Mais fans não é sempre melhor — o segredo é a direção do fluxo e a pressão positiva (um pouco mais de ar entrando do que saindo, o que também diminui poeira). Um cable management caprichado, como fazemos em toda montagem, ajuda o ar a circular livre.",
    quickFacts: ["Frente puxa, trás expulsa", "Pressão positiva = menos poeira", "Cable management ajuda"],
    anchor: [2.0, 0.55, 0.7],
    camera: { position: [5.0, 1.0, 2.8], target: [2.0, 0.4, 0] },
  },
];

export const EDUCATION_BY_ID = Object.fromEntries(HARDWARE_EDUCATION.map((h) => [h.id, h])) as Record<
  HardwarePartId,
  HardwareEducation
>;
