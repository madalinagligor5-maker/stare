// Desenul camerei lui Mimi: perete, fereastră (după ora reală), podea, obiecte, lumină de noapte.

import { FURNITURE, WALLPAPERS, FLOORS, FLOOR_Y, ROOM_W, ROOM_H } from '../data/furniture.js';
import { starPoints, MOTIFS } from './svg.js';

const furnById = new Map(FURNITURE.map((f) => [f.id, f]));
export function furnitureDef(id) { return furnById.get(id) || null; }

// Ordinea de desen: obiecte de perete, covoare, apoi restul după `z`.
export function sortedItems(items) {
  const rank = (it) => { const d = furnById.get(it.id); return d?.wall ? 0 : d?.flat ? 1 : 2; };
  return items.slice().sort((a, b) => rank(a) - rank(b) || (a.z || 0) - (b.z || 0));
}

function windowSky(phase) {
  switch (phase) {
    case 'morning': return { a: '#ffd1dc', b: '#ffe9b0', sun: '#ffd36b', sunY: 150 };
    case 'evening': return { a: '#ff9a76', b: '#9b6bff', sun: '#ff7b54', sunY: 150 };
    case 'night': return { a: '#1b1840', b: '#3a3570', moon: true };
    default: return { a: '#7fd1ff', b: '#d3f1ff', sun: '#ffe27a', sunY: 90 };
  }
}

export function renderItem(it, { interactive = false, selected = false } = {}) {
  const def = furnById.get(it.id);
  if (!def) return '';
  const s = it.s || 1;
  const sx = (it.flip ? -1 : 1) * s;
  const hit = interactive ? '<rect x="-60" y="-70" width="120" height="80" fill="transparent"/>' : '';
  // zona de atingere pentru obiectele de podea e deasupra punctului de jos
  const hitFloor = interactive && !def.wall ? '<rect x="-55" y="-110" width="110" height="115" fill="transparent"/>' : hit;
  let out = `<g transform="translate(${it.x} ${it.y}) scale(${sx} ${s})" ${interactive ? `data-item="${it.uid}"` : ''} class="room-item">${def.wall ? hit : hitFloor}${def.draw()}</g>`;
  if (selected) {
    const r = def.wall ? 0 : -45 * s;
    out += `<ellipse cx="${it.x}" cy="${it.y + r}" rx="${62 * s}" ry="${62 * s}" fill="none" stroke="#7c4dff" stroke-width="3" stroke-dasharray="8 6" class="sel-ring" pointer-events="none"/>`;
  }
  return out;
}

// phase: 'morning'|'day'|'evening'|'night'; dark: lumina stinsă (Mimi doarme)
export function renderRoom(room, { p = 'room', phase = 'day', dark = false, interactive = false, selected = null, grid = false } = {}) {
  const wpDef = (WALLPAPERS.find((w) => w.id === room.wallpaper) || WALLPAPERS[0]).draw(p);
  const flDef = (FLOORS.find((f) => f.id === room.floor) || FLOORS[0]).draw(p);
  const sky = windowSky(phase);
  let s = `<defs>${wpDef.defs}${flDef.defs}
    <linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.a}"/><stop offset="1" stop-color="${sky.b}"/></linearGradient>
    <linearGradient id="${p}-flsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".3" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="${p}-glow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".85"/><stop offset=".5" stop-color="#ffe27a" stop-opacity=".3"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<rect width="${ROOM_W}" height="${FLOOR_Y}" fill="${wpDef.fill}"/>`;
  // fereastra
  s += `<g class="window"><rect x="34" y="46" width="120" height="120" rx="10" fill="#fff" stroke="#e8c8d8" stroke-width="4"/><rect x="42" y="54" width="104" height="104" rx="6" fill="url(#${p}-sky)"/>`;
  if (sky.moon) {
    s += `<g transform="translate(110 84) scale(1.6)">${MOTIFS.luna('#fff3c4')}</g>`;
    for (const [x, y] of [[60, 70], [76, 120], [130, 130], [92, 66], [62, 140]]) s += `<polygon points="${starPoints(x, y, 4, 1.7)}" fill="#ffe27a" class="twinkle"/>`;
  } else {
    s += `<circle cx="112" cy="${sky.sunY - 10}" r="17" fill="${sky.sun}"/>`;
    s += `<g transform="translate(72 90) scale(1.3)">${MOTIFS.nor('#ffffff')}</g>`;
  }
  s += '<path d="M94 54 L 94 158 M42 106 L 146 106" stroke="#fff" stroke-width="5"/><path d="M30 44 Q 52 110 40 170 L 30 170 Z M158 44 Q 136 110 148 170 L 158 170 Z" fill="#ff8fc7" opacity=".85"/><rect x="24" y="38" width="140" height="10" rx="5" fill="#c08a5b"/></g>';
  // podea
  s += `<rect y="${FLOOR_Y}" width="${ROOM_W}" height="${ROOM_H - FLOOR_Y}" fill="${flDef.fill}"/>`;
  s += `<rect y="${FLOOR_Y}" width="${ROOM_W}" height="${ROOM_H - FLOOR_Y}" fill="url(#${p}-flsh)"/>`;
  s += `<rect y="${FLOOR_Y - 8}" width="${ROOM_W}" height="10" fill="#fff" opacity=".85"/>`;
  if (grid) {
    let g = '<g stroke="#7c4dff" stroke-opacity=".18" stroke-width="1">';
    for (let x = 20; x < ROOM_W; x += 20) g += `<path d="M${x} 0 L ${x} ${ROOM_H}"/>`;
    for (let y = 20; y < ROOM_H; y += 20) g += `<path d="M0 ${y} L ${ROOM_W} ${y}"/>`;
    s += `${g}</g>`;
  }
  s += `<g class="room-items">${sortedItems(room.items).map((it) => renderItem(it, { interactive, selected: selected === it.uid })).join('')}</g>`;
  return s;
}

// Stratul de lumină (peste Mimi): întuneric seara/noaptea + strălucirea lămpilor.
export function renderLighting(room, { p = 'room', phase = 'day', dark = false } = {}) {
  let dim = phase === 'night' ? 0.42 : phase === 'evening' ? 0.18 : phase === 'morning' ? 0.05 : 0;
  if (dark) dim = Math.max(dim, 0.5);
  if (!dim) return '';
  let s = `<rect width="${ROOM_W}" height="${ROOM_H}" fill="#1a1440" opacity="${dim}" pointer-events="none"/>`;
  if (phase === 'night' || phase === 'evening' || dark) {
    for (const it of room.items) {
      const def = furnById.get(it.id);
      if (!def?.light || !def.glow) continue;
      const [gx, gy, r] = def.glow;
      const k = it.s || 1;
      s += `<circle cx="${it.x + gx * k * (it.flip ? -1 : 1)}" cy="${it.y + gy * k}" r="${r * k}" fill="url(#${p}-glow)" pointer-events="none" class="lamp-glow"/>`;
    }
  }
  return s;
}
