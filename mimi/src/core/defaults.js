// Starea implicită a jocului (o salvare nouă). Orice câmp nou adăugat aici
// apare automat și în salvările vechi (vezi save.js -> deepMerge).

export const SCHEMA_VERSION = 3;

export function defaultNails() {
  return Array.from({ length: 10 }, () => ({ color: null, color2: '#ffffff', pattern: 'simplu', glitter: false }));
}

export function defaultLook() {
  return {
    hair: { style: 'mot', color: '#9a6248', color2: '#ff9ccf', gradient: false, decor: 'none', decorColor: '#ff6fa8' },
    makeup: {
      shadow: { color: null, amount: 60 },
      lashes: { style: 'naturale', color: '#3a2840' },
      lips: { color: null, amount: 60 },
      blush: { color: '#ff9db5', amount: 35 },
      glitter: { color: null, amount: 50 },
    },
    nails: defaultNails(),
    acc: { bow: null, crown: null, glasses: null, earrings: null, scarf: null },
    outfit: null, // o rochie din atelier purtată de Mimi
  };
}

export function defaultDesign() {
  return {
    type: 'scurta',
    material: 'bumbac',
    colorA: '#ff8fc7',
    colorB: '#ffe08a',
    gradient: false,
    pattern: 'none',
    patternColor: '#ffffff',
    decor: [],
    acc: { shoes: null, socks: null, bag: null, jewelry: null, hat: null, gloves: null, wings: null, crown: null },
  };
}

export function defaultState(now = Date.now()) {
  return {
    version: SCHEMA_VERSION,
    createdAt: now,
    pet: {
      name: 'Mimi',
      needs: { hunger: 80, play: 80, clean: 70, sleep: 85, love: 80 },
      lastTick: now,
      lastVisit: now,
      sleeping: false,
    },
    look: defaultLook(),
    stars: 25,
    totalStars: 0,
    owned: [],
    atelier: { draft: defaultDesign(), editingId: null },
    wardrobe: [],
    nextDesignNum: 1,
    room: {
      wallpaper: 'wp-buline',
      floor: 'fl-parchet',
      items: [
        { uid: 'r1', id: 'f-covor-rotund', x: 200, y: 448, s: 1, flip: false, z: 1 },
        { uid: 'r2', id: 'f-cosulet', x: 318, y: 420, s: 1, flip: false, z: 2 },
        { uid: 'r3', id: 'f-planta', x: 60, y: 400, s: 1, flip: false, z: 3 },
        { uid: 'r4', id: 'f-tablou-pisica', x: 300, y: 150, s: 1, flip: false, z: 4 },
      ],
    },
    album: [],
    quests: { day: null, list: [] },
    badges: {},
    collections: {}, // colecții complete pentru care s-a primit bonusul
    stats: {
      wash: 0, dress: 0, photo: 0, runway: 0, minigame: 0, feed: 0, play: 0, pet: 0,
      buy: 0, place: 0, salon: 0, tailor: 0, sleep: 0, quest: 0,
    },
    minigames: { colors: 1, memory: 1, sort: 1, bubbles: 1, puzzle: 1 },
    settings: {
      volume: 0.7, muted: false, voice: true, reducedMotion: false,
      dailyLimitMin: 0, gridSnap: true,
    },
    playtime: { day: '', seconds: 0, reminded: false, extraMin: 0 },
  };
}
