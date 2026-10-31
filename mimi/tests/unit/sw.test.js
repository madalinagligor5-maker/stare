// Jocul trebuie să meargă offline: toate fișierele sunt în lista service worker-ului.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listAppFiles } from '../../tools/update-sw.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('service worker-ul conține toate fișierele jocului', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]);
  for (const f of listAppFiles()) assert.ok(listed.includes(f), `lipsește din sw.js: ${f} (rulează: node tools/update-sw.mjs)`);
  for (const f of listed) if (f !== './') assert.ok(fs.existsSync(path.join(root, f)), `fișier inexistent în sw.js: ${f}`);
});

test('manifestul are iconițe existente', () => {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.display, 'standalone');
  for (const ic of m.icons) assert.ok(fs.existsSync(path.join(root, ic.src)), ic.src);
});

test('fără linkuri externe sau resurse de pe internet în cod', () => {
  const files = listAppFiles().filter((f) => /\.(js|html|css)$/.test(f) || f === 'index.html');
  for (const f of files.concat(['index.html', 'styles/main.css'])) {
    if (f === './') continue;
    const txt = fs.readFileSync(path.join(root, f), 'utf8').replace(/xmlns(:\w+)?="http:\/\/www\.w3\.org\/[^"]+"/g, '').replace(/'http:\/\/www\.w3\.org\/2000\/svg'/g, '');
    assert.ok(!/https?:\/\/(?!localhost)/.test(txt), `link extern în ${f}`);
  }
});
