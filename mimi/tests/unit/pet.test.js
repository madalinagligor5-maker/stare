import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decayNeeds, care, moodOf, dayPhase, NEED_FLOOR } from '../../src/core/pet.js';
import { defaultState } from '../../src/core/defaults.js';

test('nevoile scad încet și nu ajung niciodată la zero', () => {
  const { pet } = defaultState(0);
  decayNeeds(pet, 10 * 60000);
  assert.ok(pet.needs.hunger < 80 && pet.needs.hunger > 70);
  decayNeeds(pet, 30 * 24 * 3600000); // o lună de pauză
  for (const v of Object.values(pet.needs)) assert.ok(v >= NEED_FLOOR, `nevoie sub prag: ${v}`);
});

test('somnul reface energia', () => {
  const { pet } = defaultState(0);
  pet.needs.sleep = 40;
  pet.sleeping = true;
  decayNeeds(pet, 10 * 60000);
  assert.ok(pet.needs.sleep > 40);
});

test('grija crește nevoile până la 100', () => {
  const { pet } = defaultState(0);
  care(pet, 'hunger', 500);
  assert.equal(pet.needs.hunger, 100);
});

test('emoții', () => {
  const { pet } = defaultState(0);
  assert.equal(moodOf(pet, 'day'), 'fericita');
  pet.needs.play = 30;
  assert.equal(moodOf(pet, 'day'), 'mofturoasa');
  pet.sleeping = true;
  assert.equal(moodOf(pet, 'day'), 'adormita');
});

test('ziua și noaptea după ora reală', () => {
  assert.equal(dayPhase(new Date(2026, 0, 1, 7, 30)), 'morning');
  assert.equal(dayPhase(new Date(2026, 0, 1, 13)), 'day');
  assert.equal(dayPhase(new Date(2026, 0, 1, 19, 30)), 'evening');
  assert.equal(dayPhase(new Date(2026, 0, 1, 23)), 'night');
  assert.equal(dayPhase(new Date(2026, 0, 1, 3)), 'night');
});
