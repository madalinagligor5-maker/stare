import { test } from 'node:test';
import assert from 'node:assert/strict';
import { History } from '../../src/core/history.js';

test('anulează și refă', () => {
  const h = new History();
  h.reset({ c: 'roz' });
  h.push({ c: 'albastru' });
  h.push({ c: 'verde' });
  assert.deepEqual(h.undo(), { c: 'albastru' });
  assert.deepEqual(h.undo(), { c: 'roz' });
  assert.equal(h.undo(), null, 'nu se poate anula dincolo de început');
  assert.deepEqual(h.redo(), { c: 'albastru' });
  assert.deepEqual(h.redo(), { c: 'verde' });
  assert.equal(h.redo(), null);
});

test('o schimbare nouă după anulare șterge "refă"', () => {
  const h = new History();
  h.reset({ n: 1 });
  h.push({ n: 2 });
  h.undo();
  h.push({ n: 3 });
  assert.equal(h.canRedo, false);
  assert.deepEqual(h.undo(), { n: 1 });
});

test('stările identice nu se dublează', () => {
  const h = new History();
  h.reset({ a: 1 });
  assert.equal(h.push({ a: 1 }), false);
  assert.equal(h.canUndo, false);
});

test('copiile sunt independente (modificarea obiectului nu strică istoricul)', () => {
  const h = new History();
  const o = { list: [1] };
  h.reset(o);
  o.list.push(2);
  h.push(o);
  const back = h.undo();
  assert.deepEqual(back.list, [1]);
  back.list.push(99);
  assert.deepEqual(h.redo().list, [1, 2]);
});

test('limita de pași', () => {
  const h = new History(5);
  h.reset({ i: 0 });
  for (let i = 1; i <= 20; i++) h.push({ i });
  let steps = 0;
  while (h.undo()) steps++;
  assert.equal(steps, 4);
  assert.deepEqual(h.current(), { i: 16 });
});
