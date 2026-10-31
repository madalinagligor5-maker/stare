// Creează "mimi-offline.html": tot jocul într-un singur fișier, care se deschide
// direct cu dublu-clic (fără server). Folosire: node tools/bundle.mjs
// E un mic "bundler" făcut pentru codul acestui joc (importuri/exporturi simple).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map(); // cale relativă -> cod transformat

const IMPORT_RE = /import\s*\{([\s\S]*?)\}\s*from\s*'([^']+)';?/g;
const IMPORT_NS_RE = /import\s*\*\s*as\s+(\w+)\s+from\s*'([^']+)';?/g;

function resolve(from, spec) {
  return path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
}

function load(rel) {
  if (modules.has(rel)) return;
  modules.set(rel, null);
  let code = fs.readFileSync(path.join(root, rel), 'utf8');
  const deps = [];
  code = code.replace(IMPORT_RE, (_, names, spec) => {
    const dep = resolve(rel, spec);
    deps.push(dep);
    const list = names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n.replace(/\s+as\s+/, ': '));
    return `const { ${list.join(', ')} } = __require('${dep}');`;
  });
  code = code.replace(IMPORT_NS_RE, (_, name, spec) => {
    const dep = resolve(rel, spec);
    deps.push(dep);
    return `const ${name} = __require('${dep}');`;
  });
  const exported = [];
  code = code.replace(/export\s+\{([^}]*)\};?/g, (_, names) => {
    names.split(',').map((n) => n.trim()).filter(Boolean).forEach((n) => exported.push(n));
    return '';
  });
  code = code.replace(/export\s+(async\s+function|function|class|const|let)\s+(\w+)/g, (_, kind, name) => {
    exported.push(name);
    return `${kind} ${name}`;
  });
  if (/\bexport\b\s/.test(code.replace(/\/\/.*$/gm, ''))) throw new Error(`Export necunoscut în ${rel}`);
  const body = `${code}\nObject.assign(__exports, { ${exported.join(', ')} });`;
  modules.set(rel, body);
  deps.forEach(load);
}

load('src/main.js');

const runtime = `
const __defs = {}, __cache = {};
function __require(name) {
  if (__cache[name]) return __cache[name];
  const exp = (__cache[name] = {});
  __defs[name](exp);
  return exp;
}
${[...modules].map(([name, body]) => `__defs['${name}'] = function (__exports) {\n${body}\n};`).join('\n')}
__require('src/main.js');
`;

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles/main.css'), 'utf8');
const icon = fs.readFileSync(path.join(root, 'assets/icons/icon.svg'), 'utf8');
html = html
  .replace('<link rel="stylesheet" href="styles/main.css">', () => `<style>\n${css}\n</style>`)
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  .replace(/<link rel="icon"[^>]*>/, () => `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}">`)
  .replace(/<div id="file-warning"[\s\S]*?<\/script>\n/, '')
  .replace('<script type="module" src="src/main.js"></script>', () => `<script>\n(function () {\n'use strict';\n${runtime.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>`);
html = html.replace('<head>', '<head>\n  <!-- Fișier generat automat de tools/bundle.mjs. Nu-l edita de mână. -->');
fs.writeFileSync(path.join(root, 'mimi-offline.html'), html);
console.log(`mimi-offline.html creat (${modules.size} module, ${(html.length / 1024).toFixed(0)} KB).`);
