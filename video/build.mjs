// Gera video/dist/apresentacao-lnd.html: o player completo num único arquivo
// (CSS, JavaScript, fontes e telas embutidos) — abre em qualquer navegador, sem internet.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const MIME = { jpg: "image/jpeg", png: "image/png", woff2: "font/woff2", mp3: "audio/mpeg" };

async function inlineAssets(text) {
  const refs = [...new Set(text.match(/assets\/[\w./-]+\.(?:jpg|png|woff2|mp3)/g) ?? [])];
  for (const ref of refs) {
    const data = await readFile(path.join(here, ref));
    const uri = `data:${MIME[ref.split(".").pop()]};base64,${data.toString("base64")}`;
    text = text.split(ref).join(uri);
  }
  return text;
}

let html = await readFile(path.join(here, "index.html"), "utf8");
const css = await inlineAssets(await readFile(path.join(here, "video.css"), "utf8"));
const js = await inlineAssets(await readFile(path.join(here, "video.js"), "utf8"));

html = html
  .replace('<link rel="stylesheet" href="video.css" />', () => `<style>\n${css}\n</style>`)
  .replace('<script src="video.js"></script>', () => `<script>\n${js.replace(/<\/script/gi, "<\\/script")}\n</script>`);

const out = path.join(here, "dist", "apresentacao-lnd.html");
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, html);
console.log(`${out}: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
