// Ecranul de start: logo cu coroniță, pisicuța care salută, butonul mare JOACĂ.

import { h, btn, svgFromString, burst } from '../core/ui.js';
import { MimiLive } from '../art/mimiLive.js';
import { MOTIFS, heartPath } from '../art/svg.js';
import { parentGate } from './parents.js';

// Fundal: cer, căsuțe colorate, flori.
function menuBackdrop() {
  let s = '<defs><linearGradient id="mn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6ec"/><stop offset=".6" stop-color="#fbe7ff"/><stop offset="1" stop-color="#e6f7d9"/></linearGradient></defs><rect width="400" height="800" fill="url(#mn-sky)"/>';
  for (const [x, y, k] of [[60, 90, 1.6], [320, 140, 2], [200, 60, 1.2]]) s += `<g transform="translate(${x} ${y}) scale(${k})">${MOTIFS.nor('#fff')}</g>`;
  const houses = [[-10, '#ffb3d1', '#ff6b8b'], [70, '#fff3c4', '#ff8fc7'], [290, '#c9b6ff', '#9b6bff'], [350, '#bff0ff', '#3d8bfd']];
  for (const [x, wall, roof] of houses) s += `<rect x="${x}" y="470" width="70" height="120" fill="${wall}"/><path d="M${x - 8} 474 L ${x + 35} 430 L ${x + 78} 474 Z" fill="${roof}"/><rect x="${x + 14}" y="500" width="18" height="20" rx="4" fill="#fff"/><rect x="${x + 40}" y="540" width="18" height="50" rx="4" fill="#c08a5b"/>`;
  s += '<path d="M0 600 Q 100 570 200 600 T 400 596 L 400 800 L 0 800 Z" fill="#9fe08f"/>';
  const cols = ['#ff5fa2', '#ffd36b', '#9b6bff', '#ff8fc7', '#6bd0ff'];
  for (let i = 0; i < 14; i++) s += `<g transform="translate(${(i * 31) % 400} ${640 + (i % 4) * 34}) scale(1.4)">${MOTIFS.floare(cols[i % 5])}</g>`;
  for (const [x, y] of [[40, 300], [360, 260], [30, 420], [370, 400]]) s += `<path d="${heartPath(x, y, 1.6)}" fill="#ff8fc7" opacity=".7"/>`;
  return s;
}

export const menuScene = {
  id: 'menu',
  title: 'Angy',
  back: null,
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    root.appendChild(svgFromString(`<svg class="menu-bg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${menuBackdrop()}</svg>`));
    const svg = svgFromString('<svg viewBox="-10 -50 320 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pisicuța"><g class="mimi"></g></svg>');
    const mimi = new MimiLive(svg.querySelector('.mimi'), {
      getLook: () => s.look, getDesign: () => s.look.outfit, scope, audio: ctx.audio,
      reducedMotion: () => s.settings.reducedMotion,
    });
    scope.on(svg, 'pointerdown', (e) => {
      if (mimi.react(e.target)) burst(e.clientX, e.clientY, ['💖', '✨'], 6);
    });
    root.appendChild(h('div', { class: 'menu-wrap' },
      h('div', { class: 'logo' }, h('span', { class: 'logo-crown', 'aria-hidden': 'true' }, '👑'), h('h1', { class: 'menu-title' }, s.pet.name), h('p', { class: 'menu-sub' }, 'Prietena ta mereu alături!')),
      h('div', { class: 'menu-mimi' }, svg),
      btn({ icon: '', label: 'JOACĂ', cls: 'btn-primary btn-big btn-play', say: true, onClick: () => ctx.go('home') }),
    ));
    root.appendChild(btn({ icon: '⚙️', title: 'Pentru părinți', cls: 'btn-icon menu-gear', onClick: async () => { if (await parentGate()) ctx.go('parents'); } }));
    scope.timeout(() => { mimi.flash('giggle', 1200); ctx.audio.play('meow'); }, 900);
  },
};
