// Strânge toate obiectele care se pot cumpăra/debloca într-o singură listă (pentru magazin și colecții).

import { DRESS_TYPES, MATERIALS, PATTERNS, OUTFIT_ACC, DECOR } from './clothes.js';
import { FURNITURE, WALLPAPERS, FLOORS } from './furniture.js';

export const SHOP_CATS = [
  { id: 'mobila', name: 'Mobilă', icon: '🛋️' },
  { id: 'tapet', name: 'Tapet', icon: '🧱' },
  { id: 'podea', name: 'Podea', icon: '🟫' },
  { id: 'haine', name: 'Haine rare', icon: '👗' },
];

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
