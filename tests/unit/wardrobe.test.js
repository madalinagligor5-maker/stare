import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDesign, renameDesign, removeDesign, toggleFavorite, filterWardrobe, designCategory, updateDesign, cleanName, MAX_NAME } from '../../src/core/wardrobe.js';
import { defaultState, defaultDesign } from '../../src/core/defaults.js';

const mk = (type) => ({ ...defaultDesign(), type });

test('adaugă rochii cu nume implicit și copie independentă', () => {
  const s = defaultState();
  const d = mk('lunga');
  const e = addDesign(s, d, '');
  assert.equal(e.name, 'Creația mea 1');
  d.colorA = '#000000';
  assert.notEqual(s.wardrobe[0].design.colorA, '#000000');
  const e2 = addDesign(s, mk('scurta'), '  Rochia   de bal  ');
  assert.equal(e2.name, 'Rochia de bal');
  assert.equal(s.wardrobe[0].id, e2.id, 'cele noi apar primele');
});

test('salvare nelimitată', () => {
  const s = defaultState();
  for (let i = 0; i < 300; i++) addDesign(s, mk('scurta'), `R${i}`);
  assert.equal(s.wardrobe.length, 300);
  assert.equal(new Set(s.wardrobe.map((w) => w.id)).size, 300);
});

test('redenumire (cu limită de lungime, nume gol păstrează numele vechi)', () => {
  const s = defaultState();
  const e = addDesign(s, mk('scurta'), 'Veche');
  renameDesign(s, e.id, 'Nouă');
  assert.equal(s.wardrobe[0].name, 'Nouă');
  renameDesign(s, e.id, '   ');
  assert.equal(s.wardrobe[0].name, 'Nouă');
  renameDesign(s, e.id, 'x'.repeat(100));
  assert.equal(s.wardrobe[0].name.length, MAX_NAME);
  assert.equal(renameDesign(s, 'nu-exista', 'a'), null);
});

test('ștergere', () => {
  const s = defaultState();
  const a = addDesign(s, mk('scurta'), 'A');
  const b = addDesign(s, mk('lunga'), 'B');
  s.atelier.editingId = a.id;
  assert.equal(removeDesign(s, a.id), true);
  assert.equal(s.atelier.editingId, null);
  assert.deepEqual(s.wardrobe.map((w) => w.id), [b.id]);
  assert.equal(removeDesign(s, a.id), false);
});

test('favorite și filtre pe categorii', () => {
  const s = defaultState();
  const a = addDesign(s, mk('printesa'), 'A');
  addDesign(s, mk('pijama'), 'B');
  addDesign(s, mk('salopeta'), 'C');
  addDesign(s, mk('carnaval'), 'D');
  assert.equal(toggleFavorite(s, a.id), true);
  assert.equal(filterWardrobe(s.wardrobe, 'favorite').length, 1);
  assert.equal(filterWardrobe(s.wardrobe, 'toate').length, 4);
  assert.equal(filterWardrobe(s.wardrobe, 'pijamale')[0].name, 'B');
  assert.equal(filterWardrobe(s.wardrobe, 'tinute')[0].name, 'C');
  assert.equal(filterWardrobe(s.wardrobe, 'costume')[0].name, 'D');
  assert.equal(filterWardrobe(s.wardrobe, 'rochii')[0].name, 'A');
  assert.equal(toggleFavorite(s, a.id), false);
  assert.equal(designCategory({ type: 'bluza' }), 'tinute');
});

test('actualizare rochie existentă', () => {
  const s = defaultState();
  const e = addDesign(s, mk('scurta'), 'A');
  updateDesign(s, e.id, { ...mk('lunga'), colorA: '#123456' });
  assert.equal(s.wardrobe[0].design.type, 'lunga');
  assert.equal(cleanName('', 'X'), 'X');
});
