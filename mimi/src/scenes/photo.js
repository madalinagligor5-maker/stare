// "Fă poză": fundal, ramă, autocolante, expresie. Exportă PNG, salvează în album, distribuie.

import { h, btn, tabs, optionRow, toast, modal, svgFromString, downloadBlob, confirmBox, onTap } from '../core/ui.js';
import { gesture, svgPoint } from '../core/input.js';
import { clone, clamp, uid } from '../core/util.js';
import { renderFigure } from '../art/figure.js';
import { newPrefix } from '../art/svg.js';
import { BACKGROUNDS, FRAMES, STICKERS, PHOTO_W, PHOTO_H } from '../data/photo.js';
import { centeredPreview } from './common.js';

const EXPRS = [
  { id: 'happy', name: 'Zâmbet', icon: '😊' },
  { id: 'giggle', name: 'Râs', icon: '😆' },
  { id: 'love', name: 'Fericită', icon: '🥰' },
  { id: 'curious', name: 'Mirată', icon: '😮' },
  { id: 'purr', name: 'Ochi închiși', icon: '😌' },
];

const bgBy = new Map(BACKGROUNDS.map((b) => [b.id, b]));
const frBy = new Map(FRAMES.map((b) => [b.id, b]));
const skBy = new Map(STICKERS.map((b) => [b.id, b]));

// Construiește SVG-ul complet al unei poze (folosit și în album și la export).
export function photoSVG(comp, { interactive = false, selected = null, p = newPrefix('ph') } = {}) {
  const bg = (bgBy.get(comp.bg) || BACKGROUNDS[0]).draw(p);
  const fig = renderFigure({ look: comp.look, design: comp.design, kind: 'mimi', expr: comp.expr || 'happy', p: `${p}f` });
  let st = '';
  for (const k of comp.stickers || []) {
    const def = skBy.get(k.id);
    if (!def) continue;
    st += `<g transform="translate(${k.x} ${k.y}) rotate(${k.r || 0}) scale(${k.s || 1})" ${interactive ? `data-sticker="${k.uid}"` : ''}>${interactive ? '<circle r="26" fill="transparent"/>' : ''}${def.draw()}</g>`;
    if (selected === k.uid) st += `<circle cx="${k.x}" cy="${k.y}" r="${34 * (k.s || 1)}" fill="none" stroke="#7c4dff" stroke-width="3" stroke-dasharray="7 5" class="sel-ring" pointer-events="none"/>`;
  }
  const fr = (frBy.get(comp.frame) || FRAMES[0]).draw(p);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PHOTO_W} ${PHOTO_H}" width="${PHOTO_W}" height="${PHOTO_H}">${bg}<g transform="translate(46 52) scale(.89)">${fig}</g>${st}${fr}</svg>`;
}

// Transformă SVG-ul în PNG (Blob). scale = de câte ori mai mare.
export function svgToPng(svgText, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = PHOTO_W * scale; c.height = PHOTO_H * scale;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Nu am putut desena poza.')); };
    img.src = url;
  });
}

// Descarcă sau distribuie o poză.
export async function savePhotoFile(comp, mode = 'download') {
  const blob = await svgToPng(photoSVG(comp, { p: 'exp' }));
  const name = `mimi-poza-${new Date(comp.created || Date.now()).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
  if (mode === 'share') {
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Mimi' }); return 'shared'; } catch { return 'cancel'; }
    }
  }
  downloadBlob(blob, name);
  return 'downloaded';
}

export function canShareFiles() {
  try { return !!navigator.canShare?.({ files: [new File([''], 'a.png', { type: 'image/png' })] }); } catch { return false; }
}

// Fereastra cu o poză: descarcă / distribuie / șterge.
export async function showPhoto(ctx, comp, { allowDelete = false } = {}) {
  const body = h('div', { class: 'album-view' }, svgFromString(photoSVG(comp)));
  const actions = [{ label: 'Descarcă', icon: '⬇️', cls: 'btn-violet', value: 'download' }];
  if (canShareFiles()) actions.push({ label: 'Trimite', icon: '📤', cls: 'btn-soft', value: 'share' });
  if (allowDelete) actions.push({ label: 'Șterge', icon: '🗑️', cls: 'btn-soft', value: 'delete' });
  const v = await modal({ title: 'Poza ta', icon: '📸', body, actions });
  if (v === 'download' || v === 'share') {
    try {
      const r = await savePhotoFile(comp, v);
      if (r === 'downloaded') toast('Poza a fost salvată pe dispozitiv!', '⬇️');
    } catch (err) { toast('Nu am putut salva poza.', '⚠️'); }
  }
  return v;
}

export const photoScene = {
  id: 'photo',
  title: 'Fă o poză',
  back: (params) => (params?.from === 'home' ? 'home' : 'atelier'),
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const comp = {
      bg: params.bg || 'bg-roz', frame: 'fr-aur', stickers: [], expr: 'happy',
      design: clone(params.design || s.look.outfit || null), look: clone({ ...s.look, outfit: null }),
    };
    let tab = 'bg';
    let selected = null;
    const p = newPrefix('pp');
    const holder = h('div', { class: 'editor-stage photo-stage' });
    const shotBtn = btn({ icon: '📸', label: 'Fotografiază!', cls: 'btn-primary btn-big', say: true, onClick: () => takePhoto() });
    holder.appendChild(h('div', { class: 'stage-bottom' }, shotBtn));
    const selBar = h('div', { class: 'stage-tools sel-tools', hidden: true });
    holder.appendChild(selBar);
    let svg = null;

    function draw() {
      const fresh = svgFromString(photoSVG(comp, { interactive: true, selected, p }));
      fresh.removeAttribute('width'); fresh.removeAttribute('height');
      if (svg) svg.replaceWith(fresh); else holder.prepend(fresh);
      svg = fresh;
      svg.style.height = 'calc(100% - 84px)';
      svg.style.marginBottom = '76px';
      renderSel();
    }
    const selItem = () => comp.stickers.find((k) => k.uid === selected) || null;
    let drag = null, pinchBase = null;
    gesture(holder, {
      onStart(pt, e) {
        if (e.target.closest?.('button')) return false;
        const g = e.target.closest?.('[data-sticker]');
        if (!g) { drag = null; return; }
        const it = comp.stickers.find((k) => k.uid === g.dataset.sticker);
        if (!it) return;
        if (selected !== it.uid) { selected = it.uid; draw(); ctx.audio.play('pop'); }
        drag = { it, dx: pt.x - it.x, dy: pt.y - it.y };
      },
      onMove(pt) { if (!drag) return; drag.it.x = Math.round(clamp(pt.x - drag.dx, 10, PHOTO_W - 10)); drag.it.y = Math.round(clamp(pt.y - drag.dy, 10, PHOTO_H - 10)); draw(); },
      onPinchStart() { const it = selItem(); if (it) pinchBase = { s: it.s, r: it.r }; },
      onPinch({ scale, rotate }) { const it = selItem(); if (it && pinchBase) { it.s = +clamp(pinchBase.s * scale, 0.5, 3).toFixed(2); it.r = Math.round(pinchBase.r + rotate); draw(); } },
      onEnd() { drag = null; pinchBase = null; },
      onTap(pt, e) { if (!e.target.closest?.('[data-sticker]') && selected) { selected = null; draw(); } },
    }, scope, (x, y) => svgPoint(svg, x, y)); // coordonatele în SVG-ul curent al pozei
    function renderSel() {
      const it = selItem();
      selBar.hidden = !it;
      if (!it) return;
      selBar.innerHTML = '';
      const B = (icon, title, fn) => selBar.appendChild(btn({ icon, title, onClick: () => { fn(it); draw(); } }));
      B('➕', 'Mărește', (x) => { x.s = Math.min(3, +(x.s * 1.2).toFixed(2)); });
      B('➖', 'Micșorează', (x) => { x.s = Math.max(0.5, +(x.s / 1.2).toFixed(2)); });
      B('↻', 'Rotește', (x) => { x.r = (x.r || 0) + 20; });
      B('🗑️', 'Șterge', (x) => { comp.stickers = comp.stickers.filter((k) => k !== x); selected = null; });
      B('✔', 'Gata', () => { selected = null; });
    }

    const panelBody = h('div', { class: 'panel-body' });
    const tabRow = tabs([
      { id: 'bg', name: 'Fundal', icon: '🏞️' }, { id: 'frame', name: 'Ramă', icon: '🖼️' },
      { id: 'stickers', name: 'Autocolante', icon: '💟' }, { id: 'pose', name: 'Expresie', icon: '😊' },
    ], tab, (id) => { tab = id; renderPanel(); });
    root.appendChild(h('div', { class: 'editor' }, holder, h('div', { class: 'editor-panel' }, tabRow, panelBody)));

    function renderPanel() {
      panelBody.innerHTML = '';
      if (tab === 'bg') {
        panelBody.appendChild(optionRow(BACKGROUNDS.map((b) => ({ ...b, icon: `<svg viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg">${b.draw(newPrefix('bgp'))}</svg>` })), comp.bg, (o) => { comp.bg = o.id; draw(); }));
      } else if (tab === 'frame') {
        panelBody.appendChild(optionRow(FRAMES.map((f) => ({ ...f, icon: `<svg viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="480" fill="#f3eaff"/>${f.draw()}</svg>` })), comp.frame, (o) => { comp.frame = o.id; draw(); }));
      } else if (tab === 'stickers') {
        panelBody.appendChild(h('div', { class: 'panel-label' }, 'Atinge ca să lipești, apoi mută cu degetul'));
        panelBody.appendChild(optionRow(STICKERS.map((k) => ({ ...k, icon: centeredPreview(k.draw(), 28) })), null, (o) => {
          if (comp.stickers.length >= 20) { toast('Destule autocolante! 😊', '💟'); return; }
          const k = { uid: uid('sk'), id: o.id, x: 60 + Math.round(Math.random() * 240), y: 60 + Math.round(Math.random() * 120), s: 1, r: 0 };
          comp.stickers.push(k);
          selected = k.uid;
          ctx.audio.play('pop');
          draw();
        }));
      } else {
        panelBody.appendChild(optionRow(EXPRS, comp.expr, (o) => { comp.expr = o.id; draw(); }));
      }
    }

    async function takePhoto() {
      selected = null;
      draw();
      document.body.appendChild(h('div', { class: 'flash' }));
      setTimeout(() => document.querySelector('.flash')?.remove(), 600);
      ctx.audio.play('camera');
      const saved = { ...clone(comp), id: uid('ph'), created: Date.now() };
      s.album.unshift(saved);
      ctx.track('photo');
      ctx.reward(3, shotBtn);
      ctx.store.commit();
      const v = await showPhoto(ctx, saved);
      if (v === null) toast('Poza e în album! 🖼️', '📸');
    }

    draw();
    renderPanel();
  },
};

export const albumScene = {
  id: 'album',
  title: 'Album foto',
  back: 'home',
  mount(root, ctx) {
    const s = ctx.store.state;
    const scroll = h('div', { class: 'scroll' });
    root.appendChild(scroll);
    function render() {
      scroll.innerHTML = '';
      if (!s.album.length) {
        scroll.appendChild(h('div', { class: 'empty' }, h('span', { class: 'big' }, '🖼️'), 'Albumul e gol. Fă prima poză cu Mimi!',
          h('div', { style: { marginTop: '12px' } }, btn({ icon: '📸', label: 'Fă o poză', cls: 'btn-primary', onClick: () => ctx.go('photo', { from: 'home' }) }))));
        return;
      }
      scroll.appendChild(h('div', { class: 'row row-center', style: { marginBottom: '10px' } }, btn({ icon: '📸', label: 'Poză nouă', cls: 'btn-primary', onClick: () => ctx.go('photo', { from: 'home' }) })));
      const grid = h('div', { class: 'grid' });
      for (const ph of s.album) {
        const art = h('div', { class: 'card-art', style: { aspectRatio: '3 / 4' } }, svgFromString(photoSVG(ph)));
        const card = h('div', { class: 'card' }, art, h('div', { class: 'card-title' }, new Date(ph.created).toLocaleDateString('ro-RO')),
          h('div', { class: 'card-actions' }, btn({ icon: '🔍', title: 'Vezi poza', onClick: () => open(ph) }), btn({ icon: '🗑️', title: 'Șterge poza', onClick: () => del(ph) })));
        onTap(art, () => open(ph));
        grid.appendChild(card);
      }
      scroll.appendChild(grid);
    }
    async function del(ph) {
      if (!(await confirmBox('Ștergem poza?', { icon: '🗑️' }))) return;
      s.album = s.album.filter((x) => x !== ph);
      ctx.store.commit();
      render();
    }
    async function open(ph) {
      const v = await showPhoto(ctx, ph, { allowDelete: true });
      if (v === 'delete') del(ph);
    }
    render();
  },
};
