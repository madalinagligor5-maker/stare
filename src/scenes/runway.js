// Defilarea: Angy merge pe podium, se învârte, publicul aplaudă, juriul dă stele.

import { h, btn, svgFromString, burst } from '../core/ui.js';
import { renderFigure } from '../art/figure.js';
import { newPrefix, starPoints, sparkle } from '../art/svg.js';
import { clone } from '../core/util.js';
import { care } from '../core/pet.js';

const JUDGES = [{ icon: '🐰', name: 'Iepurica' }, { icon: '🐻', name: 'Ursuleț' }, { icon: '🦊', name: 'Vulpița' }];

// Note blânde: între 3 și 5 stele, niciodată mai puțin.
export function runwayScores(design, rnd = Math.random) {
  let pts = 0;
  if (design) {
    if (design.decor?.length) pts += 1;
    if (design.pattern && design.pattern !== 'none') pts += 1;
    if (Object.values(design.acc || {}).filter(Boolean).length >= 2) pts += 1;
    if (design.material && design.material !== 'bumbac') pts += 1;
    if (design.gradient) pts += 1;
  }
  return JUDGES.map(() => Math.max(3, Math.min(5, 3 + Math.round((pts / 5) * 2 + (rnd() - 0.4)))));
}

function stageBackdrop() {
  let s = '<defs><linearGradient id="rw-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6ea"/><stop offset="1" stop-color="#ff8fc7"/></linearGradient><radialGradient id="rw-spot"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
  s += '<rect width="400" height="600" fill="#3b2363"/>';
  s += '<path d="M0 0 L 70 0 Q 50 200 90 330 L 0 330 Z M400 0 L 330 0 Q 350 200 310 330 L 400 330 Z" fill="#c2185b"/><path d="M0 0 H 400 V 26 Q 200 50 0 26 Z" fill="#ad1457"/>';
  for (let i = 0; i < 9; i++) s += `<circle cx="${30 + i * 43}" cy="40" r="7" fill="#ffe27a" class="bulb"/>`;
  s += '<path d="M150 150 L 250 150 L 360 600 L 40 600 Z" fill="url(#rw-floor)"/><path d="M150 150 L 250 150 L 252 158 L 148 158 Z" fill="#fff" opacity=".5"/>';
  for (let i = 0; i < 6; i++) { const y = 200 + i * 70; const t = (y - 150) / 450; const x1 = 150 - t * 110, x2 = 250 + t * 110; s += `<circle cx="${x1 + 8}" cy="${y}" r="${3 + t * 3}" fill="#fff" class="bulb"/><circle cx="${x2 - 8}" cy="${y}" r="${3 + t * 3}" fill="#fff" class="bulb"/>`; }
  s += '<ellipse cx="200" cy="420" rx="150" ry="220" fill="url(#rw-spot)" class="spot"/>';
  return s;
}

function audience() {
  const heads = ['#c98b5a', '#ffd36b', '#cfcfd8', '#ffb3d9', '#9ee6e0', '#c9b6ff', '#ffa94d', '#b8e986'];
  let s = '<g class="audience">';
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 8; i++) {
      const x = 25 + i * 50 + (row ? 25 : 0), y = 560 + row * 40;
      if (x > 120 && x < 280 && row === 0) continue;
      const c = heads[(i + row * 3) % heads.length];
      s += `<g class="fan" style="animation-delay:${(i * 0.13 + row * 0.3).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="22" fill="${c}"/><circle cx="${x - 14}" cy="${y - 18}" r="8" fill="${c}"/><circle cx="${x + 14}" cy="${y - 18}" r="8" fill="${c}"/><circle cx="${x - 7}" cy="${y - 3}" r="3" fill="#333"/><circle cx="${x + 7}" cy="${y - 3}" r="3" fill="#333"/><path d="M${x - 6} ${y + 7} Q ${x} ${y + 12} ${x + 6} ${y + 7}" stroke="#333" stroke-width="2" fill="none"/></g>`;
    }
  }
  return `${s}</g>`;
}

export const runwayScene = {
  id: 'runway',
  title: 'Defilare',
  back: 'atelier',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const design = clone(params.design || s.look.outfit || s.atelier.draft);
    const p = newPrefix('rw');
    const wrap = h('div', { class: 'runway' });
    const svg = svgFromString(`<svg class="rw" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${stageBackdrop()}<g class="walker"><g class="mimi">${renderFigure({ look: s.look, design, kind: 'mimi', p, expr: 'happy' })}</g></g><g class="sparkles"></g>${audience()}</svg>`);
    wrap.appendChild(svg);
    const scores = h('div', { class: 'scores' });
    const actions = h('div', { class: 'stage-tools', style: { justifyContent: 'center' } });
    wrap.append(scores, actions);
    root.appendChild(wrap);
    const walker = svg.querySelector('.walker');
    const mimiG = svg.querySelector('.mimi');
    const sparkG = svg.querySelector('.sparkles');
    const style = h('style', {}, '.fan{animation:fanbob .6s ease-in-out infinite alternate}.clap .fan{animation-duration:.18s}@keyframes fanbob{to{transform:translateY(-6px)}}');
    wrap.appendChild(style);

    const reduce = s.settings.reducedMotion;
    let t = 0, phase = 'walk', lastStep = 0, flipT = 0, done = false;
    const WALK = reduce ? 0.6 : 3.2, SPIN = reduce ? 0.2 : 1.2, POSE = reduce ? 0.3 : 1.4;
    ctx.audio.tune(Math.floor(Math.random() * 1000), 3, 72, 0.17);

    function setExpr(expr) { mimiG.innerHTML = renderFigure({ look: s.look, design, kind: 'mimi', p, expr }); }

    scope.loop((dt) => {
      if (done) return;
      t += dt;
      let k, y, bob = 0, sx = 1;
      if (phase === 'walk') {
        k = Math.min(1, t / WALK);
        bob = reduce ? 0 : Math.abs(Math.sin(t * 7)) * 6;
        if (!reduce && t - lastStep > 0.45) { lastStep = t; ctx.audio.play('step'); }
        if (k >= 1) { phase = 'spin'; t = 0; ctx.audio.play('whoosh'); }
      } else if (phase === 'spin') {
        k = 1;
        flipT = Math.min(1, t / SPIN);
        sx = Math.cos(flipT * Math.PI * 2);
        if (flipT >= 1) { phase = 'pose'; t = 0; setExpr('giggle'); ctx.audio.play('applause'); svg.classList.add('clap'); const r = wrap.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * 0.45, ['🎉', '✨', '💖', '⭐', '🌸'], 22); }
      } else if (phase === 'pose') {
        k = 1;
        if (!reduce) sparkG.innerHTML = [0, 1, 2, 3, 4].map((i) => sparkle(200 + Math.cos(t * 3 + i * 1.3) * 120, 300 + Math.sin(t * 3 + i * 1.3) * 140, 10, '#fff')).join('');
        if (t > POSE) { phase = 'score'; showScores(); }
      } else { k = 1; }
      const scale = 0.32 + 0.5 * k;
      y = 130 + 260 * k;
      // (150,400) din figura lui Angy = tălpile; le punem în punctul de pe podium
      walker.setAttribute('transform', `translate(200 ${y - bob}) scale(${(scale * sx).toFixed(3)} ${scale.toFixed(3)}) translate(-150 -400)`);
    });

    function showScores() {
      done = true;
      const pts = runwayScores(design);
      pts.forEach((n, i) => {
        scope.timeout(() => {
          scores.appendChild(h('div', { class: 'judge' }, h('span', { class: 'j-ico' }, JUDGES[i].icon), '⭐'.repeat(n)));
          ctx.audio.play('star');
        }, 400 + i * 600);
      });
      scope.timeout(() => {
        const total = Math.round(pts.reduce((a, b) => a + b, 0) / 3) + 2;
        ctx.reward(total, scores);
        care(s.pet, 'love', 5);
        care(s.pet, 'play', 8);
        ctx.track('runway');
        svg.classList.remove('clap');
        actions.append(
          btn({ icon: '🔁', label: 'Încă o dată', cls: 'btn-primary', onClick: () => ctx.go('runway', { design }) }),
          btn({ icon: '📸', label: 'Poză', cls: 'btn-soft', onClick: () => ctx.go('photo', { design, bg: 'bg-podium' }) }),
          btn({ icon: '✂️', label: 'Atelier', cls: 'btn-soft', onClick: () => ctx.go('atelier', {}, 'back') }),
        );
      }, 2400);
    }
  },
};
