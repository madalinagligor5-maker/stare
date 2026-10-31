// Desenul lui Mimi (și al manechinului) pe straturi:
// aripi, coadă, păr spate, picioare, șosete/pantofi, corp, rochie, mănuși/poșetă, eșarfă/bijuterii,
// cap + față, păr față, urechi + cercei, ochelari, accesorii de cap.
// Toate hainele folosesc aceleași coordonate, deci se potrivesc și pe manechin, și pe Mimi.

import { DRESS_TYPES, OUTFIT_ACC, DECOR } from '../data/clothes.js';
import { HAIRSTYLES, HAIR_DECOR, LOOK_ACC, LASH_STYLES } from '../data/beauty.js';
import { patternDef, materialLayer } from './patterns.js';
import { mirrorPath, sparkle, starPoints, heartPath, newPrefix } from './svg.js';
import { shade } from '../core/util.js';

export const FUR = '#ffe3cc';
export const FUR_LINE = '#e2b298';
const BELLY = '#fff6ee';
const EAR_IN = '#ffb8cf';

const TORSO = 'M150 196 C 125 196 112 205 112 222 C 112 245 118 262 120 270 C 114 285 112 300 118 312 L 182 312 C 188 300 186 285 180 270 C 182 262 188 245 188 222 C 188 205 175 196 150 196 Z';
const ARM_L = 'M118 210 C 104 218 94 244 92 276 L 108 278 C 110 252 116 234 126 220 Z';
const LEG_L = 'M124 300 L 148 300 L 147 386 C 147 396 125 396 125 386 Z';
const HEAD = 'M150 40 C 205 40 240 72 240 118 C 240 168 200 196 150 196 C 100 196 60 168 60 118 C 60 72 95 40 150 40 Z';
const EAR_L = 'M70 84 C 62 54 70 26 82 12 C 98 22 116 40 124 52 Z';
const EAR_L_IN = 'M80 74 C 76 56 80 38 86 28 C 96 36 106 46 112 54 Z';
const TUFT_L = 'M64 140 L 50 150 L 66 156 L 56 166 L 74 166 Z';

const accById = new Map(OUTFIT_ACC.map((a) => [a.id, a]));
const lookAccById = new Map(LOOK_ACC.map((a) => [a.id, a]));
const decorById = new Map(DECOR.map((d) => [d.id, d]));

// ---------- Haine ----------
export function renderOutfit(design, p, { selected = null, interactive = false } = {}) {
  const out = { defs: '', wings: '', legs: '', dress: '', over: '', head: '' };
  if (!design) return out;
  const type = DRESS_TYPES.find((t) => t.id === design.type) || DRESS_TYPES[0];
  const A = design.colorA || '#ff8fc7';
  const B = design.colorB || '#ffe08a';
  const fillMain = design.gradient ? `url(#${p}-grad)` : A;
  out.defs += `<linearGradient id="${p}-grad" x1="0" y1="200" x2="0" y2="400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${A}"/><stop offset="1" stop-color="${B}"/></linearGradient>`;
  out.defs += patternDef(`${p}-pat`, design.pattern, design.patternColor || '#ffffff');
  const fabric = type.parts.filter((pt) => pt.role === 'main' || pt.role === 'second');
  const mains = type.parts.filter((pt) => pt.role === 'main');
  out.defs += `<clipPath id="${p}-clip">${fabric.map((pt) => `<path d="${pt.d}"/>`).join('')}</clipPath>`;
  out.defs += `<clipPath id="${p}-clipm">${mains.map((pt) => `<path d="${pt.d}"/>`).join('')}</clipPath>`;
  const mat = materialLayer(p, design.material);
  out.defs += mat.defs;

  let d = '';
  if (design.material === 'tul') {
    // un strat de tul în plus, puțin mai jos, ca să pară vaporos
    d += mains.map((pt) => `<path d="${pt.d}" fill="${shade(A, 12)}" opacity=".45" transform="translate(-3 7) scale(1.02 1)"/>`).join('');
  }
  for (const pt of type.parts) {
    const base = pt.role === 'second' ? B : pt.role === 'trim' ? shade(A, -16) : pt.role === 'white' ? '#ffffff' : A;
    const fill = pt.role === 'main' ? fillMain : base;
    d += `<path d="${pt.d}" fill="${fill}" stroke="${shade(base, -28)}" stroke-width="2" stroke-linejoin="round" ${design.material === 'tul' && pt.role === 'main' ? 'fill-opacity=".9"' : ''}/>`;
  }
  if (design.pattern && design.pattern !== 'none') {
    d += `<g clip-path="url(#${p}-clipm)"><rect x="0" y="150" width="300" height="270" fill="url(#${p}-pat)"/></g>`;
  }
  d += `<g clip-path="url(#${p}-clip)">${mat.overlay}</g>`;
  if (type.details) d += `<path d="${type.details}" stroke="${shade(A, -30)}" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (design.material === 'denim') d += mains.map((pt) => `<path d="${pt.d}" fill="none" stroke="#f5d27a" stroke-width="1.6" stroke-dasharray="4 3" transform="translate(150 260) scale(.94) translate(-150 -260)"/>`).join('');
  if (type.extra) d += type.extra;

  // Decoruri puse cu degetul (ordinea din listă = care e în față)
  for (const it of design.decor || []) {
    const def = decorById.get(it.kind);
    if (!def) continue;
    const sx = (it.flip ? -1 : 1) * (it.s || 1);
    const g = `<g transform="translate(${it.x} ${it.y}) rotate(${it.r || 0}) scale(${sx} ${it.s || 1})" ${interactive ? `data-decor="${it.uid}"` : ''}>${interactive ? '<circle r="26" fill="transparent"/>' : ''}${def.draw(it.color || '#ffffff')}</g>`;
    d += def.clip ? `<g clip-path="url(#${p}-clip)">${g}</g>` : g;
    if (selected && selected === it.uid) {
      d += `<circle cx="${it.x}" cy="${it.y}" r="${32 * (it.s || 1)}" fill="none" stroke="#7c4dff" stroke-width="2.5" stroke-dasharray="6 5" class="sel-ring" pointer-events="none"/>`;
    }
  }
  out.dress = d;

  const acc = design.acc || {};
  const draw = (slot) => {
    const a = acc[slot];
    if (!a) return '';
    const def = accById.get(a.id);
    return def ? def.draw(a.color || '#ff8fc7') : '';
  };
  out.wings = draw('wings');
  out.legs = draw('socks') + draw('shoes');
  out.over = draw('gloves') + draw('bag') + draw('jewelry');
  out.head = draw('hat') + draw('crown');
  return out;
}

// ---------- Păr ----------
function hairFill(hair, p) {
  if (!hair.gradient) return { defs: '', fill: hair.color };
  return {
    defs: `<linearGradient id="${p}-hair" x1="0" y1="0" x2="0" y2="300" gradientUnits="userSpaceOnUse"><stop offset=".1" stop-color="${hair.color}"/><stop offset=".9" stop-color="${hair.color2}"/></linearGradient>`,
    fill: `url(#${p}-hair)`,
  };
}

// Stări temporare din salon: păr ciufulit / ud.
function hairEffects(hairState, color = '#9a6248') {
  let s = '';
  if (hairState?.wet > 0.02) {
    s += `<g opacity="${hairState.wet.toFixed(2)}"><path d="M62 108 C 56 60 96 30 150 30 C 204 30 244 60 238 108 C 200 70 100 70 62 108 Z" fill="#2a4a7a" opacity=".22"/>`;
    for (const [x, y] of [[90, 70], [130, 48], [176, 52], [212, 78], [72, 104], [228, 104]]) s += `<path d="M${x} ${y} q 4 7 0 10 q -4 -3 0 -10 Z" fill="#8fd3ff" stroke="#fff"/>`;
    s += '</g>';
  }
  if (hairState?.messy > 0.02) {
    s += `<g opacity="${hairState.messy.toFixed(2)}" stroke="${shade(color, -12)}" stroke-width="4" fill="none" stroke-linecap="round">`;
    for (const d of ['M80 70 q -14 -20 4 -34', 'M110 46 q -6 -22 12 -28', 'M150 34 q 4 -24 -8 -32', 'M186 44 q 14 -18 2 -32', 'M220 66 q 22 -10 18 -30', 'M64 98 q -22 -4 -26 -22', 'M236 98 q 24 0 30 -18', 'M128 40 q -18 -10 -14 -26']) s += `<path d="${d}"/>`;
    s += '</g>';
  }
  return s;
}

// ---------- Față ----------
function eyeMarkup(cx, cy, side, look, p, expr) {
  const mk = look?.makeup || {};
  let s = '';
  if (mk.shadow?.color) {
    s += `<path d="M${cx - 25} ${cy - 2} Q ${cx - 24} ${cy - 34} ${cx} ${cy - 34} Q ${cx + 24} ${cy - 34} ${cx + 25} ${cy - 2} Z" fill="${mk.shadow.color}" opacity="${(0.25 + mk.shadow.amount / 140).toFixed(2)}"/>`;
  }
  const closedHappy = expr === 'purr' || expr === 'giggle' || expr === 'love';
  const closedSleep = expr === 'sleep';
  const lash = LASH_STYLES.find((l) => l.id === mk.lashes?.style) || LASH_STYLES[0];
  const lashColor = mk.lashes?.color || '#3a2840';
  if (closedHappy || closedSleep) {
    const d = closedHappy ? `M${cx - 16} ${cy + 4} Q ${cx} ${cy - 14} ${cx + 16} ${cy + 4}` : `M${cx - 16} ${cy - 2} Q ${cx} ${cy + 10} ${cx + 16} ${cy - 2}`;
    s += `<path d="${d}" stroke="#4a3048" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    const ex = cx + side * 16, ey = closedHappy ? cy + 4 : cy - 2;
    s += `<path d="M${ex} ${ey} l ${side * 7} ${closedHappy ? 2 : -5}" stroke="${lashColor}" stroke-width="3" stroke-linecap="round"/>`;
    return `<g id="${p}-eye${side < 0 ? 'L' : 'R'}">${s}</g>`;
  }
  const big = expr === 'curious' ? 1.08 : 1;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${21 * big}" ry="${24 * big}" fill="#fff" stroke="#4a3048" stroke-width="2.5"/>`;
  s += `<g id="${p}-pup${side < 0 ? 'L' : 'R'}"><ellipse cx="${cx}" cy="${cy + 2}" rx="15" ry="18" fill="#3aa6b9"/><ellipse cx="${cx}" cy="${cy + 4}" rx="15" ry="9" fill="#2b8396" opacity=".5"/><ellipse cx="${cx}" cy="${cy + 2}" rx="${expr === 'curious' ? 9.5 : 8}" ry="${expr === 'curious' ? 12.5 : 11}" fill="#2a1d2e"/><circle cx="${cx - 5}" cy="${cy - 5}" r="5.2" fill="#fff"/><circle cx="${cx + 5}" cy="${cy + 7}" r="2.4" fill="#fff"/></g>`;
  if (expr === 'pout') s += `<path d="M${cx - 24} ${cy - 30} L ${cx + 24} ${cy - 30} L ${cx + 24} ${cy - 8} Q ${cx} ${cy - 2} ${cx - 24} ${cy - 8} Z" fill="${FUR}"/><path d="M${cx - 21} ${cy - 8} Q ${cx} ${cy - 2} ${cx + 21} ${cy - 8}" stroke="#4a3048" stroke-width="2.5" fill="none"/>`;
  // gene pe marginea de sus, spre exterior
  for (let i = 0; i < lash.n; i++) {
    const t = lash.n === 1 ? 0.5 : i / (lash.n - 1);
    const deg = side < 0 ? 196 + t * 52 : 344 - t * 52;
    const a = (deg * Math.PI) / 180;
    const px = cx + 21 * Math.cos(a), py = cy + 24 * Math.sin(a);
    const ex = px + lash.len * Math.cos(a), ey = py + lash.len * Math.sin(a) - lash.curl * 0.4;
    const qx = px + lash.len * 0.7 * Math.cos(a) + side * lash.curl, qy = py + lash.len * 0.7 * Math.sin(a) + lash.curl * 0.6;
    s += `<path d="M${px.toFixed(1)} ${py.toFixed(1)} Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${lashColor}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  return `<g id="${p}-eye${side < 0 ? 'L' : 'R'}">${s}</g>`;
}

function mouthMarkup(look, expr) {
  const lips = look?.makeup?.lips;
  const lc = lips?.color;
  const lo = lips ? (0.35 + lips.amount / 160).toFixed(2) : 1;
  switch (expr) {
    case 'giggle':
    case 'love':
      return `<path d="M136 168 Q 150 196 164 168 Q 150 174 136 168 Z" fill="#d9536f" stroke="${lc || '#a8475e'}" stroke-width="${lc ? 4 : 2}" stroke-opacity="${lc ? lo : 1}"/><ellipse cx="150" cy="182" rx="7" ry="4" fill="#ff9db5"/>`;
    case 'curious':
      return `<circle cx="150" cy="175" r="5.5" fill="#d9536f" stroke="${lc || '#a8475e'}" stroke-width="${lc ? 4 : 2}" stroke-opacity="${lc ? lo : 1}"/>`;
    case 'pout': {
      const d = 'M141 177 Q 145 170 150 175 Q 155 170 159 177';
      return `<path d="${d}" stroke="#a8475e" stroke-width="3" fill="none" stroke-linecap="round"/>${lc ? `<path d="${d}" stroke="${lc}" stroke-width="5" fill="none" opacity="${lo}" stroke-linecap="round"/>` : ''}`;
    }
    case 'sleep':
      return `<path d="M145 172 Q 150 176 155 172" stroke="#a8475e" stroke-width="3" fill="none" stroke-linecap="round"/>${lc ? `<path d="M145 172 Q 150 176 155 172" stroke="${lc}" stroke-width="5" fill="none" opacity="${lo}" stroke-linecap="round"/>` : ''}`;
    default: {
      const d = expr === 'purr' ? 'M134 168 Q 142 180 150 169 Q 158 180 166 168' : 'M136 169 Q 143 177 150 169 Q 157 177 164 169';
      return `<path d="${d}" stroke="#a8475e" stroke-width="3" fill="none" stroke-linecap="round"/>${lc ? `<path d="${d}" stroke="${lc}" stroke-width="5.5" fill="none" opacity="${lo}" stroke-linecap="round"/>` : ''}`;
    }
  }
}

export function renderFace(look, p, expr = 'happy') {
  const mk = look?.makeup || {};
  let s = '';
  const blush = mk.blush?.color || '#ff9db5';
  const bo = mk.blush ? (0.15 + mk.blush.amount / 130) : 0.3;
  const puff = expr === 'pout' ? 1.25 : 1;
  s += `<ellipse cx="92" cy="160" rx="${18 * puff}" ry="${10 * puff}" fill="${blush}" opacity="${bo.toFixed(2)}"/><ellipse cx="208" cy="160" rx="${18 * puff}" ry="${10 * puff}" fill="${blush}" opacity="${bo.toFixed(2)}"/>`;
  s += eyeMarkup(114, 128, -1, look, p, expr) + eyeMarkup(186, 128, 1, look, p, expr);
  if (expr === 'curious') s += '<path d="M98 92 Q 114 82 130 92 M170 92 Q 186 82 202 92" stroke="#c9917a" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  s += `<path d="${heartPath(150, 157, 0.95)}" fill="#ff8fb1" stroke="#e0718f" stroke-width="1.5"/>`;
  s += mouthMarkup(look, expr);
  s += '<g stroke="#c99a86" stroke-width="2.5" stroke-linecap="round"><path d="M84 150 L 46 143"/><path d="M84 158 L 44 160"/><path d="M86 166 L 50 176"/><path d="M216 150 L 254 143"/><path d="M216 158 L 256 160"/><path d="M214 166 L 250 176"/></g>';
  if (mk.glitter?.color) {
    const o = (0.3 + mk.glitter.amount / 140).toFixed(2);
    s += `<g opacity="${o}">${[[86, 140, 5], [100, 172, 4], [214, 140, 5], [200, 172, 4], [112, 94, 4], [188, 94, 4], [150, 140, 3]].map(([x, y, r], i) => sparkle(x, y, r, mk.glitter.color, `class="twinkle" style="animation-delay:${i * 0.2}s"`)).join('')}</g>`;
  }
  return s;
}

// Unghiile mici de pe labe (pe figura mare).
function pawNails(nails) {
  if (!nails) return '';
  let s = '';
  [[100, 284], [200, 284]].forEach(([px, py], k) => {
    for (let i = 0; i < 5; i++) {
      const n = nails[k * 5 + i];
      if (!n?.color) continue;
      const a = ((30 + i * 30) * Math.PI) / 180;
      const x = px + Math.cos(a) * 9 * (k ? 1 : -1) * -1, y = py + Math.sin(a) * 9;
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.6" ry="3.2" fill="${n.color}" stroke="rgba(0,0,0,.2)" stroke-width=".8"/>`;
    }
  });
  return s;
}

// ---------- Figura completă ----------
// opts: look, design, kind ('mimi'|'mannequin'), p (prefix), expr, hairState, selected, interactive
export function renderFigure(opts = {}) {
  const { look = null, design = null, kind = 'mimi', expr = 'happy', hairState = null, selected = null, interactive = false } = opts;
  const p = opts.p || newPrefix('f');
  const isMimi = kind === 'mimi';
  const o = renderOutfit(design, p, { selected, interactive });
  const hair = look?.hair;
  const style = hair ? HAIRSTYLES.find((h) => h.id === hair.style) || HAIRSTYLES[0] : null;
  const hf = hair ? hairFill(hair, p) : { defs: '', fill: '' };
  const furC = isMimi ? FUR : '#f1dcc0';
  const lineC = isMimi ? FUR_LINE : '#cdb08c';

  let s = `<defs>${o.defs}${hf.defs}</defs>`;
  s += `<g id="${p}-all" class="fig">`;
  s += `<g class="fig-wings">${o.wings}</g>`;
  if (isMimi) {
    s += `<g id="${p}-tail" class="fig-tail"><path d="M182 330 C 232 336 254 300 242 262 C 236 244 246 230 258 238" stroke="${lineC}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M182 330 C 232 336 254 300 242 262 C 236 244 246 230 258 238" stroke="${furC}" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M243 250 C 240 242 248 232 258 238" stroke="${BELLY}" stroke-width="15" fill="none" stroke-linecap="round"/></g>`;
    if (style) s += `<g class="hair-back">${style.back(hf.fill)}</g>`;
  } else {
    s += '<rect x="146" y="380" width="8" height="26" fill="#b08f6a"/><ellipse cx="150" cy="408" rx="40" ry="8" fill="#9c7b58"/>';
  }
  // picioare
  s += `<g class="fig-legs"><path d="${LEG_L}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/><path d="${mirrorPath(LEG_L)}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>`;
  if (isMimi) s += `<ellipse cx="134" cy="391" rx="17" ry="9" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/><ellipse cx="166" cy="391" rx="17" ry="9" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>`;
  s += `${o.legs}</g>`;
  // corp
  s += `<g id="${p}-body" class="fig-body"><path d="${ARM_L}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/><path d="${mirrorPath(ARM_L)}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/><path d="${TORSO}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>`;
  if (isMimi) s += `<ellipse cx="150" cy="268" rx="22" ry="32" fill="${BELLY}"/>`;
  else s += '<path d="M150 200 L 150 310" stroke="#cdb08c" stroke-width="1.5" stroke-dasharray="5 4"/>';
  s += `<circle cx="100" cy="284" r="12" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/><circle cx="200" cy="284" r="12" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>`;
  s += '</g>';
  s += `<g class="fig-dress">${o.dress}</g>`;
  s += `<g class="fig-over">${isMimi ? pawNails(look?.nails) : ''}${o.over}</g>`;
  if (isMimi && look?.acc?.scarf) s += drawLookAcc(look.acc.scarf);

  // cap
  // manechinul are capul mai mic, ca rochia să se vadă mare
  s += `<g id="${p}-head" class="fig-head"${isMimi ? '' : ' transform="translate(150 200) scale(.62) translate(-150 -200)"'}>`;
  s += `<path d="${TUFT_L}" fill="${furC}" stroke="${lineC}" stroke-width="2"/><path d="${mirrorPath(TUFT_L)}" fill="${furC}" stroke="${lineC}" stroke-width="2"/>`;
  s += `<path d="${HEAD}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>`;
  if (isMimi) {
    s += `<g id="${p}-face">${renderFace(look, p, expr)}</g>`;
    if (style) s += `<g class="hair-front">${style.front(hf.fill)}${hairEffects(hairState, hair.color)}</g>`;
    if (hair && hair.decor && hair.decor !== 'none') {
      const dec = HAIR_DECOR.find((x) => x.id === hair.decor);
      if (dec) s += dec.draw(hair.decorColor || '#ff6fa8');
    }
  } else {
    s += '<path d="M150 44 C 150 90 150 150 150 192" stroke="#cdb08c" stroke-width="1.5" stroke-dasharray="5 4"/>';
  }
  // urechi
  s += `<g id="${p}-earL" class="ear"><path d="${EAR_L}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>${isMimi ? `<path d="${EAR_L_IN}" fill="${EAR_IN}"/>` : ''}</g>`;
  s += `<g id="${p}-earR" class="ear"><path d="${mirrorPath(EAR_L)}" fill="${furC}" stroke="${lineC}" stroke-width="2.5"/>${isMimi ? `<path d="${mirrorPath(EAR_L_IN)}" fill="${EAR_IN}"/>` : ''}</g>`;
  if (isMimi && look?.acc) {
    const hideHead = !!design?.acc?.hat;
    const hideCrown = hideHead || !!design?.acc?.crown;
    s += drawLookAcc(look.acc.earrings) + drawLookAcc(look.acc.glasses);
    if (!hideHead) s += drawLookAcc(look.acc.bow);
    if (!hideCrown) s += drawLookAcc(look.acc.crown);
  }
  s += o.head;
  s += '</g></g>';
  return s;
}

function drawLookAcc(a) {
  if (!a) return '';
  const def = lookAccById.get(a.id);
  return def ? def.draw(a.color || '#ff5fa2') : '';
}

// SVG complet, ca text.
export function figureSVG(opts = {}, { cls = 'figure', viewBox = '-10 -50 320 470', attrs = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${cls}" ${attrs}>${renderFigure(opts)}</svg>`;
}

// Miniatură pentru garderobă: doar manechinul cu rochia.
export function designThumb(design) {
  return figureSVG({ design, kind: 'mannequin' }, { cls: 'thumb', viewBox: '20 150 260 270' });
}

export { starPoints };
