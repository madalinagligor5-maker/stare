// Atelierul de rochii: miezul jocului. Editor pe manechin (sau direct pe Mimi),
// cu tip, material, culori, modele, decoruri mutate cu degetul, accesorii, Anulează/Refă.

import { h, btn, tabs, optionRow, swatches, slider, toast, promptText, confirmBox, modal, burst, svgFromString } from '../core/ui.js';
import { History } from '../core/history.js';
import { svgGesture } from '../core/input.js';
import { clone, clamp, uid, colorFamily, hexToHsl, pick } from '../core/util.js';
import { defaultDesign } from '../core/defaults.js';
import { isUnlocked } from '../core/economy.js';
import { addDesign, updateDesign } from '../core/wardrobe.js';
import { renderFigure } from '../art/figure.js';
import { newPrefix } from '../art/svg.js';
import { DRESS_TYPES, MATERIALS, PATTERNS, DECOR, OUTFIT_SLOTS, accFor } from '../data/clothes.js';
import { FABRIC_COLORS, READY_PALETTES, ACC_COLORS } from '../data/colors.js';
import { buyFlow, withLocks, colorWheel, withLightness, patternPreview, centeredPreview, ACC_VIEW, viewPreview } from './common.js';

const TABS = [
  { id: 'tip', name: 'Model', icon: '👗' },
  { id: 'material', name: 'Material', icon: '🧵' },
  { id: 'culoare', name: 'Culori', icon: '🎨' },
  { id: 'modele', name: 'Desene', icon: '🌸' },
  { id: 'decor', name: 'Decor', icon: '✨' },
  { id: 'acc', name: 'Accesorii', icon: '👠' },
  { id: 'gata', name: 'Gata', icon: '✅' },
];

export const atelierScene = {
  id: 'atelier',
  title: 'Atelier de rochii',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    if (params.design) {
      s.atelier.draft = clone(params.design);
      s.atelier.editingId = params.editingId || null;
    }
    let D = s.atelier.draft;
    if (!Array.isArray(D.decor)) D.decor = [];
    const hist = new History(80);
    hist.reset(D);
    let selected = null;
    let onMimi = false;
    let tab = params.tab || 'tip';
    let colorTarget = 'colorA';
    let decorColor = '#ff5fa2';
    let accSlot = 'shoes';
    const p = newPrefix('at');

    // ---- scena (manechinul) ----
    const svg = svgFromString('<svg viewBox="-10 -50 320 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Manechin cu rochia"><g class="fig-root"></g></svg>');
    const figG = svg.querySelector('.fig-root');
    const stage = h('div', { class: 'editor-stage' }, svg);
    const undoBtn = btn({ icon: '↩️', title: 'Anulează', onClick: () => undoRedo('undo') });
    const redoBtn = btn({ icon: '↪️', title: 'Refă', onClick: () => undoRedo('redo') });
    const viewBtn = btn({ icon: '🐱', label: 'Pe Mimi', onClick: () => { onMimi = !onMimi; viewBtn.querySelector('.btn-ico').textContent = onMimi ? '🧍' : '🐱'; viewBtn.querySelector('.btn-lbl').textContent = onMimi ? 'Manechin' : 'Pe Mimi'; draw(); } });
    const saveBtn = btn({ icon: '💾', label: 'Salvează', cls: 'btn-ok', say: true, onClick: () => saveToWardrobe(saveBtn) });
    stage.appendChild(h('div', { class: 'stage-tools' }, undoBtn, redoBtn, h('div', { class: 'spacer' }), viewBtn, saveBtn));
    const selBar = h('div', { class: 'stage-bottom sel-tools', hidden: true });
    stage.appendChild(selBar);

    function draw() {
      svg.setAttribute('viewBox', onMimi ? '-10 -50 320 470' : '-10 40 320 380');
      const look = onMimi ? { ...s.look, outfit: null } : null;
      figG.innerHTML = renderFigure({ look, design: D, kind: onMimi ? 'mimi' : 'mannequin', selected, interactive: true, p });
      undoBtn.disabled = !hist.canUndo;
      redoBtn.disabled = !hist.canRedo;
      renderSelBar();
    }

    // salvează schimbarea: în istoric + în salvarea automată
    function commit() {
      s.atelier.draft = D;
      hist.push(D);
      ctx.store.commit();
      draw();
    }

    function undoRedo(which) {
      const snap = which === 'undo' ? hist.undo() : hist.redo();
      if (!snap) return;
      D = snap;
      s.atelier.draft = D;
      if (selected && !D.decor.some((x) => x.uid === selected)) selected = null;
      ctx.store.commit();
      ctx.audio.play('whoosh');
      draw();
      renderPanel();
    }

    // ---- decoruri: selectare, tragere, ciupire ----
    const selItem = () => D.decor.find((x) => x.uid === selected) || null;
    let drag = null;
    let pinchBase = null;
    // actualizare rapidă în timpul tragerii (fără să redesenăm tot)
    function moveLive(it) {
      const g = figG.querySelector(`[data-decor="${it.uid}"]`);
      if (g) g.setAttribute('transform', `translate(${it.x} ${it.y}) rotate(${it.r || 0}) scale(${(it.flip ? -1 : 1) * it.s} ${it.s})`);
      const ring = figG.querySelector('.sel-ring');
      if (ring) { ring.setAttribute('cx', it.x); ring.setAttribute('cy', it.y); ring.setAttribute('r', 32 * it.s); }
    }
    svgGesture(svg, {
      onStart(pt, e) {
        const g = e.target.closest?.('[data-decor]');
        if (!g) { drag = null; return; }
        const it = D.decor.find((x) => x.uid === g.dataset.decor);
        if (!it) return;
        if (selected !== it.uid) { selected = it.uid; draw(); ctx.audio.play('pop'); }
        drag = { it, dx: pt.x - it.x, dy: pt.y - it.y, moved: false };
      },
      onMove(pt) {
        if (!drag) return;
        drag.it.x = Math.round(clamp(pt.x - drag.dx, 40, 260));
        drag.it.y = Math.round(clamp(pt.y - drag.dy, 160, 412));
        drag.moved = true;
        moveLive(drag.it);
      },
      onPinchStart() { const it = selItem(); if (it) pinchBase = { s: it.s, r: it.r || 0 }; },
      onPinch({ scale, rotate }) {
        const it = selItem();
        if (!it || !pinchBase) return;
        it.s = +clamp(pinchBase.s * scale, 0.4, 3).toFixed(2);
        it.r = Math.round(pinchBase.r + rotate);
        moveLive(it);
      },
      onEnd(pt, info) {
        if ((drag && drag.moved) || info.pinched) { ctx.audio.play('place'); commit(); }
        drag = null; pinchBase = null;
      },
      onTap(pt, e) {
        if (!e.target.closest?.('[data-decor]') && selected) { selected = null; draw(); }
      },
    }, scope);

    function editSel(fn, sound = 'pop') {
      const it = selItem();
      if (!it) return;
      fn(it);
      ctx.audio.play(sound);
      commit();
    }
    function renderSelBar() {
      const it = selItem();
      selBar.hidden = !it;
      if (!it) return;
      selBar.innerHTML = '';
      const B = (icon, title, fn, sound) => selBar.appendChild(btn({ icon, title, onClick: fn, sound: null }));
      B('➕', 'Mărește', () => editSel((x) => { x.s = +Math.min(3, x.s * 1.15).toFixed(2); }));
      B('➖', 'Micșorează', () => editSel((x) => { x.s = +Math.max(0.4, x.s / 1.15).toFixed(2); }));
      B('↺', 'Rotește la stânga', () => editSel((x) => { x.r = (x.r || 0) - 15; }));
      B('↻', 'Rotește la dreapta', () => editSel((x) => { x.r = (x.r || 0) + 15; }));
      B('↔️', 'Oglindește', () => editSel((x) => { x.flip = !x.flip; }));
      B('⬆️', 'Adu în față', () => editSel((x) => { D.decor = D.decor.filter((d) => d !== x); D.decor.push(x); }));
      B('⬇️', 'Trimite în spate', () => editSel((x) => { D.decor = D.decor.filter((d) => d !== x); D.decor.unshift(x); }));
      B('⧉', 'Duplică', () => editSel((x) => { const c = { ...clone(x), uid: uid('dc'), x: clamp(x.x + 14, 40, 260), y: clamp(x.y + 14, 160, 412) }; D.decor.push(c); selected = c.uid; }, 'sparkle'));
      B('🗑️', 'Șterge', () => editSel((x) => { D.decor = D.decor.filter((d) => d !== x); selected = null; }, 'whoosh'));
      B('✔', 'Gata', () => { selected = null; draw(); });
    }

    // ---- panoul de unelte ----
    const panelBody = h('div', { class: 'panel-body' });
    const tabRow = tabs(TABS, tab, (id) => { tab = id; renderPanel(); });
    const panel = h('div', { class: 'editor-panel' }, tabRow, panelBody);
    root.appendChild(h('div', { class: 'editor' }, stage, panel));

    const label = (t) => h('div', { class: 'panel-label' }, t);

    async function choose(item, apply) {
      if (item.locked || !isUnlocked(s, item)) {
        const ok = await buyFlow(ctx, item);
        if (!ok) return;
      }
      apply();
      commit();
      renderPanel();
    }

    function renderPanel() {
      panelBody.innerHTML = '';
      const add = (...els) => els.forEach((e) => panelBody.appendChild(e));
      switch (tab) {
        case 'tip':
          add(label('Ce fel de haină?'), optionRow(withLocks(s, DRESS_TYPES), D.type, (o) => choose(o, () => { D.type = o.id; ctx.audio.play('whoosh'); })));
          break;
        case 'material':
          add(label('Din ce material?'), optionRow(withLocks(s, MATERIALS), D.material, (o) => choose(o, () => { D.material = o.id; })));
          break;
        case 'culoare': {
          const t1 = btn({ label: 'Culoarea 1', cls: colorTarget === 'colorA' ? 'on' : 'btn-soft', onClick: () => { colorTarget = 'colorA'; renderPanel(); } });
          const t2 = btn({ label: 'Culoarea 2', cls: colorTarget === 'colorB' ? 'on' : 'btn-soft', onClick: () => { colorTarget = 'colorB'; renderPanel(); } });
          [t1, t2].forEach((b, i) => { b.prepend(h('span', { style: { width: '26px', height: '26px', borderRadius: '50%', background: i ? D.colorB : D.colorA, border: '3px solid #fff', boxShadow: '0 0 0 1px #ccc' } })); });
          const grad = btn({ icon: D.gradient ? '🌅' : '⬜', label: D.gradient ? 'Degrade: DA' : 'Degrade: NU', cls: D.gradient ? 'on' : 'btn-soft', onClick: () => { D.gradient = !D.gradient; commit(); renderPanel(); } });
          add(h('div', { class: 'row' }, t1, t2, grad));
          add(swatches(FABRIC_COLORS, D[colorTarget], (c) => { D[colorTarget] = c; commit(); renderPanel(); }));
          const wheelRow = h('div', { class: 'row', style: { flexWrap: 'nowrap', alignItems: 'center' } });
          wheelRow.appendChild(colorWheel((c, final) => { D[colorTarget] = c; if (final) { commit(); renderPanel(); } else draw(); }, 120));
          const l = hexToHsl(D[colorTarget]).l;
          const sl = slider({ label: 'Deschis/închis', icon: '🌗', min: 15, max: 92, value: Math.round(l), onInput: (v) => { D[colorTarget] = withLightness(D[colorTarget], v); draw(); } });
          sl.querySelector('input').addEventListener('change', () => commit());
          sl.style.flex = '1';
          wheelRow.appendChild(sl);
          add(label('Roata de culori'), wheelRow);
          add(label('Palete gata făcute'));
          const pal = h('div', { class: 'options' });
          READY_PALETTES.forEach((pl) => {
            const b = btn({ label: pl.name, cls: 'opt', sound: 'pop', onClick: () => { D.colorA = pl.colors[0]; D.colorB = pl.colors[1]; commit(); renderPanel(); } });
            b.prepend(h('span', { style: { width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${pl.colors[0]} 50%, ${pl.colors[1]} 50%)`, border: '3px solid #fff', boxShadow: '0 0 0 1px #ddd' } }));
            pal.appendChild(b);
          });
          add(pal);
          break;
        }
        case 'modele': {
          const opts = withLocks(s, PATTERNS).map((o) => ({ ...o, icon: patternPreview(o.id, D.colorA, D.patternColor) }));
          add(label('Alege un desen'), optionRow(opts, D.pattern, (o) => choose(o, () => { D.pattern = o.id; })));
          add(label('Culoarea desenului'), swatches(FABRIC_COLORS, D.patternColor, (c) => { D.patternColor = c; commit(); renderPanel(); }));
          break;
        }
        case 'decor': {
          const opts = withLocks(s, DECOR).map((o) => ({ ...o, icon: centeredPreview(o.draw(decorColor), 32) }));
          add(label('Atinge ca să adaugi, apoi mută cu degetul (2 degete = mărești/rotești)'));
          add(optionRow(opts, null, (o) => choose(o, () => {
            const it = { uid: uid('dc'), kind: o.id, x: 150 + Math.round(Math.random() * 40 - 20), y: 250 + Math.round(Math.random() * 40 - 20), s: 1, r: 0, flip: false, color: decorColor };
            D.decor.push(it);
            selected = it.uid;
            ctx.audio.play('sparkle');
          })));
          add(label(selItem() ? 'Culoarea decorului ales' : 'Culoarea decorului'), swatches(FABRIC_COLORS, selItem()?.color || decorColor, (c) => {
            decorColor = c;
            const it = selItem();
            if (it) { it.color = c; commit(); }
            renderPanel();
          }));
          if (D.decor.length) add(btn({ icon: '🧹', label: 'Șterge toate decorurile', cls: 'btn-soft', onClick: async () => { if (await confirmBox('Ștergem toate decorurile?', { icon: '🧹' })) { D.decor = []; selected = null; commit(); renderPanel(); } } }));
          break;
        }
        case 'acc': {
          const slotRow = optionRow(OUTFIT_SLOTS, accSlot, (o) => { accSlot = o.id; renderPanel(); }, { cls: 'slot-row' });
          add(slotRow);
          const cur = D.acc[accSlot];
          const color = cur?.color || '#ff5fa2';
          const none = { id: '__none', name: 'Fără', icon: '🚫' };
          const opts = [none, ...withLocks(s, accFor(accSlot)).map((o) => ({ ...o, icon: viewPreview(o.draw(color), ACC_VIEW[accSlot]) }))];
          add(optionRow(opts, cur?.id || '__none', (o) => {
            if (o.id === '__none') { D.acc[accSlot] = null; commit(); renderPanel(); return; }
            choose(o, () => { D.acc[accSlot] = { id: o.id, color }; ctx.audio.play('sparkle'); });
          }));
          add(label('Culoare'), swatches(ACC_COLORS.concat(FABRIC_COLORS.slice(0, 8)), cur?.color, (c) => {
            if (D.acc[accSlot]) { D.acc[accSlot].color = c; commit(); }
            renderPanel();
          }));
          break;
        }
        case 'gata': {
          const grid = h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' } });
          const A = (icon, label, cls, fn) => { const b = btn({ icon, label, cls: `btn-col ${cls}`, say: true, onClick: () => fn(b) }); grid.appendChild(b); };
          A('💾', 'Salvează în garderobă', 'btn-ok', (b) => saveToWardrobe(b));
          A('🐱', 'Îmbracă-o pe Mimi', 'btn-primary', (b) => {
            s.look.outfit = clone(D);
            ctx.store.commit();
            ctx.audio.play('sparkle');
            burst(innerWidth / 2, innerHeight / 3, ['✨', '💖', '👗'], 12);
            toast(`${s.pet.name} poartă rochia nouă!`, '👗');
          });
          A('✨', 'Defilare pe podium', 'btn-violet', () => ctx.go('runway', { design: clone(D) }));
          A('📸', 'Fă o poză', 'btn-soft', () => ctx.go('photo', { design: clone(D) }));
          A('🧵', 'Croitorie (coase de mână)', 'btn-soft', () => ctx.go('tailor'));
          A('🎲', 'Surpriză!', 'btn-soft', () => { surprise(); });
          A('🆕', 'Rochie nouă', 'btn-soft', async () => {
            if (!(await confirmBox('Începem o rochie nouă?', { icon: '🆕' }))) return;
            D = { ...defaultDesign(), type: D.type };
            s.atelier.editingId = null;
            selected = null;
            commit();
            renderPanel();
          });
          add(grid);
          break;
        }
        default: break;
      }
    }

    function surprise() {
      const types = DRESS_TYPES.filter((t) => isUnlocked(s, t));
      const pats = PATTERNS.filter((t) => isUnlocked(s, t));
      const mats = MATERIALS.filter((t) => isUnlocked(s, t));
      D.type = pick(types).id;
      D.pattern = pick(pats).id;
      D.material = pick(mats).id;
      D.colorA = pick(FABRIC_COLORS);
      D.colorB = pick(FABRIC_COLORS);
      D.patternColor = pick(['#ffffff', '#ffd36b', '#ff5fa2', '#6bd0ff']);
      D.gradient = Math.random() < 0.4;
      ctx.audio.play('sparkle');
      commit();
      renderPanel();
    }

    async function saveToWardrobe(fromEl) {
      const editing = s.atelier.editingId && s.wardrobe.find((w) => w.id === s.atelier.editingId);
      if (editing) {
        const choice = await modal({
          icon: '💾', title: `Salvezi peste „${editing.name}”?`,
          actions: [{ label: 'Rochie nouă', icon: '🆕', cls: 'btn-soft', value: 'new' }, { label: 'Da, actualizează', icon: '✔', cls: 'btn-ok', value: 'update' }],
        });
        if (!choice) return;
        if (choice === 'update') {
          updateDesign(s, editing.id, D);
          ctx.store.commit();
          ctx.audio.play('tada');
          toast(`„${editing.name}” a fost actualizată!`, '💾');
          return;
        }
      }
      const name = await promptText('Cum se numește creația?', `Creația mea ${s.nextDesignNum || 1}`, { icon: '👗' });
      if (name === null) return;
      const json = JSON.stringify(D);
      const duplicate = s.wardrobe.some((w) => JSON.stringify(w.design) === json);
      const entry = addDesign(s, D, name);
      s.atelier.editingId = entry.id;
      ctx.track('dress', { family: colorFamily(D.colorA), type: D.type, pattern: D.pattern });
      if (!duplicate) ctx.reward(5, fromEl);
      ctx.audio.play('tada');
      burst(innerWidth / 2, innerHeight / 3, ['👗', '✨', '💖'], 14);
      toast(`„${entry.name}” e în garderobă!`, '🚪');
      ctx.store.commit();
    }

    draw();
    renderPanel();
  },
};
