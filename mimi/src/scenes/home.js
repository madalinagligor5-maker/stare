// Acasă: camera lui Mimi, nevoile ei și drumul spre toate celelalte locuri.

import { h, btn, svgFromString, burst, toast } from '../core/ui.js';
import { MimiLive } from '../art/mimiLive.js';
import { renderRoom, renderLighting } from '../art/room.js';
import { NEEDS, care, moodOf, lowestNeed } from '../core/pet.js';
import { svgPoint } from '../core/input.js';

const FOODS = [
  { icon: '🐟', name: 'Peștișor', hunger: 22 },
  { icon: '🥛', name: 'Lăptic', hunger: 14 },
  { icon: '🍓', name: 'Căpșună', hunger: 10 },
  { icon: '🧁', name: 'Brioșă', hunger: 16 },
  { icon: '🍪', name: 'Biscuite', hunger: 12 },
];

const MIMI_T = { x: 107, y: 222, k: 0.62 }; // poziția lui Mimi în cameră

function moodText(s, mood, phase) {
  const name = s.pet.name;
  if (mood === 'adormita') return s.pet.sleeping ? 'Zzz… (atinge-o ușor pe cap)' : `${name} e somnoroasă… 🌙`;
  if (mood === 'mofturoasa') {
    const low = lowestNeed(s.pet).id;
    return { hunger: 'Mi-e un pic foame… 🐟', play: 'Hai să ne jucăm! 🧶', clean: 'Aș face o băiță! 🫧', sleep: 'Sunt somnoroasă… 🌙', love: 'Vreau o mângâiere! 💗' }[low];
  }
  if (phase === 'morning') return 'Bună dimineața! ☀️';
  if (phase === 'evening') return 'Ce seară frumoasă! 🌆';
  return `${name} e fericită! 😊`;
}

export const homeScene = {
  id: 'home',
  title: (s) => `Camera lui ${s.pet.name}`,
  back: 'menu',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const phase = ctx.phase();
    let mode = 'idle'; // idle | feed | play

    const svg = svgFromString(`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Camera"><g class="room"></g><g transform="translate(${MIMI_T.x} ${MIMI_T.y}) scale(${MIMI_T.k})"><g class="mimi"></g></g><g class="light"></g></svg>`);
    const roomG = svg.querySelector('.room');
    const lightG = svg.querySelector('.light');
    const drawRoom = () => {
      roomG.innerHTML = renderRoom(s.room, { p: 'home', phase });
      lightG.innerHTML = renderLighting(s.room, { p: 'home', phase, dark: s.pet.sleeping });
    };
    drawRoom();

    const mimi = new MimiLive(svg.querySelector('.mimi'), {
      getLook: () => s.look, getDesign: () => s.look.outfit, scope, audio: ctx.audio,
      reducedMotion: () => s.settings.reducedMotion,
    });
    const bubble = h('div', { class: 'mood-bubble', role: 'status' }, '');
    const roomBox = h('div', { class: 'home-room' }, svg, bubble);
    const zzzBox = h('div', {});
    roomBox.appendChild(zzzBox);

    // ---- nevoi ----
    const needEls = {};
    const needs = h('div', { class: 'needs' }, NEEDS.map((n) => {
      const fill = h('div', { class: 'need-fill', style: { background: n.color } });
      needEls[n.id] = fill;
      return h('div', { class: 'need', title: n.name }, h('div', { class: 'need-top' }, h('span', { class: 'need-ico' }, n.icon), h('span', {}, n.name)), h('div', { class: 'need-bar' }, fill));
    }));
    const refresh = () => {
      for (const n of NEEDS) needEls[n.id].style.width = `${Math.round(s.pet.needs[n.id])}%`;
      const mood = moodOf(s.pet, phase);
      mimi.setMood(mood);
      if (!bubble.dataset.locked) bubble.textContent = moodText(s, mood, phase);
      sleepBtn.querySelector('.btn-ico').textContent = s.pet.sleeping ? '☀️' : '🌙';
      sleepBtn.querySelector('.btn-lbl').textContent = s.pet.sleeping ? 'Trezește' : 'Somn';
      zzzBox.innerHTML = '';
      if (s.pet.sleeping) {
        for (let i = 0; i < 3; i++) zzzBox.appendChild(h('div', { class: 'zzz', style: { left: `${54 + i * 4}%`, top: '30%', animationDelay: `${i * 0.8}s` } }, 'z'));
      }
    };
    const say = (text, ms = 2200) => {
      bubble.textContent = text;
      bubble.dataset.locked = '1';
      scope.timeout(() => { delete bubble.dataset.locked; refresh(); }, ms);
    };

    // ---- atingeri pe Mimi ----
    let petCount = 0;
    scope.on(svg, 'pointerdown', (e) => {
      if (mode !== 'idle') return;
      const zone = mimi.react(e.target);
      if (!zone) return;
      if (s.pet.sleeping && zone === 'head') {
        say('Shh… doarme și torcă. 💤');
        return;
      }
      if (s.pet.sleeping) return;
      burst(e.clientX, e.clientY, zone === 'head' ? ['💖', '💗'] : ['✨', '😆'], 6);
      care(s.pet, 'love', zone === 'head' ? 5 : 3);
      care(s.pet, 'play', zone === 'tail' ? 3 : 1);
      petCount += 1;
      ctx.track('pet');
      say({ head: 'Rrrr… ce bine! 💗', belly: 'Hi-hi, mă gâdili! 😆', feet: 'Hi-hi! 😆', tail: 'Miau! Cine e acolo? 👀', ear: 'Hi-hi, urechiușele! 😺' }[zone] || '💗', 1600);
      refresh();
    });
    // curiozitate când degetul trece pe aproape
    let lastCurious = 0;
    scope.on(svg, 'pointermove', (e) => {
      if (mode !== 'idle' || s.pet.sleeping) return;
      const p = svgPoint(svg, e.clientX, e.clientY);
      const near = Math.hypot(p.x - 200, p.y - 330) < 140;
      if (near && performance.now() - lastCurious > 6000) { lastCurious = performance.now(); mimi.flash('curious', 1200); }
    });

    // ---- butoane de grijă ----
    const foodTray = h('div', { class: 'food-tray', hidden: true });
    roomBox.appendChild(foodTray);
    const wand = h('div', { class: 'wand', hidden: true }, '🪶');
    document.body.appendChild(wand);
    scope.add(() => wand.remove());

    const mimiRect = () => svg.querySelector('.mimi').getBoundingClientRect();
    const feed = (food, fromEl) => {
      if (s.pet.sleeping) { say('Mimi doarme acum. 💤'); ctx.audio.play('soft-no'); return; }
      if (s.pet.needs.hunger > 96) { say('Mmm, sunt sătulă! Mulțumesc! 😊'); ctx.audio.play('meow'); return; }
      care(s.pet, 'hunger', food.hunger);
      care(s.pet, 'love', 2);
      mimi.flash('giggle', 900);
      ctx.audio.play('chomp');
      const r = mimiRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.3, [food.icon, '💖'], 6);
      say(`Mmm, ${food.name.toLowerCase()}! Mulțumesc! 😋`);
      ctx.track('feed');
      refresh();
    };
    FOODS.forEach((food) => {
      const el = h('div', { class: 'food', role: 'button', tabindex: '0', 'aria-label': food.name, title: food.name }, food.icon);
      // tragi mâncarea spre Mimi sau doar atingi
      let ghost = null, sx = 0, sy = 0, moved = false;
      scope.on(el, 'pointerdown', (e) => {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY; moved = false;
        ghost = h('div', { class: 'food dragging', style: { left: `${e.clientX - 32}px`, top: `${e.clientY - 32}px` } }, food.icon);
        document.body.appendChild(ghost);
      });
      scope.on(el, 'pointermove', (e) => {
        if (!ghost) return;
        if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) moved = true;
        ghost.style.left = `${e.clientX - 32}px`; ghost.style.top = `${e.clientY - 32}px`;
      });
      const end = (e) => {
        if (!ghost) return;
        ghost.remove(); ghost = null;
        const r = mimiRect();
        const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
        if (!moved || inside) feed(food, el);
      };
      scope.on(el, 'pointerup', end);
      scope.on(el, 'pointercancel', () => { ghost?.remove(); ghost = null; });
      scope.on(el, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') feed(food, el); });
      foodTray.appendChild(el);
    });
    foodTray.appendChild(btn({ icon: '✔', title: 'Gata', cls: 'btn-icon btn-ok', onClick: () => setMode('idle') }));

    let playDist = 0, playGiven = 0, lastPt = null;
    const playMove = (e) => {
      if (mode !== 'play') return;
      wand.style.left = `${e.clientX}px`; wand.style.top = `${e.clientY}px`;
      if (lastPt) {
        const d = Math.hypot(e.clientX - lastPt.x, e.clientY - lastPt.y);
        playDist += Math.min(d, 60);
        if (playDist > 280) {
          playDist = 0;
          care(s.pet, 'play', 5);
          playGiven += 5;
          mimi.flash(Math.random() < 0.5 ? 'giggle' : 'curious', 700);
          mimi.bounce = 1;
          ctx.audio.play(Math.random() < 0.5 ? 'giggle' : 'pop');
          burst(e.clientX, e.clientY, ['✨', '🧶'], 4);
          if (playGiven === 15) { ctx.track('play'); say('Ce distracție! 🧶'); }
          refresh();
        }
      }
      lastPt = { x: e.clientX, y: e.clientY };
    };
    scope.on(window, 'pointermove', playMove);
    scope.on(window, 'pointerdown', playMove);

    const playBar = h('div', { class: 'edit-tray', hidden: true }, h('span', { class: 'hint' }, 'Mișcă pana prin cameră! 🪶'), btn({ icon: '✔', label: 'Gata', cls: 'btn-ok', onClick: () => setMode('idle') }));
    roomBox.appendChild(playBar);

    function setMode(m) {
      mode = m;
      foodTray.hidden = m !== 'feed';
      playBar.hidden = m !== 'play';
      wand.hidden = m !== 'play';
      careBar.style.visibility = m === 'idle' ? 'visible' : 'hidden';
      if (m === 'play') { playDist = 0; playGiven = 0; lastPt = null; wand.style.left = '50%'; wand.style.top = '50%'; say('Prinde pana! 🪶', 1800); }
      if (m === 'feed') say('Trage mâncarea spre mine! 🍽️', 2000);
    }

    const sleepBtn = btn({ icon: '🌙', label: 'Somn', cls: 'btn-col', say: true, onClick: () => {
      s.pet.sleeping = !s.pet.sleeping;
      if (s.pet.sleeping) {
        ctx.audio.melody([76, 74, 72, 67, 69, 72, 67], 0.32, 'sine', 0.1);
        ctx.track('sleep');
        say('Noapte bună! 💤');
      } else {
        ctx.audio.play('yawn');
        mimi.flash('happy', 1000);
        say('Bună! M-am odihnit! ☀️');
      }
      drawRoom();
      ctx.store.commit();
      refresh();
    } });
    const careBar = h('div', { class: 'care-bar' },
      btn({ icon: '🐟', label: 'Hrănește', cls: 'btn-col', say: true, onClick: () => { if (s.pet.sleeping) { say('Mimi doarme acum. 💤'); return; } setMode('feed'); } }),
      btn({ icon: '🧶', label: 'Joacă', cls: 'btn-col', say: true, onClick: () => { if (s.pet.sleeping) { say('Mimi doarme acum. 💤'); return; } setMode('play'); } }),
      btn({ icon: '🛁', label: 'Spală', cls: 'btn-col', say: true, onClick: () => ctx.go('salon', { tab: 'wash' }) }),
      sleepBtn,
      btn({ icon: '💗', label: 'Mângâie', cls: 'btn-col', say: true, onClick: () => {
        if (s.pet.sleeping) { say('Shh… doarme. 💤'); return; }
        mimi.flash('purr', 1600); ctx.audio.play('purr');
        care(s.pet, 'love', 6); ctx.track('pet');
        const r = mimiRect(); burst(r.left + r.width / 2, r.top + r.height * 0.25, ['💖', '💗'], 8);
        say('Rrrr… te iubesc! 💗'); refresh();
      } }),
    );

    // ---- navigare ----
    const claimable = s.quests.list.filter((q) => q.done && !q.claimed).length;
    const dock = h('nav', { class: 'dock', 'aria-label': 'Locuri' },
      btn({ icon: '💇', label: 'Salon', cls: 'btn-col', say: true, onClick: () => ctx.go('salon') }),
      btn({ icon: '👗', label: 'Atelier', cls: 'btn-col', say: true, onClick: () => ctx.go('atelier') }),
      btn({ icon: '🚪', label: 'Garderobă', cls: 'btn-col', say: true, onClick: () => ctx.go('wardrobe') }),
      btn({ icon: '🛋️', label: 'Decorează', cls: 'btn-col', say: true, onClick: () => ctx.go('room') }),
      btn({ icon: '🛍️', label: 'Magazin', cls: 'btn-col', say: true, onClick: () => ctx.go('shop') }),
      btn({ icon: '🏅', label: claimable ? `Misiuni (${claimable})` : 'Misiuni', cls: `btn-col ${claimable ? 'on' : ''}`, say: true, onClick: () => ctx.go('quests') }),
      btn({ icon: '🎲', label: 'Jocuri', cls: 'btn-col', say: true, onClick: () => ctx.go('games') }),
      btn({ icon: '🖼️', label: 'Album', cls: 'btn-col', say: true, onClick: () => ctx.go('album') }),
    );

    root.appendChild(h('div', { class: 'home' }, h('div', { class: 'home-main' }, needs, h('div', { class: 'home-mid' }, roomBox, careBar)), dock));
    scope.sub(ctx.bus.on('state', refresh));
    scope.interval(() => {
      if (s.pet.sleeping) { care(s.pet, 'sleep', 1); ctx.store.commit(); }
    }, 1500);
    refresh();

    // bun venit după o pauză lungă / trezire de dimineață
    if (ctx.welcomeBack) {
      ctx.welcomeBack = false;
      scope.timeout(() => {
        mimi.flash('giggle', 1600); mimi.bounce = 1; ctx.audio.play('meow');
        const r = mimiRect(); burst(r.left + r.width / 2, r.top + r.height * 0.3, ['💖', '✨', '🎉'], 14);
        say(`Te-am așteptat! Ce bine că ai venit! 💖`, 3200);
      }, 500);
    } else if (ctx.justWoke) {
      ctx.justWoke = false;
      scope.timeout(() => { ctx.audio.play('yawn'); say('Bună dimineața! M-am trezit! ☀️', 2600); }, 500);
    } else if (phase === 'night' && !s.pet.sleeping && s.pet.needs.sleep < 60) {
      scope.timeout(() => say('E noapte… apasă pe 🌙 ca să mă culci.', 3000), 600);
    }
  },
};
