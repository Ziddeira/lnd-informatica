// Trilha sonora original do vídeo, sintetizada do zero (sem amostras de terceiros → sem direitos autorais).
// Os instantes das cenas são lidos de video.js, então a música acompanha o roteiro automaticamente.
//
//   node video/soundtrack.mjs            → video/dist/trilha.wav (44,1 kHz, 16 bits, estéreo)
//
// Estilo: corporate/tech, 110 BPM, progressão Am7 – Fmaj7 – Cadd9 – G6.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 44100;

/* ---------------------------------------------------------------- Roteiro (de video.js) */
const source = await readFile(path.join(here, "video.js"), "utf8");
const OVERLAP = Number(/const OVERLAP = ([\d.]+)/.exec(source)[1]);
const durs = [...source.matchAll(/^\s{6}dur: ([\d.]+),/gm)].map((m) => Number(m[1]));
const starts = [];
let acc = 0;
for (const d of durs) {
  starts.push(acc);
  acc += d - OVERLAP;
}
const DURATION = acc + OVERLAP;
const scene = (i, local = 0) => starts[i] + local;
// Cenas: 0 abertura · 1 números · 2 identidade · 3 home · 4 empresas · 5 servidores · 6 gamer · 7 backend · 8 mobile · 9 fechamento

const N = Math.ceil(DURATION * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const revL = new Float32Array(N); // envio para o reverb
const revR = new Float32Array(N);
const duck = new Float32Array(N).fill(1); // sidechain do bumbo

/* ---------------------------------------------------------------- Utilidades */
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seed = 0x1a2b3c4d;
const rand = () => {
  // mulberry32 — ruído determinístico (a trilha sai sempre igual)
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;

function table(harmonics) {
  const size = 4096;
  const t = new Float32Array(size + 1);
  for (let i = 0; i <= size; i++) {
    const ph = (i / size) * Math.PI * 2;
    let v = 0;
    for (const [n, a] of harmonics) v += a * Math.sin(n * ph);
    t[i] = v;
  }
  let peak = 0;
  for (const v of t) peak = Math.max(peak, Math.abs(v));
  for (let i = 0; i <= size; i++) t[i] /= peak;
  return t;
}
const SAW = table(Array.from({ length: 14 }, (_, i) => [i + 1, 1 / (i + 1)]));
const SOFT = table([
  [1, 1],
  [2, 0.35],
  [3, 0.18],
  [4, 0.08],
]);
const BELL = table([
  [1, 1],
  [2, 0.5],
  [3, 0.12],
  [5, 0.06],
]);
const osc = (tab, phase) => {
  const x = (phase - Math.floor(phase)) * 4096;
  const i = x | 0;
  return tab[i] + (tab[i + 1] - tab[i]) * (x - i);
};

function add(i, l, r, send = 0) {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
  if (send) {
    revL[i] += l * send;
    revR[i] += r * send;
  }
}

/** Biquad RBJ (lowpass/highpass/bandpass) com coeficientes atualizáveis. */
function biquad() {
  let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return {
    set(type, freq, q = 0.707) {
      const w = (2 * Math.PI * Math.min(freq, SR * 0.45)) / SR;
      const cos = Math.cos(w);
      const alpha = Math.sin(w) / (2 * q);
      const a0 = 1 + alpha;
      if (type === "lp") [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
      else if (type === "hp") [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
      else [b0, b1, b2] = [alpha, 0, -alpha];
      b0 /= a0; b1 /= a0; b2 /= a0;
      a1 = (-2 * cos) / a0;
      a2 = (1 - alpha) / a0;
    },
    run(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    },
  };
}

/* ---------------------------------------------------------------- Harmonia e grade */
const BPM = 110;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [
  { pad: [57, 60, 64, 67], bass: 45 }, // Am7
  { pad: [53, 57, 60, 64], bass: 41 }, // Fmaj7
  { pad: [55, 60, 62, 64], bass: 48 }, // Cadd9
  { pad: [55, 59, 62, 64], bass: 43 }, // G6
];
const chordAt = (t) => CHORDS[Math.floor(t / (BAR * 2)) % CHORDS.length];
const bars = Math.ceil(DURATION / BAR);

// Seções em compassos, alinhadas às cenas
const barOf = (t) => Math.round(t / BAR);
const DROP = barOf(scene(3)); // entra a batida no tour da home
const BREAK_START = barOf(scene(7)) - 1; // respiro no capítulo do backend
const BREAK_END = BREAK_START + 2;
const FINAL_HIT = scene(9, 5.8); // logo final
const GROOVE_END = FINAL_HIT - 3;

/* ---------------------------------------------------------------- Instrumentos */
function pad(t0, dur, notes, gain = 0.05) {
  const attack = 1.2;
  const release = 1.6;
  const lp = [biquad(), biquad()];
  lp.forEach((f) => f.set("lp", 1300, 0.6));
  const start = Math.floor(t0 * SR);
  const len = Math.floor((dur + release) * SR);
  const voices = notes.flatMap((m, k) => [
    { f: mtof(m) * Math.pow(2, 7 / 1200), ph: rand(), pan: 0.25 + k * 0.1 },
    { f: mtof(m) * Math.pow(2, -7 / 1200), ph: rand(), pan: 0.75 - k * 0.1 },
  ]);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    const env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
    let l = 0;
    let r = 0;
    for (const v of voices) {
      const s = osc(SAW, v.ph);
      v.ph += v.f / SR;
      l += s * (1 - v.pan);
      r += s * v.pan;
    }
    const i = start + n;
    if (i >= N) break;
    const g = gain * env * duck[i] ** 0.6;
    add(i, lp[0].run(l) * g, lp[1].run(r) * g, 0.55);
  }
}

function bassNote(t0, dur, midi, gain = 0.33) {
  const f = mtof(midi);
  const lp = biquad();
  lp.set("lp", 420, 0.9);
  let ph = 0;
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / (dur * 0.9)) * (n > len - 200 ? (len - n) / 200 : 1);
    const s = lp.run(osc(SOFT, ph) * 0.8 + Math.sin(ph * Math.PI * 2) * 0.6);
    ph += f / SR;
    const i = start + n;
    if (i >= N) break;
    const v = s * env * gain * duck[i];
    add(i, v, v);
  }
}

/** Pluck do arpejo com delay pingue-pongue. */
function pluck(t0, midi, gain, pan, bright = 2400) {
  const f = mtof(midi);
  const lp = biquad();
  let ph = rand();
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.45 * SR);
  const DELAY = Math.floor(BEAT * 0.75 * SR);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    if (n % 32 === 0) lp.set("lp", 300 + bright * Math.exp(-t / 0.08), 1.2);
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.11);
    const s = lp.run(osc(SAW, ph)) * env * gain;
    ph += f / SR;
    const i = start + n;
    const d = duck[Math.min(i, N - 1)] ** 0.5;
    add(i, s * (1 - pan) * d, s * pan * d, 0.3);
    // ecos alternando lados
    add(i + DELAY, s * 0.32 * pan, s * 0.32 * (1 - pan), 0.3);
    add(i + DELAY * 2, s * 0.14 * (1 - pan), s * 0.14 * pan, 0.3);
  }
}

function bell(t0, midi, gain = 0.1, pan = 0.5, decay = 0.9) {
  const f = mtof(midi);
  let ph = 0;
  let ph2 = 0;
  const start = Math.floor(t0 * SR);
  const len = Math.floor(decay * 3 * SR);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t / decay);
    const s = (osc(BELL, ph) + Math.sin(ph2 * Math.PI * 2) * 0.25 * Math.exp(-t / 0.15)) * env * gain;
    ph += f / SR;
    ph2 += (f * 3.01) / SR;
    add(start + n, s * (1 - pan), s * pan, 0.5);
  }
}

function kick(t0, gain = 0.72) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.45 * SR);
  let ph = 0;
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    const f = 44 + 110 * Math.exp(-t / 0.035);
    ph += f / SR;
    const env = Math.exp(-t / 0.22) * Math.min(1, t / 0.002);
    const click = n < 90 ? noise() * 0.25 * (1 - n / 90) : 0;
    const s = (Math.sin(ph * Math.PI * 2) * env + click) * gain;
    add(start + n, s, s);
  }
  // sidechain: abaixa pad/baixo/arpejo logo após o bumbo
  for (let n = 0; n < Math.floor(0.3 * SR); n++) {
    const i = start + n;
    if (i >= N) break;
    duck[i] = Math.min(duck[i], 1 - 0.55 * Math.exp(-n / SR / 0.09));
  }
}

function clap(t0, gain = 0.2) {
  const bp = biquad();
  bp.set("bp", 1500, 0.9);
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.25 * SR);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    // três ataques rápidos + cauda
    const env = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) / 0.012) : 0), 0) * 0.5 + Math.exp(-t / 0.09);
    const s = bp.run(noise()) * env * gain;
    add(start + n, s * 0.9, s, 0.35);
  }
}

function hat(t0, gain = 0.06, open = false, pan = 0.6) {
  const hp = biquad();
  hp.set("hp", 7500, 0.8);
  const start = Math.floor(t0 * SR);
  const decay = open ? 0.12 : 0.03;
  const len = Math.floor(decay * 5 * SR);
  for (let n = 0; n < len; n++) {
    const s = hp.run(noise()) * Math.exp(-n / SR / decay) * gain;
    add(start + n, s * (1 - pan), s * pan);
  }
}

/** Whoosh de transição: ruído com filtro passa-banda varrendo para cima e para baixo. */
function whoosh(tCenter, gain = 0.22, dur = 1.0) {
  const bpL = biquad();
  const bpR = biquad();
  const t0 = tCenter - dur * 0.6;
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  for (let n = 0; n < len; n++) {
    const p = n / len;
    if (n % 32 === 0) {
      const f = 350 + 3600 * Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 2;
      bpL.set("bp", f, 1.4);
      bpR.set("bp", f * 1.08, 1.4);
    }
    const env = Math.sin(Math.PI * p) ** 2;
    const pan = 0.2 + 0.6 * p; // atravessa da esquerda para a direita
    add(start + n, bpL.run(noise()) * env * gain * (1.2 - pan), bpR.run(noise()) * env * gain * (0.4 + pan), 0.4);
  }
}

function riser(tEnd, dur, gain = 0.2) {
  const bp = biquad();
  const start = Math.floor((tEnd - dur) * SR);
  const len = Math.floor(dur * SR);
  let ph = 0;
  for (let n = 0; n < len; n++) {
    const p = n / len;
    if (n % 32 === 0) bp.set("bp", 400 + 5000 * p * p, 2);
    const env = p ** 2.2;
    ph += (180 + 700 * p * p) / SR;
    const s = (bp.run(noise()) * 0.8 + Math.sin(ph * Math.PI * 2) * 0.12) * env * gain;
    add(start + n, s, s, 0.5);
  }
}

function impact(t0, gain = 0.8) {
  const lp = biquad();
  lp.set("lp", 3500, 0.7);
  const start = Math.floor(t0 * SR);
  const len = Math.floor(3.2 * SR);
  let ph = 0;
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    ph += (38 + 60 * Math.exp(-t / 0.08)) / SR;
    const boom = Math.sin(ph * Math.PI * 2) * Math.exp(-t / 0.9);
    const crash = lp.run(noise()) * Math.exp(-t / 0.7) * 0.35;
    const s = (boom + crash) * gain * Math.min(1, t / 0.003);
    add(start + n, s, s * 0.97, 0.45);
  }
}

/** Blip de interface (cartões, bolhas do chat). */
function blip(t0, midi = 84, gain = 0.07, pan = 0.5) {
  const f = mtof(midi);
  let ph = 0;
  const start = Math.floor(t0 * SR);
  const len = Math.floor(0.18 * SR);
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    ph += (f * (1 + 0.5 * Math.exp(-t / 0.01))) / SR;
    const s = Math.sin(ph * Math.PI * 2) * Math.exp(-t / 0.045) * gain;
    add(start + n, s * (1 - pan), s * pan, 0.25);
  }
}

/* ---------------------------------------------------------------- Arranjo */
// Pad o vídeo inteiro (mais aberto na abertura e no fim)
for (let b = 0; b < bars; b += 2) {
  const t = b * BAR;
  if (t > DURATION) break;
  const inBreak = b >= BREAK_START && b < BREAK_END;
  const quiet = b < 3 || t > FINAL_HIT || inBreak ? 0.065 : 0.052;
  pad(t, BAR * 2, chordAt(t).pad, quiet);
}

// Bumbo, baixo, percussão e arpejo por compasso
for (let b = 0; b < bars; b++) {
  const t = b * BAR;
  if (t >= GROOVE_END + BAR) break;
  const chord = chordAt(t + 0.01);
  const breakdown = b >= BREAK_START && b < BREAK_END;
  const main = b >= DROP && !breakdown && t < GROOVE_END;
  const build = b >= 3 && b < DROP;

  for (let beat = 0; beat < 4; beat++) {
    const tb = t + beat * BEAT;
    if (tb >= GROOVE_END) break;
    if (main) {
      kick(tb);
      if (beat % 2 === 1) clap(tb);
      bassNote(tb + BEAT / 2, BEAT * 0.45, chord.bass + 12, 0.18);
      bassNote(tb, BEAT * 0.45, chord.bass, 0.25);
      hat(tb + BEAT / 2, 0.07, beat === 3, 0.65);
      hat(tb + BEAT / 4, 0.03, false, 0.4);
      hat(tb + (BEAT * 3) / 4, 0.03, false, 0.4);
    } else if (breakdown) {
      if (beat === 0) bassNote(tb, BAR * 0.95, chord.bass, 0.2);
      hat(tb + BEAT / 2, 0.045, false, 0.65);
    } else if (build) {
      if (beat === 0) bassNote(tb, BAR * 0.9, chord.bass, 0.18);
      if (b >= DROP - 4) hat(tb + BEAT / 2, 0.05, false, 0.65);
      if (b >= DROP - 2 && beat % 2 === 0) kick(tb, 0.45);
    }
  }

  // Arpejo: colcheias na construção, semicolcheias no groove
  if ((build && b >= 4) || main || breakdown) {
    const tones = [...chord.pad.map((m) => m + 12), chord.pad[1] + 24];
    const pattern = [0, 2, 1, 3, 4, 3, 1, 2];
    const step = main ? BEAT / 4 : BEAT / 2;
    const count = main ? 16 : 8;
    for (let k = 0; k < count; k++) {
      const tk = t + k * step;
      if (tk >= GROOVE_END) break;
      pluck(tk, tones[pattern[k % 8]], main ? 0.068 : 0.055, k % 2 ? 0.35 : 0.65, main ? 2800 : 1600);
    }
  }
}

// Melodia (sino) na segunda metade do groove, depois do respiro
const MELODY = [0, 2, 3, 2, 1, 0]; // índices nos tons do acorde
for (let b = BREAK_END; b < barOf(GROOVE_END) - 1; b += 2) {
  const t = b * BAR;
  const chord = chordAt(t + 0.01);
  const tones = chord.pad.map((m) => m + 12);
  [0, 1.5, 2, 3, 4.5, 5].forEach((beatPos, k) => bell(t + beatPos * BEAT, tones[MELODY[k]], 0.07, 0.4 + 0.2 * (k % 2), 0.6));
}

// Respiro do backend: sobe um riser e volta a batida
riser(BREAK_END * BAR, BAR * 2, 0.16);
riser(DROP * BAR, BAR * 2, 0.18);

// Abertura: brilho enquanto a logo é desenhada e impacto quando fica completa
[76, 79, 83, 88].forEach((m, k) => bell(scene(0, 0.35 + k * 0.42), m, 0.05, 0.3 + k * 0.13, 1.4));
impact(scene(0, 2.0), 0.55);
bell(scene(0, 2.0), 81, 0.09, 0.5, 2.2);
bell(scene(0, 2.0), 88, 0.05, 0.5, 2.2);

// Whoosh a cada troca de cena
for (let i = 1; i < starts.length; i++) whoosh(starts[i] + 0.25, 0.2);

// Blips de interface sincronizados com o roteiro
[1.1, 1.3, 1.5, 1.7].forEach((o, k) => blip(scene(1, o), 79 + k * 2, 0.06, 0.3 + k * 0.13)); // cartões de números
[1.0, 1.35, 1.7, 2.05].forEach((o, k) => blip(scene(7, o), 76 + k * 3, 0.06, 0.3 + k * 0.13)); // nós do backend
[7.1, 7.6, 8.3].forEach((o) => blip(scene(6, o), 88, 0.05, 0.7)); // bolhas do WhatsApp
blip(scene(3, 3.1), 72, 0.08, 0.6); // clique no PC 3D
blip(scene(6, 4.0), 91, 0.05, 0.7); // preço completo

// Final: riser até a logo, impacto e acorde longo
riser(FINAL_HIT, 3, 0.22);
impact(FINAL_HIT, 0.75);
[69, 76, 81, 84].forEach((m, k) => bell(FINAL_HIT + k * 0.03, m, 0.06, 0.35 + k * 0.1, 2.4));

/* ---------------------------------------------------------------- Reverb (Freeverb simplificado) */
function reverb(input, combs, allpasses, feedback = 0.8, damp = 0.3) {
  const out = new Float32Array(N);
  for (const size of combs) {
    const buf = new Float32Array(size);
    let idx = 0;
    let store = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      store = y * (1 - damp) + store * damp;
      buf[idx] = input[i] + store * feedback;
      out[i] += y;
      idx = (idx + 1) % size;
    }
  }
  for (const size of allpasses) {
    const buf = new Float32Array(size);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[idx];
      const y = -out[i] + b;
      buf[idx] = out[i] + b * 0.5;
      out[i] = y;
      idx = (idx + 1) % size;
    }
  }
  return out;
}
const wetL = reverb(revL, [1557, 1617, 1491, 1422], [556, 441]);
const wetR = reverb(revR, [1580, 1640, 1514, 1445], [579, 464]);
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 0.045;
  R[i] += wetR[i] * 0.045;
}

/* ---------------------------------------------------------------- Master */
// Pico final — calibrado para ~-14 LUFS integrados (padrão de YouTube/Instagram), deixando espaço para narração.
const TARGET_PEAK = 0.7;
const hpL = biquad();
const hpR = biquad();
hpL.set("hp", 28);
hpR.set("hp", 28);
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(hpL.run(L[i]) * 1.1);
  R[i] = Math.tanh(hpR.run(R[i]) * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = TARGET_PEAK / peak;
const fadeOut = 2.5 * SR;
for (let i = 0; i < N; i++) {
  let g = norm * Math.min(1, i / (0.02 * SR));
  if (i > N - fadeOut) g *= (N - i) / fadeOut;
  L[i] *= g;
  R[i] *= g;
}

/* ---------------------------------------------------------------- WAV */
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const out = path.resolve(process.argv[2] ?? path.join(here, "dist", "trilha.wav"));
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, Buffer.concat([header, data]));
console.log(`${out}: ${DURATION.toFixed(2)}s · drop no compasso ${DROP} · final em ${FINAL_HIT.toFixed(2)}s`);
