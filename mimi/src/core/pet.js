// Nevoile blânde ale lui Mimi. Scad încet și nu ajung niciodată la zero.

import { clamp } from './util.js';

export const NEEDS = [
  { id: 'hunger', name: 'Mâncare', icon: '🐟', color: '#ffb36b' },
  { id: 'play', name: 'Joacă', icon: '🧶', color: '#8fd3ff' },
  { id: 'clean', name: 'Curățenie', icon: '🫧', color: '#9ee6c9' },
  { id: 'sleep', name: 'Somn', icon: '🌙', color: '#b9a6ff' },
  { id: 'love', name: 'Iubire', icon: '💗', color: '#ff9cc8' },
];

export const NEED_FLOOR = 25;         // sub atât nu coboară niciodată
export const WELCOME_AFTER_MIN = 180; // după 3 ore de pauză, Mimi te întâmpină
// puncte pierdute pe minut (100 -> 25 în câteva ore)
const RATE = { hunger: 1 / 5, play: 1 / 6, clean: 1 / 8, sleep: 1 / 9, love: 1 / 6 };

// Aplică trecerea timpului. Întoarce câte minute au trecut.
export function decayNeeds(pet, now = Date.now()) {
  const minutes = Math.max(0, (now - (Number.isFinite(pet.lastTick) ? pet.lastTick : now)) / 60000);
  for (const k of Object.keys(RATE)) {
    const cur = pet.needs[k] ?? 80;
    let rate = RATE[k];
    if (k === 'sleep' && pet.sleeping) rate = -2; // doarme: se odihnește
    const next = cur - rate * minutes;
    pet.needs[k] = clamp(cur < NEED_FLOOR ? Math.max(cur, next) : Math.max(NEED_FLOOR, next), 0, 100);
  }
  pet.lastTick = now;
  return minutes;
}

export function care(pet, need, amount) {
  pet.needs[need] = clamp((pet.needs[need] ?? 0) + amount, 0, 100);
  return pet.needs[need];
}

export function lowestNeed(pet) {
  return NEEDS.map((n) => ({ ...n, value: pet.needs[n.id] })).sort((a, b) => a.value - b.value)[0];
}

// Emoția generală: 'adormita' | 'mofturoasa' | 'fericita'
export function moodOf(pet, phase) {
  if (pet.sleeping) return 'adormita';
  const low = lowestNeed(pet);
  if (low.value < 40) return 'mofturoasa';
  if (phase === 'night' && pet.needs.sleep < 60) return 'adormita';
  return 'fericita';
}

// Ciclu zi/noapte după ora reală.
export function dayPhase(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 6.5 && h < 9) return 'morning';
  if (h >= 9 && h < 18.5) return 'day';
  if (h >= 18.5 && h < 21) return 'evening';
  return 'night';
}

export const PHASE_NAMES = { morning: 'Dimineață', day: 'Zi', evening: 'Seară', night: 'Noapte' };
