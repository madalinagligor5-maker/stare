// Salvare în localStorage, cu versiune de schemă și migrare de la versiunile vechi.
// Funcționează cu orice obiect de tip "storage" (getItem/setItem/removeItem),
// de aceea poate fi testat și în Node.

import { SCHEMA_VERSION, defaultState, defaultDesign } from './defaults.js';
import { deepMerge, clone, isPlainObject, uid } from './util.js';

export const SAVE_KEY = 'mimi-salon-save';
export const EXPORT_APP = 'mimi-salon';

// Fiecare migrare duce salvarea de la versiunea N la N+1.
export const MIGRATIONS = {
  // v1 (prima variantă): { version:1, stars, petName, dresses:[{name,type,color}] }
  1(data) {
    const wardrobe = (Array.isArray(data.dresses) ? data.dresses : []).map((d, i) => ({
      id: uid('d'),
      name: String(d.name || `Rochia ${i + 1}`),
      fav: false,
      created: Date.now(),
      design: { ...defaultDesign(), type: d.type || 'scurta', colorA: d.color || '#ff8fc7' },
    }));
    return {
      version: 2,
      stars: Number(data.stars) || 0,
      pet: { name: data.petName || 'Angy' },
      wardrobe,
      dailyLimit: data.dailyLimit || 0,
    };
  },
  // v2 -> v3: setările au fost mutate în `settings`, limita zilnică redenumită.
  2(data) {
    const out = { ...data, version: 3 };
    out.settings = { ...(data.settings || {}) };
    if (data.dailyLimit !== undefined) {
      out.settings.dailyLimitMin = Number(data.dailyLimit) || 0;
      delete out.dailyLimit;
    }
    if (data.muted !== undefined) { out.settings.muted = !!data.muted; delete out.muted; }
    return out;
  },
};

// Primește orice obiect salvat și întoarce o stare completă, la zi.
export function migrate(raw, now = Date.now()) {
  if (!isPlainObject(raw)) return defaultState(now);
  let data = clone(raw);
  let version = Number(data.version) || 1;
  if (version > SCHEMA_VERSION) version = SCHEMA_VERSION; // salvare dintr-o versiune mai nouă: încercăm totuși
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) break;
    data = step(data);
    version = Number(data.version) || version + 1;
  }
  const merged = deepMerge(defaultState(now), data);
  merged.version = SCHEMA_VERSION;
  return sanitize(merged);
}

// Corecturi de siguranță (valori imposibile -> valori bune).
function sanitize(s) {
  s.stars = Math.max(0, Math.floor(Number(s.stars) || 0));
  if (!Array.isArray(s.owned)) s.owned = [];
  if (!Array.isArray(s.wardrobe)) s.wardrobe = [];
  s.wardrobe = s.wardrobe.filter((w) => isPlainObject(w) && isPlainObject(w.design))
    .map((w) => ({ id: w.id || uid('d'), name: String(w.name || 'Rochie'), fav: !!w.fav, created: w.created || Date.now(), design: deepMerge(defaultDesign(), w.design) }));
  if (!Array.isArray(s.album)) s.album = [];
  if (!Array.isArray(s.room.items)) s.room.items = [];
  for (const k of Object.keys(s.pet.needs)) {
    s.pet.needs[k] = Math.max(0, Math.min(100, Number(s.pet.needs[k]) || 0));
  }
  if (!s.pet.name || typeof s.pet.name !== 'string') s.pet.name = 'Angy';
  return s;
}

export function createSaveManager(storage, key = SAVE_KEY) {
  return {
    // Încarcă salvarea; dacă nu există sau e stricată, pornește de la zero.
    load(now = Date.now()) {
      let raw = null;
      try { raw = storage.getItem(key); } catch { raw = null; }
      if (!raw) return { state: defaultState(now), fresh: true };
      try {
        return { state: migrate(JSON.parse(raw), now), fresh: false };
      } catch {
        return { state: defaultState(now), fresh: true, recovered: true };
      }
    },
    save(state) {
      try {
        storage.setItem(key, JSON.stringify(state));
        return true;
      } catch (err) {
        return false; // spațiu plin sau stocare blocată
      }
    },
    reset() {
      try { storage.removeItem(key); } catch { /* nimic */ }
    },
    exportData(state) {
      return JSON.stringify({ app: EXPORT_APP, exportedAt: new Date().toISOString(), data: state }, null, 1);
    },
    // Aruncă o eroare cu mesaj prietenos dacă textul nu e o salvare validă.
    importData(text, now = Date.now()) {
      let parsed;
      try { parsed = JSON.parse(String(text)); } catch {
        throw new Error('Fișierul nu este o salvare Angy.');
      }
      const data = isPlainObject(parsed) && parsed.app === EXPORT_APP ? parsed.data : parsed;
      if (!isPlainObject(data) || !('version' in data || 'stars' in data || 'pet' in data)) {
        throw new Error('Fișierul nu este o salvare Angy.');
      }
      return migrate(data, now);
    },
  };
}
