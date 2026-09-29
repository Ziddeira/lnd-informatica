// Captura as telas reais do site usadas no vídeo de apresentação.
// Uso: com o site rodando (npm run build && npm start), execute:
//   SITE_URL=http://localhost:3000 LND_ADMIN_TOKEN=... node video/capture.mjs
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const SITE = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const TOKEN = process.env.LND_ADMIN_TOKEN || "";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "assets");
const JPG = { type: "jpeg", quality: 84 };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

async function page(viewport, deviceScaleFactor = 1) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor });
  // Sem internet externa no vídeo: mapa e WhatsApp ficam de fora.
  await ctx.route((url) => !url.href.startsWith(SITE), (route) => route.abort());
  return ctx.newPage();
}

const settle = async (p, ms = 1500) => {
  // Percorre a página para disparar animações de entrada e volta ao topo.
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(ms);
};

const shot = (p, name, opts = {}) => p.screenshot({ path: path.join(OUT, `${name}.jpg`), ...JPG, ...opts });
const hideFloating = (p) =>
  p.addStyleTag({ content: `a[aria-label^="Conversar com a LND"]{display:none!important}` });

// 1) Home: hero com o PC 3D (fechado e aberto) + página inteira
{
  const p = await page({ width: 1920, height: 1080 });
  await p.goto(`${SITE}/`, { waitUntil: "domcontentloaded" });
  await hideFloating(p);
  await p.waitForTimeout(9000);
  await shot(p, "home-hero");
  await p.getByRole("button", { name: "Abrir painel" }).click();
  await p.waitForTimeout(3500);
  await shot(p, "home-hero-open");
  await p.close();
}

// 2) Páginas inteiras (largura de notebook) para o efeito de rolagem
for (const [route, name] of [
  ["/", "full-home"],
  ["/empresas/", "full-empresas"],
  ["/servidores/", "full-servidores"],
]) {
  const p = await page({ width: 1440, height: 900 });
  await p.goto(`${SITE}${route}`, { waitUntil: "domcontentloaded" });
  await hideFloating(p);
  await p.waitForTimeout(5000);
  await settle(p);
  await shot(p, name, { fullPage: true });
  await p.close();
}

// 3) Seções específicas
{
  const p = await page({ width: 1920, height: 1080 });
  await p.goto(`${SITE}/empresas/`, { waitUntil: "domcontentloaded" });
  await hideFloating(p);
  await settle(p, 800);
  await p.locator("#planos").screenshot({ path: path.join(OUT, "empresas-planos.jpg"), ...JPG });

  // Formulário preenchido → enviado (protocolo gerado pelo backend)
  const form = p.locator("#proposta form");
  await form.getByLabel("Nome").fill("Mariana Costa");
  await form.getByLabel("WhatsApp / telefone").fill("(48) 99111-2233");
  await form.getByRole("textbox", { name: "Empresa" }).fill("Clínica Bem Viver");
  await form.getByLabel("Colaboradores").selectOption("21-50");
  await form.getByLabel("E-mail (opcional)").fill("ti@clinicabemviver.com.br");
  await form.getByLabel("Mensagem").fill("Temos 30 computadores e um servidor com o sistema da clínica. Queremos contrato mensal com backup.");
  await form.getByRole("checkbox").check();
  await form.screenshot({ path: path.join(OUT, "form-filled.jpg"), ...JPG });
  await form.getByRole("button", { name: /Enviar/ }).click();
  await p.waitForTimeout(1500);
  await p.locator("#proposta [role=status]").screenshot({ path: path.join(OUT, "form-success.jpg"), ...JPG });
  await p.close();
}

// 4) Montador de PC com uma configuração pronta
let quoteUrl = "";
{
  const p = await page({ width: 1920, height: 1080 });
  await p.goto(`${SITE}/monte-seu-pc/`, { waitUntil: "domcontentloaded" });
  await hideFloating(p);
  await p.waitForTimeout(4000);
  await p.getByRole("button", { name: /Equilibrado 1440p/ }).click();
  await p.waitForTimeout(4000);
  await p.evaluate(() => window.scrollTo(0, 360));
  await p.waitForTimeout(1500);
  await shot(p, "builder");
  const saved = await p.evaluate(async () => {
    const selections = JSON.parse(localStorage.getItem("lnd-pc-builder") || "{}").state?.selections ?? {};
    const res = await fetch("/api/orcamentos/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ selections, rgbColor: "#ffaa01" }),
    });
    return res.json();
  });
  quoteUrl = new URL(saved.url).pathname;
  await p.close();
}

// 5) Página do orçamento salvo (link que vai no WhatsApp)
{
  const p = await page({ width: 1920, height: 1080 });
  await p.goto(`${SITE}${quoteUrl}`, { waitUntil: "domcontentloaded" });
  await hideFloating(p);
  await p.waitForTimeout(1500);
  await shot(p, "orcamento");
  await p.close();
}

// 6) Painel administrativo
if (TOKEN) {
  const p = await page({ width: 1920, height: 1080 });
  await p.goto(`${SITE}/admin/`, { waitUntil: "domcontentloaded" });
  await hideFloating(p);
  await p.getByLabel(/Chave de acesso/).fill(TOKEN);
  await p.getByRole("button", { name: "Entrar" }).click();
  await p.waitForTimeout(2000);
  await shot(p, "admin");
  await p.close();
}

// 7) Celular
for (const [route, name] of [
  ["/", "mobile-home"],
  ["/empresas/", "mobile-empresas"],
  ["/monte-seu-pc/", "mobile-builder"],
]) {
  const p = await page({ width: 390, height: 844 }, 2);
  await p.goto(`${SITE}${route}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(6000);
  await shot(p, name);
  await p.close();
}

await browser.close();
console.log(`Telas salvas em ${OUT}`);
