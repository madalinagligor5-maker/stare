// Salonul de frumusețe: spălat (cu spumă și duș), coafor, machiaj, manichiură, accesorii.
// Toate schimbările de look au Anulează / Refă.

import { h, btn, tabs, optionRow, swatches, slider, toast, burst, svgFromString } from '../core/ui.js';
import { History } from '../core/history.js';
import { svgGesture, svgPoint } from '../core/input.js';
import { clone, clamp } from '../core/util.js';
import { care } from '../core/pet.js';
import { MimiLive } from '../art/mimiLive.js';
import { newPrefix, starPoints, heartPath, sparkle } from '../art/svg.js';
import { HAIRSTYLES, HAIR_DECOR, LASH_STYLES, MAKEUP_PARTS, NAIL_PATTERNS, LOOK_SLOTS, lookAccFor } from '../data/beauty.js';
import { HAIR_COLORS, MAKEUP_COLORS, NAIL_COLORS, ACC_COLORS } from '../data/colors.js';
import { ACC_VIEW, viewPreview } from './common.js';

const TABS = [
  { id: 'face', name: 'Față', icon: '🧖' },
  { id: 'makeup', name: 'Machiaj', icon: '💄' },
  { id: 'hair', name: 'Coafură', icon: '💇' },
  { id: 'nails', name: 'Unghii', icon: '💅' },
  { id: 'wash', name: 'Spălat', icon: '🛁' },
  { id: 'acc', name: 'Accesorii', icon: '🎀' },
];
// Măștile de la "Față" (tratament de spa, doar pentru joacă: nu se salvează).
const MASKS = [
  { id: 'capsuni', name: 'Căpșuni', icon: '🍓', color: '#ffb3cf' },
  { id: 'kiwi', name: 'Kiwi', icon: '🥝', color: '#c8ec9a' },
  { id: 'lapte', name: 'Lapte', icon: '🥛', color: '#fff4e6' },
  { id: 'miere', name: 'Miere', icon: '🍯', color: '#ffd98a' },
];
function spaMarkup(spa) {
  let s = '';
  if (spa.mask) {
    const c = MASKS.find((m) => m.id === spa.mask).color;
    // mască pe față, cu găuri pentru ochi, nas și gură
    s += `<path fill-rule="evenodd" fill="${c}" opacity=".93" d="M150 92 C 210 92 236 116 236 146 C 236 178 200 194 150 194 C 100 194 64 178 64 146 C 64 116 90 92 150 92 Z M114 104 a 24 27 0 1 0 0.1 0 Z M186 104 a 24 27 0 1 0 0.1 0 Z M150 150 a 11 9 0 1 0 0.1 0 Z M150 166 a 18 12 0 1 0 0.1 0 Z"/>`;
    for (const [x, y] of [[84, 160], [216, 160], [130, 186], [172, 186], [150, 104]]) s += `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".6"/>`;
  }
  if (spa.cucumber) {
    for (const x of [114, 186]) s += `<circle cx="${x}" cy="130" r="25" fill="#5cb85c" stroke="#3f8a4a" stroke-width="3"/><circle cx="${x}" cy="130" r="19" fill="#d9f5c0"/><g fill="#b8e0a0">${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${(x + Math.cos(i) * 10).toFixed(1)}" cy="${(130 + Math.sin(i) * 10).toFixed(1)}" rx="2.5" ry="4"/>`).join('')}</g>`;
  }
  if (spa.towel) {
    s += '<path d="M58 104 C 48 30 110 2 150 6 C 190 2 252 30 242 104 C 214 74 86 74 58 104 Z" fill="#ffd1e6" stroke="#f0a8c8" stroke-width="3"/><path d="M90 60 Q 150 20 210 60 M100 82 Q 150 50 200 82" stroke="#f0a8c8" stroke-width="3" fill="none"/><path d="M118 10 Q 150 -16 182 10 Q 150 22 118 10 Z" fill="#ffc2dc" stroke="#f0a8c8" stroke-width="3"/>';
  }
  return s;
}
// Decorul băii (în coordonatele pisicuței).
function bathBack() {
  let s = '<rect x="-10" y="-50" width="320" height="470" fill="#e9dcff"/>';
  for (let x = -10; x < 310; x += 40) s += `<path d="M${x} -50 L ${x} 420" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  for (let y = -50; y < 420; y += 40) s += `<path d="M-10 ${y} L 310 ${y}" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  s += '<ellipse cx="40" cy="20" rx="34" ry="44" fill="#fff" stroke="#ffb3d1" stroke-width="5"/><ellipse cx="40" cy="20" rx="26" ry="36" fill="#dff4ff"/><rect x="236" y="70" width="70" height="8" rx="3" fill="#fff"/><rect x="242" y="44" width="14" height="26" rx="5" fill="#ff8fc7"/><rect x="262" y="50" width="14" height="20" rx="5" fill="#9ee6e0"/><circle cx="290" cy="60" r="10" fill="#ffd36b"/>';
  return s;
}
function bathFront(duckY = 0) {
  let foam = '';
  for (let i = 0; i < 16; i++) foam += `<circle cx="${-6 + i * 21}" cy="${296 + (i % 3) * 4}" r="${14 + (i % 4) * 3}" fill="#fff" stroke="#dff1ff" stroke-width="2"/>`;
  return `<path d="M-10 300 L 310 300 L 300 400 Q 296 420 270 420 L 30 420 Q 4 420 0 400 Z" fill="#fff" stroke="#ffb3d1" stroke-width="6"/><rect x="-14" y="294" width="328" height="14" rx="7" fill="#ff9cc8"/>${foam}<g class="duck" transform="translate(236 ${282 + duckY})"><ellipse cx="0" cy="8" rx="22" ry="13" fill="#ffd93b" stroke="#e0a800" stroke-width="2"/><circle cx="12" cy="-8" r="11" fill="#ffd93b" stroke="#e0a800" stroke-width="2"/><path d="M21 -8 L 31 -5 L 21 -2 Z" fill="#ff8a3d"/><circle cx="14" cy="-11" r="2" fill="#333"/></g>`;
}
const VIEW = { face: '40 10 220 210', wash: '-10 -50 320 470', hair: '-10 -40 320 340', makeup: '40 10 220 210', acc: '-10 -50 320 470' };
const MAKEUP_TARGET = { shadow: [150, 100], lashes: [150, 112], lips: [150, 172], blush: [150, 160], glitter: [150, 140] };

// ---------- Unghii mari (pentru manichiură) ----------
export function nailMarkup(n, cx, cy, ang, p, idx, selected) {
  const id = `${p}-n${idx}`;
  const base = n.color || '#fbe3e8';
  let s = `<g transform="translate(${cx} ${cy}) rotate(${ang})" data-nail="${idx}" style="cursor:pointer">`;
  s += `<defs><clipPath id="${id}c"><ellipse rx="17" ry="23"/></clipPath>`;
  if (n.pattern === 'degrade' && n.color) s += `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${n.color}"/><stop offset="1" stop-color="${n.color2}"/></linearGradient>`;
  s += '</defs>';
  s += `<ellipse rx="22" ry="28" fill="#ffe3cc" stroke="#e2b298" stroke-width="2"/>`;
  s += `<ellipse rx="17" ry="23" fill="${n.pattern === 'degrade' && n.color ? `url(#${id}g)` : base}" stroke="${n.color ? 'rgba(0,0,0,.2)' : '#e8c3c9'}" stroke-width="2"/>`;
  if (n.color) {
    let pat = '';
    const c2 = n.color2 || '#fff';
    switch (n.pattern) {
      case 'buline': pat = [[-6, -10], [6, -2], [-5, 8], [6, 14], [0, -18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c2}"/>`).join(''); break;
      case 'linii': pat = [-12, -2, 8, 18].map((y) => `<rect x="-20" y="${y}" width="40" height="4" fill="${c2}" transform="rotate(-25)"/>`).join(''); break;
      case 'stele': pat = `<polygon points="${starPoints(0, 0, 10, 4.5)}" fill="${c2}"/><polygon points="${starPoints(-6, -14, 4, 1.8)}" fill="${c2}"/>`; break;
      case 'inimioare': pat = `<path d="${heartPath(0, 0, 1)}" fill="${c2}"/><path d="${heartPath(5, -14, 0.45)}" fill="${c2}"/>`; break;
      default: break;
    }
    s += `<g clip-path="url(#${id}c)">${pat}${n.glitter ? [[-7, -12], [5, -4], [-3, 6], [7, 12], [0, -18], [-8, 14]].map(([x, y], i) => sparkle(x, y, 3.2, '#fff', `class="twinkle" style="animation-delay:${i * 0.2}s"`)).join('') : ''}</g>`;
    s += '<path d="M-9 -14 Q -10 -2 -7 8" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>';
  }
  if (selected) s += '<ellipse rx="25" ry="31" fill="none" stroke="#7c4dff" stroke-width="3" stroke-dasharray="6 5" class="sel-ring"/>';
  s += '</g>';
  return s;
}

function pawsMarkup(nails, p, selectedSet) {
  let s = '';
  [[110, 160], [290, 160]].forEach(([px, py], k) => {
    s += `<ellipse cx="${px}" cy="${py + 30}" rx="86" ry="74" fill="#ffe3cc" stroke="#e2b298" stroke-width="3"/>`;
    s += `<path d="M${px - 26} ${py + 50} Q ${px} ${py + 24} ${px + 26} ${py + 50} Q ${px + 30} ${py + 76} ${px} ${py + 78} Q ${px - 30} ${py + 76} ${px - 26} ${py + 50} Z" fill="#ffb8cf"/>`;
    for (let i = 0; i < 5; i++) {
      const deg = 205 + i * 32.5;
      const a = (deg * Math.PI) / 180;
      const idx = k * 5 + (k ? i : 4 - i);
      s += `<circle cx="${px + Math.cos(a) * 44}" cy="${py + 30 + Math.sin(a) * 40}" r="13" fill="#ffc9d9"/>`;
      s += nailMarkup(nails[idx], px + Math.cos(a) * 74, py + 30 + Math.sin(a) * 68, deg + 90, p, idx, selectedSet.has(idx));
    }
  });
  return s;
}

export const salonScene = {
  id: 'salon',
  title: 'Salon de frumusețe',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const bath = !!params.bath;
    let tab = bath ? 'wash' : params.tab || 'face';
    const spa = { mask: null, cucumber: false, towel: false };
    const hist = new History(80);
    hist.reset(s.look);
    const hairState = { messy: 0.75, wet: 0 };
    let changedSinceReward = { face: false, hair: false, makeup: false, nails: false, acc: false };
    const p = newPrefix('sl');

    // ---- scena ----
    const svg = svgFromString('<svg viewBox="-10 -50 320 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Angy la salon"><g class="bath-bg"></g><g class="mimi"></g><g class="bath-front"></g><g class="spa"></g><g class="paws"></g></svg>');
    const spaG = svg.querySelector('.spa');
    const drawSpa = () => { spaG.innerHTML = tab === 'face' ? spaMarkup(spa) : ''; };
    if (bath) {
      svg.querySelector('.bath-bg').innerHTML = bathBack();
      svg.querySelector('.bath-front').innerHTML = bathFront();
      // rățușca: atingi și face „mac”
      svg.addEventListener('pointerdown', (e) => {
        if (!e.target.closest?.('.duck')) return;
        ctx.audio.tone({ freq: 900, to: 600, dur: 0.18, vol: 0.2, type: 'square', filter: { type: 'bandpass', freq: 1200, q: 3 } });
        burst(e.clientX, e.clientY, ['🦆', '🫧'], 5);
      });
    }
    const mimiG = svg.querySelector('.mimi');
    const pawsG = svg.querySelector('.paws');
    const canvas = h('canvas', { class: 'wash-canvas', style: { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' } });
    const stage = h('div', { class: 'editor-stage' }, svg, canvas);
    const mimi = new MimiLive(mimiG, {
      getLook: () => s.look,
      getDesign: () => (tab === 'wash' ? null : s.look.outfit),
      scope, audio: ctx.audio,
      reducedMotion: () => s.settings.reducedMotion,
      hairState: () => (tab === 'hair' || tab === 'wash' ? hairState : null),
    });
    const undoBtn = btn({ icon: '↩️', title: 'Anulează', onClick: () => undoRedo('undo') });
    const redoBtn = btn({ icon: '↪️', title: 'Refă', onClick: () => undoRedo('redo') });
    const doneBtn = btn({ icon: '⭐', label: 'Gata!', cls: 'btn-ok', say: true, onClick: () => finishStation(doneBtn) });
    stage.appendChild(h('div', { class: 'stage-tools' }, undoBtn, redoBtn, h('div', { class: 'spacer' }), doneBtn));
    const toolCursor = h('div', { class: 'wand', hidden: true }, '');
    document.body.appendChild(toolCursor);
    scope.add(() => toolCursor.remove());

    const panelBody = h('div', { class: 'panel-body' });
    const tabRow = tabs(TABS, tab, (id) => { tab = id; setupTab(); });
    if (bath) tabRow.hidden = true;
    root.appendChild(h('div', { class: 'editor' }, stage, h('div', { class: 'editor-panel' }, tabRow, panelBody)));
    const label = (t) => h('div', { class: 'panel-label' }, t);

    function refreshTools() {
      undoBtn.disabled = !hist.canUndo;
      redoBtn.disabled = !hist.canRedo;
      doneBtn.hidden = tab === 'wash' || tab === 'face';
    }
    function lookChanged(kind) {
      hist.push(s.look);
      changedSinceReward[kind] = true;
      ctx.store.commit();
      mimi.render();
      if (tab === 'nails') drawPaws();
      refreshTools();
    }
    function undoRedo(which) {
      const snap = which === 'undo' ? hist.undo() : hist.redo();
      if (!snap) return;
      s.look = snap;
      ctx.store.commit();
      ctx.audio.play('whoosh');
      mimi.render();
      if (tab === 'nails') drawPaws();
      renderPanel();
      refreshTools();
    }
    function finishStation(el) {
      const kind = tab === 'acc' ? 'acc' : tab;
      if (!changedSinceReward[kind]) { toast('Încearcă ceva nou mai întâi! ✨', '💡'); ctx.audio.play('soft-no'); return; }
      changedSinceReward[kind] = false;
      ctx.track({ face: 'face', hair: 'hair', makeup: 'makeup', nails: 'nails', acc: 'salonacc' }[kind]);
      care(s.pet, 'love', 4);
      ctx.reward(3, el);
      mimi.flash('giggle', 1400);
      ctx.audio.play('tada');
      const r = stage.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['✨', '💖', '⭐'], 14);
      toast(['Arată superb!', 'Minunat!', 'Ce frumoasă e!', 'Bravo!'][Math.floor(Math.random() * 4)], '💖');
    }

    // Pensula zboară de la buton spre un punct de pe Angy.
    function flyBrush(fromEl, fx, fy, icon = '🖌️') {
      const m = mimiG.getScreenCTM();
      if (!m || !fromEl) return;
      const tx = fx * m.a + fy * m.c + m.e, ty = fx * m.b + fy * m.d + m.f;
      const r = fromEl.getBoundingClientRect();
      const el = h('div', { class: 'wand', style: { left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px` } }, icon);
      document.body.appendChild(el);
      const dur = s.settings.reducedMotion ? 1 : 450;
      const anim = el.animate?.([
        { transform: 'translate(-50%,-50%) scale(.8)' },
        { transform: `translate(calc(-50% + ${tx - r.left - r.width / 2}px), calc(-50% + ${ty - r.top - r.height / 2}px)) scale(1.1) rotate(-20deg)` },
      ], { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
      const done = () => { el.remove(); burst(tx, ty, ['✨'], 4); };
      if (anim) anim.onfinish = done; else setTimeout(done, dur);
      scope.add(() => el.remove());
    }

    // ================= SPĂLAT =================
    const CELL = 12;
    let wash = null; // { cells:[{x,y,dirt,foam,wet}], step:'soap'|'rinse'|'dry'|'done', drops:[] }
    function insideBody(x, y) {
      if (bath && y > 292) return false; // în cadă: doar ce se vede deasupra spumei
      if (((x - 150) / 92) ** 2 + ((y - 118) / 80) ** 2 < 1) return true;
      if (x > 114 && x < 186 && y > 196 && y < 312) return true;
      if (x > 124 && x < 176 && y > 300 && y < 398) return true;
      if (y > 210 && y < 296 && ((x > 86 && x < 124) || (x > 176 && x < 214))) return true;
      return false;
    }
    function newWash() {
      const dirtiness = clamp(1 - s.pet.needs.clean / 100, 0.35, 0.9);
      const cells = [];
      for (let y = 30; y < 400; y += CELL) for (let x = 56; x < 246; x += CELL) if (insideBody(x, y)) cells.push({ x, y, dirt: 0, foam: 0, wet: 0 });
      const blobs = 6 + Math.round(dirtiness * 10);
      for (let i = 0; i < blobs; i++) {
        const c = cells[Math.floor(Math.random() * cells.length)];
        const r = 18 + Math.random() * 22;
        for (const d of cells) if (Math.hypot(d.x - c.x, d.y - c.y) < r) d.dirt = Math.max(d.dirt, 0.6 + Math.random() * 0.4);
      }
      return { cells, step: 'soap', drops: [], progress: 0 };
    }
    function sizeCanvas() {
      const r = stage.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    }
    function drawWash() {
      const g = canvas.getContext('2d');
      g.clearRect(0, 0, canvas.width, canvas.height);
      if (tab !== 'wash' || !wash) return;
      const m = mimiG.getScreenCTM();
      const cr = canvas.getBoundingClientRect();
      if (!m || !cr.width) return;
      const k = canvas.width / cr.width;
      const tx = (x, y) => [(x * m.a + y * m.c + m.e - cr.left) * k, (x * m.b + y * m.d + m.f - cr.top) * k];
      const scale = m.a * k;
      for (const c of wash.cells) {
        const [cx, cy] = tx(c.x, c.y);
        if (c.wet > 0.05) { g.fillStyle = `rgba(120,190,255,${0.22 * c.wet})`; g.beginPath(); g.arc(cx, cy, CELL * 0.75 * scale, 0, 7); g.fill(); }
        if (c.dirt > 0.03) { g.fillStyle = `rgba(139,94,60,${0.7 * c.dirt})`; g.beginPath(); g.arc(cx, cy, CELL * 0.85 * scale, 0, 7); g.fill(); }
      }
      for (const c of wash.cells) {
        if (c.foam <= 0.05) continue;
        const [cx, cy] = tx(c.x, c.y);
        const r = CELL * (0.35 + 0.45 * c.foam + ((c.x * 13 + c.y * 7) % 5) * 0.06) * scale;
        g.fillStyle = 'rgba(255,255,255,.92)'; g.strokeStyle = 'rgba(150,200,255,.8)'; g.lineWidth = 1.2 * k;
        const jx = (((c.x * 31 + c.y * 17) % 11) - 5) * scale, jy = (((c.x * 13 + c.y * 29) % 11) - 5) * scale;
        g.beginPath(); g.arc(cx + jx, cy + jy, r, 0, 7); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,1)'; g.beginPath(); g.arc(cx + jx - r * 0.3, cy + jy - r * 0.3, r * 0.25, 0, 7); g.fill();
      }
      g.fillStyle = 'rgba(110,190,255,.85)';
      for (const d of wash.drops) {
        const [cx, cy] = tx(d.x, d.y);
        g.beginPath(); g.ellipse(cx, cy, 2.2 * k, 5 * k, 0, 0, 7); g.fill();
      }
    }
    function washProgress() {
      const cs = wash.cells;
      if (wash.step === 'soap') return cs.filter((c) => c.foam > 0.45).length / cs.length / 0.6;
      if (wash.step === 'rinse') return cs.filter((c) => c.foam < 0.1 && c.dirt < 0.1).length / cs.length / 0.92;
      if (wash.step === 'dry') return cs.filter((c) => c.wet < 0.15).length / cs.length / 0.85;
      return 1;
    }
    function washAt(pt) {
      if (!wash || wash.step === 'done') return;
      if (wash.step === 'soap') {
        for (const c of wash.cells) { const d = Math.hypot(c.x - pt.x, c.y - pt.y); if (d < 26) c.foam = Math.min(1, c.foam + 0.22 * (1 - d / 26) + 0.05); }
        ctx.audio.play('scrub', 120);
      } else if (wash.step === 'rinse') {
        for (let i = 0; i < 3; i++) wash.drops.push({ x: pt.x + (Math.random() - 0.5) * 30, y: pt.y, vy: 260 + Math.random() * 120 });
        for (const c of wash.cells) {
          if (Math.abs(c.x - pt.x) < 22 && c.y > pt.y - 10 && c.y < pt.y + 130) {
            c.foam = Math.max(0, c.foam - 0.12);
            if (c.foam < 0.3) c.dirt = Math.max(0, c.dirt - 0.1);
            c.wet = Math.min(1, c.wet + 0.2);
          }
        }
        ctx.audio.play('water', 160);
      } else if (wash.step === 'dry') {
        for (const c of wash.cells) { const d = Math.hypot(c.x - pt.x, c.y - pt.y); if (d < 30) c.wet = Math.max(0, c.wet - 0.15); }
        ctx.audio.play('brush', 180);
        if (Math.random() < 0.15) { const m = mimiG.getScreenCTM(); if (m) burst(pt.x * m.a + pt.y * m.c + m.e, pt.x * m.b + pt.y * m.d + m.f, ['✨'], 2); }
      }
      updateWashPanel();
    }
    let washBar = null, washHint = null, washSteps = null;
    function updateWashPanel() {
      if (!wash || !washBar) return;
      const pr = clamp(washProgress(), 0, 1);
      washBar.style.width = `${Math.round(pr * 100)}%`;
      if (pr >= 1 && wash.step !== 'done') nextWashStep();
    }
    function nextWashStep() {
      ctx.audio.play('sparkle');
      if (wash.step === 'soap') {
        wash.step = 'rinse';
        for (const c of wash.cells) c.foam = Math.max(c.foam, 0.5);
      } else if (wash.step === 'rinse') {
        wash.step = 'dry';
        for (const c of wash.cells) { c.foam = 0; c.dirt = 0; c.wet = Math.max(c.wet, 0.8); }
      } else if (wash.step === 'dry') {
        wash.step = 'done';
        for (const c of wash.cells) c.wet = 0;
        finishWash();
      }
      renderPanel();
    }
    function finishWash() {
      care(s.pet, 'clean', 100);
      care(s.pet, 'love', 5);
      hairState.wet = 1;
      hairState.messy = 0.9;
      mimi.bounce = 1;
      mimi.flash('giggle', 1800);
      ctx.audio.play('tada');
      const r = stage.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ['✨', '🫧', '💖', '⭐'], 18);
      ctx.reward(5, stage);
      ctx.track('wash');
      toast(`${s.pet.name} e curată și pufoasă!`, '🫧');
      mimi.render();
    }

    // ================= PĂR: pieptene și foehn =================
    let hairTool = 'comb';
    let lastHairRender = 0;
    function hairAt(pt) {
      if (pt.y > 200 || pt.y < -20) return;
      if (hairTool === 'comb') {
        hairState.messy = Math.max(0, hairState.messy - 0.02);
        ctx.audio.play('brush', 200);
      } else {
        hairState.wet = Math.max(0, hairState.wet - 0.025);
        hairState.messy = Math.max(0, hairState.messy - 0.006);
        ctx.audio.play('dryer', 260);
        const m = mimiG.getScreenCTM();
        if (m && Math.random() < 0.3) burst(pt.x * m.a + pt.y * m.c + m.e, pt.x * m.b + pt.y * m.d + m.f, ['💨'], 1);
      }
      const now = performance.now();
      if (now - lastHairRender > 90) { lastHairRender = now; mimi.render(); }
      if (hairState.messy === 0 && hairState.wet === 0 && !hairState.announced) {
        hairState.announced = true;
        changedSinceReward.hair = true;
        ctx.audio.play('sparkle');
        toast('Păr neted și uscat! ✨', '💇');
        mimi.render();
      }
    }

    // ---- gesturi pe scenă ----
    svgGesture(svg, {
      onStart(pt, e) {
        if (tab === 'nails') {
          const n = e.target.closest?.('[data-nail]');
          if (n) toggleNail(Number(n.dataset.nail));
          return;
        }
        if (tab === 'wash' || (tab === 'hair')) {
          toolCursor.hidden = false;
          moveCursor(e);
          handleTool(e);
          return;
        }
        mimi.react(e.target);
      },
      onMove(pt, d, e) {
        if (tab === 'wash' || tab === 'hair') { moveCursor(e); handleTool(e); }
      },
      onEnd() { toolCursor.hidden = true; },
    }, scope);
    function moveCursor(e) {
      toolCursor.textContent = tab === 'wash' ? ({ soap: '🧽', rinse: '🚿', dry: '🧺', done: '✨' }[wash?.step] || '🧽') : hairTool === 'comb' ? '🪮' : '💨';
      toolCursor.style.left = `${e.clientX}px`;
      toolCursor.style.top = `${e.clientY - 20}px`;
    }
    function handleTool(e) {
      // coordonate în spațiul lui Angy
      const m = mimiG.getScreenCTM();
      if (!m) return;
      const inv = m.inverse();
      const pt = { x: e.clientX * inv.a + e.clientY * inv.c + inv.e, y: e.clientX * inv.b + e.clientY * inv.d + inv.f };
      if (tab === 'wash') washAt(pt); else hairAt(pt);
    }

    // ================= UNGHII =================
    const selectedNails = new Set([0]);
    function drawPaws() { pawsG.innerHTML = tab === 'nails' ? pawsMarkup(s.look.nails, p, selectedNails) : ''; }
    function toggleNail(i) {
      if (selectedNails.size === 10) selectedNails.clear();
      if (selectedNails.has(i) && selectedNails.size > 1) selectedNails.delete(i); else { selectedNails.clear(); selectedNails.add(i); }
      ctx.audio.play('pop');
      drawPaws();
      renderPanel();
    }
    function applyNails(fn, fromEl) {
      for (const i of selectedNails) fn(s.look.nails[i]);
      ctx.audio.play('brush');
      lookChanged('nails');
      const pulse = pawsG.querySelector(`[data-nail="${[...selectedNails][0]}"]`);
      if (pulse) { const r = pulse.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, ['✨', '💅'], 5); }
    }

    // ================= panouri =================
    let makeupPart = 'shadow';
    let accSlot = 'bow';
    function renderPanel() {
      panelBody.innerHTML = '';
      const add = (...els) => els.forEach((e) => panelBody.appendChild(e));
      const L = s.look;
      switch (tab) {
        case 'face': {
          add(label('Tratament de spa pentru față'));
          add(h('div', { class: 'row' },
            btn({ icon: '🧖', label: spa.towel ? 'Prosop: DA' : 'Prosop pe cap', cls: spa.towel ? 'on' : 'btn-soft', onClick: () => { spa.towel = !spa.towel; spaChanged(); } }),
            btn({ icon: '🥒', label: spa.cucumber ? 'Castraveți: DA' : 'Castraveți', cls: spa.cucumber ? 'on' : 'btn-soft', onClick: () => { spa.cucumber = !spa.cucumber; spaChanged(); } })));
          add(label('Mască'), optionRow(MASKS, spa.mask, (o) => { spa.mask = spa.mask === o.id ? null : o.id; spaChanged(); }));
          add(btn({ icon: '🚿', label: 'Clătește fața (gata!)', cls: 'btn-primary btn-big', say: true, onClick: (e) => {
            if (!spa.mask && !spa.cucumber && !spa.towel) { toast('Pune întâi o mască sau castraveți! 🥒', '💡'); ctx.audio.play('soft-no'); return; }
            spa.mask = null; spa.cucumber = false; spa.towel = false;
            ctx.audio.play('water');
            care(s.pet, 'clean', 10);
            changedSinceReward.face = true;
            drawSpa();
            mimi.flash('happy', 400);
            finishStation(e.currentTarget || doneBtn);
            renderPanel();
          } }));
          break;
        }
        case 'wash': {
          const steps = [['soap', '🧽', 'Săpun'], ['rinse', '🚿', 'Duș'], ['dry', '🧺', 'Prosop']];
          washSteps = h('div', { class: 'tailor-steps' }, steps.map(([id, ic, nm]) => {
            const idx = steps.findIndex((x) => x[0] === wash.step);
            const my = steps.findIndex((x) => x[0] === id);
            return h('div', { class: `step-dot ${wash.step === id ? 'on' : ''} ${wash.step === 'done' || my < idx ? 'done' : ''}`, title: nm }, ic);
          }));
          const text = { soap: 'Freacă-o pe Angy cu buretele ca să facă spumă!', rinse: 'Trage dușul peste ea ca să clătești spuma și noroiul!', dry: 'Șterge-o cu prosopul până se usucă!', done: 'Gata! Angy e curată! 🫧' }[wash.step];
          washHint = h('p', { class: 'hint' }, text);
          washBar = h('div');
          add(washSteps, washHint, h('div', { class: 'progress' }, washBar));
          if (wash.step === 'done') add(h('div', { class: 'row row-center' }, btn({ icon: '🛁', label: 'Mai spală o dată', cls: 'btn-soft', onClick: () => { wash = newWash(); renderPanel(); } }), btn({ icon: '💇', label: 'Mergi la coafor', cls: 'btn-primary', onClick: () => { if (bath) { ctx.go('salon', { tab: 'hair' }); return; } tab = 'hair'; tabRow.mark('hair'); setupTab(); } })));
          updateWashPanel();
          break;
        }
        case 'hair': {
          const toolRow = h('div', { class: 'row' },
            btn({ icon: '🪮', label: 'Pieptene', cls: hairTool === 'comb' ? 'on' : 'btn-soft', onClick: () => { hairTool = 'comb'; renderPanel(); } }),
            btn({ icon: '💨', label: 'Foehn', cls: hairTool === 'dryer' ? 'on' : 'btn-soft', onClick: () => { hairTool = 'dryer'; renderPanel(); } }),
            h('span', { class: 'hint' }, hairState.wet > 0 ? 'Usucă părul cu foehnul!' : hairState.messy > 0 ? 'Pieptănă părul ciufulit!' : 'Păr perfect! ✨'));
          add(toolRow);
          add(label('Coafura'), optionRow(HAIRSTYLES.map((x) => ({ ...x, icon: hairIcon(x) })), L.hair.style, (o) => { L.hair.style = o.id; ctx.audio.play('whoosh'); lookChanged('hair'); }));
          add(label('Culoarea părului'), swatches(HAIR_COLORS, L.hair.color, (c) => { L.hair.color = c; lookChanged('hair'); renderPanel(); }));
          const g = btn({ icon: L.hair.gradient ? '🌈' : '⬜', label: L.hair.gradient ? 'Degrade: DA' : 'Degrade: NU', cls: L.hair.gradient ? 'on' : 'btn-soft', onClick: () => { L.hair.gradient = !L.hair.gradient; lookChanged('hair'); renderPanel(); } });
          add(h('div', { class: 'row' }, g));
          if (L.hair.gradient) add(label('A doua culoare (vârfuri)'), swatches(HAIR_COLORS, L.hair.color2, (c) => { L.hair.color2 = c; lookChanged('hair'); renderPanel(); }));
          add(label('Împletituri și decor'), optionRow(HAIR_DECOR, L.hair.decor, (o) => { L.hair.decor = o.id; ctx.audio.play('sparkle'); lookChanged('hair'); renderPanel(); }));
          if (L.hair.decor !== 'none') add(swatches(ACC_COLORS, L.hair.decorColor, (c) => { L.hair.decorColor = c; lookChanged('hair'); }));
          break;
        }
        case 'makeup': {
          add(optionRow(MAKEUP_PARTS, makeupPart, (o) => { makeupPart = o.id; renderPanel(); }));
          const part = L.makeup[makeupPart];
          if (makeupPart === 'lashes') {
            add(label('Forma genelor'), optionRow(LASH_STYLES.map((x) => ({ ...x, icon: '👁️' })), part.style, (o, el) => { part.style = o.id; flyBrush(el, 150, 112, '🖌️'); ctx.audio.play('brush'); lookChanged('makeup'); }));
            add(label('Culoarea genelor'), swatches(['#3a2840', '#2d2a3a', '#7a4b2f', ...MAKEUP_COLORS.slice(0, 9)], part.color, (c) => { part.color = c; ctx.audio.play('brush'); lookChanged('makeup'); }));
          } else {
            add(label('Culoare'), swatches(MAKEUP_COLORS, part.color, (c) => {
              part.color = c;
              const [fx, fy] = MAKEUP_TARGET[makeupPart];
              flyBrush(panelBody.querySelector('.swatch.on') || panelBody, fx, fy, makeupPart === 'lips' ? '💄' : '🖌️');
              ctx.audio.play('brush');
              lookChanged('makeup');
            }, { allowNone: true, noneLabel: 'Fără machiaj' }));
            const sl = slider({ label: 'Intensitate', icon: '🔆', min: 10, max: 100, value: part.amount, onInput: (v) => { part.amount = v; mimi.render(); } });
            sl.querySelector('input').addEventListener('change', () => lookChanged('makeup'));
            add(sl);
          }
          add(btn({ icon: '🧼', label: 'Demachiază tot', cls: 'btn-soft', onClick: () => { for (const k of ['shadow', 'lips', 'glitter']) L.makeup[k].color = null; L.makeup.blush.color = '#ff9db5'; L.makeup.blush.amount = 35; L.makeup.lashes.style = 'naturale'; ctx.audio.play('water'); lookChanged('makeup'); renderPanel(); } }));
          break;
        }
        case 'nails': {
          const sel = [...selectedNails];
          const cur = s.look.nails[sel[0]];
          add(h('div', { class: 'row' },
            h('span', { class: 'hint' }, selectedNails.size === 10 ? 'Toate unghiile' : `Unghia ${sel[0] + 1} (atinge altă unghie)`),
            btn({ icon: '🖐️', label: 'Toate', cls: selectedNails.size === 10 ? 'on' : 'btn-soft', onClick: () => { if (selectedNails.size === 10) { selectedNails.clear(); selectedNails.add(0); } else { for (let i = 0; i < 10; i++) selectedNails.add(i); } drawPaws(); renderPanel(); } }),
          ));
          add(label('Ojă'), swatches(NAIL_COLORS, cur.color, (c) => applyNails((n) => { n.color = c; }), { allowNone: true, noneLabel: 'Fără ojă' }));
          add(label('Model'), optionRow(NAIL_PATTERNS, cur.pattern, (o) => applyNails((n) => { n.pattern = o.id; if (!n.color) n.color = '#ff8fc7'; })));
          add(label('A doua culoare (pentru model)'), swatches(NAIL_COLORS, cur.color2, (c) => applyNails((n) => { n.color2 = c; })));
          add(btn({ icon: '✨', label: cur.glitter ? 'Sclipici: DA' : 'Sclipici: NU', cls: cur.glitter ? 'on' : 'btn-soft', onClick: () => { const v = !cur.glitter; applyNails((n) => { n.glitter = v; if (!n.color) n.color = '#ff8fc7'; }); renderPanel(); } }));
          break;
        }
        case 'acc': {
          add(optionRow(LOOK_SLOTS, accSlot, (o) => { accSlot = o.id; renderPanel(); }));
          const cur = L.acc[accSlot];
          const color = cur?.color || '#ff5fa2';
          const vb = ACC_VIEW[accSlot === 'crown' ? 'crown2' : accSlot];
          const opts = [{ id: '__none', name: 'Fără', icon: '🚫' }, ...lookAccFor(accSlot).map((a) => ({ ...a, icon: viewPreview(a.draw(color), vb) }))];
          add(optionRow(opts, cur?.id || '__none', (o) => {
            L.acc[accSlot] = o.id === '__none' ? null : { id: o.id, color };
            ctx.audio.play(o.id === '__none' ? 'whoosh' : 'sparkle');
            lookChanged('acc');
          }));
          add(label('Culoare'), swatches(ACC_COLORS, cur?.color, (c) => { if (L.acc[accSlot]) { L.acc[accSlot].color = c; lookChanged('acc'); } renderPanel(); }));
          break;
        }
        default: break;
      }
    }

    function hairIcon(style) {
      const f = s.look.hair.color;
      return `<svg viewBox="30 -10 240 220" xmlns="http://www.w3.org/2000/svg">${style.back(f)}<path d="M150 40 C 205 40 240 72 240 118 C 240 168 200 196 150 196 C 100 196 60 168 60 118 C 60 72 95 40 150 40 Z" fill="#ffe3cc" stroke="#e2b298" stroke-width="3"/>${style.front(f)}</svg>`;
    }

    function spaChanged() {
      ctx.audio.play('sparkle');
      drawSpa();
      if (spa.cucumber || spa.mask) mimi.flash('purr', 600000); else mimi.flash('happy', 300);
      renderPanel();
    }
    function setupTab() {
      drawSpa();
      if (tab !== 'face' && mimi.tempExpr === 'purr') mimi.flash('happy', 200);
      svg.setAttribute('viewBox', tab === 'nails' ? '0 40 400 260' : VIEW[tab]);
      mimiG.style.display = tab === 'nails' ? 'none' : '';
      if (tab === 'wash' && (!wash || wash.step === 'done')) wash = newWash();
      if (tab === 'hair') hairState.announced = false;
      drawPaws();
      mimi.render();
      renderPanel();
      refreshTools();
      sizeCanvas();
    }

    // bucla de animație pentru picăturile de apă
    scope.loop((dt) => {
      if (tab !== 'wash' || !wash) { if (canvas.dataset.dirty) { canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); delete canvas.dataset.dirty; } return; }
      for (const d of wash.drops) { d.y += d.vy * dt; }
      wash.drops = wash.drops.filter((d) => d.y < 420);
      drawWash();
      canvas.dataset.dirty = '1';
    });
    scope.on(window, 'resize', sizeCanvas);
    setupTab();
    requestAnimationFrame(sizeCanvas);
  },
};

// Baia: același spălat, dar într-o cadă cu spumă.
export const bathScene = {
  id: 'bath',
  title: 'Baie',
  back: 'home',
  mount(root, ctx, params, scope) { return salonScene.mount(root, ctx, { ...params, bath: true }, scope); },
};
