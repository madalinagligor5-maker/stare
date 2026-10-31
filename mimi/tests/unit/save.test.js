import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSaveManager, migrate, SAVE_KEY } from '../../src/core/save.js';
import { SCHEMA_VERSION, defaultState } from '../../src/core/defaults.js';
import { memoryStorage } from './helpers.js';

test('fără salvare: pornește o stare nouă, completă', () => {
  const sm = createSaveManager(memoryStorage());
  const { state, fresh } = sm.load();
  assert.equal(fresh, true);
  assert.equal(state.version, SCHEMA_VERSION);
  assert.equal(state.pet.name, 'Mimi');
  assert.ok(state.stars > 0);
});

test('salvare + încărcare păstrează tot', () => {
  const st = memoryStorage();
  const sm = createSaveManager(st);
  const s = defaultState();
  s.stars = 77; s.pet.name = 'Lulu'; s.owned.push('f-canapea');
  s.wardrobe.push({ id: 'd1', name: 'Roz', fav: true, created: 1, design: { type: 'lunga', colorA: '#ff0000' } });
  assert.equal(sm.save(s), true);
  const { state, fresh } = sm.load();
  assert.equal(fresh, false);
  assert.equal(state.stars, 77);
  assert.equal(state.pet.name, 'Lulu');
  assert.deepEqual(state.owned, ['f-canapea']);
  assert.equal(state.wardrobe[0].design.type, 'lunga');
  assert.equal(state.wardrobe[0].design.material, 'bumbac', 'câmpurile lipsă din rochie sunt completate');
});

test('migrare v1 -> versiunea curentă', () => {
  const v1 = { version: 1, stars: 12, petName: 'Pufi', dresses: [{ name: 'Albastră', type: 'clopot', color: '#3d8bfd' }], dailyLimit: 30 };
  const s = migrate(v1);
  assert.equal(s.version, SCHEMA_VERSION);
  assert.equal(s.stars, 12);
  assert.equal(s.pet.name, 'Pufi');
  assert.equal(s.wardrobe.length, 1);
  assert.equal(s.wardrobe[0].name, 'Albastră');
  assert.equal(s.wardrobe[0].design.colorA, '#3d8bfd');
  assert.equal(s.settings.dailyLimitMin, 30);
  assert.equal(s.dailyLimit, undefined);
  assert.ok(Array.isArray(s.room.items));
});

test('migrare v2 -> v3 mută setările', () => {
  const s = migrate({ version: 2, stars: 3, pet: { name: 'Mimi' }, wardrobe: [], dailyLimit: 15, muted: true });
  assert.equal(s.settings.dailyLimitMin, 15);
  assert.equal(s.settings.muted, true);
  assert.equal(s.settings.volume, 0.7);
});

test('salvare stricată: pornește din nou fără să crape', () => {
  const sm = createSaveManager(memoryStorage({ [SAVE_KEY]: '{nu e json' }));
  const r = sm.load();
  assert.equal(r.recovered, true);
  assert.equal(r.state.version, SCHEMA_VERSION);
});

test('valori imposibile sunt corectate', () => {
  const s = migrate({ version: 3, stars: -50, pet: { name: '', needs: { hunger: 500, play: -3 } }, wardrobe: 'x', album: null });
  assert.equal(s.stars, 0);
  assert.equal(s.pet.name, 'Mimi');
  assert.equal(s.pet.needs.hunger, 100);
  assert.equal(s.pet.needs.play, 0);
  assert.deepEqual(s.wardrobe, []);
  assert.deepEqual(s.album, []);
});

test('export / import dus-întors', () => {
  const sm = createSaveManager(memoryStorage());
  const s = defaultState();
  s.stars = 99;
  const text = sm.exportData(s);
  const back = sm.importData(text);
  assert.equal(back.stars, 99);
  assert.equal(JSON.parse(text).app, 'mimi-salon');
});

test('import acceptă și starea simplă (fără înveliș)', () => {
  const sm = createSaveManager(memoryStorage());
  const back = sm.importData(JSON.stringify({ version: 3, stars: 5 }));
  assert.equal(back.stars, 5);
});

test('import de fișier greșit dă o eroare prietenoasă', () => {
  const sm = createSaveManager(memoryStorage());
  assert.throws(() => sm.importData('salut'), /nu este o salvare Mimi/);
  assert.throws(() => sm.importData('[1,2,3]'), /nu este o salvare Mimi/);
  assert.throws(() => sm.importData('{"altceva":1}'), /nu este o salvare Mimi/);
});

test('stocare plină: save întoarce false, nu aruncă', () => {
  const sm = createSaveManager({ getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); }, removeItem: () => {} });
  assert.equal(sm.save(defaultState()), false);
});

test('reset șterge salvarea', () => {
  const st = memoryStorage();
  const sm = createSaveManager(st);
  sm.save(defaultState());
  sm.reset();
  assert.equal(sm.load().fresh, true);
});
