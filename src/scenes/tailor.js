// Croitoria: alegi modelul, măsori manechinul, tai pe linia punctată și coși cu degetul.
// La final rochia apare pe manechin.

import { h, btn, optionRow, swatches, svgFromString, burst, toast, promptText } from '../core/ui.js';
import { svgGesture } from '../core/input.js';
import { clone, colorFamily } from '../core/util.js';
import { isUnlocked } from '../core/economy.js';
import { addDesign } from '../core/wardrobe.js';
import { renderFigure } from '../art/figure.js';
import { newPrefix } from '../art/svg.js';
import { DRESS_TYPES } from '../data/clothes.js';
import { FABRIC_COLORS } from '../data/colors.js';

const MEASURES = [
  { name: 'Bust', from: [112, 228], to: [188, 228] },
  { name: 'Talie', from: [118, 266], to: [182, 266] },
  { name: 'Lungime', from: [205, 266], to: [205, 330] },
];

// Puncte de-a lungul unui traseu SVG (pentru urmărirea degetului).
function samplePath(svg, d, n) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('visibility', 'hidden');
  svg.appendChild(path);
  const len = path.getTotalLength();
  const pts = [];
  for (let i = 0; i <= n; i++) { const q = path.getPointAtLength((len * i) / n); pts.push({ x: q.x, y: q.y, hit: false }); }
  path.remove();
  return pts;
}

export const tailorScene = {
  id: 'tailor',
  title: 'Croitorie',
  back: 'atelier',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const design = clone(s.atelier.draft);
    if (!isUnlocked(s, DRESS_TYPES.find((t) => t.id === design.type))) design.type = 'scurta';
    let step = 'choose';
    let mIdx = 0;
    let trace = null; // { pts, tol, kind }
    const p = newPrefix('tl');

    const svg = svgFromString('<svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Masa de croitorie"><g class="base"></g><g class="trace"></g><g class="cursor"></g></svg>');
    const baseG = svg.querySelector('.base');
    const traceG = svg.querySelector('.trace');
    const cursorG = svg.querySelector('.cursor');
    const steps = h('div', { class: 'tailor-steps' });
    const hint = h('p', { class: 'hint' });
    const bar = h('div');
    const panelBody = h('div', { class: 'panel-body' });
    const stage = h('div', { class: 'editor-stage' }, svg);
    root.appendChild(h('div', { class: 'editor' }, stage, h('div', { class: 'editor-panel' }, steps, hint, h('div', { class: 'progress' }, bar), panelBody)));

    const STEP_LIST = [['choose', '🎨'], ['measure', '📏'], ['cut', '✂️'], ['sew', '🪡'], ['done', '👗']];
    function renderSteps() {
      steps.innerHTML = '';
      const idx = STEP_LIST.findIndex((x) => x[0] === step);
      STEP_LIST.forEach(([id, ic], i) => steps.appendChild(h('div', { class: `step-dot ${i === idx ? 'on' : ''} ${i < idx ? 'done' : ''}` }, ic)));
    }

    const typeDef = () => DRESS_TYPES.find((t) => t.id === design.type) || DRESS_TYPES[0];
    // conturul piesei de tăiat: forma hainei, mărită pe masa de croit
    const outline = () => typeDef().parts.filter((x) => x.role === 'main').map((x) => x.d).join(' ');

    function setStep(next) {
      step = next;
      renderSteps();
      panelBody.innerHTML = '';
      traceG.innerHTML = '';
      cursorG.innerHTML = '';
      bar.style.width = '0%';
      if (step === 'choose') {
        hint.textContent = 'Alege modelul și materialul, apoi apasă „Începe”!';
        baseG.innerHTML = renderFigure({ design, kind: 'mannequin', p });
        panelBody.append(
          optionRow(DRESS_TYPES.filter((t) => isUnlocked(s, t)), design.type, (o) => { design.type = o.id; baseG.innerHTML = renderFigure({ design, kind: 'mannequin', p }); }),
          swatches(FABRIC_COLORS, design.colorA, (c) => { design.colorA = c; baseG.innerHTML = renderFigure({ design, kind: 'mannequin', p }); }),
          btn({ icon: '▶️', label: 'Începe', cls: 'btn-primary btn-big', say: true, onClick: () => { mIdx = 0; setStep('measure'); } }),
        );
      } else if (step === 'measure') {
        baseG.innerHTML = renderFigure({ design: null, kind: 'mannequin', p });
        startMeasure();
      } else if (step === 'cut') {
        hint.textContent = 'Trage foarfeca pe linia punctată! ✂️';
        baseG.innerHTML = `<rect x="20" y="150" width="260" height="270" rx="14" fill="${design.colorA}" opacity=".9"/><rect x="20" y="150" width="260" height="270" rx="14" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 6"/><path d="${outline()}" fill="none" stroke="#4a2d4f" stroke-width="3" stroke-dasharray="7 7"/>`;
        trace = { pts: samplePath(svg, outline(), 90), tol: 22, kind: 'cut' };
        cursorG.innerHTML = '';
      } else if (step === 'sew') {
        hint.textContent = 'Coase cu acul pe cusături! 🪡';
        const seams = 'M118 214 L 120 266 M182 214 L 180 266 M120 266 L 92 318 M180 266 L 208 318';
        baseG.innerHTML = renderFigure({ design: { ...design, decor: [], acc: {} }, kind: 'mannequin', p }) + `<path d="${seams}" stroke="#fff" stroke-width="4" stroke-dasharray="4 6" fill="none" opacity=".9"/>`;
        trace = { pts: [].concat(...['M118 214 L 120 266', 'M182 214 L 180 266', 'M120 266 L 92 318', 'M180 266 L 208 318'].map((d) => samplePath(svg, d, 14))), tol: 22, kind: 'sew' };
      } else if (step === 'done') {
        hint.textContent = 'Rochia e gata! Bravo, croitoreaso! 🎉';
        bar.style.width = '100%';
        baseG.innerHTML = renderFigure({ design, kind: 'mannequin', p });
        const r = stage.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, ['✨', '👗', '🎉', '⭐'], 20);
        ctx.audio.play('win');
        s.atelier.draft = clone(design);
        s.atelier.editingId = null;
        ctx.track('tailor');
        ctx.reward(6, stage);
        panelBody.append(h('div', { class: 'row row-center' },
          btn({ icon: '💾', label: 'Salvează în garderobă', cls: 'btn-ok', onClick: async (e) => {
            const name = await promptText('Cum se numește rochia?', `Rochia cusută ${s.nextDesignNum || 1}`, { icon: '🧵' });
            if (name === null) return;
            const entry = addDesign(s, design, name);
            s.atelier.editingId = entry.id;
            ctx.track('dress', { family: colorFamily(design.colorA), type: design.type, pattern: design.pattern });
            ctx.store.commit();
            toast(`„${entry.name}” e în garderobă!`, '🚪');
          } }),
          btn({ icon: '✂️', label: 'Decorează în atelier', cls: 'btn-primary', onClick: () => ctx.go('atelier', {}, 'back') }),
          btn({ icon: '🔁', label: 'Mai coase una', cls: 'btn-soft', onClick: () => setStep('choose') }),
        ));
        ctx.store.commit();
      }
    }

    function startMeasure() {
      const m = MEASURES[mIdx];
      hint.textContent = `Măsoară: ${m.name}. Trage metrul de la punctul roz la cel verde! 📏`;
      const d = `M${m.from[0]} ${m.from[1]} L ${m.to[0]} ${m.to[1]}`;
      traceG.innerHTML = `<path d="${d}" stroke="#ffd36b" stroke-width="10" stroke-opacity=".35" stroke-linecap="round"/><circle cx="${m.from[0]}" cy="${m.from[1]}" r="9" fill="#ff5fa2" stroke="#fff" stroke-width="3"/><circle cx="${m.to[0]}" cy="${m.to[1]}" r="9" fill="#22a866" stroke="#fff" stroke-width="3"/><g class="done-part"></g>`;
      trace = { pts: samplePath(svg, d, 16), tol: 26, kind: 'measure' };
      bar.style.width = `${Math.round((mIdx / MEASURES.length) * 100)}%`;
    }

    function drawTraceProgress() {
      const done = traceG.querySelector('.done-part') || traceG.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      done.setAttribute('class', 'done-part');
      const pts = trace.pts;
      let out = '';
      for (let i = 1; i < pts.length; i++) {
        if (!(pts[i].hit && pts[i - 1].hit)) continue;
        const a = pts[i - 1], b = pts[i];
        if (Math.hypot(a.x - b.x, a.y - b.y) > 40) continue; // segmente separate (cusături diferite)
        if (trace.kind === 'measure') out += `<path d="M${a.x} ${a.y} L ${b.x} ${b.y}" stroke="#ffd36b" stroke-width="10" stroke-linecap="round"/><path d="M${a.x} ${a.y - 4} L ${a.x} ${a.y + 4}" stroke="#a06b00" stroke-width="1.5"/>`;
        else if (trace.kind === 'cut') out += `<path d="M${a.x} ${a.y} L ${b.x} ${b.y}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
        else out += `<path d="M${a.x} ${a.y} L ${b.x} ${b.y}" stroke="#ff3f9a" stroke-width="3" stroke-dasharray="5 4" stroke-linecap="round"/>`;
      }
      done.innerHTML = out;
    }

    function traceAt(pt) {
      if (!trace) return;
      let newHits = 0;
      for (const q of trace.pts) if (!q.hit && Math.hypot(q.x - pt.x, q.y - pt.y) < trace.tol) { q.hit = true; newHits++; }
      const icon = { measure: '📏', cut: '✂️', sew: '🪡' }[trace.kind];
      cursorG.innerHTML = `<text x="${pt.x}" y="${pt.y}" font-size="34" text-anchor="middle" dominant-baseline="central">${icon}</text>`;
      if (newHits) {
        ctx.audio.play(trace.kind === 'cut' ? 'snip' : trace.kind === 'sew' ? 'stitch' : 'pop', 90);
        drawTraceProgress();
      }
      const frac = trace.pts.filter((q) => q.hit).length / trace.pts.length;
      if (trace.kind === 'measure') {
        bar.style.width = `${Math.round(((mIdx + frac) / MEASURES.length) * 100)}%`;
        if (frac >= 0.85) {
          ctx.audio.play('sparkle');
          toast(`${MEASURES[mIdx].name}: ${Math.round(40 + Math.random() * 30)} cm ✓`, '📏', 1400);
          trace = null;
          mIdx += 1;
          if (mIdx >= MEASURES.length) scope.timeout(() => setStep('cut'), 500); else scope.timeout(startMeasure, 400);
        }
      } else {
        bar.style.width = `${Math.round(frac * 100)}%`;
        if (frac >= 0.85) {
          trace = null;
          ctx.audio.play('sparkle');
          scope.timeout(() => setStep(step === 'cut' ? 'sew' : 'done'), 450);
        }
      }
    }

    svgGesture(svg, {
      onStart(pt) { traceAt(pt); },
      onMove(pt) { traceAt(pt); },
      onEnd() { cursorG.innerHTML = ''; },
    }, scope);

    setStep('choose');
  },
};
