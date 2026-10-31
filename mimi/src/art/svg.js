// Ajutoare pentru desenul SVG făcut în cod.

let n = 0;
// Prefix unic pentru id-urile din <defs>, ca două desene pe aceeași pagină să nu se încurce.
export function newPrefix(tag = 'm') { n += 1; return `${tag}${n}`; }

// Oglindește un traseu SVG față de axa verticală x = cx (doar comenzi absolute M L C Q S T Z).
export function mirrorPath(d, cx = 150) {
  return d.replace(/([MLCQST])([^MLCQSTZ]*)/g, (_, cmd, args) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    return `${cmd}${nums.map((v, i) => (i % 2 === 0 ? +(2 * cx - v).toFixed(2) : v)).join(' ')} `;
  });
}

// Puncte pentru o stea cu `k` colțuri.
export function starPoints(cx, cy, r1, r2, k = 5, rot = -90) {
  const pts = [];
  for (let i = 0; i < k * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = ((rot + (i * 180) / k) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export const heartPath = (cx, cy, s = 1) =>
  `M${cx} ${cy + 7 * s} C${cx - 11 * s} ${cy - 1 * s} ${cx - 8 * s} ${cy - 11 * s} ${cx} ${cy - 5 * s} C${cx + 8 * s} ${cy - 11 * s} ${cx + 11 * s} ${cy - 1 * s} ${cx} ${cy + 7 * s} Z`;

// Mici "motive" desenate în jurul punctului (0,0), cam 20px. Folosite la modele, ștampile, autocolante.
export const MOTIFS = {
  inima: (c) => `<path d="${heartPath(0, 0, 1)}" fill="${c}"/>`,
  stea: (c) => `<polygon points="${starPoints(0, 0, 10, 4.5)}" fill="${c}"/>`,
  floare: (c) => {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 * Math.PI) / 180;
      s += `<circle cx="${(Math.cos(a) * 6).toFixed(1)}" cy="${(Math.sin(a) * 6).toFixed(1)}" r="5" fill="${c}"/>`;
    }
    return `${s}<circle r="3.6" fill="#ffe27a"/>`;
  },
  fluture: (c) => `<ellipse cx="-6" cy="-4" rx="6" ry="7" fill="${c}" transform="rotate(-20 -6 -4)"/><ellipse cx="6" cy="-4" rx="6" ry="7" fill="${c}" transform="rotate(20 6 -4)"/><ellipse cx="-5" cy="6" rx="4.5" ry="4" fill="${c}" opacity=".8"/><ellipse cx="5" cy="6" rx="4.5" ry="4" fill="${c}" opacity=".8"/><rect x="-1.2" y="-9" width="2.4" height="18" rx="1.2" fill="#5b3b55"/>`,
  buline: (c) => `<circle r="7" fill="${c}"/>`,
  luna: (c) => `<path d="M3 -10 A10 10 0 1 0 3 10 A7.5 7.5 0 1 1 3 -10 Z" fill="${c}"/>`,
  cirese: (c) => `<path d="M-4 2 C -2 -6, 2 -10, 6 -10 M4 3 C 4 -4, 5 -8, 6 -10" stroke="#3f8a4a" stroke-width="1.6" fill="none"/><circle cx="-5" cy="5" r="5" fill="${c}"/><circle cx="4" cy="6" r="5" fill="${c}"/>`,
  curcubeu: () => `<path d="M-12 6 A12 12 0 0 1 12 6" stroke="#ff6b6b" stroke-width="3" fill="none"/><path d="M-9 6 A9 9 0 0 1 9 6" stroke="#ffd36b" stroke-width="3" fill="none"/><path d="M-6 6 A6 6 0 0 1 6 6" stroke="#6bd38f" stroke-width="3" fill="none"/><path d="M-3 6 A3 3 0 0 1 3 6" stroke="#6bb5ff" stroke-width="3" fill="none"/>`,
  nor: (c) => `<path d="M-10 5 a5 5 0 0 1 1 -9 a7 7 0 0 1 13 -1 a5 5 0 0 1 6 10 Z" fill="${c}"/>`,
  sclipici: (c) => `<path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="${c}"/>`,
};

// Stea cu 4 colțuri (sclipire mică).
export const sparkle = (x, y, r, c, extra = '') =>
  `<path d="M${x} ${y - r} L${x + r * 0.25} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.25} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.25} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.25} ${y - r * 0.25} Z" fill="${c}" ${extra}/>`;

export function wrapSVG(inner, { viewBox = '0 0 300 420', cls = '', attrs = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${cls}" ${attrs}>${inner}</svg>`;
}
