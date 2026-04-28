// Generates icons/icon-192.png and icons/icon-512.png from the SVG source.
// Run once: node generate-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./icons/icon.svg');

for (const size of [192, 512]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`./icons/icon-${size}.png`);
  console.log(`icons/icon-${size}.png created`);
}
