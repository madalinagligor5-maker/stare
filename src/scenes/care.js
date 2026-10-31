// Locurile de grijă: bucătăria (mâncare), dormitorul (somn) și harta orașului.

import { h, btn, svgFromString, burst, optionRow } from '../core/ui.js';
import { MimiLive } from '../art/mimiLive.js';
import { care, moodOf } from '../core/pet.js';
import { MOTIFS, starPoints, heartPath } from '../art/svg.js';

export const FOODS = [
  { id: 'briosa', icon: '🧁', name: 'Brioșă', hunger: 16 },
  { id: 'smoothie', icon: '🥤', name: 'Smoothie', hunger: 12 },
  { id: 'peste', icon: '🐟', name: 'Peștișor', hunger: 22 },
  { id: 'capsuni', icon: '🍓', name: 'Căpșuni', hunger: 10 },
  { id: 'salata', icon: '🥗', name: 'Salată', hunger: 14 },
  { id: 'clatite', icon: '🥞', name: 'Clătite', hunger: 18 },
  { id: 'pepene', icon: '🍉', name: 'Pepene', hunger: 10 },
  { id: 'lapte', icon: '🥛', name: 'Lăptic', hunger: 14 },
];

// Pisicuța așezată în scenă (sus), cu masa/pătura în față.
function sceneSVG(bg, front, t = { x: 65, y: 60, k: 0.9 }) {
  return svgFromString(`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img">${bg}<g transform="translate(${t.x} ${t.y}) scale(${t.k})"><g class="mimi"></g></g><g class="front">${front}</g></svg>`);
}

function kitchenBG() {
  let s = '<rect width="400" height="520" fill="#ffd9e8"/>';
  for (let x = 0; x < 400; x += 40) s += `<rect x="${x}" width="20" height="400" fill="#ffcfe2" opacity=".6"/>`;
  s += '<rect x="24" y="40" width="130" height="120" rx="12" fill="#fff" stroke="#f2b6cf" stroke-width="5"/><rect x="34" y="50" width="110" height="100" rx="6" fill="#bfe7ff"/><circle cx="118" cy="80" r="16" fill="#ffe27a"/><path d="M89 50 L 89 150 M34 100 L 144 100" stroke="#fff" stroke-width="5"/><path d="M18 34 Q 44 100 30 168 L 18 168 Z M160 34 Q 134 100 148 168 L 160 168 Z" fill="#ff9cc8"/>';
  s += '<rect x="292" y="120" width="96" height="280" rx="18" fill="#ffb3d1" stroke="#f08bb7" stroke-width="4"/><path d="M292 220 L 388 220" stroke="#f08bb7" stroke-width="4"/><rect x="300" y="160" width="8" height="40" rx="4" fill="#fff"/><rect x="300" y="240" width="8" height="50" rx="4" fill="#fff"/><path d="' + heartPath(340, 175, 1.2) + '" fill="#fff"/>';
  s += '<rect x="180" y="70" width="96" height="8" rx="3" fill="#d89a64"/><rect x="186" y="44" width="18" height="26" rx="5" fill="#ff8fc7"/><rect x="210" y="50" width="18" height="20" rx="5" fill="#9ee6e0"/><rect x="234" y="40" width="18" height="30" rx="5" fill="#ffd36b"/><circle cx="264" cy="58" r="11" fill="#5cc98a"/>';
  s += '<rect y="400" width="400" height="120" fill="#f1c7a6"/>';
  return s;
}
function kitchenFront() {
  let scallop = 'M0 380';
  for (let x = 0; x < 400; x += 25) scallop += ` Q ${x + 12.5} 400 ${x + 25} 380`;
  return `<rect x="0" y="372" width="400" height="148" fill="#fff0f6"/><path d="${scallop} L 400 372 L 0 372 Z" fill="#ff9cc8"/><rect x="0" y="366" width="400" height="12" fill="#ff8fc7"/>${[60, 140, 260, 340].map((x) => `<path d="${heartPath(x, 450, 1.3)}" fill="#ffc2dc"/>`).join('')}<ellipse cx="200" cy="384" rx="62" ry="13" fill="#fff" stroke="#f2b6cf" stroke-width="3"/><text class="plate-food" x="200" y="382" font-size="34" text-anchor="middle"></text>`;
}

export const kitchenScene = {
  id: 'kitchen',
  title: 'Mâncare',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const svg = sceneSVG(kitchenBG(), kitchenFront());
    const mimiG = svg.querySelector('.mimi');
    const plate = svg.querySelector('.plate-food');
    const mimi = new MimiLive(mimiG, { getLook: () => s.look, getDesign: () => s.look.outfit, scope, audio: ctx.audio, reducedMotion: () => s.settings.reducedMotion });
    mimi.setMood(moodOf(s.pet, ctx.phase()));
    const bubble = h('div', { class: 'mood-bubble', role: 'status' }, 'Ce bunătăți avem azi? 😋');
    const bar = h('div', { class: 'need-line' }, h('span', {}, '🍎'), h('div', { class: 'need-bar' }, h('div', { class: 'need-fill', style: { background: '#ffb36b' } })));
    const fill = bar.querySelector('.need-fill');
    const stage = h('div', { class: 'care-stage' }, svg, bubble, bar);
    const tray = h('div', { class: 'care-tray', role: 'list' });
    root.appendChild(h('div', { class: 'care' }, stage, h('div', { class: 'care-bottom' }, h('p', { class: 'hint' }, 'Trage mâncarea la gura pisicuței (sau atinge)'), tray)));
    const refresh = () => { fill.style.width = `${Math.round(s.pet.needs.hunger)}%`; };
    refresh();
    let sayTimer = 0;
    const say = (t) => { bubble.textContent = t; clearTimeout(sayTimer); sayTimer = setTimeout(() => { bubble.textContent = 'Ce bunătăți avem azi? 😋'; }, 2200); };
    scope.add(() => clearTimeout(sayTimer));

    const feed = (food) => {
      if (s.pet.sleeping) { say('Doarme acum… 💤'); return; }
      if (s.pet.needs.hunger > 96) { say('Mmm, sunt sătulă! Mulțumesc! 😊'); ctx.audio.play('meow'); return; }
      plate.textContent = food.icon;
      scope.timeout(() => { plate.textContent = ''; }, 900);
      care(s.pet, 'hunger', food.hunger);
      care(s.pet, 'love', 2);
      mimi.flash('giggle', 900);
      ctx.audio.play('chomp');
      const r = mimiG.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.35, [food.icon, '💖'], 6);
      say(`Mmm, ${food.name.toLowerCase()}! Delicios! 😋`);
      ctx.track('feed');
      refresh();
    };
    for (const food of FOODS) {
      const el = h('div', { class: 'food', role: 'button', tabindex: '0', 'aria-label': food.name, title: food.name, dataset: { food: food.id } }, food.icon);
      let ghost = null, sx = 0, sy = 0, moved = false;
      scope.on(el, 'pointerdown', (e) => {
        e.preventDefault(); el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY; moved = false;
        ghost = h('div', { class: 'food dragging', style: { left: `${e.clientX - 32}px`, top: `${e.clientY - 32}px` } }, food.icon);
        document.body.appendChild(ghost);
      });
      scope.on(el, 'pointermove', (e) => {
        if (!ghost) return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) moved = true;
        ghost.style.left = `${e.clientX - 32}px`; ghost.style.top = `${e.clientY - 32}px`;
      });
      scope.on(el, 'pointerup', (e) => {
        if (!ghost) return;
        ghost.remove(); ghost = null;
        const r = mimiG.getBoundingClientRect();
        if (!moved || (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom)) feed(food);
      });
      scope.on(el, 'pointercancel', () => { ghost?.remove(); ghost = null; });
      scope.on(el, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') feed(food); });
      tray.appendChild(el);
    }
    scope.add(() => document.querySelectorAll('.food.dragging').forEach((g) => g.remove()));
  },
};

// ---------- Dormitor ----------
export const BLANKETS = [
  { id: 'stele', name: 'Steluțe', icon: '⭐', a: '#b9a6ff', b: '#ffe27a', motif: 'stea' },
  { id: 'inimioare', name: 'Inimioare', icon: '💗', a: '#ff9cc8', b: '#ffffff', motif: 'inima' },
  { id: 'luni', name: 'Luni', icon: '🌙', a: '#6a5acd', b: '#fff3c4', motif: 'luna' },
  { id: 'nori', name: 'Nori', icon: '☁️', a: '#9ed8ff', b: '#ffffff', motif: 'nor' },
];

function bedroomBG(dark) {
  let s = `<rect width="400" height="520" fill="${dark ? '#3b2d6b' : '#c9b6ff'}"/>`;
  for (let i = 0; i < 14; i++) s += `<polygon points="${starPoints((i * 89) % 400, 20 + ((i * 53) % 260), 5, 2.2)}" fill="#fff6c8" opacity="${dark ? 0.9 : 0.5}" class="twinkle"/>`;
  s += '<rect x="250" y="40" width="120" height="130" rx="60" fill="#2b2f6b" stroke="#fff" stroke-width="6"/><g transform="translate(330 95) scale(2)">' + MOTIFS.luna('#fff3c4') + '</g><circle cx="282" cy="140" r="2" fill="#fff"/><circle cx="300" cy="80" r="1.5" fill="#fff"/>';
  s += '<rect x="20" y="210" width="34" height="8" rx="3" fill="#ffd36b"/><path d="M14 210 L 22 180 L 52 180 L 60 210 Z" fill="#fff3a6"/><rect x="34" y="218" width="6" height="40" fill="#ffd36b"/>';
  if (dark) s += '<circle cx="37" cy="196" r="60" fill="#ffe27a" opacity=".18"/>';
  s += '<path d="M60 250 Q 60 150 200 150 Q 340 150 340 250 Z" fill="#ff8fc7" stroke="#fff" stroke-width="6"/><path d="' + heartPath(200, 196, 2.2) + '" fill="#fff" opacity=".8"/>';
  s += '<ellipse cx="200" cy="268" rx="120" ry="26" fill="#fff"/><rect y="440" width="400" height="80" fill="#9c7bd8"/>';
  return s;
}
function blanketFront(theme) {
  const t = BLANKETS.find((b) => b.id === theme) || BLANKETS[0];
  let dots = '';
  for (let i = 0; i < 12; i++) dots += `<g transform="translate(${70 + (i % 4) * 85 + (Math.floor(i / 4) % 2) * 40} ${360 + Math.floor(i / 4) * 45}) scale(1.3)">${MOTIFS[t.motif](t.b)}</g>`;
  return `<defs><clipPath id="blk"><path d="M40 330 Q 200 300 360 330 L 372 470 Q 200 490 28 470 Z"/></clipPath></defs><rect x="40" y="440" width="320" height="50" rx="10" fill="#ff8fc7"/><path d="M40 330 Q 200 300 360 330 L 372 470 Q 200 490 28 470 Z" fill="${t.a}" stroke="#fff" stroke-width="5"/><g clip-path="url(#blk)">${dots}</g><path d="M40 330 Q 200 300 360 330 L 362 350 Q 200 322 38 350 Z" fill="#fff" opacity=".85"/>`;
}

export const bedroomScene = {
  id: 'bedroom',
  title: 'Somn',
  back: 'home',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const svg = sceneSVG(bedroomBG(s.pet.sleeping), blanketFront(s.sleepTheme), { x: 95, y: 150, k: 0.7 });
    const mimiG = svg.querySelector('.mimi');
    const front = svg.querySelector('.front');
    const pj = () => s.look.outfit;
    const mimi = new MimiLive(mimiG, { getLook: () => s.look, getDesign: pj, scope, audio: ctx.audio, reducedMotion: () => s.settings.reducedMotion });
    const bubble = h('div', { class: 'mood-bubble', role: 'status' }, '');
    const bar = h('div', { class: 'need-line' }, h('span', {}, '🌙'), h('div', { class: 'need-bar' }, h('div', { class: 'need-fill', style: { background: '#b9a6ff' } })));
    const fill = bar.querySelector('.need-fill');
    const zzz = h('div', {});
    const stage = h('div', { class: 'care-stage' }, svg, bubble, bar, zzz);
    const sleepBtn = btn({ icon: '🌙', label: 'Culcă', cls: 'btn-primary btn-big', say: true, onClick: () => toggle() });
    const songBtn = btn({ icon: '🎵', label: 'Cântec', cls: 'btn-soft', say: true, onClick: () => { ctx.audio.melody([72, 76, 79, 76, 74, 72, 67, 69, 72], 0.38, 'sine', 0.1); care(s.pet, 'love', 2); } });
    const themes = optionRow(BLANKETS, s.sleepTheme, (o) => { s.sleepTheme = o.id; front.innerHTML = blanketFront(o.id); ctx.audio.play('pop'); ctx.store.commit(); });
    root.appendChild(h('div', { class: 'care' }, stage, h('div', { class: 'care-bottom' }, h('div', { class: 'row row-center' }, sleepBtn, songBtn), themes)));

    function refresh() {
      fill.style.width = `${Math.round(s.pet.needs.sleep)}%`;
      mimi.setMood(moodOf(s.pet, ctx.phase()));
      sleepBtn.querySelector('.btn-ico').textContent = s.pet.sleeping ? '☀️' : '🌙';
      sleepBtn.querySelector('.btn-lbl').textContent = s.pet.sleeping ? 'Trezește' : 'Culcă';
      bubble.textContent = s.pet.sleeping ? 'Zzz… noapte bună! 💤' : s.pet.needs.sleep < 60 ? 'Sunt somnoroasă… 🥱' : 'Nu mi-e somn încă! 😊';
      zzz.innerHTML = '';
      if (s.pet.sleeping) for (let i = 0; i < 3; i++) zzz.appendChild(h('div', { class: 'zzz', style: { left: `${58 + i * 4}%`, top: '24%', animationDelay: `${i * 0.8}s` } }, 'z'));
    }
    function toggle() {
      s.pet.sleeping = !s.pet.sleeping;
      layer.innerHTML = bedroomBG(s.pet.sleeping);
      if (s.pet.sleeping) { ctx.audio.melody([76, 74, 72, 67, 69, 72, 67], 0.32, 'sine', 0.1); ctx.track('sleep'); }
      else { ctx.audio.play('yawn'); mimi.flash('happy', 1000); }
      ctx.store.commit();
      refresh();
    }
    // fundalul ca strat separat, ca să se poată schimba ziua/noaptea
    const first = [...svg.childNodes].filter((n) => n.nodeType === 1 && !n.matches('g[transform], .front'));
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('class', 'bg-layer');
    first.forEach((n) => layer.appendChild(n));
    svg.insertBefore(layer, svg.firstChild);
    // o atingere ușoară pe cap: torcă în somn
    scope.on(svg, 'pointerdown', (e) => {
      const z = mimi.react(e.target);
      if (z === 'head') { care(s.pet, 'love', 3); burst(e.clientX, e.clientY, ['💗'], 4); }
    });
    scope.interval(() => { if (s.pet.sleeping) { care(s.pet, 'sleep', 1); ctx.store.commit(); refresh(); } }, 1500);
    refresh();
  },
};

// ---------- Harta orașului ----------
const PLACES = [
  { id: 'casa', name: 'Casă', x: 23, y: 21, go: ['home'] },
  { id: 'salon', name: 'Salon', x: 74, y: 22, go: ['salon', { tab: 'face' }] },
  { id: 'magazin', name: 'Magazin', x: 26, y: 55, go: ['shop'] },
  { id: 'jocuri', name: 'Jocuri', x: 75, y: 55, go: ['games'] },
  { id: 'parc', name: 'Parc', x: 36, y: 86, go: ['photo', { bg: 'bg-gradina', from: 'map' }], play: 8 },
  { id: 'plaja', name: 'Plajă', x: 80, y: 87, go: ['photo', { bg: 'bg-plaja', from: 'map' }], play: 8 },
];

function mapArt() {
  let s = '<rect width="400" height="520" fill="#9fe08f"/>';
  s += '<path d="M260 520 Q 300 420 400 400 L 400 520 Z" fill="#6fd0f0"/><path d="M250 520 Q 292 418 400 392" stroke="#f6e2b0" stroke-width="22" fill="none"/>';
  s += '<path d="M90 120 C 90 220 300 180 300 280 C 300 360 140 330 150 440 M300 120 L 300 280 M100 280 L 300 280 M150 440 L 320 440" stroke="#f6e2b0" stroke-width="20" fill="none" stroke-linecap="round"/>';
  for (const [x, y, r] of [[30, 200, 18], [370, 190, 16], [200, 70, 15], [200, 360, 18], [40, 470, 16], [360, 330, 14], [190, 220, 12]]) s += `<circle cx="${x}" cy="${y + 8}" r="${r}" fill="#4fae6f"/><circle cx="${x - 6}" cy="${y}" r="${r * 0.8}" fill="#6cc985"/>`;
  // casa
  s += '<path d="M50 110 L 92 74 L 134 110 Z" fill="#ff6b8b"/><rect x="58" y="108" width="68" height="44" fill="#ffe0ec"/><rect x="86" y="126" width="14" height="26" fill="#c08a5b"/><path d="' + heartPath(72, 122, 0.6) + '" fill="#ff6b8b"/>';
  // salon
  s += '<rect x="258" y="80" width="84" height="70" rx="8" fill="#c9b6ff"/><rect x="250" y="72" width="100" height="14" rx="6" fill="#9b6bff"/><rect x="290" y="120" width="20" height="30" fill="#fff"/><text x="300" y="112" font-size="20" text-anchor="middle">✂️</text>';
  // magazin
  s += '<rect x="64" y="240" width="88" height="62" fill="#fff3e0"/>' + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${60 + i * 16}" y="228" width="16" height="16" fill="${i % 2 ? '#fff' : '#ff8fc7'}"/>`).join('') + '<rect x="96" y="272" width="22" height="30" fill="#ff8fc7"/>';
  // jocuri
  s += '<rect x="258" y="236" width="86" height="66" rx="10" fill="#6bd0ff"/><text x="300" y="276" font-size="28" text-anchor="middle">🎮</text>';
  // parc
  s += '<ellipse cx="150" cy="430" rx="40" ry="14" fill="#cfcfd8"/><ellipse cx="150" cy="426" rx="32" ry="9" fill="#8fd3ff"/><rect x="146" y="398" width="8" height="28" fill="#cfcfd8"/><path d="M150 398 Q 130 384 126 420 M150 398 Q 170 384 174 420" stroke="#8fd3ff" stroke-width="4" fill="none"/>';
  // plaja
  s += '<path d="M310 452 L 310 410" stroke="#8d6e63" stroke-width="4"/><path d="M282 414 Q 310 386 338 414 Z" fill="#ff6b6b"/><path d="M296 414 Q 310 392 324 414" fill="#fff"/>';
  return s;
}

export const mapScene = {
  id: 'map',
  title: 'Harta',
  back: 'home',
  mount(root, ctx) {
    const s = ctx.store.state;
    const box = h('div', { class: 'map-box' }, svgFromString(`<svg viewBox="0 0 400 520" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Harta orașului">${mapArt()}</svg>`));
    for (const pl of PLACES) {
      box.appendChild(btn({ label: pl.name, cls: 'map-pin', say: true, attrs: { 'data-place': pl.id, style: `left:${pl.x}%;top:${pl.y}%` }, onClick: () => {
        if (pl.play) { care(s.pet, 'play', pl.play); ctx.store.commit(); }
        ctx.go(...pl.go);
      } }));
    }
    root.appendChild(h('div', { class: 'map-wrap' }, box));
  },
};
