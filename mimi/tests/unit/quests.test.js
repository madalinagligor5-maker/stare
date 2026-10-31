import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensureDailyQuests, trackQuestEvent, claimQuest, checkBadges, questMatches, QUESTS_PER_DAY } from '../../src/core/quests.js';
import { QUEST_POOL, BADGES } from '../../src/data/quests.js';
import { defaultState } from '../../src/core/defaults.js';
import { colorFamily } from '../../src/core/util.js';

test('misiunile zilei sunt aceleași toată ziua și diferite ca tip', () => {
  const a = defaultState(), b = defaultState();
  ensureDailyQuests(a, QUEST_POOL, new Date(2026, 9, 31, 9));
  ensureDailyQuests(b, QUEST_POOL, new Date(2026, 9, 31, 20));
  assert.deepEqual(a.quests.list.map((q) => q.id), b.quests.list.map((q) => q.id));
  assert.equal(a.quests.list.length, QUESTS_PER_DAY);
  const events = a.quests.list.map((q) => QUEST_POOL.find((p) => p.id === q.id).event);
  assert.equal(new Set(events).size, events.length);
  assert.equal(ensureDailyQuests(a, QUEST_POOL, new Date(2026, 9, 31, 22)), false);
  assert.equal(ensureDailyQuests(a, QUEST_POOL, new Date(2026, 10, 1, 8)), true, 'zi nouă = misiuni noi');
});

test('progres, terminare, recompensă o singură dată', () => {
  const s = defaultState();
  s.quests = { day: 'x', list: [{ id: 'q-hraneste', progress: 0, done: false, claimed: false }, { id: 'q-albastra', progress: 0, done: false, claimed: false }] };
  assert.equal(trackQuestEvent(s, QUEST_POOL, 'feed').length, 0);
  trackQuestEvent(s, QUEST_POOL, 'feed');
  const done = trackQuestEvent(s, QUEST_POOL, 'feed');
  assert.equal(done[0].id, 'q-hraneste');
  assert.equal(claimQuest(s, QUEST_POOL, 'q-hraneste'), 8);
  assert.equal(claimQuest(s, QUEST_POOL, 'q-hraneste'), 0);
  assert.equal(claimQuest(s, QUEST_POOL, 'q-albastra'), 0, 'neterminată = fără recompensă');
  trackQuestEvent(s, QUEST_POOL, 'dress', { family: 'roz' });
  assert.equal(s.quests.list[1].done, false);
  trackQuestEvent(s, QUEST_POOL, 'dress', { family: colorFamily('#3d8bfd') });
  assert.equal(s.quests.list[1].done, true);
});

test('condiții speciale ale misiunilor', () => {
  const lunga = QUEST_POOL.find((q) => q.id === 'q-lunga');
  assert.equal(questMatches(lunga, { type: 'printesa' }), true);
  assert.equal(questMatches(lunga, { type: 'scurta' }), false);
  const model = QUEST_POOL.find((q) => q.id === 'q-model');
  assert.equal(questMatches(model, { pattern: 'none' }), false);
  assert.equal(questMatches(model, { pattern: 'buline' }), true);
});

test('insigne după statistici și colecții', () => {
  const s = defaultState();
  s.stats.dress = 1;
  const got = checkBadges(s, BADGES);
  assert.deepEqual(got.map((b) => b.id), ['b-prima-rochie']);
  assert.equal(checkBadges(s, BADGES).length, 0, 'aceeași insignă nu se primește de două ori');
  assert.ok(checkBadges(s, BADGES, { completeCollections: 1 }).some((b) => b.id === 'b-colectie'));
});

test('familii de culori', () => {
  assert.equal(colorFamily('#3d8bfd'), 'albastru');
  assert.equal(colorFamily('#ff8fc7'), 'roz');
  assert.equal(colorFamily('#5cc98a'), 'verde');
  assert.equal(colorFamily('#ffd36b'), 'galben');
  assert.equal(colorFamily('#9b6bff'), 'mov');
  assert.equal(colorFamily('#d93a3a'), 'rosu');
  assert.equal(colorFamily('#ffffff'), 'alb');
});
