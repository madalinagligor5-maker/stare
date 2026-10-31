// Decorarea camerei: tapet, podea, mobilă; mutare cu degetul, grilă, oglindire, ștergere.

import { h, btn, tabs, optionRow, toast, svgFromString } from '../core/ui.js';
import { History } from '../core/history.js';
import { svgGesture } from '../core/input.js';
import { clamp, uid } from '../core/util.js';
import { isUnlocked } from '../core/economy.js';
import { renderRoom } from '../art/room.js';
import { newPrefix } from '../art/svg.js';
import { FURNITURE, WALLPAPERS, FLOORS, FURNITURE_CATS, ROOM_W, ROOM_H } from '../data/furniture.js';
import { buyFlow, withLocks } from './common.js';

export const MAX_ITEMS = 40;

export function furniturePreview(def) {
  const vb = def.wall ? '-95 -70 190 140' : def.flat ? '-115 -60 230 70' : '-95 -170 190 180';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${def.draw()}</svg>`;
}
export function surfacePreview(def, kind) {
  const p = newPrefix('sp');
  const d = def.draw(p);
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs>${d.defs}</defs><rect width="80" height="80" rx="12" fill="${d.fill}"/></svg>`;
}

export const roomScene = {
  id: 'room',
  title: 'Decorează camera',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const R = () => s.room;
    const hist = new History(60);
    hist.reset(s.room);
    let selected = null;
    let tab = 'obiecte';
    let cat = 'toate';
    const p = newPrefix('rm');

    const svg = svgFromString(`<svg viewBox="0 0 ${ROOM_W} ${ROOM_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Camera de decorat"><g class="room"></g></svg>`);
    const roomG = svg.querySelector('.room');
    const stage = h('div', { class: 'editor-stage' }, svg);
    const undoBtn = btn({ icon: '↩️', title: 'Anulează', onClick: () => undoRedo('undo') });
    const redoBtn = btn({ icon: '↪️', title: 'Refă', onClick: () => undoRedo('redo') });
    const gridBtn = btn({ icon: '▦', label: 'Grilă', cls: s.settings.gridSnap ? 'on' : '', onClick: () => { s.settings.gridSnap = !s.settings.gridSnap; gridBtn.classList.toggle('on', s.settings.gridSnap); ctx.store.commit(); draw(); } });
    stage.appendChild(h('div', { class: 'stage-tools' }, undoBtn, redoBtn, h('div', { class: 'spacer' }), gridBtn));
    const selBar = h('div', { class: 'stage-bottom sel-tools', hidden: true });
    stage.appendChild(selBar);

    function draw() {
      roomG.innerHTML = renderRoom(R(), { p, phase: 'day', interactive: true, selected, grid: s.settings.gridSnap });
      undoBtn.disabled = !hist.canUndo;
      redoBtn.disabled = !hist.canRedo;
      renderSelBar();
    }
    function commit() { hist.push(s.room); ctx.store.commit(); draw(); }
    function undoRedo(which) {
      const snap = which === 'undo' ? hist.undo() : hist.redo();
      if (!snap) return;
      s.room = snap;
      if (selected && !s.room.items.some((i) => i.uid === selected)) selected = null;
      ctx.store.commit();
      ctx.audio.play('whoosh');
      draw();
      renderPanel();
    }
    const selItem = () => R().items.find((i) => i.uid === selected) || null;
    const snap = (v) => (s.settings.gridSnap ? Math.round(v / 20) * 20 : Math.round(v));

    let drag = null, pinchBase = null;
    svgGesture(svg, {
      onStart(pt, e) {
        const g = e.target.closest?.('[data-item]');
        if (!g) { drag = null; return; }
        const it = R().items.find((i) => i.uid === g.dataset.item);
        if (!it) return;
        if (selected !== it.uid) { selected = it.uid; draw(); ctx.audio.play('pop'); }
        drag = { it, dx: pt.x - it.x, dy: pt.y - it.y, moved: false };
      },
      onMove(pt) {
        if (!drag) return;
        drag.it.x = clamp(snap(pt.x - drag.dx), 10, ROOM_W - 10);
        drag.it.y = clamp(snap(pt.y - drag.dy), 30, ROOM_H - 4);
        drag.moved = true;
        draw();
      },
      onPinchStart() { const it = selItem(); if (it) pinchBase = it.s; },
      onPinch({ scale }) { const it = selItem(); if (it && pinchBase) { it.s = +clamp(pinchBase * scale, 0.5, 2).toFixed(2); draw(); } },
      onEnd(pt, info) {
        if ((drag && drag.moved) || info.pinched) { ctx.audio.play('place'); commit(); }
        drag = null; pinchBase = null;
      },
      onTap(pt, e) { if (!e.target.closest?.('[data-item]') && selected) { selected = null; draw(); } },
    }, scope);

    function editSel(fn, sound = 'pop') { const it = selItem(); if (!it) return; fn(it); ctx.audio.play(sound); commit(); }
    function renderSelBar() {
      const it = selItem();
      selBar.hidden = !it;
      if (!it) return;
      selBar.innerHTML = '';
      const B = (icon, title, fn) => selBar.appendChild(btn({ icon, title, sound: null, onClick: fn }));
      B('↔️', 'Oglindește', () => editSel((x) => { x.flip = !x.flip; }));
      B('➕', 'Mărește', () => editSel((x) => { x.s = +Math.min(2, x.s * 1.15).toFixed(2); }));
      B('➖', 'Micșorează', () => editSel((x) => { x.s = +Math.max(0.5, x.s / 1.15).toFixed(2); }));
      B('⬆️', 'Adu în față', () => editSel((x) => { x.z = Math.max(0, ...R().items.map((i) => i.z || 0)) + 1; }));
      B('⬇️', 'Trimite în spate', () => editSel((x) => { x.z = Math.min(0, ...R().items.map((i) => i.z || 0)) - 1; }));
      B('🗑️', 'Scoate din cameră', () => editSel((x) => { s.room.items = R().items.filter((i) => i !== x); selected = null; }, 'whoosh'));
      B('✔', 'Gata', () => { selected = null; draw(); });
    }

    const panelBody = h('div', { class: 'panel-body' });
    const tabRow = tabs([{ id: 'obiecte', name: 'Obiecte', icon: '🛋️' }, { id: 'tapet', name: 'Tapet', icon: '🧱' }, { id: 'podea', name: 'Podea', icon: '🟫' }], tab, (id) => { tab = id; renderPanel(); });
    root.appendChild(h('div', { class: 'editor' }, stage, h('div', { class: 'editor-panel' }, tabRow, panelBody)));

    async function placeItem(def) {
      if (!isUnlocked(s, def) && !(await buyFlow(ctx, def))) return;
      if (R().items.length >= MAX_ITEMS) { toast('Camera e plină! Scoate ceva mai întâi.', '🏠'); return; }
      const it = { uid: uid('r'), id: def.id, x: 200 + Math.round(Math.random() * 60 - 30), y: def.wall ? 170 : 440, s: 1, flip: false, z: Math.max(0, ...R().items.map((i) => i.z || 0)) + 1 };
      if (s.settings.gridSnap) { it.x = snap(it.x); it.y = snap(it.y); }
      s.room.items.push(it);
      selected = it.uid;
      ctx.audio.play('place');
      ctx.track('place');
      commit();
      renderPanel();
    }

    function renderPanel() {
      panelBody.innerHTML = '';
      if (tab === 'obiecte') {
        panelBody.appendChild(optionRow(FURNITURE_CATS, cat, (o) => { cat = o.id; renderPanel(); }));
        const list = FURNITURE.filter((f) => cat === 'toate' || f.cat === cat);
        panelBody.appendChild(h('div', { class: 'panel-label' }, 'Atinge ca să pui în cameră, apoi mută cu degetul'));
        panelBody.appendChild(optionRow(withLocks(s, list).map((f) => ({ ...f, icon: furniturePreview(f) })), null, (o) => placeItem(FURNITURE.find((f) => f.id === o.id))));
      } else {
        const list = tab === 'tapet' ? WALLPAPERS : FLOORS;
        const key = tab === 'tapet' ? 'wallpaper' : 'floor';
        panelBody.appendChild(optionRow(withLocks(s, list).map((w) => ({ ...w, icon: surfacePreview(w) })), R()[key], async (o) => {
          const def = list.find((x) => x.id === o.id);
          if (!isUnlocked(s, def) && !(await buyFlow(ctx, def))) return;
          s.room[key] = def.id;
          ctx.audio.play('sparkle');
          commit();
          renderPanel();
        }));
      }
    }

    draw();
    renderPanel();
  },
};
