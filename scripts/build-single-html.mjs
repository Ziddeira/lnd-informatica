// Gera um único arquivo HTML autossuficiente (lnd-informatica.html) a partir do export estático em /out.
// Tudo fica embutido: CSS, fontes, JavaScript e as três páginas — abre direto no navegador, sem servidor.
// Uso: npm run build:html
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
const TARGET = "lnd-informatica.html";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(OUT).map((p) => relative(OUT, p).split("\\").join("/"));
const read = (p) => readFileSync(join(OUT, p), "utf8");
// O roteador do Next recebe "/" como URL inicial (o arquivo é a página inicial, qualquer que seja o caminho real).
const inlineJs = (code) =>
  code.replace(/<\/script/gi, "<\\/script").replace(/location:window\.location\}/g, "location:self.__LND_LOCATION__||window.location}");

// CSS com as fontes convertidas em data URI.
const inlineCss = (css) =>
  css.replace(/url\((["']?)\/_next\/static\/media\/([^"')]+)\1\)/g, (_, _q, name) => {
    const data = readFileSync(join(OUT, "_next/static/media", name)).toString("base64");
    return `url(data:font/woff2;base64,${data})`;
  });

// O CSS vai inline; nas referências do React (HTML e payloads RSC) o arquivo vira um data URI vazio.
const CSS_STUB = "data:text/css,%2F%2A%2A%2F";
const stubCss = (s) =>
  s
    .replace(/\/_next\/static\/css\/[a-z0-9]+\.css/g, CSS_STUB)
    .replace(/\/_next\/static\/media\/[\w.-]+\.woff2/g, "data:font/woff2;base64,");

let html = read("index.html");

html = html.replace(
  /<link rel="stylesheet" href="\/(_next\/static\/css\/[^"]+)"([^>]*)\/?>/g,
  (m, p, attrs) => `<style>${inlineCss(read(p))}</style><link rel="stylesheet" href="${CSS_STUB}"${attrs.replace(/\/$/, "")}/>`,
);
html = stubCss(html);
html = html.replace(/<link rel="preload"[^>]*\/?>/g, "");
html = html.replace(/<link rel="icon"[^>]*\/?>/g, "");

// Scripts externos viram inline no fim do <body>, na mesma ordem (depois do payload RSC).
const ordered = [];
html = html.replace(/<script src="\/(_next\/static\/chunks\/[^"]+)"([^>]*)><\/script>/g, (_, p, attrs) => {
  if (!/noModule/i.test(attrs)) ordered.push(p);
  return "";
});
const runtime = ordered.find((p) => /\/webpack-[^/]+\.js$/.test(p));
const rest = ordered.filter((p) => p !== runtime);
// Demais chunks (outras páginas e imports dinâmicos) são registrados de antemão para não depender de rede.
const extras = files.filter(
  (p) =>
    p.startsWith("_next/static/chunks/") &&
    p.endsWith(".js") &&
    !ordered.includes(p) &&
    !/\/(webpack|main|polyfills)-[^/]+\.js$/.test(p),
);

// Payloads RSC de todas as rotas, servidos por um fetch interceptado durante a navegação.
const rsc = Object.fromEntries(files.filter((p) => p.endsWith(".txt")).map((p) => [p, stubCss(read(p))]));

const shim = `
(function () {
  var RSC = ${JSON.stringify(rsc).replace(/<\//g, "<\\/")};
  var keys = Object.keys(RSC).sort(function (a, b) { return b.length - a.length; });
  // Requisições internas (file://, mesma origem) recebem o payload da rota; externas seguem normais.
  var find = function (url) {
    var u;
    try { u = new URL(url, location.href); } catch (e) { return null; }
    if (/^https?:$/.test(u.protocol) && u.origin !== location.origin) return null;
    var path = decodeURIComponent(u.pathname).replace(/^\\/+/, "");
    if (!/\\.txt$/.test(path)) path = path.replace(/\\/?$/, "/").replace(/^\\/$/, "") + "index.txt";
    for (var i = 0; i < keys.length; i++) if (path === keys[i] || path.slice(-keys[i].length - 1) === "/" + keys[i]) return RSC[keys[i]];
    return null;
  };
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var body = find(String((input && input.url) || input));
    if (body == null) return realFetch(input, init);
    return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "text/x-component" } }));
  };
  self.__LND_LOCATION__ = new URL("/" + location.hash, "https://lnd.local/");
  // O Next deduz o assetPrefix de document.currentScript.src; scripts inline não têm src.
  var getCurrent = Object.getOwnPropertyDescriptor(Document.prototype, "currentScript").get;
  var fakeScript = document.createElement("script");
  fakeScript.src = "https://lnd.local/_next/static/chunks/inline.js";
  Object.defineProperty(document, "currentScript", {
    configurable: true,
    get: function () { var s = getCurrent.call(document); return s && !s.src ? fakeScript : s; },
  });
  // Aberto como arquivo local, o navegador bloqueia trocar o caminho da URL; mantém a navegação interna.
  ["pushState", "replaceState"].forEach(function (m) {
    var orig = history[m].bind(history);
    history[m] = function (state, title, url) {
      try { return orig(state, title, url); } catch (e) { try { return orig(state, title); } catch (e2) {} }
    };
  });
})();`;

const scripts = [
  `<script>${shim}</script>`,
  `<script>${inlineJs(read(runtime))}</script>`,
  ...extras.map((p) => `<script>${inlineJs(read(p))}</script>`),
  ...rest.map((p) => `<script>${inlineJs(read(p))}</script>`),
].join("\n");

const bodyEnd = html.lastIndexOf("</body>");
html = html.slice(0, bodyEnd) + scripts + html.slice(bodyEnd);

writeFileSync(TARGET, html);
console.log(`${TARGET}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
