# LND - Informática

Site da LND Informática (Palhoça - SC): assistência técnica, montagem de PCs Gamers e Workstations e consultoria em TI.

- **Hero com PC 3D interativo** — gabinete procedural em alta definição (React Three Fiber), painel de vidro que abre, hotspots educativos por peça e câmera orbital.
- **Monte seu PC Gamer** — wizard em 7 etapas com validação de compatibilidade (socket, memória, tamanho de GPU, cooler, radiador), cálculo da fonte ideal, valor estimado em tempo real e envio da configuração para o WhatsApp.
- **Assistência Técnica**, avaliações, sobre e contato com mapa.

## Stack

Next.js 16 (App Router, export estático) · TypeScript · Tailwind CSS v4 · React Three Fiber + drei + postprocessing · Framer Motion · Zustand · Lucide.

## Rodando

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:3000
npm run build      # gera o site estático em /out
npm run preview    # serve /out em http://localhost:3100
npm run build:html # gera lnd-informatica.html: o site inteiro num único arquivo, abre direto no navegador
```

A pasta `out/` pode ser publicada em qualquer hospedagem estática (Vercel, Netlify, hospedagem comum).

## Onde editar

| O quê | Arquivo |
|---|---|
| Dados da empresa (telefone, endereço, horários) | `data/company.ts` |
| Catálogo de peças e preços estimados | `data/hardwareCatalog.ts` |
| Textos educativos do PC 3D | `data/hardwareEducation.ts` |
| Depoimentos | `data/reviews.ts` |
| Modelos 3D licenciados (.glb), opcional | `data/models3d.ts` + `docs/modelos-3d.md` |

## Antes de publicar

- [ ] Substituir os depoimentos de exemplo em `data/reviews.ts` por avaliações reais do Google.
- [ ] Confirmar os horários de funcionamento em `data/company.ts`.
- [ ] Confirmar que (48) 3093-2003 está ativo no WhatsApp Business.
- [ ] Revisar preços e especificações do catálogo.
- [ ] Usar apenas modelos 3D com licença comercial (ver `docs/modelos-3d.md`).
