# LND - Informática

Site da LND Informática (Palhoça - SC): suporte de TI para empresas, servidores e redes, PCs Gamers e Workstations e assistência técnica.

- **Para Empresas** (`/empresas`): suporte de TI B2B, planos de suporte, onboarding em 4 passos, segmentos atendidos, FAQ e formulário de proposta.
- **Servidores & Redes** (`/servidores`): Windows Server e Linux, AD, virtualização/failover, firewall pfSense, cabeamento, cloud/Google Workspace e backup.
- **PC Gamer** (`/monte-seu-pc`): configurador em 7 etapas com validação de compatibilidade, cálculo de fonte e valor em tempo real. A configuração é salva no servidor e o link segue no WhatsApp.
- **Assistência** (`/assistencia`) e **Contato** (`/contato`), com formulário, canais e mapa.
- **Home**: hero com PC 3D interativo, caminhos por público (empresas → servidores → gamer → assistência), avaliações, sobre e formulário.
- Identidade visual: logotipo oficial em SVG (`components/ui/Logo.tsx`) e paleta âmbar `#FFAA01` (tokens em `app/globals.css`).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Zod · React Three Fiber + drei + postprocessing · Framer Motion · Zustand · Lucide.

## Rodando

```bash
npm install
npm run dev          # desenvolvimento em http://localhost:3000
npm run build        # site completo com backend (API + painel)
npm start            # serve o build em http://localhost:3000 (hospedagem Node.js)
npm run build:static # só HTML estático em /out, sem backend (formulários vão para o WhatsApp)
npm run preview      # serve /out em http://localhost:3100
npm run build:html   # gera lnd-informatica.html: o site inteiro num único arquivo, abre direto no navegador
```

## Backend

As rotas ficam em arquivos `*.api.ts(x)`. O build estático ignora esses arquivos automaticamente (`next.config.ts`).

| Rota | O que faz |
|---|---|
| `POST /api/contato` | Recebe os formulários: validação com Zod, anti-spam (honeypot), limite de 5 envios a cada 10 min por IP, checagem de origem. Grava o contato, devolve um protocolo (`LND-XXXXXX`) e dispara os avisos. |
| `POST /api/orcamentos` | Salva uma configuração do montador. **Preços e compatibilidade são recalculados no servidor** a partir do catálogo. Devolve o link `/orcamento/PC-XXXXXX/`. |
| `GET /api/orcamentos/[id]` e página `/orcamento/[id]` | Consulta pública da configuração salva (link enviado no WhatsApp). |
| `GET /api/health` | Verificação de saúde para monitoramento (uptime). |
| `GET /api/admin/leads` · `PATCH /api/admin/leads/[id]` · `GET /api/admin/orcamentos` | Listagem, filtros, exportação CSV e mudança de status (exigem `Authorization: Bearer LND_ADMIN_TOKEN`). |
| `/admin` | Painel de contatos: status, observações internas, busca, CSV e configurações de PC salvas. |

**Configuração:** copie `.env.example` para `.env.local`. Nenhuma variável é obrigatória, mas para produção configure:

- `LND_ADMIN_TOKEN`: habilita o painel `/admin`.
- `RESEND_API_KEY` + `LND_NOTIFY_EMAIL_TO`: aviso de novo contato por e-mail. Alternativa ou complemento: `LND_WEBHOOK_URL` (Slack, Discord, n8n, Make, Zapier).
- `LND_DATA_DIR`: onde os contatos são gravados (JSON). Em hospedagens com disco efêmero (ex.: Vercel), aponte para um volume persistente ou use o e-mail/webhook como registro principal.
- `NEXT_PUBLIC_SITE_URL`: domínio público, usado em links, sitemap e metadados.

## Vídeo de apresentação

Vídeo 16:9 (1920×1080, ~1min47) que apresenta o site e suas funcionalidades, feito em HTML/JavaScript em `video/`.
Cada quadro é calculado a partir do tempo, então o mesmo código roda como player no navegador e é renderizado em MP4.

```bash
npm run build && npm start               # site rodando (para capturar as telas)
SITE_URL=http://localhost:3000 LND_ADMIN_TOKEN=... npm run video:capture   # atualiza video/assets/*.jpg
npm run video:build                      # video/dist/apresentacao-lnd.html (player em arquivo único)
npm run video:render                     # video/dist/apresentacao-lnd.mp4 (precisa do ffmpeg)
npm run video:render -- --audio trilha.mp3   # com trilha sonora licenciada
```

Para editar o roteiro, textos e tempos, altere a lista `SCENES` em `video/video.js`. Para abrir o player sem build, use `video/index.html`.

## Onde editar

| O quê | Arquivo |
|---|---|
| Dados da empresa (telefone, e-mail, endereço, horários, CNPJ, menu) | `data/company.ts` |
| Serviços B2B, planos, servidores, firewall, cloud, FAQ corporativo | `data/b2b.ts` |
| Serviços de assistência técnica | `data/services.ts` |
| Catálogo de peças e preços estimados | `data/hardwareCatalog.ts` |
| Textos educativos do PC 3D | `data/hardwareEducation.ts` |
| Depoimentos | `data/reviews.ts` |
| Cores da marca | `app/globals.css` (`--color-brand`, `--color-accent`) |
| Logotipo | `components/ui/Logo.tsx` e `app/icon.svg` |
| Modelos 3D licenciados (.glb), opcional | `data/models3d.ts` + `docs/modelos-3d.md` |

## Antes de publicar

- [ ] Confirmar o escopo dos planos e os tempos de resposta em `data/b2b.ts`.
- [ ] Substituir os depoimentos de exemplo em `data/reviews.ts` por avaliações reais do Google.
- [ ] Confirmar os horários de funcionamento em `data/company.ts`.
- [ ] Confirmar que (48) 3093-2003 está ativo no WhatsApp Business.
- [ ] Definir `LND_ADMIN_TOKEN` e ao menos um canal de aviso (e-mail ou webhook).
- [ ] Revisar preços e especificações do catálogo.
- [ ] Usar apenas modelos 3D com licença comercial (ver `docs/modelos-3d.md`).
