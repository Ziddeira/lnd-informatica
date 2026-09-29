// Build estático (HTML puro em /out), sem backend: formulários vão direto para o WhatsApp.
// Usa webpack porque o empacotador de arquivo único (build-single-html.mjs) depende do formato dos chunks dele.
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build", "--webpack"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, LND_STATIC_EXPORT: "1" },
});
process.exit(result.status ?? 1);
