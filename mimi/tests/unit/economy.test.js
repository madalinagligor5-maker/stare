import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addStars, buyItem, isUnlocked, canAfford, collectionProgress } from '../../src/core/economy.js';
import { defaultState } from '../../src/core/defaults.js';
import { ALL_ITEMS, itemById } from '../../src/data/catalog.js';
import { COLLECTIONS } from '../../src/data/furniture.js';

test('câștig de stele', () => {
  const s = defaultState();
  const before = s.stars;
  assert.equal(addStars(s, 5), 5);
  assert.equal(s.stars, before + 5);
  assert.equal(s.totalStars, 5);
  assert.equal(addStars(s, -3), 0, 'nu se pot pierde stele prin "câștig" negativ');
  assert.equal(s.stars, before + 5);
});

test('cumpărare reușită', () => {
  const s = defaultState();
  s.stars = 20;
  const item = itemById('f-canapea');
  assert.equal(isUnlocked(s, item), false);
  assert.deepEqual(buyItem(s, item), { ok: true });
  assert.equal(s.stars, 20 - item.price);
  assert.equal(isUnlocked(s, item), true);
});

test('nu poți cumpăra fără destule stele (și nu pierzi nimic)', () => {
  const s = defaultState();
  s.stars = 3;
  const item = itemById('f-pat-printesa');
  const r = buyItem(s, item);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'poor');
  assert.equal(r.missing, item.price - 3);
  assert.equal(s.stars, 3);
  assert.equal(canAfford(s, item), false);
});

test('nu cumperi de două ori', () => {
  const s = defaultState();
  s.stars = 100;
  const item = itemById('f-ursulet');
  buyItem(s, item);
  const left = s.stars;
  assert.equal(buyItem(s, item).reason, 'owned');
  assert.equal(s.stars, left);
});

test('obiectele gratuite sunt deblocate', () => {
  const s = defaultState();
  assert.equal(isUnlocked(s, itemById('f-cosulet')), true);
  assert.equal(buyItem(s, itemById('f-cosulet')).reason, 'owned');
});

test('colecții: progres și completare', () => {
  const s = defaultState();
  s.stars = 10000;
  const col = 'mare';
  const items = ALL_ITEMS.filter((i) => i.collection === col);
  assert.ok(items.length >= 4);
  assert.deepEqual(collectionProgress(s, col, ALL_ITEMS), { have: 0, total: items.length, complete: false });
  items.forEach((i) => buyItem(s, i));
  assert.equal(collectionProgress(s, col, ALL_ITEMS).complete, true);
});

test('catalogul: id-uri unice, prețuri blânde, colecții valide', () => {
  const ids = new Set();
  for (const it of ALL_ITEMS) {
    assert.ok(!ids.has(it.id), `id dublat: ${it.id}`);
    ids.add(it.id);
    if (it.price) assert.ok(it.price > 0 && it.price <= 40, `preț prea mare: ${it.id}`);
    if (it.collection) assert.ok(COLLECTIONS.some((c) => c.id === it.collection), `colecție necunoscută: ${it.id}`);
    if (it.collection) assert.ok(it.price > 0, `obiectele din colecții se cumpără: ${it.id}`);
  }
  for (const c of COLLECTIONS) assert.ok(ALL_ITEMS.filter((i) => i.collection === c.id).length >= 4);
});
