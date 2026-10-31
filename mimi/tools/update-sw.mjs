// Reface lista de fișiere salvate pentru offline din sw.js și schimbă versiunea cache-ului.
// Rulează după ce adaugi fișiere noi: node tools/update-sw.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function listAppFiles() {
  const out = ['./', 'index.html', 'manifest.webmanifest', 'styles/main.css'];
  const walk = (dir) => {
    for (const f of fs.readdirSync(path.join(root, dir)).sort()) {
      const rel = `${dir}/${f}`;
      if (fs.statSync(path.join(root, rel)).isDirectory()) walk(rel);
      else if (/\.(js|png|svg)$/.test(f)) out.push(rel);
    }
  };
  walk('src');
  walk('assets');
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const swPath = path.join(root, 'sw.js');
  const sw = fs.readFileSync(swPath, 'utf8');
  const files = listAppFiles();
  const list = `const FILES = [\n${files.map((f) => `  '${f}',`).join('\n')}\n];`;
  const version = `const VERSION = 'mimi-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}';`;
  const next = sw.replace(/const FILES = \[[\s\S]*?\];/, list).replace(/const VERSION = '[^']*';/, version);
  fs.writeFileSync(swPath, next);
  console.log(`sw.js actualizat: ${files.length} fișiere.`);
}
