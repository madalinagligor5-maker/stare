// Magazinul: cumperi cu stelele câștigate (prețuri blânde). Fără bani reali.

import { h, btn, svgFromString } from '../core/ui.js';
import { isUnlocked, collectionProgress } from '../core/economy.js';
import { ALL_ITEMS, SHOP_CATS, shopShelf } from '../data/catalog.js';
import { COLLECTIONS } from '../data/furniture.js';
import { buyFlow, patternPreview, centeredPreview, viewPreview, ACC_VIEW } from './common.js';
import { furniturePreview, surfacePreview } from './room.js';
import { designThumb } from '../art/figure.js';
import { defaultDesign } from '../core/defaults.js';

export function itemPreview(it) {
  switch (it.shop) {
    case 'mobila': return furniturePreview(it);
    case 'tapet': case 'podea': return surfacePreview(it);
    default:
      if (it.kind === 'type') return designThumb({ ...defaultDesign(), type: it.id, colorA: '#c9b6ff', colorB: '#6bd0ff' });
      if (it.kind === 'material') return designThumb({ ...defaultDesign(), type: 'printesa', material: it.id, colorA: '#ff8fc7' });
      if (it.kind === 'pattern') return patternPreview(it.id, '#ffc2d9', '#9b6bff');
      if (it.kind === 'acc') return viewPreview(it.draw('#ff8fc7'), ACC_VIEW[it.slot]);
      if (it.kind === 'decor') return centeredPreview(it.draw('#ff5fa2'), 32);
      return '<svg viewBox="0 0 10 10"></svg>';
  }
}

export const shopScene = {
  id: 'shop',
  title: 'Magazin',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    let cat = params.cat || 'colectii';
    const filterRow = h('div', { class: 'filters' });
    const scroll = h('div', { class: 'scroll' });
    root.append(filterRow, scroll);

    function renderFilters() {
      filterRow.innerHTML = '';
      [{ id: 'colectii', name: 'Colecții', icon: '🏆' }, ...SHOP_CATS].forEach((c) => {
        filterRow.appendChild(btn({ icon: c.icon, label: c.name, cls: cat === c.id ? 'on' : '', say: true, onClick: () => { cat = c.id; render(); } }));
      });
    }

    function card(it) {
      const owned = isUnlocked(s, it);
      return h('div', { class: 'card', dataset: { id: it.id } },
        h('div', { class: 'card-art' }, svgFromString(itemPreview(it))),
        h('div', { class: 'card-title', title: it.name }, it.name),
        owned ? h('div', { class: 'owned-badge' }, '✓ Al tău') : btn({ icon: '⭐', label: `${it.price}`, attrs: { 'aria-label': `Cumpără pentru ${it.price} stele` }, cls: s.stars >= it.price ? 'btn-ok' : 'btn-soft', onClick: async () => { if (await buyFlow(ctx, it)) render(); } }),
      );
    }

    function render() {
      renderFilters();
      scroll.innerHTML = '';
      const paid = ALL_ITEMS.filter((it) => it.price > 0);
      if (cat === 'colectii') {
        scroll.appendChild(h('p', { class: 'hint' }, 'Completează o colecție și primești stele bonus și o insignă! 🏆'));
        for (const c of COLLECTIONS) {
          const pr = collectionProgress(s, c.id, ALL_ITEMS);
          scroll.appendChild(h('div', { class: 'section-title' }, `${c.icon} ${c.name} — ${pr.have}/${pr.total}${pr.complete ? ' ✅' : ''}`));
          scroll.appendChild(h('div', { class: 'progress' }, h('div', { style: { width: `${Math.round((pr.have / Math.max(1, pr.total)) * 100)}%` } })));
          const grid = h('div', { class: 'grid', style: { marginTop: '10px' } });
          ALL_ITEMS.filter((it) => it.collection === c.id).forEach((it) => grid.appendChild(card(it)));
          scroll.appendChild(grid);
        }
        return;
      }
      const grid = h('div', { class: 'grid' });
      paid.filter((it) => shopShelf(it) === cat).sort((a, b) => a.price - b.price).forEach((it) => grid.appendChild(card(it)));
      scroll.appendChild(grid);
    }
    render();
  },
};
