// Garderoba: toate creațiile salvate, cu favorite, filtre, redenumire și ștergere.

import { h, btn, svgFromString, toast, confirmBox, promptText, burst } from '../core/ui.js';
import { WARDROBE_FILTERS, filterWardrobe, renameDesign, removeDesign, toggleFavorite } from '../core/wardrobe.js';
import { designThumb } from '../art/figure.js';
import { clone } from '../core/util.js';

export const wardrobeScene = {
  id: 'wardrobe',
  title: 'Garderoba',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    let filter = params.filter || 'toate';
    const filterRow = h('div', { class: 'filters' });
    const scroll = h('div', { class: 'scroll' });
    root.append(filterRow, scroll);

    function renderFilters() {
      filterRow.innerHTML = '';
      for (const f of WARDROBE_FILTERS) {
        const n = filterWardrobe(s.wardrobe, f.id).length;
        filterRow.appendChild(btn({ icon: f.icon, label: `${f.name} (${n})`, cls: filter === f.id ? 'on' : '', say: true, onClick: () => { filter = f.id; render(); } }));
      }
    }

    function render() {
      renderFilters();
      scroll.innerHTML = '';
      if (s.look.outfit) {
        scroll.appendChild(h('div', { class: 'row row-center', style: { marginBottom: '10px' } },
          h('span', { class: 'hint' }, `${s.pet.name} poartă o rochie din atelier.`),
          btn({ icon: '👕', label: 'Dezbrac-o', cls: 'btn-soft', onClick: () => { s.look.outfit = null; ctx.store.commit(); ctx.audio.play('whoosh'); render(); } })));
      }
      const list = filterWardrobe(s.wardrobe, filter);
      if (!list.length) {
        scroll.appendChild(h('div', { class: 'empty' }, h('span', { class: 'big' }, '👗'),
          s.wardrobe.length ? 'Nicio rochie aici încă.' : 'Garderoba e goală. Hai să creezi prima rochie!',
          h('div', { style: { marginTop: '12px' } }, btn({ icon: '✂️', label: 'Mergi la atelier', cls: 'btn-primary', onClick: () => ctx.go('atelier') }))));
        return;
      }
      const grid = h('div', { class: 'grid' });
      for (const w of list) {
        const fav = btn({ icon: w.fav ? '💖' : '🤍', title: w.fav ? 'Scoate de la favorite' : 'Pune la favorite', cls: 'btn-icon fav-btn', sound: 'pop', onClick: () => { toggleFavorite(s, w.id); ctx.store.commit(); render(); } });
        const card = h('div', { class: 'card', dataset: { id: w.id } },
          fav,
          h('div', { class: 'card-art' }, svgFromString(designThumb(w.design))),
          h('div', { class: 'card-title', title: w.name }, w.name),
          h('div', { class: 'card-actions' },
            btn({ icon: '🐱', title: 'Îmbracă-o pe Mimi', cls: 'btn-primary', onClick: (e) => {
              s.look.outfit = clone(w.design);
              ctx.store.commit();
              ctx.audio.play('sparkle');
              burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, ['✨', '👗', '💖'], 10);
              toast(`${s.pet.name} poartă „${w.name}”!`, '👗');
              render();
            } }),
            btn({ icon: '✏️', title: 'Editează în atelier', onClick: () => ctx.go('atelier', { design: w.design, editingId: w.id }) }),
            btn({ icon: '🏷️', title: 'Redenumește', onClick: async () => {
              const name = await promptText('Nume nou', w.name, { icon: '🏷️' });
              if (name === null) return;
              renameDesign(s, w.id, name);
              ctx.store.commit();
              render();
            } }),
            btn({ icon: '🗑️', title: 'Șterge', onClick: async () => {
              if (!(await confirmBox(`Ștergem „${w.name}”?`, { icon: '🗑️' }))) return;
              removeDesign(s, w.id);
              ctx.store.commit();
              ctx.audio.play('whoosh');
              render();
            } }),
          ));
        grid.appendChild(card);
      }
      scroll.appendChild(grid);
    }
    render();
  },
};
