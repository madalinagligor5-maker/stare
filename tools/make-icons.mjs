// Generează iconițele aplicației (SVG + PNG) din desenul lui Mimi.
// Folosire: node tools/make-icons.mjs   (PNG-urile au nevoie de Playwright)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { renderFigure } from '../src/art/figure.js';
import { defaultLook } from '../src/core/defaults.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets', 'icons');
fs.mkdirSync(out, { recursive: true });

const look = defaultLook();
look.acc.bow = { id: 'fundita-mare', color: '#ff3f9a' };
const fig = renderFigure({ look, kind: 'mimi', expr: 'happy', p: 'ic' });
const icon = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc2e0"/><stop offset="1" stop-color="#c9b6ff"/></linearGradient></defs><rect width="512" height="512" rx="${pad ? 0 : 110}" fill="url(#bg)"/><g transform="translate(256 ${pad ? 300 : 316}) scale(${pad ? 1.55 : 1.95}) translate(-150 -118)">${fig}</g></svg>`;
fs.writeFileSync(path.join(out, 'icon.svg'), icon(false));
fs.writeFileSync(path.join(out, 'icon-maskable.svg'), icon(true));

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('Playwright lipsește: am generat doar SVG-urile.'); process.exit(0); }
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, size, svg] of [['icon-192.png', 192, icon(false)], ['icon-512.png', 512, icon(false)], ['icon-maskable-512.png', 512, icon(true)]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: path.join(out, file), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
console.log('Iconițe gata în assets/icons/');
