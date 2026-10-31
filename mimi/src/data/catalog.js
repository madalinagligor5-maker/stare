// Strânge toate obiectele care se pot cumpăra/debloca într-o singură listă (pentru magazin și colecții).

import { DRESS_TYPES, MATERIALS, PATTERNS, OUTFIT_ACC, DECOR } from './clothes.js';
import { FURNITURE, WALLPAPERS, FLOORS } from './furniture.js';

export const SHOP_CATS = [
  { id: 'tinute', name: 'Ținute', icon: '👗' },
  { id: 'accesorii', name: 'Accesorii', icon: '👑' },
  { id: 'mobilier', name: 'Mobilier', icon: '🛋️' },
  { id: 'deco', name: 'Deco', icon: '🪴' },
];

// În ce raft din magazin apare un obiect.
export function shopShelf(it) {
  if (it.shop === 'haine') return it.kind === 'acc' || it.kind === 'decor' ? 'accesorii' : 'tinute';
  if (it.shop === 'mobila') return it.cat === 'mobila' || it.cat === 'lumini' ? 'mobilier' : 'deco';
  return 'deco'; // tapet, podea
}

export const ALL_ITEMS = [
  ...FURNITURE.map((x) => ({ ...x, shop: 'mobila' })),
  ...WALLPAPERS.map((x) => ({ ...x, shop: 'tapet' })),
  ...FLOORS.map((x) => ({ ...x, shop: 'podea' })),
  ...DRESS_TYPES.map((x) => ({ ...x, shop: 'haine', kind: 'type' })),
  ...MATERIALS.map((x) => ({ ...x, shop: 'haine', kind: 'material' })),
  ...PATTERNS.map((x) => ({ ...x, shop: 'haine', kind: 'pattern' })),
  ...OUTFIT_ACC.map((x) => ({ ...x, shop: 'haine', kind: 'acc' })),
  ...DECOR.map((x) => ({ ...x, shop: 'haine', kind: 'decor' })),
];

export const ITEM_BY_ID = new Map(ALL_ITEMS.map((x) => [x.id, x]));

export function itemById(id) { return ITEM_BY_ID.get(id) || null; }
