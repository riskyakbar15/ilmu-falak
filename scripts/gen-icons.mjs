import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(dir, "icon.svg"));
const BG = "#0b1020";

async function render(size, file) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .flatten({ background: BG })
    .png()
    .toFile(join(dir, file));
}

async function renderMaskable(size, file) {
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  await sharp(svg, { density: 384 })
    .resize(inner, inner)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BG })
    .flatten({ background: BG })
    .png()
    .toFile(join(dir, file));
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(180, "apple-touch-icon.png");
await renderMaskable(512, "maskable-512.png");
console.log("Ikon dibuat ulang.");
