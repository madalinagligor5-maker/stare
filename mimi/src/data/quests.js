// Misiunile zilnice și insignele. Adaugă ușor altele noi aici.
// event = ce acțiune numără misiunea; match = condiții în plus; count = de câte ori; reward = stele.

export const QUEST_POOL = [
  { id: 'q-spala', icon: '🫧', text: 'Spală-o pe Mimi', event: 'wash', count: 1, reward: 10 },
  { id: 'q-albastra', icon: '💙', text: 'Fă o rochie albastră', event: 'dress', match: { family: 'albastru' }, count: 1, reward: 12 },
  { id: 'q-roz', icon: '🩷', text: 'Fă o rochie roz', event: 'dress', match: { family: 'roz' }, count: 1, reward: 12 },
  { id: 'q-verde', icon: '💚', text: 'Fă o rochie verde', event: 'dress', match: { family: 'verde' }, count: 1, reward: 12 },
  { id: 'q-galbena', icon: '💛', text: 'Fă o rochie galbenă', event: 'dress', match: { family: 'galben' }, count: 1, reward: 12 },
  { id: 'q-mov', icon: '💜', text: 'Fă o rochie mov', event: 'dress', match: { family: 'mov' }, count: 1, reward: 12 },
  { id: 'q-lunga', icon: '👑', text: 'Fă o rochie lungă sau de prințesă', event: 'dress', match: { types: ['lunga', 'printesa', 'sirena'] }, count: 1, reward: 12 },
  { id: 'q-model', icon: '🌸', text: 'Fă o rochie cu model', event: 'dress', match: { hasPattern: true }, count: 1, reward: 12 },
  { id: 'q-hraneste', icon: '🐟', text: 'Hrănește-o pe Mimi de 3 ori', event: 'feed', count: 3, reward: 8 },
  { id: 'q-joaca', icon: '🧶', text: 'Joacă-te cu Mimi', event: 'play', count: 2, reward: 8 },
  { id: 'q-mangaie', icon: '💗', text: 'Mângâie-o pe Mimi de 5 ori', event: 'pet', count: 5, reward: 8 },
  { id: 'q-poza', icon: '📸', text: 'Fă o poză', event: 'photo', count: 1, reward: 10 },
  { id: 'q-podium', icon: '✨', text: 'Mergi la defilare', event: 'runway', count: 1, reward: 10 },
  { id: 'q-joc', icon: '🎲', text: 'Joacă 2 mini-jocuri', event: 'minigame', count: 2, reward: 10 },
  { id: 'q-unghii', icon: '💅', text: 'Fă-i manichiura lui Mimi', event: 'nails', count: 1, reward: 10 },
  { id: 'q-coafura', icon: '💇', text: 'Fă-i o coafură nouă', event: 'hair', count: 1, reward: 10 },
  { id: 'q-machiaj', icon: '💄', text: 'Machiaz-o pe Mimi', event: 'makeup', count: 1, reward: 10 },
  { id: 'q-camera', icon: '🛋️', text: 'Așază 2 lucruri în cameră', event: 'place', count: 2, reward: 8 },
  { id: 'q-croitorie', icon: '🧵', text: 'Coase o rochie la croitorie', event: 'tailor', count: 1, reward: 12 },
  { id: 'q-somn', icon: '🌙', text: 'Culc-o pe Mimi', event: 'sleep', count: 1, reward: 8 },
];

// Insigne: stat = contor din state.stats, need = câte trebuie; sau check = funcție.
export const BADGES = [
  { id: 'b-prima-rochie', icon: '👗', name: 'Prima rochie', desc: 'Ai salvat prima rochie', stat: 'dress', need: 1 },
  { id: 'b-designer', icon: '🎀', name: 'Designer', desc: '10 rochii create', stat: 'dress', need: 10 },
  { id: 'b-spuma', icon: '🫧', name: 'Spumă multă', desc: 'Ai spălat-o pe Mimi', stat: 'wash', need: 1 },
  { id: 'b-curatel', icon: '🛁', name: 'Mereu curată', desc: '5 băițe', stat: 'wash', need: 5 },
  { id: 'b-fotograf', icon: '📸', name: 'Fotograf', desc: 'Prima poză', stat: 'photo', need: 1 },
  { id: 'b-album', icon: '🖼️', name: 'Album plin', desc: '10 poze', stat: 'photo', need: 10 },
  { id: 'b-vedeta', icon: '🌟', name: 'Vedetă', desc: 'Prima defilare', stat: 'runway', need: 1 },
  { id: 'b-jucausa', icon: '🎲', name: 'Jucăușă', desc: '10 mini-jocuri', stat: 'minigame', need: 10 },
  { id: 'b-bucatar', icon: '🍓', name: 'Bucătăreasă', desc: 'Ai hrănit-o de 10 ori', stat: 'feed', need: 10 },
  { id: 'b-prietena', icon: '💞', name: 'Cea mai bună prietenă', desc: '20 de mângâieri', stat: 'pet', need: 20 },
  { id: 'b-decorator', icon: '🛋️', name: 'Decoratoare', desc: '10 lucruri așezate', stat: 'place', need: 10 },
  { id: 'b-croitor', icon: '🧵', name: 'Croitoreasă', desc: 'Prima rochie cusută', stat: 'tailor', need: 1 },
  { id: 'b-stilist', icon: '💇', name: 'Stilistă', desc: '10 tratamente la salon', stat: 'salon', need: 10 },
  { id: 'b-misiuni', icon: '🏅', name: 'Harnică', desc: '10 misiuni terminate', stat: 'quest', need: 10 },
  { id: 'b-colectie', icon: '🏆', name: 'Colecționară', desc: 'O colecție completă', check: (s, ctx) => (ctx.completeCollections || 0) >= 1 },
];
