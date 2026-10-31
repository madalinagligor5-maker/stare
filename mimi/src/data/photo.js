// Fundaluri, rame și autocolante pentru poze (foto 360 x 480).

import { MOTIFS, starPoints, heartPath, sparkle } from '../art/svg.js';

export const PHOTO_W = 360;
export const PHOTO_H = 480;

const grad = (p, a, b) => `<linearGradient id="${p}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

export const BACKGROUNDS = [
  { id: 'bg-roz', name: 'Roz', draw: (p) => `<defs>${grad(p, '#ffd6ea', '#ffb3d9')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/>${[[40, 60], [300, 90], [70, 380], [320, 330], [180, 40]].map(([x, y]) => `<path d="${heartPath(x, y, 1.2)}" fill="#fff" opacity=".5"/>`).join('')}` },
  { id: 'bg-podium', name: 'Podium', draw: (p) => `<defs>${grad(p, '#4a2d6e', '#9b6bff')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/><path d="M60 0 L 140 480 L 0 480 L 0 0 Z M300 0 L 220 480 L 360 480 L 360 0 Z" fill="#fff" opacity=".08"/><ellipse cx="180" cy="452" rx="150" ry="26" fill="#ff8fc7"/><ellipse cx="180" cy="446" rx="130" ry="18" fill="#ffb3d9"/>${[[40, 40], [320, 70], [100, 120], [260, 30]].map(([x, y]) => sparkle(x, y, 7, '#fff')).join('')}` },
  { id: 'bg-gradina', name: 'Grădină', draw: (p) => `<defs>${grad(p, '#bfe7ff', '#e6f9d8')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/><circle cx="300" cy="70" r="34" fill="#ffe27a"/><path d="M0 380 Q 90 340 180 380 T 360 370 L 360 480 L 0 480 Z" fill="#8fdc8f"/>${[[40, 420, '#ff5fa2'], [100, 450, '#ffd36b'], [280, 430, '#9b6bff'], [330, 460, '#ff6b6b']].map(([x, y, c]) => `<g transform="translate(${x} ${y}) scale(1.3)">${MOTIFS.floare(c)}</g>`).join('')}<g transform="translate(70 120) scale(1.5)">${MOTIFS.fluture('#ff8fc7')}</g>` },
  { id: 'bg-castel', name: 'Castel', draw: (p) => `<defs>${grad(p, '#ffe0ef', '#c9b6ff')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/><g opacity=".55"><rect x="30" y="160" width="300" height="220" fill="#fff"/><rect x="10" y="100" width="60" height="280" fill="#ffc2d9"/><rect x="290" y="100" width="60" height="280" fill="#ffc2d9"/><path d="M5 100 L 40 40 L 75 100 Z M285 100 L 320 40 L 355 100 Z" fill="#9b6bff"/></g><rect y="400" width="360" height="80" fill="#ffd6ea"/>` },
  { id: 'bg-spatiu', name: 'Spațiu', draw: (p) => `<defs>${grad(p, '#1b1840', '#3a3570')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 73) % 360}" cy="${(i * 131) % 480}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity=".85"/>`).join('')}<circle cx="290" cy="90" r="36" fill="#ff8fc7"/><ellipse cx="290" cy="90" rx="56" ry="10" fill="none" stroke="#ffd36b" stroke-width="5" transform="rotate(-15 290 90)"/><g transform="translate(60 80) scale(2)">${MOTIFS.luna('#ffe27a')}</g>` },
  { id: 'bg-plaja', name: 'Plajă', draw: (p) => `<defs>${grad(p, '#7fd1e8', '#bff0ff')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/><rect y="300" width="360" height="80" fill="#3daad0"/><path d="M0 300 Q 30 290 60 300 T 120 300 T 180 300 T 240 300 T 300 300 T 360 300" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/><rect y="370" width="360" height="110" fill="#f6e2b0"/><circle cx="70" cy="70" r="30" fill="#ffe27a"/>` },
  { id: 'bg-noapte', name: 'Noapte', draw: (p) => `<defs>${grad(p, '#2b2f6b', '#6a5acd')}</defs><rect width="360" height="480" fill="url(#${p}-bg)"/>${Array.from({ length: 18 }, (_, i) => `<polygon points="${starPoints((i * 97) % 360, (i * 61) % 300, 4, 1.8)}" fill="#ffe27a" opacity=".8"/>`).join('')}<circle cx="290" cy="80" r="28" fill="#fff3c4"/>` },
  { id: 'bg-curcubeu', name: 'Curcubeu', draw: (p) => `<rect width="360" height="480" fill="#fff8fb"/>${['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'].map((c, i) => `<path d="M${-20 + i * 18} 480 A ${200 - i * 18} ${200 - i * 18} 0 0 1 ${380 - i * 18} 480" stroke="${c}" stroke-width="18" fill="none" opacity=".6"/>`).join('')}<g transform="translate(60 80) scale(2)">${MOTIFS.nor('#e6f2ff')}</g><g transform="translate(290 120) scale(2.4)">${MOTIFS.nor('#e6f2ff')}</g>` },
];

export const FRAMES = [
  { id: 'fr-none', name: 'Fără ramă', draw: () => '' },
  { id: 'fr-aur', name: 'Aurie', draw: () => '<rect x="8" y="8" width="344" height="464" rx="14" fill="none" stroke="#e6c35c" stroke-width="16"/><rect x="18" y="18" width="324" height="444" rx="8" fill="none" stroke="#fff3a6" stroke-width="3"/>' },
  { id: 'fr-polaroid', name: 'Polaroid', draw: () => '<path d="M0 0 H360 V480 H0 Z M18 18 V400 H342 V18 Z" fill="#fff" fill-rule="evenodd"/><text x="180" y="448" text-anchor="middle" font-size="26" font-family="Comic Sans MS, ui-rounded, sans-serif" fill="#e0318a">♥ Angy ♥</text>' },
  { id: 'fr-inimi', name: 'Inimioare', draw: () => { let s = '<rect x="6" y="6" width="348" height="468" rx="20" fill="none" stroke="#ff8fc7" stroke-width="10"/>'; for (let i = 0; i < 9; i++) { s += `<path d="${heartPath(20 + i * 40, 18, 1.1)}" fill="#ff5fa2"/><path d="${heartPath(20 + i * 40, 464, 1.1)}" fill="#ff5fa2"/>`; } return s; } },
  { id: 'fr-flori', name: 'Flori', draw: () => { let s = '<rect x="6" y="6" width="348" height="468" rx="20" fill="none" stroke="#b8e986" stroke-width="10"/>'; const cols = ['#ff5fa2', '#ffd36b', '#9b6bff', '#6bd0ff']; for (let i = 0; i < 12; i++) { s += `<g transform="translate(${i % 2 ? 14 : 346} ${30 + i * 38}) scale(1.2)">${MOTIFS.floare(cols[i % 4])}</g>`; } return s; } },
  { id: 'fr-stele', name: 'Stele', draw: () => { let s = '<rect x="6" y="6" width="348" height="468" rx="20" fill="none" stroke="#9b8cf2" stroke-width="10"/>'; for (let i = 0; i < 8; i++) { s += `<polygon points="${starPoints(24 + i * 45, 20, 11, 5)}" fill="#ffe27a" stroke="#e0a800"/><polygon points="${starPoints(24 + i * 45, 460, 11, 5)}" fill="#ffe27a" stroke="#e0a800"/>`; } return s; } },
];

export const STICKERS = [
  { id: 'sk-inima', name: 'Inimă', draw: () => `<g transform="scale(2)">${MOTIFS.inima('#ff5fa2')}</g>` },
  { id: 'sk-stea', name: 'Stea', draw: () => `<g transform="scale(2)">${MOTIFS.stea('#ffd36b')}</g>` },
  { id: 'sk-floare', name: 'Floare', draw: () => `<g transform="scale(2)">${MOTIFS.floare('#ff8fc7')}</g>` },
  { id: 'sk-fluture', name: 'Fluture', draw: () => `<g transform="scale(2)">${MOTIFS.fluture('#9b6bff')}</g>` },
  { id: 'sk-curcubeu', name: 'Curcubeu', draw: () => `<g transform="scale(2.2)">${MOTIFS.curcubeu()}</g>` },
  { id: 'sk-nor', name: 'Nor', draw: () => `<g transform="scale(2.2)">${MOTIFS.nor('#e6f2ff')}</g>` },
  { id: 'sk-luna', name: 'Lună', draw: () => `<g transform="scale(2)">${MOTIFS.luna('#ffe27a')}</g>` },
  { id: 'sk-sclipici', name: 'Sclipire', draw: () => `<g transform="scale(2)">${MOTIFS.sclipici('#fff6a8')}</g>` },
  { id: 'sk-cirese', name: 'Cireșe', draw: () => `<g transform="scale(2)">${MOTIFS.cirese('#ff3b5c')}</g>` },
  { id: 'sk-coroana', name: 'Coroană', draw: () => '<path d="M-20 10 L -22 -12 L -10 -2 L 0 -18 L 10 -2 L 22 -12 L 20 10 Z" fill="#ffd36b" stroke="#b8860b" stroke-width="2"/>' },
];
