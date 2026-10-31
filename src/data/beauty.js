// Catalogul salonului: coafuri, decor de păr, machiaj, modele de unghii, accesorii.
// Coafurile au două straturi: `back` (în spatele capului) și `front` (peste frunte).
// f = umplerea (culoarea/degradeul părului).

import { mirrorPath, MOTIFS, starPoints, heartPath, sparkle } from '../art/svg.js';

const CAP = 'M62 108 C 56 60 96 30 150 30 C 204 30 244 60 238 108 C 226 92 214 84 200 82 C 196 70 184 62 172 66 C 160 56 140 56 128 66 C 116 62 104 70 100 82 C 86 84 74 92 62 108 Z';
const SLEEK = 'M62 108 C 56 56 100 30 150 30 C 200 30 244 56 238 108 C 220 80 190 64 150 64 C 110 64 80 80 62 108 Z';
const P = (d, f, extra = '') => `<path d="${d}" fill="${f}" stroke="rgba(0,0,0,.15)" stroke-width="2" ${extra}/>`;
const shine = '<path d="M96 56 Q 120 40 150 38" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>';
const chain = (pts, f, rx = 13, ry = 10) => pts.map(([x, y, a = 0]) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${f}" stroke="rgba(0,0,0,.15)" stroke-width="2"/>`).join('');

export const HAIRSTYLES = [
  { id: 'mot', name: 'Moț', back: () => '', front: (f) => P(CAP, f) + P('M138 36 C 126 14 140 2 150 12 C 152 -2 170 2 164 18 C 178 12 186 26 170 36 Z', f) + shine },
  { id: 'liber', name: 'Păr lung', back: (f) => P('M64 100 C 44 150 44 220 64 268 C 84 262 100 252 108 236 C 120 228 180 228 192 236 C 200 252 216 262 236 268 C 256 220 256 150 236 100 Z', f), front: (f) => P(CAP, f) + shine },
  { id: 'breton', name: 'Breton', back: (f) => P('M62 100 C 46 140 50 180 70 196 C 100 202 200 202 230 196 C 250 180 254 140 238 100 Z', f), front: (f) => P('M60 112 C 54 60 96 28 150 28 C 204 28 246 60 240 112 C 236 104 232 98 226 96 L 214 99 L 204 94 L 192 99 L 180 94 L 168 99 L 156 94 L 144 99 L 132 94 L 120 99 L 108 94 L 96 99 L 84 96 C 72 98 64 104 60 112 Z', f) + shine },
  {
    id: 'cozi', name: 'Cozi',
    back: (f) => { const d = 'M66 92 C 30 100 18 150 30 204 C 36 214 48 210 46 198 C 44 160 52 124 78 106 Z'; return P(d, f) + P(mirrorPath(d), f); },
    front: (f) => P(CAP, f) + '<circle cx="70" cy="98" r="8" fill="#ff5fa2"/><circle cx="230" cy="98" r="8" fill="#ff5fa2"/>' + shine,
  },
  {
    id: 'codite', name: 'Codițe',
    back: (f) => { const L = []; for (let i = 0; i < 9; i++) L.push([72 - i * 0.8 + (i % 2 ? 5 : -5), 118 + i * 16, i % 2 ? 20 : -20]); const R = L.map(([x, y, a]) => [300 - x, y, -a]); return chain(L, f) + chain(R, f) + '<circle cx="64" cy="262" r="6" fill="#ff5fa2"/><circle cx="236" cy="262" r="6" fill="#ff5fa2"/>'; },
    front: (f) => P(SLEEK, f) + '<path d="M150 32 L 150 64" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' + shine,
  },
  {
    id: 'bucle', name: 'Bucle',
    back: (f) => { const pts = [[60, 110], [48, 142], [46, 174], [52, 206], [66, 234], [86, 252]]; return pts.concat(pts.map(([x, y]) => [300 - x, y])).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="23" fill="${f}" stroke="rgba(0,0,0,.15)" stroke-width="2"/><path d="M${x - 8} ${y} q 8 -10 14 2" stroke="rgba(0,0,0,.12)" stroke-width="2" fill="none"/>`).join(''); },
    front: (f) => P(SLEEK, f) + [[78, 82], [102, 68], [126, 62], [150, 60], [174, 62], [198, 68], [222, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="${f}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`).join('') + shine,
  },
  { id: 'coc', name: 'Coc', back: () => '', front: (f) => `<circle cx="150" cy="24" r="28" fill="${f}" stroke="rgba(0,0,0,.15)" stroke-width="2"/><path d="M134 22 q 16 -18 30 0 q -12 12 -22 2" stroke="rgba(0,0,0,.15)" stroke-width="2" fill="none"/>` + P(SLEEK, f) + shine },
  {
    id: 'coada', name: 'Coadă de cal',
    back: (f) => P('M200 50 C 262 40 292 110 272 192 C 268 204 252 200 254 188 C 264 132 248 92 206 72 Z', f),
    front: (f) => P(SLEEK, f) + '<circle cx="206" cy="58" r="8" fill="#ff5fa2"/>' + shine,
  },
  { id: 'coc-dublu', name: 'Două cocuri', back: () => '', front: (f) => `<circle cx="122" cy="22" r="21" fill="${f}" stroke="rgba(0,0,0,.15)" stroke-width="2"/><circle cx="178" cy="22" r="21" fill="${f}" stroke="rgba(0,0,0,.15)" stroke-width="2"/>` + P(CAP, f) + shine },
  { id: 'bob', name: 'Bob scurt', back: (f) => P('M62 100 C 46 140 50 180 70 196 C 100 202 200 202 230 196 C 250 180 254 140 238 100 Z', f), front: (f) => P('M60 112 C 52 60 96 28 150 28 C 204 28 248 60 240 112 C 220 88 190 74 150 80 C 120 70 90 80 60 112 Z', f) + shine },
  { id: 'valuri', name: 'Valuri lungi', back: (f) => P('M64 100 C 40 140 62 170 46 200 C 32 230 60 260 50 298 C 80 302 100 282 110 252 L 190 252 C 200 282 220 302 250 298 C 240 260 268 230 254 200 C 238 170 260 140 236 100 Z', f), front: (f) => P(CAP, f) + shine },
  {
    id: 'coroana-impletita', name: 'Coroniță împletită', back: () => '',
    front: (f) => { const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.08 + i * 0.07); pts.push([150 + 82 * Math.cos(a), 112 + 74 * Math.sin(a), (a * 180) / Math.PI + 90]); } return P(SLEEK, f) + chain(pts, f, 12, 9) + shine; },
  },
];

// Decor de păr ("împletituri decorative"): se pune peste orice coafură.
export const HAIR_DECOR = [
  { id: 'none', name: 'Fără', icon: '🚫', draw: () => '' },
  { id: 'margele', name: 'Mărgele', icon: '📿', draw: (c) => [[72, 100], [66, 116], [228, 100], [234, 116], [112, 60], [188, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="#fff" stroke-width="1.5"/>`).join('') },
  { id: 'panglica', name: 'Panglică', icon: '🎀', draw: (c) => `<path d="M70 96 Q 110 40 150 44 Q 190 40 230 96" stroke="${c}" stroke-width="6" fill="none" stroke-dasharray="12 7" stroke-linecap="round"/>` },
  { id: 'flori', name: 'Flori mici', icon: '🌼', draw: (c) => [[96, 66, 0.8], [124, 52, 0.6], [206, 70, 0.8]].map(([x, y, k]) => `<g transform="translate(${x} ${y}) scale(${k})">${MOTIFS.floare(c)}</g>`).join('') },
  { id: 'sclipici', name: 'Sclipici', icon: '✨', draw: (c) => [[100, 60, 6], [140, 44, 5], [180, 50, 7], [214, 74, 5], [80, 84, 4]].map(([x, y, r], i) => sparkle(x, y, r, c, `class="twinkle" style="animation-delay:${i * 0.25}s"`)).join('') },
  { id: 'suvite', name: 'Șuvițe colorate', icon: '🌈', draw: (c) => `<path d="M112 70 Q 104 50 120 36" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/><path d="M190 72 Q 198 52 182 38" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>` },
];

export const LASH_STYLES = [
  { id: 'naturale', name: 'Naturale', n: 3, len: 7, curl: 0 },
  { id: 'lungi', name: 'Lungi', n: 4, len: 11, curl: 2 },
  { id: 'bogate', name: 'Bogate', n: 5, len: 12, curl: 4 },
  { id: 'bucle', name: 'Ondulate', n: 4, len: 13, curl: 7 },
];

export const MAKEUP_PARTS = [
  { id: 'shadow', name: 'Pleoape', icon: '👁️' },
  { id: 'lashes', name: 'Gene', icon: '✨' },
  { id: 'lips', name: 'Ruj', icon: '💋' },
  { id: 'blush', name: 'Bujori', icon: '🌸' },
  { id: 'glitter', name: 'Sclipici', icon: '💫' },
];

export const NAIL_PATTERNS = [
  { id: 'simplu', name: 'Simplu', icon: '💅' },
  { id: 'buline', name: 'Buline', icon: '⚪' },
  { id: 'linii', name: 'Linii', icon: '〰️' },
  { id: 'stele', name: 'Stele', icon: '⭐' },
  { id: 'inimioare', name: 'Inimioare', icon: '💗' },
  { id: 'degrade', name: 'Degrade', icon: '🌅' },
];

// Accesoriile salonului (look.acc). Coordonate pe capul lui Angy.
export const LOOK_SLOTS = [
  { id: 'bow', name: 'Fundițe', icon: '🎀' },
  { id: 'crown', name: 'Coronițe', icon: '👑' },
  { id: 'glasses', name: 'Ochelari', icon: '👓' },
  { id: 'earrings', name: 'Cercei', icon: '💎' },
  { id: 'scarf', name: 'Eșarfe', icon: '🧣' },
];

const bowShape = (x, y, k, c, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M0 0 C -16 -18 -32 -10 -28 4 C -24 16 -10 10 0 0 Z M0 0 C 16 -18 32 -10 28 4 C 24 16 10 10 0 0 Z" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/><circle r="6" fill="${c}" stroke="rgba(0,0,0,.25)"/></g>`;
const ring = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="4"/>`;

export const LOOK_ACC = [
  { id: 'fundita-mare', slot: 'bow', name: 'Fundiță mare', draw: (c) => bowShape(214, 62, 1.1, c, 15) },
  { id: 'fundite-duble', slot: 'bow', name: 'Fundițe duble', draw: (c) => bowShape(82, 88, 0.6, c, -20) + bowShape(218, 88, 0.6, c, 20) },
  { id: 'fundita-buline', slot: 'bow', name: 'Fundiță cu buline', draw: (c) => bowShape(214, 62, 1.1, c, 15) + '<g fill="#fff"><circle cx="196" cy="54" r="3"/><circle cx="206" cy="66" r="2.5"/><circle cx="230" cy="62" r="3"/><circle cx="224" cy="74" r="2.5"/></g>' },
  { id: 'bentita', slot: 'bow', name: 'Bentiță', draw: (c) => `<path d="M66 98 C 70 36 230 36 234 98" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>` + bowShape(184, 44, 0.55, c, 10) },
  { id: 'coronita-flori', slot: 'crown', name: 'Coroniță de flori', draw: (c) => { let s = ''; for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.12 + i * 0.095); const x = 150 + 84 * Math.cos(a), y = 106 + 70 * Math.sin(a); s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(.75)">${MOTIFS.floare(i % 2 ? c : '#fff')}</g>`; } return s; } },
  { id: 'tiara-mica', slot: 'crown', name: 'Tiară', draw: (c) => `<path d="M110 50 Q 150 30 190 50" stroke="#e6c35c" stroke-width="4" fill="none"/><path d="M128 46 L 136 30 L 144 42 L 150 24 L 156 42 L 164 30 L 172 46 Z" fill="${c}" stroke="#b8860b" stroke-width="1.5"/><circle cx="150" cy="38" r="3.5" fill="#fff"/>` },
  { id: 'coronita-stele', slot: 'crown', name: 'Coroniță cu stele', draw: (c) => `<path d="M80 80 Q 150 20 220 80" stroke="#e6c35c" stroke-width="3" fill="none"/>` + [[96, 62], [122, 46], [150, 40], [178, 46], [204, 62]].map(([x, y]) => `<polygon points="${starPoints(x, y, 8, 3.5)}" fill="${c}" stroke="rgba(0,0,0,.2)"/>`).join('') },
  { id: 'ochelari-rotunzi', slot: 'glasses', name: 'Rotunzi', draw: (c) => ring(114, 128, 27, c) + ring(186, 128, 27, c) + `<path d="M141 126 Q 150 120 159 126" stroke="${c}" stroke-width="4" fill="none"/>` },
  { id: 'ochelari-inima', slot: 'glasses', name: 'Inimioare', draw: (c) => `<path d="${heartPath(114, 128, 3.2)}" fill="rgba(255,150,200,.25)" stroke="${c}" stroke-width="4"/><path d="${heartPath(186, 128, 3.2)}" fill="rgba(255,150,200,.25)" stroke="${c}" stroke-width="4"/><path d="M144 122 L 156 122" stroke="${c}" stroke-width="4"/>` },
  { id: 'ochelari-stea', slot: 'glasses', name: 'Steluțe', draw: (c) => `<polygon points="${starPoints(114, 130, 32, 17)}" fill="rgba(255,240,150,.25)" stroke="${c}" stroke-width="4"/><polygon points="${starPoints(186, 130, 32, 17)}" fill="rgba(255,240,150,.25)" stroke="${c}" stroke-width="4"/>` },
  { id: 'ochelari-soare', slot: 'glasses', name: 'De soare', draw: (c) => `<rect x="86" y="108" width="56" height="40" rx="16" fill="${c}" opacity=".85" stroke="#2d2a3a" stroke-width="3"/><rect x="158" y="108" width="56" height="40" rx="16" fill="${c}" opacity=".85" stroke="#2d2a3a" stroke-width="3"/><path d="M142 122 L 158 122" stroke="#2d2a3a" stroke-width="4"/><path d="M96 116 L 108 116" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M168 116 L 180 116" stroke="#fff" stroke-width="3" opacity=".7"/>` },
  { id: 'cercei-perle', slot: 'earrings', name: 'Perle', draw: (c) => `<circle cx="66" cy="96" r="6" fill="${c}" stroke="rgba(0,0,0,.2)"/><circle cx="234" cy="96" r="6" fill="${c}" stroke="rgba(0,0,0,.2)"/><circle cx="64" cy="94" r="2" fill="#fff"/><circle cx="232" cy="94" r="2" fill="#fff"/>` },
  { id: 'cercei-inima', slot: 'earrings', name: 'Inimioare', draw: (c) => `<path d="M68 86 L 66 94" stroke="#e6c35c" stroke-width="2"/><path d="M232 86 L 234 94" stroke="#e6c35c" stroke-width="2"/><path d="${heartPath(66, 100, 0.8)}" fill="${c}"/><path d="${heartPath(234, 100, 0.8)}" fill="${c}"/>` },
  { id: 'cercei-stea', slot: 'earrings', name: 'Steluțe', draw: (c) => `<path d="M68 86 L 66 94" stroke="#e6c35c" stroke-width="2"/><path d="M232 86 L 234 94" stroke="#e6c35c" stroke-width="2"/><polygon points="${starPoints(66, 102, 8, 3.5)}" fill="${c}"/><polygon points="${starPoints(234, 102, 8, 3.5)}" fill="${c}"/>` },
  { id: 'cercei-cercuri', slot: 'earrings', name: 'Cercuri', draw: (c) => `<circle cx="66" cy="98" r="10" fill="none" stroke="${c}" stroke-width="3.5"/><circle cx="234" cy="98" r="10" fill="none" stroke="${c}" stroke-width="3.5"/>` },
  { id: 'esarfa', slot: 'scarf', name: 'Eșarfă', draw: (c) => `<path d="M116 198 Q 150 214 184 198 L 186 210 Q 150 228 114 210 Z" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/><path d="M168 212 L 176 254 L 162 252 L 158 214 Z" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>` },
  { id: 'fular-dungi', slot: 'scarf', name: 'Fular cu dungi', draw: (c) => `<path d="M114 196 Q 150 214 186 196 L 188 212 Q 150 230 112 212 Z" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/><path d="M128 204 L 128 220 M142 208 L 142 224 M158 208 L 158 224 M172 204 L 172 220" stroke="#fff" stroke-width="4" opacity=".75"/><path d="M130 214 L 124 262 L 140 262 L 142 218 Z" fill="${c}" stroke="rgba(0,0,0,.2)"/><path d="M124 254 L 140 254" stroke="#fff" stroke-width="4" opacity=".75"/>` },
  { id: 'bandana', slot: 'scarf', name: 'Bandană', draw: (c) => `<path d="M116 200 Q 150 212 184 200 L 150 244 Z" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/><circle cx="140" cy="214" r="3" fill="#fff"/><circle cx="160" cy="214" r="3" fill="#fff"/><circle cx="150" cy="228" r="3" fill="#fff"/>` },
  { id: 'papion', slot: 'scarf', name: 'Papion', draw: (c) => `<path d="M150 206 L 128 194 L 128 218 Z M150 206 L 172 194 L 172 218 Z" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/><circle cx="150" cy="206" r="5" fill="${c}" stroke="rgba(0,0,0,.3)"/>` },
];

export function lookAccFor(slot) { return LOOK_ACC.filter((a) => a.slot === slot); }
