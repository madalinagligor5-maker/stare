// Punctul de pornire: încarcă salvarea, pregătește sunetul, scenele și progresul (stele, misiuni, insigne).

import { bus } from './core/bus.js';
import { audio } from './core/audio.js';
import { createSaveManager } from './core/save.js';
import { SceneManager, getActiveHandles } from './core/scenes.js';
import { initUI, toast, flyStars, speak, modal, h, onTap } from './core/ui.js';
import { addStars, collectionProgress } from './core/economy.js';
import { ensureDailyQuests, trackQuestEvent, checkBadges } from './core/quests.js';
import { decayNeeds, dayPhase, WELCOME_AFTER_MIN } from './core/pet.js';
import { dayKey } from './core/util.js';
import { QUEST_POOL, BADGES } from './data/quests.js';
import { COLLECTIONS } from './data/furniture.js';
import { ALL_ITEMS } from './data/catalog.js';
import { SCENES } from './scenes/index.js';

const saver = createSaveManager(globalThis.localStorage);
const loaded = saver.load();

// ---- Starea centralizată ----
let saveTimer = 0;
const store = {
  state: loaded.state,
  // Anunță schimbarea și salvează (cu mică întârziere, ca să nu scriem prea des).
  commit() {
    bus.emit('state', this.state);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => this.flush(), 350);
  },
  flush() {
    clearTimeout(saveTimer);
    if (!saver.save(this.state)) toast('Nu am putut salva (spațiu plin?)', '⚠️');
  },
};

const stage = document.getElementById('stage');
const ctx = {
  store, bus, audio, save: saver,
  phase: () => dayPhase(new Date()),
  go: (id, params, dir) => scenes.go(id, params, dir),
  track,
  reward,
  say: speak,
  welcomeBack: false,
};
initUI(ctx);
const scenes = new SceneManager(stage, ctx);
ctx.scenes = scenes;
SCENES.forEach((s) => scenes.register(s));

// ---- Stele ----
function reward(n, fromEl) {
  const got = addStars(store.state, n);
  if (!got) return 0;
  audio.play('star');
  flyStars(fromEl, got);
  updateStars(true);
  store.commit();
  return got;
}

function updateStars(delayed = false) {
  const el = document.getElementById('star-count');
  const set = () => { el.textContent = String(store.state.stars); };
  if (delayed) setTimeout(set, 750); else set();
}
bus.on('state', () => updateStars(false));

// ---- Progres: statistici, misiuni, insigne, colecții ----
const SALON_EVENTS = ['hair', 'nails', 'makeup', 'salonacc', 'wash'];
function track(type, payload = {}) {
  const s = store.state;
  if (type in s.stats) s.stats[type] += 1;
  if (SALON_EVENTS.includes(type)) s.stats.salon += 1;
  ensureDailyQuests(s, QUEST_POOL);
  const done = trackQuestEvent(s, QUEST_POOL, type, payload);
  for (const q of done) {
    setTimeout(() => { toast(`Misiune gata: ${q.text}!`, '🏅', 2800); audio.play('tada'); }, 600);
  }
  checkProgress();
  store.commit();
}

function checkProgress() {
  const s = store.state;
  let complete = 0;
  for (const c of COLLECTIONS) {
    if (!collectionProgress(s, c.id, ALL_ITEMS).complete) continue;
    complete += 1;
    if (!s.collections[c.id]) {
      s.collections[c.id] = Date.now();
      addStars(s, c.bonus);
      setTimeout(() => {
        audio.play('win');
        modal({ icon: c.icon, title: `Colecția ${c.name} e completă!`, body: h('p', { class: 'hint' }, `Bonus: ${c.bonus} ⭐`), actions: [{ label: 'Super!', icon: '🎉', cls: 'btn-ok', value: true }] });
      }, 900);
    }
  }
  const badges = checkBadges(s, BADGES, { completeCollections: complete });
  badges.forEach((b, i) => setTimeout(() => { toast(`Insignă nouă: ${b.name}`, b.icon, 3000); audio.play('win'); }, 1200 + i * 900));
}
bus.on('progress:check', () => { checkProgress(); store.commit(); });

// ---- Bara de sus ----
const backBtn = document.getElementById('btn-back');
const soundBtn = document.getElementById('btn-sound');
const titleEl = document.getElementById('scene-title');
onTap(backBtn, () => { audio.play('click'); scenes.back(); });
onTap(soundBtn, () => {
  store.state.settings.muted = !store.state.settings.muted;
  applySettings();
  store.commit();
  if (!store.state.settings.muted) audio.play('pop');
});
bus.on('scene:changed', ({ scene }) => {
  backBtn.hidden = !scene.back;
  const t = typeof scene.title === 'function' ? scene.title(store.state) : scene.title;
  titleEl.textContent = t || 'Mimi';
});

function applySettings() {
  const st = store.state.settings;
  audio.setVolume(st.volume);
  audio.setMuted(st.muted);
  soundBtn.querySelector('.btn-ico').textContent = st.muted ? '🔇' : '🔊';
  soundBtn.setAttribute('aria-pressed', String(!st.muted));
  document.body.classList.toggle('reduce-motion', !!st.reducedMotion);
}
bus.on('settings', applySettings);

// Sunetul pornește doar după prima atingere (regula browserelor).
const unlock = () => { audio.unlock(); applySettings(); };
window.addEventListener('pointerdown', unlock, { capture: true });
window.addEventListener('keydown', unlock, { capture: true });

// ---- Timpul: nevoi, zi nouă, timp de joc ----
function tickTime() {
  const s = store.state;
  const minutes = decayNeeds(s.pet, Date.now());
  if (minutes >= WELCOME_AFTER_MIN) ctx.welcomeBack = true;
  // la noapte Mimi doarme singură dacă e obosită; dimineața se trezește
  const ph = ctx.phase();
  if (ph === 'morning' && s.pet.sleeping && s.pet.needs.sleep > 60) { s.pet.sleeping = false; ctx.justWoke = true; }
  ensureDailyQuests(s, QUEST_POOL);
}

function tickPlaytime(sec) {
  const s = store.state;
  const today = dayKey();
  if (s.playtime.day !== today) s.playtime = { day: today, seconds: 0, reminded: false, extraMin: 0 };
  s.playtime.seconds += sec;
  const limit = (s.settings.dailyLimitMin || 0) + (s.playtime.extraMin || 0);
  if (s.settings.dailyLimitMin > 0 && !s.playtime.reminded && s.playtime.seconds >= limit * 60) {
    s.playtime.reminded = true;
    store.commit();
    scenes.go('rest');
  }
}

tickTime();
ctx.welcomeBack = ctx.welcomeBack || (!loaded.fresh && Date.now() - (store.state.pet.lastVisit || Date.now()) > WELCOME_AFTER_MIN * 60000);
store.state.pet.lastVisit = Date.now();
if (loaded.recovered) setTimeout(() => toast('Am pornit o salvare nouă', '💾'), 800);

setInterval(() => { if (document.visibilityState === 'visible') { tickTime(); store.state.pet.lastVisit = Date.now(); store.commit(); } }, 30000);
setInterval(() => { if (document.visibilityState === 'visible') tickPlaytime(5); }, 5000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { store.state.pet.lastVisit = Date.now(); store.flush(); } else { tickTime(); store.commit(); }
});
window.addEventListener('pagehide', () => store.flush());

applySettings();
updateStars();
store.flush();

// Ce se întâmplă cu linkurile externe: nu există. Blocăm totuși orice navigare accidentală.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href]');
  if (a && !a.hasAttribute('download') && /^https?:/i.test(a.getAttribute('href'))) e.preventDefault();
});

// Pentru teste automate (nu afectează jocul).
globalThis.__mimi = { ctx, getActiveHandles, busCount: () => bus.count() };

const startScene = new URLSearchParams(location.search).get('scena');
scenes.go(startScene && scenes.registry.has(startScene) ? startScene : 'menu');

// ---- Offline (PWA) ----
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !new URLSearchParams(location.search).has('fara-sw')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
