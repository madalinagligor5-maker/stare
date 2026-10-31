// Garderoba: rochiile salvate, cu nume, favorite și filtre. Funcții pure.

import { clone, uid } from './util.js';

export const MAX_NAME = 24;

// Categoria unei ținute, după tipul ei.
export function designCategory(design) {
  const t = design?.type;
  if (t === 'pijama') return 'pijamale';
  if (t === 'carnaval') return 'costume';
  if (t === 'bluza' || t === 'salopeta') return 'tinute';
  return 'rochii';
}

export const WARDROBE_FILTERS = [
  { id: 'toate', name: 'Toate', icon: '👗' },
  { id: 'favorite', name: 'Favorite', icon: '💖' },
  { id: 'rochii', name: 'Rochii', icon: '👗' },
  { id: 'tinute', name: 'Ținute', icon: '👚' },
  { id: 'pijamale', name: 'Pijamale', icon: '🌙' },
  { id: 'costume', name: 'Costume', icon: '🎭' },
];

export function cleanName(name, fallback = 'Rochie') {
  const s = String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
  return s || fallback;
}

export function addDesign(state, design, name) {
  const num = state.nextDesignNum || 1;
  state.nextDesignNum = num + 1;
  const entry = {
    id: uid('d'),
    name: cleanName(name, `Creația mea ${num}`),
    fav: false,
    created: Date.now(),
    design: clone(design),
  };
  state.wardrobe.unshift(entry);
  return entry;
}

// Actualizează o rochie existentă (când o editezi din nou).
export function updateDesign(state, id, design) {
  const e = state.wardrobe.find((w) => w.id === id);
  if (!e) return null;
  e.design = clone(design);
  return e;
}

export function renameDesign(state, id, name) {
  const e = state.wardrobe.find((w) => w.id === id);
  if (!e) return null;
  e.name = cleanName(name, e.name);
  return e;
}

export function removeDesign(state, id) {
  const i = state.wardrobe.findIndex((w) => w.id === id);
  if (i < 0) return false;
  state.wardrobe.splice(i, 1);
  if (state.atelier?.editingId === id) state.atelier.editingId = null;
  return true;
}

export function toggleFavorite(state, id) {
  const e = state.wardrobe.find((w) => w.id === id);
  if (!e) return null;
  e.fav = !e.fav;
  return e.fav;
}

export function filterWardrobe(list, filter = 'toate') {
  if (filter === 'toate') return list.slice();
  if (filter === 'favorite') return list.filter((w) => w.fav);
  return list.filter((w) => designCategory(w.design) === filter);
}
