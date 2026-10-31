// Verifică faptul că orice combinație din catalog se desenează fără erori.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderFigure, designThumb } from '../../src/art/figure.js';
import { renderRoom, renderLighting } from '../../src/art/room.js';
import { mirrorPath } from '../../src/art/svg.js';
import { defaultState, defaultDesign, defaultLook } from '../../src/core/defaults.js';
import { DRESS_TYPES, MATERIALS, PATTERNS, DECOR, OUTFIT_ACC } from '../../src/data/clothes.js';
import { HAIRSTYLES, HAIR_DECOR, LOOK_ACC, LASH_STYLES } from '../../src/data/beauty.js';
import { FURNITURE, WALLPAPERS, FLOORS } from '../../src/data/furniture.js';
import { BACKGROUNDS, FRAMES, STICKERS } from '../../src/data/photo.js';
import { runwayScores } from '../../src/scenes/runway.js';
import { adaptLevel } from '../../src/scenes/games.js';

const clean = (svg, what) => {
  assert.ok(!/undefined|NaN|\[object/.test(svg), `desen stricat: ${what}`);
  assert.ok(svg.length > 50, `desen gol: ${what}`);
};

test('toate rochiile × materiale × modele', () => {
  for (const t of DRESS_TYPES) for (const m of MATERIALS) for (const p of PATTERNS) {
    clean(renderFigure({ design: { ...defaultDesign(), type: t.id, material: m.id, pattern: p.id, gradient: true }, kind: 'mannequin' }), `${t.id}/${m.id}/${p.id}`);
  }
});

test('decoruri și accesorii de ținută', () => {
  const d = defaultDesign();
  d.decor = DECOR.map((x, i) => ({ uid: `u${i}`, kind: x.id, x: 150, y: 250, s: 1, r: 10, flip: i % 2 === 0, color: '#ff0000' }));
  for (const a of OUTFIT_ACC) d.acc[a.slot] = { id: a.id, color: '#00ff00' };
  clean(renderFigure({ design: d, look: defaultLook(), interactive: true, selected: 'u1' }), 'decor');
  clean(designThumb(d), 'miniatură');
});

test('coafuri, machiaj, accesorii de salon, expresii', () => {
  for (const hs of HAIRSTYLES) for (const dec of HAIR_DECOR) {
    const look = defaultLook();
    look.hair = { ...look.hair, style: hs.id, decor: dec.id, gradient: true };
    clean(renderFigure({ look, hairState: { messy: 0.5, wet: 0.5 } }), `${hs.id}/${dec.id}`);
  }
  const look = defaultLook();
  for (const k of ['shadow', 'lips', 'glitter', 'blush']) look.makeup[k].color = '#ff00ff';
  for (const l of LASH_STYLES) {
    look.makeup.lashes.style = l.id;
    for (const expr of ['happy', 'giggle', 'pout', 'sleep', 'curious', 'purr', 'love']) clean(renderFigure({ look, expr }), `${l.id}/${expr}`);
  }
  for (const a of LOOK_ACC) { const lk = defaultLook(); lk.acc[a.slot] = { id: a.id, color: '#123456' }; clean(renderFigure({ look: lk }), a.id); }
  look.nails.forEach((n, i) => { n.color = '#ff0000'; n.pattern = ['simplu', 'buline', 'linii', 'stele', 'inimioare', 'degrade'][i % 6]; });
  clean(renderFigure({ look }), 'unghii');
});

test('camera: toată mobila, tapetele, podelele, ziua și noaptea', () => {
  const s = defaultState();
  s.room.items = FURNITURE.map((f, i) => ({ uid: `r${i}`, id: f.id, x: 50 + i * 5, y: f.wall ? 120 : 450, s: 1, flip: i % 2 === 0, z: i }));
  for (const w of WALLPAPERS) for (const f of FLOORS) { s.room.wallpaper = w.id; s.room.floor = f.id; clean(renderRoom(s.room, { interactive: true, selected: 'r3', grid: true }), `${w.id}/${f.id}`); }
  for (const ph of ['morning', 'day', 'evening', 'night']) { clean(renderRoom(s.room, { phase: ph }), ph); renderLighting(s.room, { phase: ph, dark: true }); }
});

test('camera implicită folosește doar obiecte existente', () => {
  const s = defaultState();
  for (const it of s.room.items) assert.ok(FURNITURE.some((f) => f.id === it.id), it.id);
  assert.ok(WALLPAPERS.some((w) => w.id === s.room.wallpaper));
  assert.ok(FLOORS.some((f) => f.id === s.room.floor));
});

test('fundaluri, rame, autocolante', () => {
  for (const b of BACKGROUNDS) clean(b.draw('p'), b.id);
  for (const f of FRAMES.slice(1)) clean(f.draw(), f.id);
  for (const k of STICKERS) clean(k.draw(), k.id);
});

test('oglindirea traseelor', () => {
  assert.equal(mirrorPath('M100 10 L 120 20 Z').trim(), 'M200 10 L180 20 Z');
});

test('notele de la defilare sunt mereu între 3 și 5', () => {
  for (let i = 0; i < 50; i++) {
    for (const n of runwayScores(defaultDesign())) assert.ok(n >= 3 && n <= 5);
    for (const n of runwayScores(null)) assert.ok(n >= 3 && n <= 5);
  }
});

test('dificultatea adaptivă a mini-jocurilor', () => {
  assert.equal(adaptLevel(1, 0), 2);
  assert.equal(adaptLevel(5, 0), 5);
  assert.equal(adaptLevel(3, 2), 3);
  assert.equal(adaptLevel(3, 6), 2);
  assert.equal(adaptLevel(1, 9), 1);
});
