// Mini-jocurile: potrivește culorile, memory cu haine, sortează accesorii, bule de spălat, puzzle cu rochii.
// Dificultatea crește încet când merge bine și scade când e greu. Nu se pierde niciodată.

import { h, btn, modal, svgFromString, burst, burstAt } from '../core/ui.js';
import { shuffle, pick, clamp, hexToHsl, hslToHex } from '../core/util.js';
import { care } from '../core/pet.js';
import { defaultDesign } from '../core/defaults.js';
import { designThumb } from '../art/figure.js';
import { OUTFIT_ACC, DECOR, DRESS_TYPES } from '../data/clothes.js';
import { FABRIC_COLORS } from '../data/colors.js';
import { patternPreview, viewPreview, centeredPreview, ACC_VIEW } from './common.js';

export const GAMES = [
  { id: 'colors', scene: 'mg-colors', name: 'Potrivește culorile', icon: '🎨' },
  { id: 'memory', scene: 'mg-memory', name: 'Memory cu haine', icon: '🃏' },
  { id: 'sort', scene: 'mg-sort', name: 'Sortează accesoriile', icon: '🧺' },
  { id: 'bubbles', scene: 'mg-bubbles', name: 'Bule de spălat', icon: '🫧' },
  { id: 'puzzle', scene: 'mg-puzzle', name: 'Puzzle cu rochii', icon: '🧩' },
];

// Noul nivel după un joc: crește dacă au fost puține greșeli, scade dacă au fost multe.
export function adaptLevel(level, mistakes, { up = 1, down = 4 } = {}) {
  if (mistakes <= up) return clamp(level + 1, 1, 5);
  if (mistakes >= down) return clamp(level - 1, 1, 5);
  return level;
}

// Final de joc: stele, nivel nou, fereastra "Bravo".
async function finish(ctx, gameId, { mistakes = 0, bonus = 0, fromEl = null, adapt = {} }) {
  const s = ctx.store.state;
  const level = s.minigames[gameId] || 1;
  const stars = 2 + (mistakes <= 1 ? 2 : mistakes <= 3 ? 1 : 0) + Math.min(3, bonus) + (level >= 3 ? 1 : 0);
  s.minigames[gameId] = adaptLevel(level, mistakes, adapt);
  care(s.pet, 'play', 10);
  ctx.track('minigame', { game: gameId });
  ctx.reward(stars, fromEl);
  ctx.audio.play('win');
  burst(innerWidth / 2, innerHeight / 2, ['🎉', '⭐', '✨', '💖'], 20);
  ctx.store.commit();
  const v = await modal({
    icon: '🏆', title: 'Bravo!', dismissible: false,
    body: h('p', { class: 'hint', style: { fontSize: '20px' } }, `Ai câștigat ${stars} ⭐`, h('br'), s.minigames[gameId] > level ? 'Data viitoare: un pic mai greu! 💪' : 'Super joc! 💖'),
    actions: [{ label: 'Alte jocuri', icon: '🎲', cls: 'btn-soft', value: 'hub' }, { label: 'Încă o dată', icon: '🔁', cls: 'btn-primary', value: 'again' }],
  });
  const g = GAMES.find((x) => x.id === gameId);
  if (v === 'again') ctx.go(g.scene, {}, 'fwd'); else ctx.go('games', {}, 'back');
}

const hud = (...kids) => h('div', { class: 'game-hud' }, ...kids);

// ---------- Hub ----------
export const gamesScene = {
  id: 'games',
  title: 'Mini-jocuri',
  back: 'home',
  mount(root, ctx) {
    const s = ctx.store.state;
    const grid = h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' } });
    for (const g of GAMES) {
      grid.appendChild(btn({ icon: g.icon, label: `${g.name} • nivel ${s.minigames[g.id] || 1}`, cls: 'btn-col card', say: true, attrs: { 'data-game': g.id }, onClick: () => ctx.go(g.scene) }));
    }
    root.appendChild(h('div', { class: 'scroll' }, h('p', { class: 'hint' }, 'Joacă și câștigă stele pentru magazin! ⭐'), grid));
    root.querySelectorAll('.card .btn-ico').forEach((el) => { el.style.fontSize = '56px'; });
  },
};

// ---------- 1. Potrivește culorile / modelele ----------
const PATS = ['buline', 'dungi', 'carouri', 'flori', 'inimioare', 'stele', 'zigzag'];
export const colorsGame = {
  id: 'mg-colors',
  title: 'Potrivește culorile',
  back: 'games',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const level = s.minigames.colors || 1;
    const ROUNDS = 6;
    let round = 0, mistakes = 0;
    const area = h('div', { class: 'game-area' });
    const info = hud();
    root.append(info, area);

    function nextRound() {
      if (round >= ROUNDS) { finish(ctx, 'colors', { mistakes, fromEl: area }); return; }
      round += 1;
      area.innerHTML = '';
      info.textContent = `Runda ${round}/${ROUNDS}`;
      const n = Math.min(6, 2 + level);
      const patternRound = level >= 2 && round % 2 === 0;
      const base = pick(FABRIC_COLORS.slice(0, 20));
      let options;
      if (patternRound) {
        const target = pick(PATS);
        options = shuffle([target, ...shuffle(PATS.filter((x) => x !== target)).slice(0, n - 1)]).map((pt) => ({ key: pt, art: patternPreview(pt, base, '#ffffff') }));
        options.target = target;
        area.appendChild(h('p', { class: 'hint' }, 'Găsește același desen!'));
        area.appendChild(svgFromString(designThumb({ ...defaultDesign(), colorA: base, pattern: target, patternColor: '#ffffff', type: pick(['scurta', 'clopot', 'lunga']) })));
      } else {
        // la nivel mare, culorile-capcană sunt mai apropiate
        const spread = [140, 90, 60, 40, 28][level - 1];
        const hsl = hexToHsl(base);
        const cols = [base];
        while (cols.length < n) {
          const c = hslToHex((hsl.h + (Math.random() < 0.5 ? -1 : 1) * (spread * 0.4 + Math.random() * spread)) % 360, clamp(hsl.s, 45, 95), clamp(hsl.l + (Math.random() - 0.5) * 20, 35, 80));
          if (!cols.includes(c)) cols.push(c);
        }
        options = shuffle(cols).map((c) => ({ key: c, art: `<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="${c}"/></svg>` }));
        options.target = base;
        area.appendChild(h('p', { class: 'hint' }, 'Ce culoare are rochia?'));
        area.appendChild(svgFromString(designThumb({ ...defaultDesign(), colorA: base, type: pick(['scurta', 'clopot', 'lunga', 'printesa']) })));
      }
      area.lastChild.style.width = 'min(48vw, 30vh, 220px)';
      area.lastChild.style.height = 'auto';
      const pots = h('div', { class: 'pots' });
      options.forEach((o) => {
        const b = btn({ cls: 'pot', title: 'Alege', sound: null, onClick: () => {
          if (o.key === options.target) {
            ctx.audio.play('sparkle');
            burstAt(b, ['✨', '⭐'], 8);
            scope.timeout(nextRound, 500);
            pots.querySelectorAll('button').forEach((x) => { x.disabled = true; });
          } else {
            mistakes += 1;
            ctx.audio.play('soft-no');
            b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
          }
        } });
        b.appendChild(svgFromString(o.art));
        pots.appendChild(b);
      });
      area.appendChild(pots);
    }
    nextRound();
  },
};

// ---------- 2. Memory cu haine ----------
function memoryArts() {
  const acc = OUTFIT_ACC.filter((a) => !a.price).map((a) => viewPreview(a.draw(pick(['#ff5fa2', '#9b6bff', '#3d8bfd', '#ffa94d'])), ACC_VIEW[a.slot]));
  const dec = DECOR.filter((d) => !d.price).slice(0, 10).map((d) => centeredPreview(d.draw(pick(['#ff5fa2', '#5cc98a', '#ffd36b'])), 30));
  const dr = DRESS_TYPES.filter((t) => !t.price).map((t) => designThumb({ ...defaultDesign(), type: t.id, colorA: pick(FABRIC_COLORS.slice(0, 18)) }));
  return shuffle([...acc, ...dec, ...dr]);
}
export const memoryGame = {
  id: 'mg-memory',
  title: 'Memory cu haine',
  back: 'games',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const level = s.minigames.memory || 1;
    const pairs = [3, 4, 6, 6, 8][level - 1];
    const cols = pairs <= 3 ? 3 : pairs <= 4 ? 4 : 4;
    const arts = memoryArts().slice(0, pairs);
    const deck = shuffle(arts.flatMap((a, i) => [{ i, a }, { i, a }]));
    let open = [], matched = 0, moves = 0, lock = false;
    const info = hud(`Perechi: 0/${pairs}`);
    const grid = h('div', { class: 'mem-grid', style: { gridTemplateColumns: `repeat(${cols}, 1fr)` } });
    root.append(info, h('div', { class: 'game-area' }, grid));
    deck.forEach((c) => {
      const el = h('button', { class: 'mem-card', type: 'button', 'aria-label': 'Carte' }, h('div', { class: 'face back' }, '🐱'), h('div', { class: 'face front' }, svgFromString(c.a)));
      el.addEventListener('click', () => {
        if (lock || el.classList.contains('open')) return;
        ctx.audio.play('pop');
        el.classList.add('open');
        open.push({ el, c });
        if (open.length < 2) return;
        moves += 1;
        const [a, b] = open;
        if (a.c.i === b.c.i) {
          matched += 1;
          open = [];
          ctx.audio.play('sparkle');
          a.el.classList.add('done'); b.el.classList.add('done');
          burstAt(b.el, ['✨', '💖'], 6);
          info.textContent = `Perechi: ${matched}/${pairs}`;
          if (matched === pairs) scope.timeout(() => finish(ctx, 'memory', { mistakes: Math.max(0, moves - pairs - Math.floor(pairs / 2)), fromEl: grid }), 600);
        } else {
          lock = true;
          scope.timeout(() => { a.el.classList.remove('open'); b.el.classList.remove('open'); open = []; lock = false; }, 850);
        }
      });
      grid.appendChild(el);
    });
  },
};

// ---------- 3. Sortează accesoriile ----------
const SORT_BOXES = [
  { slot: 'shoes', name: 'Pantofi', icon: '👟' },
  { slot: 'hat', name: 'Pălării', icon: '👒' },
  { slot: 'jewelry', name: 'Bijuterii', icon: '📿' },
  { slot: 'bag', name: 'Poșete', icon: '👜' },
];
export const sortGame = {
  id: 'mg-sort',
  title: 'Sortează accesoriile',
  back: 'games',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const level = s.minigames.sort || 1;
    const boxes = SORT_BOXES.slice(0, Math.min(4, level + 1));
    const count = 5 + level;
    const pool = OUTFIT_ACC.filter((a) => boxes.some((b) => b.slot === a.slot));
    const items = Array.from({ length: count }, () => {
      const a = pick(pool);
      return { slot: a.slot, art: viewPreview(a.draw(pick(['#ff5fa2', '#9b6bff', '#3d8bfd', '#ffa94d', '#5cc98a'])), ACC_VIEW[a.slot]) };
    });
    let mistakes = 0, left = items.length, picked = null;
    const info = hud(`Mai sunt: ${left}`);
    const boxRow = h('div', { class: 'sort-boxes' });
    const itemRow = h('div', { class: 'sort-items' });
    root.append(info, h('div', { class: 'game-area' }, h('p', { class: 'hint' }, 'Trage fiecare lucru în cutia potrivită (sau atinge lucrul, apoi cutia)'), itemRow, boxRow));
    const boxEls = boxes.map((b) => {
      const el = h('div', { class: 'sort-box', dataset: { slot: b.slot }, role: 'button', tabindex: '0', 'aria-label': b.name }, h('span', { class: 'sb-ico' }, b.icon), b.name);
      el.addEventListener('click', () => { if (picked) drop(picked, b.slot, el); });
      boxRow.appendChild(el);
      return el;
    });
    function drop(it, slot, boxEl) {
      if (it.slot === slot) {
        ctx.audio.play('sparkle');
        burstAt(boxEl, ['✨', '⭐'], 6);
        it.el.remove();
        left -= 1;
        info.textContent = `Mai sunt: ${left}`;
        if (picked === it) picked = null;
        if (!left) scope.timeout(() => finish(ctx, 'sort', { mistakes, fromEl: boxRow }), 400);
      } else {
        mistakes += 1;
        ctx.audio.play('soft-no');
        it.el.classList.remove('wiggle'); void it.el.offsetWidth; it.el.classList.add('wiggle');
      }
      it.el.style.outline = '';
    }
    items.forEach((it) => {
      const el = h('div', { class: 'sort-item', role: 'button', tabindex: '0', 'aria-label': 'Accesoriu' }, svgFromString(it.art));
      it.el = el;
      let ghost = null, moved = false, sx = 0, sy = 0;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); el.setPointerCapture(e.pointerId); moved = false; sx = e.clientX; sy = e.clientY;
        ghost = el.cloneNode(true); ghost.classList.add('dragging');
        ghost.style.left = `${e.clientX - 38}px`; ghost.style.top = `${e.clientY - 38}px`;
        document.body.appendChild(ghost);
        el.style.opacity = '.35';
      });
      el.addEventListener('pointermove', (e) => {
        if (!ghost) return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) moved = true;
        ghost.style.left = `${e.clientX - 38}px`; ghost.style.top = `${e.clientY - 38}px`;
        boxEls.forEach((b) => { const r = b.getBoundingClientRect(); b.classList.toggle('hot', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); });
      });
      const end = (e) => {
        if (!ghost) return;
        ghost.remove(); ghost = null; el.style.opacity = '';
        boxEls.forEach((b) => b.classList.remove('hot'));
        if (!moved) {
          picked = it;
          itemRow.querySelectorAll('.sort-item').forEach((x) => { x.style.outline = ''; });
          el.style.outline = '4px solid #ff3f9a';
          ctx.audio.play('pop');
          return;
        }
        const target = boxEls.find((b) => { const r = b.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
        if (target) drop(it, target.dataset.slot, target);
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', () => { ghost?.remove(); ghost = null; el.style.opacity = ''; });
      itemRow.appendChild(el);
    });
    scope.add(() => document.querySelectorAll('.sort-item.dragging').forEach((g) => g.remove()));
  },
};

// ---------- 4. Bule de spălat ----------
export const bubblesGame = {
  id: 'mg-bubbles',
  title: 'Bule de spălat',
  back: 'games',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const level = s.minigames.bubbles || 1;
    const GOAL = 15 + level * 3;
    let popped = 0, starBubbles = 0, spawnT = 0, finished = false;
    const bubbles = [];
    const info = hud();
    const area = h('div', { class: 'game-area', style: { overflow: 'hidden', background: 'linear-gradient(180deg,#e0f6ff,#fbeaff)' } });
    root.append(info, area);
    const upd = () => { info.textContent = `🫧 ${popped}/${GOAL}   ⭐ ${starBubbles}`; };
    upd();
    function spawn() {
      const r = area.getBoundingClientRect();
      if (!r.width) return;
      const size = 54 + Math.random() * 34 - level * 3;
      const star = Math.random() < 0.12;
      const el = h('div', { class: 'bubble', style: { width: `${size}px`, height: `${size}px`, left: '0', top: '0' } }, star ? '⭐' : '');
      const b = { el, x: Math.random() * (r.width - size), y: r.height - size * 0.6, vy: 40 + level * 14 + Math.random() * 30, wob: Math.random() * 6, star, size };
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (b.dead) return;
        b.dead = true;
        popped += 1;
        if (b.star) starBubbles += 1;
        ctx.audio.play('bubble');
        burst(e.clientX, e.clientY, b.star ? ['⭐', '✨'] : ['💧', '✨'], 5);
        el.remove();
        upd();
        if (popped >= GOAL && !finished) { finished = true; finish(ctx, 'bubbles', { mistakes: 0, bonus: starBubbles, fromEl: area }); }
      });
      area.appendChild(el);
      bubbles.push(b);
    }
    scope.loop((dt, t) => {
      if (finished) return;
      spawnT -= dt;
      if (spawnT <= 0 && bubbles.length < 10) { spawn(); spawnT = Math.max(0.35, 1.1 - level * 0.12); }
      for (const b of bubbles) {
        if (b.dead) continue;
        b.y -= b.vy * dt;
        const x = b.x + Math.sin(t / 400 + b.wob) * 12;
        b.el.style.transform = `translate(${x}px, ${b.y}px)`;
        if (b.y < -b.size) { b.dead = true; b.el.remove(); } // a zburat: nicio problemă
      }
      for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].dead) bubbles.splice(i, 1);
    });
  },
};

// ---------- 5. Puzzle cu rochii ----------
export const puzzleGame = {
  id: 'mg-puzzle',
  title: 'Puzzle cu rochii',
  back: 'games',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const level = s.minigames.puzzle || 1;
    const [cols, rows] = [[2, 2], [2, 3], [3, 3], [3, 3], [3, 4]][level - 1];
    const fromWardrobe = s.wardrobe.length ? pick(s.wardrobe).design : null;
    const design = fromWardrobe || { ...defaultDesign(), type: pick(['printesa', 'clopot', 'lunga']), colorA: pick(FABRIC_COLORS.slice(0, 18)), pattern: pick(['buline', 'flori', 'inimioare', 'none']) };
    const VB = { x: 20, y: 150, w: 260, h: 270 }; // zona rochiei
    const area = h('div', { class: 'game-area' });
    const info = hud('Pune bucățile la locul lor!');
    root.append(info, area);
    const ar = area.getBoundingClientRect();
    const Aw = ar.width || 360, Ah = (ar.height || 600) - 40;
    // cea mai mare tablă care încape împreună cu tava de bucăți de dedesubt
    let boardW = Math.min(Aw * 0.9, 380);
    let boardH, pw, ph, perRow, trayRows;
    for (;;) {
      boardH = boardW * (VB.h / VB.w);
      pw = boardW / cols; ph = boardH / rows;
      perRow = Math.max(1, Math.floor((Aw - 8) / (pw + 8)));
      trayRows = Math.ceil((cols * rows) / perRow);
      if (boardH + trayRows * (ph + 8) + 20 <= Ah || boardW < 120) break;
      boardW *= 0.94;
    }
    const board = h('div', { class: 'puzzle-board', style: { width: `${boardW}px`, height: `${boardH}px` } });
    const tray = h('div', { style: { position: 'relative', width: '100%', height: `${trayRows * (ph + 8)}px` } });
    area.append(board, tray);
    const full = designThumb(design).replace(/viewBox="[^"]+"/, '');
    let placed = 0, mistakes = 0;
    const total = cols * rows;
    const pieces = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        board.appendChild(h('div', { class: 'puzzle-slot', style: { left: `${c * pw}px`, top: `${r * ph}px`, width: `${pw}px`, height: `${ph}px` } }));
        const vb = `${VB.x + (c * VB.w) / cols} ${VB.y + (r * VB.h) / rows} ${VB.w / cols} ${VB.h / rows}`;
        const svg = svgFromString(full.replace('<svg ', `<svg viewBox="${vb}" preserveAspectRatio="none" width="${pw}" height="${ph}" `));
        const el = h('div', { class: 'puzzle-piece', style: { width: `${pw}px`, height: `${ph}px` } }, svg);
        pieces.push({ el, c, r, done: false });
      }
    }
    // așezăm bucățile amestecate în tavă (peste tot, pe ecran)
    const layer = h('div', { style: { position: 'absolute', inset: '0', pointerEvents: 'none' } });
    area.style.position = 'relative';
    area.appendChild(layer);
    requestAnimationFrame(() => {
      const aR = area.getBoundingClientRect();
      const tR = tray.getBoundingClientRect();
      shuffle(pieces).forEach((pc, i) => {
        pc.el.style.pointerEvents = 'auto';
        const rowW = Math.min(perRow, total - Math.floor(i / perRow) * perRow) * (pw + 8);
        const x = (tR.left - aR.left) + (tR.width - rowW) / 2 + (i % perRow) * (pw + 8) + 4;
        const y = (tR.top - aR.top) + Math.floor(i / perRow) * (ph + 8);
        pc.home = { x, y };
        place(pc, x, y);
        layer.appendChild(pc.el);
        attach(pc);
      });
    });
    function place(pc, x, y) { pc.x = x; pc.y = y; pc.el.style.transform = `translate(${x}px, ${y}px)`; }
    function attach(pc) {
      let start = null;
      pc.el.addEventListener('pointerdown', (e) => {
        if (pc.done) return;
        e.preventDefault(); pc.el.setPointerCapture(e.pointerId);
        start = { mx: e.clientX, my: e.clientY, x: pc.x, y: pc.y };
        pc.el.style.zIndex = '5';
        ctx.audio.play('pop');
      });
      pc.el.addEventListener('pointermove', (e) => { if (start) place(pc, start.x + e.clientX - start.mx, start.y + e.clientY - start.my); });
      const end = () => {
        if (!start) return;
        start = null;
        pc.el.style.zIndex = '';
        const aR = area.getBoundingClientRect(), bR = board.getBoundingClientRect();
        const tx = bR.left - aR.left + pc.c * pw, ty = bR.top - aR.top + pc.r * ph;
        if (Math.hypot(pc.x - tx, pc.y - ty) < Math.min(pw, ph) * 0.45) {
          place(pc, tx, ty);
          pc.done = true;
          pc.el.classList.add('placed');
          placed += 1;
          ctx.audio.play('place');
          burstAt(pc.el, ['✨'], 4);
          if (placed === total) {
            ctx.audio.play('sparkle');
            scope.timeout(() => finish(ctx, 'puzzle', { mistakes, fromEl: board }), 600);
          }
        } else {
          const overBoard = pc.x + pw / 2 > bR.left - aR.left && pc.x + pw / 2 < bR.right - aR.left && pc.y + ph / 2 > bR.top - aR.top && pc.y + ph / 2 < bR.bottom - aR.top;
          if (overBoard) { mistakes += 1; ctx.audio.play('soft-no'); place(pc, pc.home.x, pc.home.y); }
        }
      };
      pc.el.addEventListener('pointerup', end);
      pc.el.addEventListener('pointercancel', end);
    }
  },
};

export const GAME_SCENES = [gamesScene, colorsGame, memoryGame, sortGame, bubblesGame, puzzleGame];
