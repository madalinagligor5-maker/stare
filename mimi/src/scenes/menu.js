// Ecranul de start.

import { h, btn, svgFromString, burst } from '../core/ui.js';
import { MimiLive } from '../art/mimiLive.js';
import { parentGate } from './parents.js';

export const menuScene = {
  id: 'menu',
  title: 'Mimi',
  back: null,
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const svg = svgFromString('<svg viewBox="-10 -50 320 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mimi"><g class="mimi"></g></svg>');
    const mimiBox = h('div', { class: 'menu-mimi' }, svg);
    const mimi = new MimiLive(svg.querySelector('.mimi'), {
      getLook: () => s.look, getDesign: () => s.look.outfit, scope, audio: ctx.audio,
      reducedMotion: () => s.settings.reducedMotion,
    });
    scope.on(svg, 'pointerdown', (e) => {
      const z = mimi.react(e.target);
      if (z) burst(e.clientX, e.clientY, ['💖', '✨'], 6);
    });

    root.appendChild(h('div', { class: 'menu-wrap' },
      h('h1', { class: 'menu-title' }, s.pet.name),
      h('p', { class: 'menu-sub' }, 'Salon • Atelier de rochii • Camera mea'),
      mimiBox,
      btn({ icon: '▶️', label: 'Hai să ne jucăm!', cls: 'btn-primary btn-big', say: true, onClick: () => ctx.go('home') }),
    ));
    root.appendChild(btn({ icon: '⚙️', title: 'Pentru părinți', cls: 'btn-icon menu-gear', onClick: async () => { if (await parentGate()) ctx.go('parents'); } }));
  },
};
