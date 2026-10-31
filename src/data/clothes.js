// Catalogul hainelor din atelier. Ca să adaugi ceva nou, copiezi o intrare și îi schimbi
// id-ul, numele și desenul. Logica jocului nu trebuie modificată.
//
// Coordonatele desenelor sunt în "spațiul corpului" lui Angy (viewBox 0 0 300 420):
// umeri ~ y 205, talie ~ y 266, genunchi ~ y 340, tălpi ~ y 392, labe (mâini) la (100,284) și (200,284).
// price = stele (0 = gratuit), collection = colecția tematică din care face parte.

import { mirrorPath, MOTIFS, starPoints, heartPath, sparkle } from '../art/svg.js';

const BODICE = 'M114 212 C 116 204 124 200 134 200 C 140 210 160 210 166 200 C 176 200 184 204 186 212 C 188 236 182 254 180 268 L 120 268 C 118 254 112 236 114 212 Z';
const WAIST = 'M119 262 L 181 262 L 182 272 L 118 272 Z';
const TOP = 'M112 214 C 114 202 124 198 134 198 C 140 206 160 206 166 198 C 176 198 186 202 188 214 C 190 240 186 262 184 280 L 116 280 C 114 262 110 240 112 214 Z';
const SHORT_SLEEVE = 'M114 206 C 104 210 98 222 96 236 L 112 240 C 114 230 118 220 124 214 Z';
const LONG_SLEEVE = 'M114 206 C 100 214 90 240 88 274 L 108 278 C 110 252 116 232 126 216 Z';
const both = (d) => [d, mirrorPath(d)];

// role: main (culoarea 1 + model), second (culoarea 2), trim (bordură), white (alb)
export const DRESS_TYPES = [
  {
    id: 'scurta', name: 'Scurtă', icon: '👗',
    parts: [
      { role: 'main', d: 'M120 264 L 180 264 C 194 282 206 300 214 320 C 180 330 120 330 86 320 C 94 300 106 282 120 264 Z' },
      { role: 'main', d: BODICE },
      { role: 'trim', d: WAIST },
    ],
    details: 'M136 274 L 126 322 M150 274 L 150 326 M164 274 L 174 322',
  },
  {
    id: 'lunga', name: 'Lungă', icon: '👘',
    parts: [
      { role: 'main', d: 'M120 264 L 180 264 C 196 300 208 350 216 388 C 180 398 120 398 84 388 C 92 350 104 300 120 264 Z' },
      { role: 'main', d: BODICE },
      { role: 'trim', d: WAIST },
    ],
    details: 'M134 276 L 116 386 M150 276 L 150 392 M166 276 L 184 386',
  },
  {
    id: 'clopot', name: 'Clopot', icon: '🔔',
    parts: [
      { role: 'white', d: 'M66 336 Q 78 350 90 340 Q 102 354 114 342 Q 126 356 138 344 Q 150 358 162 344 Q 174 356 186 342 Q 198 354 210 340 Q 222 350 234 336 L 234 326 L 66 326 Z' },
      { role: 'main', d: 'M120 264 L 180 264 C 232 272 248 316 238 338 C 190 352 110 352 62 338 C 52 316 68 272 120 264 Z' },
      { role: 'main', d: BODICE },
      { role: 'trim', d: WAIST },
    ],
    details: 'M128 276 Q 100 310 92 342 M150 276 L 150 348 M172 276 Q 200 310 208 342',
  },
  {
    id: 'sirena', name: 'Sirenă', icon: '🧜', price: 20, collection: 'mare',
    parts: [
      { role: 'second', d: 'M124 350 C 106 368 86 386 78 400 C 120 410 180 410 222 400 C 214 386 194 368 176 350 Z' },
      { role: 'main', d: 'M120 264 L 180 264 C 188 300 184 330 176 354 C 160 362 140 362 124 354 C 116 330 112 300 120 264 Z' },
      { role: 'main', d: BODICE },
      { role: 'trim', d: WAIST },
    ],
    details: 'M124 354 Q 150 366 176 354 M110 380 Q 120 370 132 362 M190 380 Q 180 370 168 362',
  },
  {
    id: 'printesa', name: 'Prințesă', icon: '👑',
    parts: [
      { role: 'main', d: 'M120 262 L 180 262 C 230 282 256 352 262 400 C 200 418 100 418 38 400 C 44 352 70 282 120 262 Z' },
      { role: 'second', d: 'M120 264 C 110 300 98 334 92 364 C 122 346 140 306 150 268 C 160 306 178 346 208 364 C 202 334 190 300 180 264 Z' },
      { role: 'main', d: BODICE },
      ...both('M98 214 C 96 196 122 192 128 206 C 130 222 104 232 98 214 Z').map((d) => ({ role: 'second', d })),
      { role: 'trim', d: WAIST },
    ],
    details: 'M70 360 Q 90 380 110 396 M230 360 Q 210 380 190 396',
  },
  {
    id: 'bluza', name: 'Bluză și fustă', icon: '👚',
    parts: [
      ...both(SHORT_SLEEVE).map((d) => ({ role: 'second', d })),
      { role: 'second', d: TOP },
      { role: 'main', d: 'M116 274 L 184 274 C 194 292 202 308 206 326 C 170 336 130 336 94 326 C 98 308 106 292 116 274 Z' },
      { role: 'trim', d: 'M116 270 L 184 270 L 185 280 L 115 280 Z' },
    ],
    details: 'M126 282 L 116 328 M138 282 L 134 332 M150 282 L 150 334 M162 282 L 166 332 M174 282 L 184 328 M138 202 Q 150 214 162 202',
  },
  {
    id: 'salopeta', name: 'Salopetă', icon: '👖',
    parts: [
      ...both(SHORT_SLEEVE).map((d) => ({ role: 'second', d })),
      { role: 'second', d: 'M112 214 C 114 202 124 198 134 198 C 140 206 160 206 166 198 C 176 198 186 202 188 214 C 190 236 186 252 184 266 L 116 266 C 114 252 110 236 112 214 Z' },
      { role: 'main', d: 'M116 262 L 184 262 L 188 376 L 156 376 L 150 304 L 144 376 L 112 376 Z' },
      { role: 'main', d: 'M128 220 L 172 220 L 174 266 L 126 266 Z' },
      ...both('M128 224 L 120 204 L 127 201 L 135 222 Z').map((d) => ({ role: 'main', d })),
    ],
    details: 'M138 232 L 162 232 L 162 250 Q 150 256 138 250 Z M150 304 L 150 262',
    extra: '<circle cx="131" cy="226" r="3.5" fill="#ffd36b" stroke="#c79a3a"/><circle cx="169" cy="226" r="3.5" fill="#ffd36b" stroke="#c79a3a"/>',
  },
  {
    id: 'pijama', name: 'Pijama', icon: '🌙',
    parts: [
      ...both(LONG_SLEEVE).map((d) => ({ role: 'main', d })),
      { role: 'main', d: 'M116 284 L 184 284 L 186 382 L 156 382 L 150 316 L 144 382 L 114 382 Z' },
      { role: 'main', d: 'M112 214 C 114 202 124 198 134 198 C 140 206 160 206 166 198 C 176 198 186 202 188 214 C 190 240 186 262 186 292 L 114 292 C 114 262 110 240 112 214 Z' },
      ...both('M88 270 L 108 274 L 107 282 L 87 279 Z').map((d) => ({ role: 'second', d })),
      { role: 'second', d: 'M114 372 L 144 372 L 144 384 L 114 384 Z' },
      { role: 'second', d: 'M156 372 L 186 372 L 186 384 L 156 384 Z' },
      { role: 'second', d: 'M136 199 Q 150 216 164 199 L 160 197 Q 150 208 140 197 Z' },
    ],
    details: 'M150 210 L 150 290',
    extra: '<circle cx="150" cy="226" r="3" fill="#fff"/><circle cx="150" cy="248" r="3" fill="#fff"/><circle cx="150" cy="270" r="3" fill="#fff"/>',
  },
  {
    id: 'carnaval', name: 'Costum de zână', icon: '🧚',
    parts: [
      { role: 'main', d: 'M120 262 L 180 262 L 238 318 L 214 310 L 206 334 L 186 316 L 172 340 L 160 318 L 150 344 L 140 318 L 128 340 L 114 316 L 94 334 L 86 310 L 62 318 Z' },
      { role: 'main', d: BODICE },
      { role: 'second', d: 'M116 206 L 128 224 L 136 208 L 144 226 L 150 208 L 156 226 L 164 208 L 172 224 L 184 206 L 166 200 Q 150 212 134 200 Z' },
      { role: 'trim', d: WAIST },
    ],
    details: '',
    extra: `<polygon points="${starPoints(150, 246, 12, 5)}" fill="#ffe27a" stroke="#e0a800" stroke-width="1.5"/>`,
  },
];

export const MATERIALS = [
  { id: 'bumbac', name: 'Bumbac', icon: '🧺' },
  { id: 'satin', name: 'Satin', icon: '🎀' },
  { id: 'tul', name: 'Tul', icon: '🩰' },
  { id: 'catifea', name: 'Catifea', icon: '🧸' },
  { id: 'denim', name: 'Denim', icon: '👖' },
  { id: 'stralucitor', name: 'Strălucitor', icon: '✨', price: 15, collection: 'printesa' },
];

export const PATTERNS = [
  { id: 'none', name: 'Simplu', icon: '⬜' },
  { id: 'buline', name: 'Buline', icon: '⚪' },
  { id: 'dungi', name: 'Dungi', icon: '〰️' },
  { id: 'carouri', name: 'Carouri', icon: '🟥' },
  { id: 'flori', name: 'Flori', icon: '🌸' },
  { id: 'inimioare', name: 'Inimioare', icon: '💗' },
  { id: 'stele', name: 'Stele', icon: '⭐', price: 12, collection: 'spatiu' },
  { id: 'fluturi', name: 'Fluturi', icon: '🦋', price: 12, collection: 'gradina' },
  { id: 'curcubeu', name: 'Curcubeu', icon: '🌈', price: 10 },
  { id: 'zigzag', name: 'Zigzag', icon: '⚡' },
];

// Decoruri mutate liber pe rochie. clip:true = "ștampilă" care rămâne doar pe material.
// draw(color) desenează în jurul punctului (0,0).
const scallops = (w, y, r) => { let s = `M${-w} ${y}`; for (let x = -w; x < w; x += r * 2) s += ` Q ${x + r} ${y + r * 1.6} ${x + r * 2} ${y}`; return s; };

export const DECOR = [
  { id: 'panglica', name: 'Panglică', icon: '🎗️', draw: (c) => `<path d="M-44 -6 Q 0 -10 44 -6 L 44 6 Q 0 2 -44 6 Z" fill="${c}" stroke="rgba(0,0,0,.18)"/><path d="M-40 -3 Q 0 -6 40 -3" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>` },
  { id: 'volan', name: 'Volan', icon: '〰️', draw: (c) => `<path d="${scallops(44, 0, 5.5)} L 44 -8 L -44 -8 Z" fill="${c}" stroke="rgba(0,0,0,.18)"/><path d="M-44 -4 L 44 -4" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>` },
  { id: 'dantela', name: 'Dantelă', icon: '🤍', draw: (c) => { let holes = ''; for (let x = -38; x <= 38; x += 11) holes += `<circle cx="${x}" cy="1" r="2.6" fill="none" stroke="${c}" stroke-width="1.2"/>`; return `<path d="${scallops(44, 4, 5.5)} L 44 -6 L -44 -6 Z" fill="#fff" stroke="${c}" stroke-width="1.2"/>${holes}`; } },
  { id: 'fundita', name: 'Fundiță', icon: '🎀', draw: (c) => `<path d="M0 0 C -14 -16 -28 -10 -24 2 C -22 12 -10 8 0 0 Z M0 0 C 14 -16 28 -10 24 2 C 22 12 10 8 0 0 Z" fill="${c}" stroke="rgba(0,0,0,.2)"/><path d="M-3 3 L -10 20 L -4 18 M3 3 L 10 20 L 4 18" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/><circle r="5" fill="${c}" stroke="rgba(0,0,0,.25)"/>` },
  { id: 'paiete', name: 'Paiete', icon: '✨', draw: (c) => { let s = ''; const pts = [[0, 0], [-10, -6], [10, -5], [-6, 9], [8, 9], [-16, 4], [16, 5], [0, -12]]; for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="4.2" fill="${c}" stroke="rgba(0,0,0,.15)"/><circle cx="${x - 1.3}" cy="${y - 1.3}" r="1.3" fill="#fff" opacity=".9"/>`; return s; } },
  { id: 'perle', name: 'Perle', icon: '⚪', draw: (c) => { let s = ''; for (let i = -4; i <= 4; i++) { const x = i * 9, y = (i * i) * 0.9 - 6; s += `<circle cx="${x}" cy="${y}" r="4.6" fill="${c}" stroke="rgba(0,0,0,.18)"/><circle cx="${x - 1.4}" cy="${y - 1.6}" r="1.5" fill="#fff"/>`; } return s; } },
  { id: 'buzunar', name: 'Buzunar', icon: '👛', draw: (c) => `<path d="M-15 -14 L 15 -14 L 15 8 Q 0 18 -15 8 Z" fill="${c}" stroke="rgba(0,0,0,.25)"/><path d="M-12 -10 L 12 -10" stroke="#fff" stroke-dasharray="3 2" stroke-width="1.5"/><path d="${heartPath(0, 2, 0.5)}" fill="#fff" opacity=".8"/>` },
  { id: 'nasturi', name: 'Nasturi', icon: '🔘', draw: (c) => [-14, 0, 14].map((y) => `<circle cy="${y}" r="5.5" fill="${c}" stroke="rgba(0,0,0,.25)"/><circle cx="-1.6" cy="${y - 1.6}" r=".9" fill="#fff"/><circle cx="1.6" cy="${y - 1.6}" r=".9" fill="#fff"/><circle cx="-1.6" cy="${y + 1.6}" r=".9" fill="#fff"/><circle cx="1.6" cy="${y + 1.6}" r=".9" fill="#fff"/>`).join('') },
  { id: 'st-inima', name: 'Inimă', icon: '💗', clip: true, draw: (c) => `<g transform="scale(1.4)">${MOTIFS.inima(c)}</g>` },
  { id: 'st-stea', name: 'Stea', icon: '⭐', clip: true, draw: (c) => `<g transform="scale(1.4)">${MOTIFS.stea(c)}</g>` },
  { id: 'st-floare', name: 'Floare', icon: '🌼', clip: true, draw: (c) => `<g transform="scale(1.4)">${MOTIFS.floare(c)}</g>` },
  { id: 'st-fluture', name: 'Fluture', icon: '🦋', clip: true, draw: (c) => `<g transform="scale(1.4)">${MOTIFS.fluture(c)}</g>` },
  { id: 'st-luna', name: 'Lună', icon: '🌙', clip: true, draw: (c) => `<g transform="scale(1.4)">${MOTIFS.luna(c)}</g>` },
  { id: 'st-cirese', name: 'Cireșe', icon: '🍒', clip: true, draw: (c) => `<g transform="scale(1.4)">${MOTIFS.cirese(c)}</g>` },
  { id: 'st-curcubeu', name: 'Curcubeu', icon: '🌈', clip: true, draw: () => `<g transform="scale(1.6)">${MOTIFS.curcubeu()}</g>` },
  { id: 'st-sclipici', name: 'Sclipici', icon: '💫', clip: true, draw: (c) => `<g transform="scale(1.2)">${MOTIFS.sclipici(c)}</g>` },
];

// ---- Accesorii pentru ținută (sloturi) ----
export const OUTFIT_SLOTS = [
  { id: 'shoes', name: 'Pantofi', icon: '👟' },
  { id: 'socks', name: 'Șosete', icon: '🧦' },
  { id: 'bag', name: 'Poșete', icon: '👜' },
  { id: 'jewelry', name: 'Bijuterii', icon: '📿' },
  { id: 'hat', name: 'Pălării', icon: '👒' },
  { id: 'gloves', name: 'Mănuși', icon: '🧤' },
  { id: 'wings', name: 'Aripioare', icon: '🧚' },
  { id: 'crown', name: 'Coroane', icon: '👑' },
];

const feet = (fn) => fn(134) + fn(166);
const s = (c) => `stroke="rgba(0,0,0,.25)" stroke-width="1.5"`;

export const OUTFIT_ACC = [
  // Pantofi (tălpi la y 392, picioare la x 134 și 166)
  { id: 'balerini', slot: 'shoes', name: 'Balerini', draw: (c) => feet((x) => `<path d="M${x - 18} 392 C ${x - 18} 382 ${x + 18} 382 ${x + 18} 392 C ${x + 18} 401 ${x - 18} 401 ${x - 18} 392 Z" fill="${c}" ${s()}/><circle cx="${x}" cy="385" r="3.5" fill="#fff"/>`) },
  { id: 'ghete', slot: 'shoes', name: 'Ghetuțe', draw: (c) => feet((x) => `<path d="M${x - 13} 364 L ${x + 13} 364 L ${x + 14} 384 C ${x + 22} 388 ${x + 20} 401 ${x + 10} 401 L ${x - 16} 401 C ${x - 22} 401 ${x - 20} 388 ${x - 13} 384 Z" fill="${c}" ${s()}/><path d="M${x - 14} 368 L ${x + 14} 368" stroke="#fff" stroke-width="3" opacity=".7"/>`) },
  { id: 'sandale', slot: 'shoes', name: 'Sandale', draw: (c) => feet((x) => `<ellipse cx="${x}" cy="398" rx="19" ry="5" fill="${c}" ${s()}/><path d="M${x - 14} 393 Q ${x} 380 ${x + 14} 393 M${x - 6} 392 L ${x - 2} 376" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="382" r="3" fill="#ffe27a"/>`) },
  { id: 'adidasi', slot: 'shoes', name: 'Adidași', draw: (c) => feet((x) => `<path d="M${x - 17} 386 C ${x - 16} 376 ${x + 14} 376 ${x + 19} 390 L ${x + 19} 396 L ${x - 18} 396 Z" fill="${c}" ${s()}/><rect x="${x - 19}" y="394" width="39" height="6" rx="3" fill="#fff" ${s()}/><path d="M${x - 6} 382 L ${x + 4} 384 M${x - 5} 386 L ${x + 5} 388" stroke="#fff" stroke-width="2"/>`) },
  { id: 'pantofi-printesa', slot: 'shoes', name: 'Pantofi de prințesă', price: 15, collection: 'printesa', draw: (c) => feet((x) => `<path d="M${x - 18} 392 C ${x - 16} 380 ${x + 16} 380 ${x + 18} 392 L ${x + 16} 400 L ${x - 16} 400 Z" fill="${c}" ${s()}/><rect x="${x + 10}" y="398" width="5" height="6" fill="${c}"/><polygon points="${starPoints(x, 386, 5, 2.2)}" fill="#fff6a8"/>`) },
  // Șosete
  { id: 'sosete-scurte', slot: 'socks', name: 'Șosete scurte', draw: (c) => feet((x) => `<rect x="${x - 13}" y="366" width="26" height="22" rx="6" fill="${c}" ${s()}/><rect x="${x - 13}" y="366" width="26" height="6" rx="3" fill="#fff" opacity=".6"/>`) },
  { id: 'ciorapi', slot: 'socks', name: 'Ciorapi lungi', draw: (c) => feet((x) => `<rect x="${x - 13}" y="318" width="26" height="72" rx="8" fill="${c}" ${s()}/>`) },
  { id: 'sosete-dungi', slot: 'socks', name: 'Șosete cu dungi', draw: (c) => feet((x) => `<rect x="${x - 13}" y="330" width="26" height="60" rx="8" fill="#fff" ${s()}/>${[336, 350, 364, 378].map((y) => `<rect x="${x - 13}" y="${y}" width="26" height="7" fill="${c}"/>`).join('')}`) },
  { id: 'sosete-buline', slot: 'socks', name: 'Șosete cu buline', draw: (c) => feet((x) => `<rect x="${x - 13}" y="344" width="26" height="46" rx="8" fill="${c}" ${s()}/><circle cx="${x - 5}" cy="354" r="3" fill="#fff"/><circle cx="${x + 5}" cy="366" r="3" fill="#fff"/><circle cx="${x - 4}" cy="378" r="3" fill="#fff"/>`) },
  // Poșete (lângă laba dreaptă)
  { id: 'poseta-rotunda', slot: 'bag', name: 'Poșetă rotundă', draw: (c) => `<path d="M202 282 Q 216 270 226 296" stroke="${c}" stroke-width="3" fill="none"/><circle cx="222" cy="306" r="16" fill="${c}" ${s()}/><circle cx="222" cy="306" r="5" fill="#ffe27a"/>` },
  { id: 'poseta-inima', slot: 'bag', name: 'Poșetă inimă', draw: (c) => `<path d="M202 282 Q 218 272 224 292" stroke="${c}" stroke-width="3" fill="none"/><path d="${heartPath(224, 306, 1.7)}" fill="${c}" ${s()}/><path d="${heartPath(224, 304, 0.5)}" fill="#fff" opacity=".7"/>` },
  { id: 'poseta-stea', slot: 'bag', name: 'Poșetă stea', draw: (c) => `<path d="M202 282 Q 218 272 224 290" stroke="${c}" stroke-width="3" fill="none"/><polygon points="${starPoints(224, 306, 18, 9)}" fill="${c}" ${s()}/>` },
  { id: 'plic', slot: 'bag', name: 'Plic elegant', draw: (c) => `<rect x="204" y="290" width="36" height="22" rx="5" fill="${c}" ${s()}/><path d="M204 292 L 222 304 L 240 292" stroke="rgba(0,0,0,.2)" fill="none" stroke-width="1.5"/><circle cx="222" cy="303" r="3" fill="#ffe27a"/>` },
  { id: 'poseta-scoica', slot: 'bag', name: 'Poșetă scoică', price: 10, collection: 'mare', draw: (c) => `<path d="M202 282 Q 216 272 222 292" stroke="${c}" stroke-width="3" fill="none"/><path d="M206 312 Q 204 290 222 288 Q 240 290 238 312 Z" fill="${c}" ${s()}/><path d="M222 290 L 222 312 M214 292 L 212 312 M230 292 L 232 312" stroke="rgba(255,255,255,.7)" stroke-width="1.5"/>` },
  // Bijuterii (la gât)
  { id: 'colier-perle', slot: 'jewelry', name: 'Colier de perle', draw: (c) => { let s2 = ''; for (let i = 0; i <= 8; i++) { const t = i / 8, x = 128 + t * 44, y = 204 + Math.sin(t * Math.PI) * 14; s2 += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${c}" stroke="rgba(0,0,0,.2)"/>`; } return s2; } },
  { id: 'colier-inima', slot: 'jewelry', name: 'Colier inimă', draw: (c) => `<path d="M130 204 Q 150 222 170 204" stroke="#e6c35c" stroke-width="2" fill="none"/><path d="${heartPath(150, 222, 0.8)}" fill="${c}" stroke="rgba(0,0,0,.2)"/>` },
  { id: 'pandantiv-stea', slot: 'jewelry', name: 'Pandantiv stea', draw: (c) => `<path d="M130 204 Q 150 222 170 204" stroke="#e6c35c" stroke-width="2" fill="none"/><polygon points="${starPoints(150, 224, 8, 3.6)}" fill="${c}" stroke="rgba(0,0,0,.2)"/>` },
  { id: 'bratari', slot: 'jewelry', name: 'Brățări', draw: (c) => `<ellipse cx="100" cy="272" rx="11" ry="4" fill="none" stroke="${c}" stroke-width="3.5"/><ellipse cx="200" cy="272" rx="11" ry="4" fill="none" stroke="${c}" stroke-width="3.5"/>` },
  // Pălării (pe cap, între urechi)
  { id: 'palarie-soare', slot: 'hat', name: 'Pălărie de soare', draw: (c) => `<ellipse cx="150" cy="54" rx="86" ry="15" fill="${c}" ${s()}/><path d="M104 54 C 104 14 196 14 196 54 Z" fill="${c}" ${s()}/><path d="M104 46 C 130 52 170 52 196 46 L 196 54 C 170 58 130 58 104 54 Z" fill="#fff" opacity=".75"/><g transform="translate(184 44)">${MOTIFS.floare('#ff8fc7')}</g>` },
  { id: 'bereta', slot: 'hat', name: 'Beretă', draw: (c) => `<ellipse cx="160" cy="38" rx="62" ry="22" fill="${c}" transform="rotate(-10 160 38)" ${s()}/><circle cx="160" cy="14" r="5" fill="${c}"/>` },
  { id: 'palarie-zana', slot: 'hat', name: 'Pălărie de zână', draw: (c) => `<path d="M118 50 L 150 -40 L 182 50 Q 150 58 118 50 Z" fill="${c}" ${s()}/><path d="M150 -40 Q 180 -10 200 30" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><polygon points="${starPoints(150, -38, 8, 3.5)}" fill="#ffe27a"/>` },
  { id: 'joben', slot: 'hat', name: 'Joben mic', draw: (c) => `<g transform="rotate(12 170 40)"><ellipse cx="170" cy="46" rx="34" ry="8" fill="${c}" ${s()}/><rect x="150" y="8" width="40" height="38" rx="4" fill="${c}" ${s()}/><rect x="150" y="34" width="40" height="7" fill="#ff5fa2"/></g>` },
  // Mănuși
  { id: 'manusi-scurte', slot: 'gloves', name: 'Mănuși scurte', draw: (c) => `<circle cx="100" cy="286" r="14" fill="${c}" ${s()}/><circle cx="200" cy="286" r="14" fill="${c}" ${s()}/><rect x="88" y="270" width="24" height="7" rx="3" fill="#fff" opacity=".8"/><rect x="188" y="270" width="24" height="7" rx="3" fill="#fff" opacity=".8"/>` },
  { id: 'manusi-lungi', slot: 'gloves', name: 'Mănuși lungi', draw: (c) => `<path d="M94 244 L 110 246 L 110 280 A 14 14 0 1 1 88 282 Z" fill="${c}" ${s()}/><path d="M206 244 L 190 246 L 190 280 A 14 14 0 1 0 212 282 Z" fill="${c}" ${s()}/>` },
  // Aripioare (în spate)
  { id: 'aripi-zana', slot: 'wings', name: 'Aripi de zână', draw: (c) => `<g opacity=".8"><ellipse cx="96" cy="210" rx="44" ry="26" transform="rotate(-30 96 210)" fill="${c}" stroke="#fff" stroke-width="3"/><ellipse cx="204" cy="210" rx="44" ry="26" transform="rotate(30 204 210)" fill="${c}" stroke="#fff" stroke-width="3"/><ellipse cx="106" cy="258" rx="30" ry="17" transform="rotate(25 106 258)" fill="${c}" stroke="#fff" stroke-width="3"/><ellipse cx="194" cy="258" rx="30" ry="17" transform="rotate(-25 194 258)" fill="${c}" stroke="#fff" stroke-width="3"/></g>${sparkle(70, 190, 6, '#fff')}${sparkle(232, 196, 5, '#fff')}` },
  { id: 'aripi-fluture', slot: 'wings', name: 'Aripi de fluture', price: 15, collection: 'gradina', draw: (c) => `<path d="M150 230 C 110 160 50 170 60 220 C 66 250 110 250 150 236 Z" fill="${c}" ${s()}/><path d="M150 230 C 190 160 250 170 240 220 C 234 250 190 250 150 236 Z" fill="${c}" ${s()}/><path d="M150 240 C 110 250 80 290 104 300 C 124 306 140 280 150 246 Z" fill="${c}" opacity=".85" ${s()}/><path d="M150 240 C 190 250 220 290 196 300 C 176 306 160 280 150 246 Z" fill="${c}" opacity=".85" ${s()}/><circle cx="90" cy="210" r="9" fill="#fff" opacity=".7"/><circle cx="210" cy="210" r="9" fill="#fff" opacity=".7"/><circle cx="112" cy="280" r="6" fill="#ffe27a"/><circle cx="188" cy="280" r="6" fill="#ffe27a"/>` },
  { id: 'aripi-inger', slot: 'wings', name: 'Aripi de înger', draw: (c) => [0, 1].map((m) => { const k = m ? -1 : 1, x0 = 150; const feather = (dx, dy, r) => `<ellipse cx="${x0 - k * dx}" cy="${dy}" rx="${r}" ry="${r * 0.45}" transform="rotate(${k * -25} ${x0 - k * dx} ${dy})" fill="${c}" stroke="rgba(0,0,0,.12)"/>`; return feather(54, 200, 30) + feather(70, 222, 28) + feather(76, 246, 24) + feather(72, 268, 18); }).join('') },
  // Coroane
  { id: 'coroana', slot: 'crown', name: 'Coroană de aur', price: 15, collection: 'printesa', draw: (c) => `<path d="M118 48 L 116 14 L 133 30 L 150 6 L 167 30 L 184 14 L 182 48 Z" fill="${c}" stroke="#b8860b" stroke-width="2"/><circle cx="150" cy="38" r="5" fill="#ff5fa2"/><circle cx="130" cy="40" r="3.5" fill="#6bd0ff"/><circle cx="170" cy="40" r="3.5" fill="#6bd0ff"/>` },
  { id: 'tiara-stele', slot: 'crown', name: 'Tiară cu stele', draw: (c) => `<path d="M108 54 Q 150 22 192 54" stroke="${c}" stroke-width="5" fill="none"/><polygon points="${starPoints(150, 28, 13, 5.5)}" fill="${c}" stroke="rgba(0,0,0,.2)"/><polygon points="${starPoints(124, 40, 7, 3)}" fill="${c}"/><polygon points="${starPoints(176, 40, 7, 3)}" fill="${c}"/>` },
  { id: 'diadema-luna', slot: 'crown', name: 'Diademă lună', price: 12, collection: 'spatiu', draw: (c) => `<path d="M108 54 Q 150 24 192 54" stroke="#e6c35c" stroke-width="4" fill="none"/><g transform="translate(150 26) scale(1.3)">${MOTIFS.luna(c)}</g>${sparkle(126, 38, 5, c)}${sparkle(174, 38, 5, c)}` },
];

export function accFor(slot) { return OUTFIT_ACC.filter((a) => a.slot === slot); }
