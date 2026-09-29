// Renderiza o vídeo quadro a quadro (1920×1080) com Playwright e codifica em MP4 (H.264) com ffmpeg.
//
//   node video/render.mjs                               → video/dist/apresentacao-lnd.mp4
//   node video/render.mjs --audio trilha.mp3            → com outra trilha (padrão: dist/trilha.wav, se existir)
//   node video/render.mjs --stills 3,20,45 --out-dir x  → só quadros PNG para revisão
//
// Requer ffmpeg no PATH (ou FFMPEG=/caminho/ffmpeg) e o Chromium do Playwright (npx playwright install chromium).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(" ")
    .split(/\s*--/)
    .filter(Boolean)
    .map((pair) => {
      const [key, ...rest] = pair.split(/\s+/);
      return [key, rest.join(" ") || "1"];
    }),
);

const src = path.resolve(args.src ?? path.join(here, "index.html"));
const fps = Number(args.fps ?? 30);
const out = path.resolve(args.out ?? path.join(here, "dist", "apresentacao-lnd.mp4"));
const ffmpegBin = process.env.FFMPEG || "ffmpeg";
// Usa a trilha gerada por soundtrack.mjs automaticamente, se existir (--audio outro.mp3 para trocar, --audio none para mudo).
const defaultTrack = path.join(here, "dist", "trilha.wav");
if (!args.audio && existsSync(defaultTrack)) args.audio = defaultTrack;
if (args.audio === "none") delete args.audio;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("[página]", e.message));
await page.goto(`${pathToFileURL(src).href}?render`);
await page.evaluate(() => window.__video.ready);
const duration = await page.evaluate(() => window.__video.duration);

const renderAt = (t) => page.evaluate((time) => window.__video.renderAt(time), t);

if (args.stills) {
  const dir = path.resolve(args["out-dir"] ?? path.join(here, "dist", "stills"));
  await mkdir(dir, { recursive: true });
  for (const t of args.stills.split(",").map(Number)) {
    await renderAt(t);
    const file = path.join(dir, `frame-${String(t).replace(".", "_")}s.png`);
    await page.screenshot({ path: file });
    console.log(file);
  }
  await browser.close();
  process.exit(0);
}

await mkdir(path.dirname(out), { recursive: true });
const total = Math.ceil(duration * fps);
const ffArgs = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-"];
if (args.audio) ffArgs.push("-i", path.resolve(args.audio), "-c:a", "aac", "-b:a", "192k", "-shortest");
ffArgs.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(fps), "-movflags", "+faststart", out);

const ffmpeg = spawn(ffmpegBin, ffArgs, { stdio: ["pipe", "inherit", "inherit"] });
const finished = new Promise((resolve, reject) => {
  ffmpeg.on("error", reject);
  ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg saiu com código ${code}`))));
});

const started = Date.now();
for (let i = 0; i < total; i++) {
  await renderAt(i / fps);
  const frame = await page.screenshot({ type: "jpeg", quality: 95 });
  if (!ffmpeg.stdin.write(frame)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
  if (i % (fps * 5) === 0) {
    const pct = ((i / total) * 100).toFixed(0);
    console.log(`${pct}% · quadro ${i}/${total} · ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
}
ffmpeg.stdin.end();
await finished;
await browser.close();
console.log(`Vídeo salvo em ${out} (${duration.toFixed(1)}s, ${total} quadros)`);
