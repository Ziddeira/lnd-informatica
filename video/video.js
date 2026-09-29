/*
 * Vídeo de apresentação do novo site da LND Informática (16:9, 1920×1080).
 *
 * Cada quadro é uma função pura do tempo: renderAt(t) posiciona todos os elementos
 * a partir de t (segundos). O mesmo código serve para assistir no navegador (player)
 * e para renderizar o MP4 quadro a quadro (video/render.mjs → ?render).
 *
 * Animações declarativas nos elementos:
 *   data-in="1.2"            instante de entrada (segundos, relativo à cena)
 *   data-fx="up|down|left|right|fade|scale|pop|blur|wipe"
 *   data-d="0.8"             duração da entrada      data-dist="50"  deslocamento em px
 *   data-out="6.5"           instante de saída (fade + sobe)
 *   data-count="4.9" data-at data-cd data-dec data-pre data-suf   contador numérico
 *   data-pan="de,para,início,duração"   rolagem vertical (translateY em px)
 */
(() => {
  "use strict";

  const W = 1920;
  const H = 1080;
  const FPS = 30;
  const OVERLAP = 0.6;
  const RENDER = new URLSearchParams(location.search).has("render");

  /* ---------------------------------------------------------------- Utilidades */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, start, dur) => clamp((t - start) / dur);
  const ease = {
    out: (p) => 1 - Math.pow(1 - p, 3),
    inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    back: (p) => {
      const c1 = 1.5;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    },
    expo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  };
  const fmt = (v, dec) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  /* ---------------------------------------------------------------- Ícones */
  const icon = (paths, cls = "") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const I = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  };
  const check = `<span class="check">${icon(I.check)}</span>`;
  const stars = `<div class="stars">${icon(I.star).repeat(5)}</div>`;

  /** Logotipo oficial da LND (mesmo desenho de components/ui/Logo.tsx). */
  function logo({ color = "#ffaa01", draw = false, width = 600, mark = false } = {}) {
    const teeth = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
      .map((a) => {
        const [cx, cy] = [21.5, 18.5];
        const p = (r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r].map((n) => n.toFixed(2));
        const [x1, y1] = p(6.2);
        const [x2, y2] = p(8.9);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="3" pathLength="1" class="stroke"/>`;
      })
      .join("");
    const d = draw ? ' data-draw="1"' : "";
    const letters = mark
      ? ""
      : `<g fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M53 8.5 V31.5 H69" pathLength="1" class="stroke"/>
          <path d="M78 31.5 V8.5 L97 31.5 V8.5" pathLength="1" class="stroke"/>
          <path d="M106 8.5 H121 A12 12 0 0 1 133 20.5 A11 11 0 0 1 122 31.5 H113 V16" pathLength="1" class="stroke"/>
        </g>`;
    return `<svg viewBox="0 0 ${mark ? 43 : 140} 44" width="${width}"${d}>
      <g fill="none" stroke="${color}">
        <rect x="3" y="3" width="37" height="31" rx="6.5" stroke-width="5" pathLength="1" class="stroke"/>
        <circle cx="21.5" cy="18.5" r="4.6" stroke-width="2.6" pathLength="1" class="stroke"/>
        ${teeth}
      </g>
      <rect x="16.5" y="33" width="10" height="7.5" rx="2" fill="${color}" class="fill"/>
      ${letters}
    </svg>`;
  }

  const browser = ({ url, x, y, w, inner, attrs = "", vpH }) => {
    const h = vpH ?? Math.round((w * 9) / 16);
    return `<div class="browser" style="left:${x}px;top:${y}px;width:${w}px" ${attrs}>
      <div class="bar"><i></i><i></i><i></i><div class="url">${icon(I.lock)}${url}</div></div>
      <div class="vp" style="height:${h}px">${inner}</div>
    </div>`;
  };

  const phone = (src, x, y, attrs = "") =>
    `<div class="phone" style="left:${x}px;top:${y}px" ${attrs}><div class="screen"><div class="island"></div><img src="${src}" alt=""></div></div>`;

  const callout = (text, x, y, at, fx = "pop", out = "") =>
    `<div class="callout" style="left:${x}px;top:${y}px" data-in="${at}" data-fx="${fx}"${out ? ` data-out="${out}"` : ""}><span class="dot"></span>${text}</div>`;

  const bulletList = (items, at, step = 0.45) =>
    `<ul class="bullets">${items
      .map((text, i) => `<li data-in="${(at + i * step).toFixed(2)}" data-fx="right" data-dist="40">${check}<span>${text}</span></li>`)
      .join("")}</ul>`;

  const textColumn = ({ eyebrow, title, lead, bullets, at = 0.2, top = 250, width = 560, left = 110 }) => `
    <div class="abs" style="left:${left}px;top:${top}px;width:${width}px">
      <p class="eyebrow" data-in="${at}" data-fx="fade">${eyebrow}</p>
      <h2 class="display h2" data-in="${at + 0.15}" data-fx="up">${title}</h2>
      ${lead ? `<p class="lead" data-in="${at + 0.5}" data-fx="up">${lead}</p>` : ""}
      ${bullets ? bulletList(bullets, at + 1.0) : ""}
    </div>`;

  /* ---------------------------------------------------------------- Roteiro */
  const SCENES = [
    {
      id: "abertura",
      dur: 7,
      html: `
        <div class="center">
          <div data-in="0" data-fx="fade" data-d="0.3" style="position:relative">${logo({ draw: true, width: 760 })}
            <div class="abs sweep" style="inset:-20px -40px;overflow:hidden;border-radius:20px"><div class="abs sweep-bar"
              style="top:-50%;bottom:-50%;width:160px;background:linear-gradient(90deg,transparent,rgb(255 255 255 / .35),transparent);transform:rotate(18deg)"></div></div>
          </div>
          <p class="display" style="margin-top:80px;font-size:72px" data-in="2.3" data-fx="up">Proposta de novo site</p>
          <p class="lead" style="margin-top:20px;font-size:34px" data-in="2.8" data-fx="up">Mais empresas, mais gamers, mais clientes chegando pelo site.</p>
          <p class="mono" style="margin-top:40px;font-size:26px;color:#ffaa01;letter-spacing:.08em" data-in="3.4" data-fx="fade">lndinformatica.com.br</p>
        </div>`,
      update(t, s) {
        const p = ease.inOut(prog(t, 0.2, 1.9));
        s.strokes.forEach((el, i) => {
          const q = ease.inOut(clamp(p * 1.25 - i * 0.02));
          el.style.strokeDasharray = "1";
          el.style.strokeDashoffset = String(1 - q);
        });
        s.fills.forEach((el) => (el.style.opacity = String(ease.out(prog(t, 1.6, 0.6)))));
        s.sweepBar.style.left = `${lerp(-220, 900, ease.inOut(prog(t, 2.1, 1.1)))}px`;
      },
      setup(s) {
        s.strokes = [...s.root.querySelectorAll("[data-draw] .stroke")];
        s.fills = [...s.root.querySelectorAll("[data-draw] .fill")];
        s.sweepBar = s.root.querySelector(".sweep-bar");
      },
    },

    {
      id: "numeros",
      chapter: "A LND hoje",
      dur: 9.5,
      html: `
        <div class="abs" style="left:110px;top:170px;width:1700px">
          <p class="eyebrow" data-in="0.2" data-fx="fade">Uma empresa que já é referência</p>
          <h2 class="display h1" data-in="0.35" data-fx="up">Anos de reputação.<br><span class="grad">Agora com um site à altura.</span></h2>
        </div>
        ${[
          { v: `<span data-count="4.9" data-dec="1" data-at="1.1" data-cd="1.4">0</span>`, l: "nota no Google", extra: stars },
          { v: `~<span data-count="5000" data-dec="0" data-at="1.3" data-cd="1.6">0</span>`, l: "avaliações de clientes" },
          { v: `<span data-count="20" data-dec="0" data-at="1.5" data-cd="1.2">0</span>+`, l: "anos de experiência" },
          { v: "2016", l: "loja no Centro de Palhoça" },
        ]
          .map(
            (s, i) => `<div class="card stat" style="left:${110 + i * 430}px;top:520px" data-in="${(0.9 + i * 0.2).toFixed(1)}" data-fx="pop">
              <div class="value">${s.v}</div><div class="label">${s.l}</div>${s.extra ?? ""}</div>`,
          )
          .join("")}
        <div class="abs" style="left:110px;top:880px;display:flex;gap:18px;align-items:center">
          <span style="font-size:26px;color:#cbd2dc;margin-right:8px" data-in="4.4" data-fx="fade">O novo site vende tudo o que a LND faz:</span>
          ${["Empresas", "Servidores", "PC Gamer", "Assistência"]
            .map((c, i) => `<span class="chip" data-in="${(4.8 + i * 0.25).toFixed(2)}" data-fx="pop"><b></b>${c}</span>`)
            .join("")}
        </div>`,
    },

    {
      id: "identidade",
      chapter: "Identidade visual",
      dur: 9.5,
      html: `
        ${textColumn({
          eyebrow: "Nova identidade",
          title: "Fiel à marca LND.",
          lead: "Logotipo oficial redesenhado em vetor, nítido em qualquer tela, e o âmbar da marca aplicado em todo o site.",
          top: 230,
        })}
        <div class="card abs" style="left:780px;top:170px;width:1030px;height:390px;display:grid;place-items:center" data-in="0.9" data-fx="scale">
          ${logo({ width: 640 })}
        </div>
        <div class="abs" style="left:780px;top:590px;width:500px;height:170px;border-radius:28px;background:#ffaa01;display:grid;place-items:center" data-in="1.3" data-fx="up">
          ${logo({ width: 300, color: "#07080b" })}
        </div>
        <div class="card abs" style="left:1310px;top:590px;width:500px;height:170px;padding:34px 36px" data-in="1.5" data-fx="up">
          <div style="display:flex;align-items:center;gap:14px;background:#1c1f26;border-radius:14px 14px 0 0;padding:14px 18px;width:330px">
            <span style="width:30px;height:30px;border-radius:8px;background:#0b0c10;display:grid;place-items:center">${logo({ width: 22, mark: true })}</span>
            <span style="font-size:19px;color:#e6e9ef">LND Informática</span>
          </div>
          <p style="margin:14px 0 0;font-size:19px;color:#94a3b8">Favicon e ícone do site</p>
        </div>
        ${[
          { c: "#ffaa01", n: "Âmbar LND", h: "#FFAA01" },
          { c: "#ff7a1a", n: "Laranja", h: "#FF7A1A" },
          { c: "#07080b", n: "Grafite", h: "#07080B" },
          { c: "#161920", n: "Painel", h: "#161920" },
        ]
          .map(
            (s, i) => `<div class="swatch" style="left:${780 + i * 262}px;top:800px" data-in="${(2.4 + i * 0.2).toFixed(1)}" data-fx="pop">
              <div class="color" style="background:${s.c};height:110px"></div><b>${s.n}</b><span class="mono">${s.h}</span></div>`,
          )
          .join("")}
        <div class="abs" style="left:110px;top:640px;width:560px">
          <div data-in="3.6" data-fx="up" style="display:flex;align-items:baseline;gap:22px">
            <span class="display" style="font-size:96px">Aa</span>
            <span style="font-size:24px;color:#cbd2dc">Space Grotesk<br><span style="color:#94a3b8">títulos</span></span>
          </div>
          <div data-in="3.9" data-fx="up" style="display:flex;align-items:baseline;gap:22px;margin-top:18px">
            <span style="font-size:96px;font-weight:600;color:#fff;letter-spacing:-.03em">Aa</span>
            <span style="font-size:24px;color:#cbd2dc">Inter<br><span style="color:#94a3b8">textos</span></span>
          </div>
        </div>`,
    },

    {
      id: "home",
      chapter: "Página inicial",
      dur: 13,
      html: `
        ${textColumn({
          eyebrow: "Primeira impressão",
          title: "Uma vitrine que prende a atenção.",
          bullets: [
            "PC 3D interativo: o cliente abre o gabinete e conhece cada peça",
            "Caminhos claros para empresas, gamers e assistência",
            "Nota 4,9 e avaliações sempre em destaque",
          ],
          top: 210,
        })}
        ${browser({
          url: "lndinformatica.com.br",
          x: 720,
          y: 170,
          w: 1100,
          attrs: 'data-in="0.5" data-fx="left" data-dist="120"',
          inner: `
            <img src="assets/home-hero.jpg" alt="">
            <img src="assets/home-hero-open.jpg" alt="" data-in="3.35" data-fx="fade" data-d="0.5">
            <img src="assets/full-home.jpg" alt="" class="pan-home" data-in="7.0" data-fx="fade" data-d="0.6" data-pan="0,-4300,7.6,5">
          `,
        })}
        <svg class="cursor" viewBox="0 0 24 24"><path d="M4 2v17.5l4.6-4.4 3 6.9 3.1-1.3-3-6.8H18z" fill="#fff" stroke="#07080b" stroke-width="1.4" stroke-linejoin="round"/></svg>
        <div class="ripple"></div>
        ${callout("Raio-X 3D: cada peça explicada", 1330, 360, 4.0, "pop", "6.8")}
        ${callout("Caminhos por público: empresa, gamer, assistência", 1120, 470, 8.2, "pop", "9.7")}
        ${callout("Suporte B2B em destaque na home", 1280, 600, 10.2, "pop", "12.3")}
      `,
      setup(s) {
        s.cursor = s.root.querySelector(".cursor");
        s.ripple = s.root.querySelector(".ripple");
      },
      update(t, s) {
        // Cursor vai até "Abrir painel" (na tela capturada) e clica.
        const target = { x: 720 + 954 * (1100 / 1920), y: 170 + 46 + 861 * (1100 / 1920) };
        const p = ease.inOut(prog(t, 2.0, 1.1));
        const x = lerp(1900, target.x, p);
        const y = lerp(1000, target.y, p);
        const leave = ease.inOut(prog(t, 4.2, 0.8));
        s.cursor.style.transform = `translate(${lerp(x, 1950, leave)}px, ${lerp(y, 1100, leave)}px) scale(${t > 3.05 && t < 3.25 ? 0.85 : 1})`;
        s.cursor.style.opacity = String(prog(t, 1.9, 0.3) * (1 - leave));
        const r = prog(t, 3.1, 0.6);
        s.ripple.style.left = `${target.x + 4}px`;
        s.ripple.style.top = `${target.y + 4}px`;
        s.ripple.style.opacity = String(r > 0 && r < 1 ? 1 - r : 0);
        s.ripple.style.transform = `scale(${lerp(0.3, 1.4, ease.out(r))})`;
      },
    },

    {
      id: "empresas",
      chapter: "Para Empresas",
      dur: 13,
      html: `
        ${textColumn({
          eyebrow: "Foco B2B",
          title: "Suporte de TI para empresas, em destaque.",
          bullets: [
            "Página dedicada ao cliente corporativo",
            "3 planos de suporte com escopo claro",
            "Diagnóstico e proposta em 4 passos",
            "Formulário que qualifica: empresa e porte",
          ],
          top: 200,
        })}
        ${browser({
          url: "lndinformatica.com.br/empresas",
          x: 720,
          y: 170,
          w: 1100,
          attrs: 'data-in="0.4" data-fx="left" data-dist="120"',
          inner: `<img src="assets/full-empresas.jpg" alt="" data-pan="0,-2250,1.4,5.6">`,
        })}
        <div class="abs" style="left:700px;top:215px;width:1140px;border-radius:26px;overflow:hidden;border:1px solid rgb(255 170 1 / .5);box-shadow:0 60px 120px -30px #000,0 0 120px -30px rgb(255 170 1 / .5)" data-in="7.3" data-fx="pop">
          <img src="assets/empresas-planos.jpg" alt="" style="width:100%;display:block">
        </div>
        ${callout("Plano mais contratado em destaque", 1110, 820, 8.4)}
      `,
    },

    {
      id: "servidores",
      chapter: "Servidores & Redes",
      dur: 11,
      html: `
        <div class="abs" style="left:110px;top:170px;width:640px">
          <p class="eyebrow" data-in="0.2" data-fx="fade">A especialidade da LND</p>
          <h2 class="display h2" data-in="0.35" data-fx="up">Servidores, redes e segurança.</h2>
          <p class="lead" data-in="0.8" data-fx="up">O conteúdo técnico do site atual, reorganizado para gerar pedidos de projeto.</p>
          <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:40px">
            ${[
              "Windows Server",
              "Linux",
              "Active Directory",
              "Virtualização",
              "Failover",
              "Firewall pfSense",
              "VPN",
              "Backup",
              "Cabeamento",
              "Google Workspace",
            ]
              .map((c, i) => `<span class="chip" style="font-size:22px;padding:12px 20px" data-in="${(1.3 + i * 0.14).toFixed(2)}" data-fx="pop"><b></b>${c}</span>`)
              .join("")}
          </div>
        </div>
        ${browser({
          url: "lndinformatica.com.br/servidores",
          x: 820,
          y: 170,
          w: 1000,
          attrs: 'data-in="0.4" data-fx="left" data-dist="120"',
          inner: `<img src="assets/full-servidores.jpg" alt="" data-pan="0,-2700,1.6,8.8">`,
        })}
        ${callout("Formulário de projeto em cada página", 1250, 800, 6.2)}
      `,
    },

    {
      id: "gamer",
      chapter: "PC Gamer",
      dur: 15,
      html: `
        ${textColumn({
          eyebrow: "Universo gamer",
          title: "Monte seu PC com preço em tempo real.",
          bullets: ["7 etapas com compatibilidade validada", "Fonte ideal calculada sozinha", "Configuração salva e enviada no WhatsApp"],
          top: 200,
        })}
        ${browser({
          url: "lndinformatica.com.br/monte-seu-pc",
          x: 720,
          y: 170,
          w: 1100,
          attrs: 'data-in="0.4" data-fx="left" data-dist="120"',
          inner: `<img src="assets/builder.jpg" alt="" class="kb">
                  <img src="assets/orcamento.jpg" alt="" data-in="10.6" data-fx="fade" data-d="0.6">`,
        })}
        <div class="price" style="left:1370px;top:700px" data-in="2.2" data-fx="pop" data-out="6.4">
          <small>Valor estimado de mercado</small>
          <strong>R$ <span data-count="10542" data-dec="0" data-at="2.4" data-cd="1.6">0</span></strong>
        </div>
        <div class="chat" style="left:1210px;top:250px" data-in="6.6" data-fx="left" data-dist="160" data-out="10.4">
          <div class="head">
            <span class="avatar">${logo({ width: 30, mark: true })}</span>
            <div><b>Leonardo · LND</b><span>online</span></div>
          </div>
          <div class="body">
            <div class="bubble" data-in="7.1" data-fx="up" data-dist="20">
              <p>Olá, Leonardo! Montei esta configuração no site da LND:</p>
            </div>
            <div class="bubble" style="margin-top:10px" data-in="7.6" data-fx="up" data-dist="20">
              <p>• Ryzen 7 7800X3D<br>• GeForce RTX 5070 12GB<br>• 32GB DDR5 6000MHz</p>
              <p><b>Valor estimado: R$ 10.542</b></p>
            </div>
            <div class="bubble" style="margin-top:10px" data-in="8.3" data-fx="up" data-dist="20">
              <p class="link">Configuração PC-AFAZJE:<br>lndinformatica.com.br/orcamento/PC-AFAZJE</p>
              <div class="meta">17:42 ✓✓</div>
            </div>
          </div>
        </div>
        ${callout("O link abre a configuração salva, com preços conferidos no servidor", 820, 880, 11.2)}
      `,
      setup(s) {
        s.kb = s.root.querySelector(".kb");
      },
      update(t, s) {
        const p = ease.inOut(prog(t, 2.0, 7));
        s.kb.style.transformOrigin = "88% 55%";
        s.kb.style.transform = `scale(${lerp(1, 1.18, p)})`;
      },
    },

    {
      id: "backend",
      chapter: "Backend",
      dur: 14,
      html: `
        <div class="abs" style="left:110px;top:150px;width:1700px" data-in="0" data-fx="fade" data-d="0.01" data-out="4.7">
          <p class="eyebrow" data-in="0.2" data-fx="fade">Por trás da tela</p>
          <h2 class="display h2" data-in="0.35" data-fx="up">Nenhum contato se perde.</h2>
        </div>
        ${[
          { i: I.file, t: "Formulário", p: "Empresa, porte e necessidade" },
          { i: I.shield, t: "API segura", p: "Validação, anti-spam e limite de envios" },
          { i: I.hash, t: "Protocolo", p: '<span class="mono" style="color:#ffaa01">LND-KSTGK4</span> para o cliente' },
          { i: I.bell, t: "Aviso na hora", p: "E-mail ou webhook (Slack, Discord, n8n)" },
        ]
          .map(
            (n, i) => `<div class="card node" style="left:${110 + i * 440}px;top:330px" data-in="${(1.0 + i * 0.35).toFixed(2)}" data-fx="pop">
              <div class="ico">${icon(n.i)}</div><h4>${n.t}</h4><p>${n.p}</p></div>`,
          )
          .join("")}
        ${[0, 1, 2].map((i) => `<div class="wire" style="left:${440 + i * 440}px;top:450px;width:110px" data-wire="${1.4 + i * 0.35}"></div>`).join("")}
        ${[0, 1, 2].map((i) => `<div class="packet" data-lane="${i}"></div>`).join("")}
        ${browser({
          url: "lndinformatica.com.br/admin",
          x: 310,
          y: 640,
          w: 1300,
          attrs: 'data-in="5.2" data-fx="up" data-dist="300" data-d="1.1"',
          inner: `<img src="assets/admin.jpg" alt="">`,
        })}
        ${callout("Painel com status de cada contato", 1290, 580, 6.6)}
        ${callout("Busca, filtros e exportação para planilha", 70, 905, 7.4)}
        ${callout("Resposta direto no WhatsApp", 1420, 975, 8.2)}
      `,
      setup(s) {
        s.wires = [...s.root.querySelectorAll("[data-wire]")];
        s.packets = [...s.root.querySelectorAll(".packet")];
        s.flow = [...s.root.querySelectorAll(".node, .wire, .packet")];
        s.admin = s.root.querySelector(".browser");
      },
      update(t, s) {
        s.wires.forEach((w) => {
          w.style.transform = `scaleX(${ease.out(prog(t, Number(w.dataset.wire), 0.5))})`;
        });
        s.packets.forEach((el, i) => {
          const cycle = ((t - 2.6 - i * 0.35) % 1.6) / 1.6;
          const on = t > 2.6 + i * 0.35 && cycle >= 0;
          const x = 440 + i * 440 + cycle * 110;
          el.style.left = `${x}px`;
          el.style.top = "451px";
          el.style.opacity = on ? String(Math.sin(cycle * Math.PI)) : "0";
        });
        // Fluxo sobe para abrir espaço ao painel.
        const lift = ease.inOut(prog(t, 5.0, 1.1));
        s.flow.forEach((el) => (el.style.translate = `0 ${-lift * 150}px`));
      },
    },

    {
      id: "mobile",
      chapter: "Celular, SEO e segurança",
      dur: 11,
      html: `
        ${phone("assets/mobile-home.jpg", 110, 250, 'data-in="0.5" data-fx="up" data-dist="200" data-d="1"')}
        ${phone("assets/mobile-empresas.jpg", 470, 190, 'data-in="0.8" data-fx="up" data-dist="200" data-d="1"')}
        ${phone("assets/mobile-builder.jpg", 830, 250, 'data-in="1.1" data-fx="up" data-dist="200" data-d="1"')}
        <div class="abs" style="left:1240px;top:210px;width:600px">
          <p class="eyebrow" data-in="0.2" data-fx="fade">Pronto para crescer</p>
          <h2 class="display h2" data-in="0.35" data-fx="up">Perfeito no celular. Pronto para o Google.</h2>
          ${bulletList(
            [
              "Responsivo em qualquer tela",
              "SEO: títulos, sitemap e dados estruturados",
              "Proteção anti-spam, validação e LGPD",
              "Código próprio, sem plataforma de terceiros",
            ],
            1.6,
          )}
        </div>
      `,
    },

    {
      id: "fechamento",
      dur: 10,
      html: `
        <div class="abs" style="left:110px;top:150px;width:1700px" data-in="0" data-fx="fade" data-d="0.01" data-out="5.2">
          <p class="eyebrow" data-in="0.2" data-fx="fade">Resumo da entrega</p>
          <h2 class="display h1" data-in="0.35" data-fx="up">Tudo pronto para colocar no ar.</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px 60px;margin-top:70px;width:1500px">
            ${[
              "Nova identidade visual",
              "Páginas Para Empresas e Servidores",
              "Montador de PC com orçamento salvo",
              "Formulários com protocolo e aviso",
              "Painel de contatos com exportação",
              "SEO, segurança e versão para celular",
            ]
              .map(
                (c, i) => `<div data-in="${(0.9 + i * 0.3).toFixed(1)}" data-fx="right" style="display:flex;gap:20px;align-items:center;font-size:34px;color:#fff">${check.replace("check", "check big")}${c}</div>`,
              )
              .join("")}
          </div>
        </div>
        <div class="center" data-in="5.8" data-fx="scale" data-d="1">
          ${logo({ width: 560 })}
          <p class="display h2" style="margin-top:70px">Vamos lançar o novo site da LND?</p>
          <p class="lead" style="margin-top:18px">Demonstração completa pronta para navegar.</p>
        </div>
      `,
    },
  ];

  /* ---------------------------------------------------------------- Montagem */
  const stage = document.getElementById("stage");
  stage.innerHTML = `
    <div class="bg-grid"></div>
    <div class="glow a"></div><div class="glow b"></div>
    <div id="scenes"></div>
    <div id="hud">
      <div class="chapter"><span class="num"></span><span class="sep"></span><span class="label"></span></div>
      <div class="mark">${logo({ width: 150 })}</div>
      <div class="progress"></div>
    </div>`;
  const scenesEl = stage.querySelector("#scenes");
  const glowA = stage.querySelector(".glow.a");
  const glowB = stage.querySelector(".glow.b");
  const hud = {
    root: stage.querySelector("#hud"),
    chapter: stage.querySelector("#hud .chapter"),
    num: stage.querySelector("#hud .num"),
    label: stage.querySelector("#hud .label"),
    mark: stage.querySelector("#hud .mark"),
    progress: stage.querySelector("#hud .progress"),
  };

  let cursor = 0;
  let chapterNo = 0;
  for (const scene of SCENES) {
    scene.start = cursor;
    cursor += scene.dur - OVERLAP;
    if (scene.chapter) scene.no = String(++chapterNo).padStart(2, "0");

    const root = document.createElement("section");
    root.className = "scene";
    root.dataset.scene = scene.id;
    root.innerHTML = scene.html;
    scenesEl.appendChild(root);
    scene.root = root;

    scene.anims = [...root.querySelectorAll("[data-in]")].map((el) => ({
      el,
      at: Number(el.dataset.in),
      d: Number(el.dataset.d ?? 0.85),
      fx: el.dataset.fx ?? "up",
      dist: Number(el.dataset.dist ?? 50),
      out: el.dataset.out !== undefined ? Number(el.dataset.out) : null,
    }));
    scene.counters = [...root.querySelectorAll("[data-count]")].map((el) => ({
      el,
      to: Number(el.dataset.count),
      dec: Number(el.dataset.dec ?? 0),
      at: Number(el.dataset.at ?? 0),
      d: Number(el.dataset.cd ?? 1.2),
    }));
    scene.pans = [...root.querySelectorAll("[data-pan]")].map((el) => {
      const [from, to, at, d] = el.dataset.pan.split(",").map(Number);
      return { el, from, to, at, d };
    });
    scene.setup?.(scene);
  }
  const DURATION = cursor + OVERLAP;

  function applyAnim(a, t) {
    const raw = prog(t, a.at, a.d);
    let p = a.fx === "pop" ? ease.back(raw) : ease.out(raw);
    let opacity = clamp(raw * 1.6);
    let tf = "";
    let filter = "";
    let clip = "";
    switch (a.fx) {
      case "up":
        tf = `translateY(${(1 - p) * a.dist}px)`;
        break;
      case "down":
        tf = `translateY(${-(1 - p) * a.dist}px)`;
        break;
      case "left":
        tf = `translateX(${(1 - p) * a.dist}px)`;
        break;
      case "right":
        tf = `translateX(${-(1 - p) * a.dist}px)`;
        break;
      case "scale":
        tf = `scale(${lerp(0.9, 1, p)})`;
        break;
      case "pop":
        tf = `scale(${lerp(0.7, 1, p)})`;
        break;
      case "blur":
        filter = `blur(${(1 - p) * 18}px)`;
        break;
      case "wipe":
        clip = `inset(0 ${(1 - ease.inOut(raw)) * 100}% 0 0)`;
        opacity = raw > 0 ? 1 : 0;
        break;
      default:
        break;
    }
    if (a.out !== null) {
      const q = ease.inOut(prog(t, a.out, 0.6));
      opacity *= 1 - q;
      tf += ` translateY(${-q * 30}px)`;
    }
    const s = a.el.style;
    s.opacity = String(opacity);
    s.transform = tf;
    s.filter = filter;
    s.clipPath = clip;
  }

  function sceneAlpha(scene, lt) {
    const first = scene === SCENES[0];
    const last = scene === SCENES[SCENES.length - 1];
    const fin = first ? 1 : ease.inOut(prog(lt, 0, OVERLAP));
    const fout = 1 - ease.inOut(prog(lt, scene.dur - (last ? 1.2 : OVERLAP), last ? 1.2 : OVERLAP));
    return Math.min(fin, fout);
  }

  /** Desenha o quadro do instante t (segundos). Determinístico. */
  function renderAt(t) {
    t = clamp(t, 0, DURATION);

    glowA.style.transform = `translate(${-200 + Math.sin(t * 0.21) * 160}px, ${-240 + Math.cos(t * 0.17) * 90}px)`;
    glowB.style.transform = `translate(${1400 + Math.cos(t * 0.19) * 180}px, ${560 + Math.sin(t * 0.23) * 110}px)`;

    let dominant = null;
    let best = 0;
    for (const scene of SCENES) {
      const lt = t - scene.start;
      const visible = lt >= 0 && lt <= scene.dur;
      scene.root.style.visibility = visible ? "visible" : "hidden";
      if (!visible) continue;
      const alpha = sceneAlpha(scene, lt);
      scene.root.style.opacity = String(alpha);
      if (alpha > best) {
        best = alpha;
        dominant = scene;
      }
      for (const a of scene.anims) applyAnim(a, lt);
      for (const c of scene.counters) {
        const v = lerp(0, c.to, ease.expo(prog(lt, c.at, c.d)));
        c.el.textContent = fmt(v, c.dec);
      }
      for (const p of scene.pans) p.el.style.translate = `0 ${lerp(p.from, p.to, ease.inOut(prog(lt, p.at, p.d)))}px`;
      scene.update?.(lt, scene);
    }

    // HUD: capítulo atual, marca e barra de progresso
    const withHud = dominant && dominant.chapter;
    const hudAlpha = withHud ? sceneAlpha(dominant, t - dominant.start) : 0;
    if (withHud) {
      hud.num.textContent = dominant.no;
      hud.label.textContent = dominant.chapter;
    }
    hud.chapter.style.opacity = String(hudAlpha);
    hud.mark.style.opacity = String(hudAlpha * 0.9);
    hud.progress.style.width = `${(t / DURATION) * W}px`;
    hud.progress.style.opacity = t < 6 ? String(prog(t, 5, 1)) : "1";
    return dominant;
  }

  /* ---------------------------------------------------------------- Carregamento */
  const ready = Promise.all([
    document.fonts.ready,
    ...[...stage.querySelectorAll("img")].map((img) => img.decode().catch(() => undefined)),
  ]);

  function fit() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = `scale(${s}) translate(-50%, -50%)`;
  }
  window.addEventListener("resize", fit);
  fit();

  window.__video = { duration: DURATION, fps: FPS, renderAt, ready, width: W, height: H };

  if (RENDER) {
    document.body.classList.add("render");
    ready.then(() => renderAt(0));
    return;
  }

  /* ---------------------------------------------------------------- Player */
  const $ = (id) => document.getElementById(id);
  const startEl = $("start");
  const playBtn = $("btn-play");
  const fill = $("timeline-fill");
  const timeline = $("timeline");
  const timeEl = $("time");
  const chapterEl = $("chapter-name");
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

  $("timeline-marks").innerHTML = SCENES.slice(1)
    .map((s) => `<i style="left:${(s.start / DURATION) * 100}%"></i>`)
    .join("");

  let t = 0;
  let playing = false;
  let last = 0;
  const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

  function draw() {
    const scene = renderAt(t);
    fill.style.width = `${(t / DURATION) * 100}%`;
    timeEl.textContent = `${clock(t)} / ${clock(DURATION)}`;
    chapterEl.textContent = scene?.chapter ?? (scene === SCENES[0] ? "Abertura" : "Encerramento");
  }

  function frame(now) {
    if (!playing) return;
    t += (now - last) / 1000;
    last = now;
    if (t >= DURATION) {
      t = DURATION;
      setPlaying(false);
    }
    draw();
    if (playing) requestAnimationFrame(frame);
  }

  function setPlaying(value) {
    playing = value;
    playBtn.innerHTML = playing ? PAUSE : PLAY;
    if (playing) {
      if (t >= DURATION) t = 0;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }

  function seek(sec) {
    t = clamp(sec, 0, DURATION);
    draw();
  }

  startEl.addEventListener("click", () => {
    startEl.classList.add("hidden");
    ready.then(() => setPlaying(true));
  });
  startEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") startEl.click();
  });
  playBtn.addEventListener("click", () => setPlaying(!playing));
  $("btn-full").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  let dragging = false;
  const seekFromPointer = (e) => {
    const r = timeline.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * DURATION);
  };
  timeline.addEventListener("pointerdown", (e) => {
    dragging = true;
    timeline.setPointerCapture(e.pointerId);
    seekFromPointer(e);
  });
  timeline.addEventListener("pointermove", (e) => dragging && seekFromPointer(e));
  timeline.addEventListener("pointerup", () => (dragging = false));

  window.addEventListener("keydown", (e) => {
    if (!startEl.classList.contains("hidden")) return;
    if (e.key === " ") {
      e.preventDefault();
      setPlaying(!playing);
    } else if (e.key === "ArrowRight") seek(t + 5);
    else if (e.key === "ArrowLeft") seek(t - 5);
    else if (e.key.toLowerCase() === "f") $("btn-full").click();
  });

  let hideTimer = 0;
  window.addEventListener("pointermove", () => {
    document.body.classList.add("show-controls");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => document.body.classList.remove("show-controls"), 2500);
  });
  stage.addEventListener("click", () => startEl.classList.contains("hidden") && setPlaying(!playing));

  ready.then(draw);
  playBtn.innerHTML = PLAY;
})();
