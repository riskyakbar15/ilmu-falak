import sharp from "sharp";
import { readFile } from "node:fs/promises";

const svg = await readFile(new URL("../public/icon.svg", import.meta.url));
const green = "#059669";

// Ikon transparan (sudut membulat) untuk favicon & manifest "any".
await sharp(svg).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(svg).resize(512, 512).png().toFile("public/icon-512.png");

// Maskable & apple-touch: latar penuh (tanpa transparansi) agar aman di semua peluncur.
await sharp(svg)
  .resize(512, 512)
  .flatten({ background: green })
  .png()
  .toFile("public/maskable-512.png");
await sharp(svg)
  .resize(180, 180)
  .flatten({ background: green })
  .png()
  .toFile("public/apple-touch-icon.png");

console.log("Ikon PWA dibuat.");
