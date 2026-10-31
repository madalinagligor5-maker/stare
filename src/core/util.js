// Unelte mici folosite peste tot. Nu ating DOM-ul, deci merg și în teste (Node).

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;

let uidCounter = 0;
// Id unic scurt (pentru elemente SVG, obiecte din cameră, rochii salvate).
export function uid(prefix = 'id') {
  uidCounter += 1;
  return `${prefix}${Date.now().toString(36)}${uidCounter.toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

// Copie adâncă a unui obiect simplu (JSON).
export function clone(obj) {
  if (obj === undefined) return undefined;
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

export function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// Completează câmpurile lipsă din `obj` cu valorile din `defaults`.
// Valorile existente rămân; tipurile greșite sunt înlocuite cu cele implicite.
export function deepMerge(defaults, obj) {
  if (!isPlainObject(defaults)) {
    if (obj === undefined || obj === null) return clone(defaults);
    if (Array.isArray(defaults)) return Array.isArray(obj) ? obj : clone(defaults);
    if (typeof defaults !== typeof obj && defaults !== null) return clone(defaults);
    return obj;
  }
  const out = {};
  const src = isPlainObject(obj) ? obj : {};
  for (const key of Object.keys(defaults)) out[key] = deepMerge(defaults[key], src[key]);
  // păstrăm și cheile în plus (ex. obiecte cumpărate noi)
  for (const key of Object.keys(src)) if (!(key in out)) out[key] = src[key];
  return out;
}

// Generator pseudo-aleator cu sămânță (aceeași zi = aceleași misiuni).
export function seededRandom(seed) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(arr, rnd = Math.random) { return arr[Math.floor(rnd() * arr.length)]; }

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Cheia zilei locale, ex. "2026-10-31".
export function dayKey(date = new Date()) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ---- Culori ----
export function hexToRgb(hex) {
  let h = String(hex || '#000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16) || 0;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  const to = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex({ r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 });
}

// Mai închis / mai deschis (pentru contururi și umbre).
export function shade(hex, amount) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, clamp(l + amount, 0, 100));
}

// "Familia" unei culori în cuvinte simple (pentru misiuni: "fă o rochie albastră").
export function colorFamily(hex) {
  const { h, s, l } = hexToHsl(hex);
  if (l > 90) return 'alb';
  if (l < 14) return 'negru';
  if (s < 14) return l > 60 ? 'alb' : 'gri';
  if (h < 12 || h >= 345) return l > 72 ? 'roz' : 'rosu';
  if (h < 40) return l > 75 ? 'roz' : 'portocaliu';
  if (h < 68) return 'galben';
  if (h < 165) return 'verde';
  if (h < 250) return 'albastru';
  if (h < 290) return 'mov';
  return 'roz';
}

export function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}
