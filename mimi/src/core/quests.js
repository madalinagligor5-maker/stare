// Misiuni zilnice și insigne. Funcții pure peste stare.

import { dayKey, seededRandom, shuffle } from './util.js';

export const QUESTS_PER_DAY = 3;

// Alege misiunile zilei (aceleași pentru toată ziua). Întoarce true dacă s-au schimbat.
export function ensureDailyQuests(state, pool, date = new Date()) {
  const key = dayKey(date);
  if (state.quests.day === key && state.quests.list.length) return false;
  const rnd = seededRandom(`mimi-${key}`);
  const picks = [];
  const usedEvents = new Set();
  for (const q of shuffle(pool, rnd)) {
    if (usedEvents.has(q.event)) continue; // varietate: evenimente diferite
    picks.push(q);
    usedEvents.add(q.event);
    if (picks.length === QUESTS_PER_DAY) break;
  }
  state.quests = { day: key, list: picks.map((q) => ({ id: q.id, progress: 0, done: false, claimed: false })) };
  return true;
}

export function questMatches(def, payload = {}) {
  const m = def.match;
  if (!m) return true;
  if (m.family && payload.family !== m.family) return false;
  if (m.types && !m.types.includes(payload.type)) return false;
  if (m.hasPattern && (!payload.pattern || payload.pattern === 'none')) return false;
  return true;
}

// Înregistrează o acțiune. Întoarce definițiile misiunilor tocmai terminate.
export function trackQuestEvent(state, pool, event, payload = {}) {
  const finished = [];
  for (const q of state.quests.list) {
    if (q.done) continue;
    const def = pool.find((p) => p.id === q.id);
    if (!def || def.event !== event || !questMatches(def, payload)) continue;
    q.progress = Math.min(def.count, q.progress + 1);
    if (q.progress >= def.count) { q.done = true; finished.push(def); }
  }
  return finished;
}

// Ridică recompensa unei misiuni terminate. Întoarce numărul de stele (0 dacă nu se poate).
export function claimQuest(state, pool, id) {
  const q = state.quests.list.find((x) => x.id === id);
  const def = pool.find((p) => p.id === id);
  if (!q || !def || !q.done || q.claimed) return 0;
  q.claimed = true;
  return def.reward;
}

// Verifică insignele noi. `ctx` poate conține informații în plus (ex. colecții complete).
export function checkBadges(state, badges, ctx = {}) {
  const earned = [];
  for (const b of badges) {
    if (state.badges[b.id]) continue;
    let ok = false;
    if (b.stat) ok = (state.stats[b.stat] || 0) >= b.need;
    else if (b.check) ok = !!b.check(state, ctx);
    if (ok) { state.badges[b.id] = Date.now(); earned.push(b); }
  }
  return earned;
}
