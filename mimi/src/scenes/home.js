// Acasă: camera lui Angy, cu butoane pe margini (misiuni, cadouri, album / jocuri, magazin,
// decorațiuni, hartă) și bara de jos (mâncare, baie, salon, ținute, somn).

import { h, btn, svgFromString, burst, modal } from '../core/ui.js';
import { MimiLive } from '../art/mimiLive.js';
import { renderRoom, renderLighting } from '../art/room.js';
import { NEEDS, care, moodOf, lowestNeed, levelInfo } from '../core/pet.js';
import { svgPoint } from '../core/input.js';
import { dayKey } from '../core/util.js';

const MIMI_T = { x: 83, y: 192, k: 0.78 }; // poziția pisicuței în cameră
export const DAILY_GIFT = 10;

function moodText(s, mood, phase) {
  const name = s.pet.name;
  if (mood === 'adormita') return s.pet.sleeping ? 'Zzz… (atinge-o ușor pe cap)' : `${name} e somnoroasă… 🌙`;
  if (mood === 'mofturoasa') {
    const low = lowestNeed(s.pet).id;
    return { hunger: 'Mi-e un pic foame… 🍓', play: 'Hai să ne jucăm! 🧶', clean: 'Aș face o băiță! 🫧', sleep: 'Sunt somnoroasă… 🌙', love: 'Vreau o mângâiere! 💗' }[low];
  }
  if (phase === 'morning') return 'Bună dimineața! ☀️';
  if (phase === 'evening') return 'Ce seară frumoasă! 🌆';
  return `${name} e fericită! 😊`;
}

export const homeScene = {
  id: 'home',
  title: (s) => s.pet.name,
  back: 'menu',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const phase = ctx.phase();
    let mode = 'idle'; // idle | play

    const svg = svgFromString(`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Camera"><g class="room"></g><g transform="translate(${MIMI_T.x} ${MIMI_T.y}) scale(${MIMI_T.k})"><g class="mimi"></g></g><g class="light"></g></svg>`);
    const roomG = svg.querySelector('.room');
    const lightG = svg.querySelector('.light');
    roomG.innerHTML = renderRoom(s.room, { p: 'home', phase });
    lightG.innerHTML = renderLighting(s.room, { p: 'home', phase, dark: s.pet.sleeping });

    const mimi = new MimiLive(svg.querySelector('.mimi'), {
      getLook: () => s.look, getDesign: () => s.look.outfit, scope, audio: ctx.audio,
      reducedMotion: () => s.settings.reducedMotion,
    });
    const bubble = h('div', { class: 'mood-bubble', role: 'status' }, '');
    const roomBox = h('div', { class: 'home-room' }, svg, bubble);
    const zzzBox = h('div', {});
    roomBox.appendChild(zzzBox);
    const mimiRect = () => svg.querySelector('.mimi').getBoundingClientRect();

    // ---- nivel + nevoi (sus) ----
    const lvlNum = h('span', { class: 'lvl-num' });
    const lvlFill = h('div');
    const levelBadge = h('div', { class: 'level-badge', title: 'Nivel' }, h('span', { class: 'lvl-heart' }, lvlNum), h('div', { class: 'lvl-bar' }, lvlFill));
    const needEls = {};
    const needs = h('div', { class: 'need-chips' }, NEEDS.map((n) => {
      const el = h('div', { class: 'need-chip', title: n.name, style: { '--c': n.color } }, h('span', {}, n.icon));
      needEls[n.id] = el;
      return el;
    }));

    // ---- coloanele de butoane ----
    const giftDot = h('span', { class: 'red-dot', hidden: true });
    const questDot = h('span', { class: 'red-dot', hidden: true });
    const side = (icon, label, fn, dot) => {
      const b = btn({ icon, label, cls: 'side-btn', say: true, onClick: fn });
      if (dot) b.appendChild(dot);
      return b;
    };
    const left = h('div', { class: 'side-col left' },
      side('📋', 'Misiuni', () => ctx.go('quests'), questDot),
      side('🎁', 'Cadouri', () => openGift(), giftDot),
      side('📸', 'Album', () => ctx.go('album')),
      side('🧶', 'Joacă', () => { if (s.pet.sleeping) { say(`${s.pet.name} doarme acum. 💤`); return; } setMode(mode === 'play' ? 'idle' : 'play'); }),
    );
    const right = h('div', { class: 'side-col right' },
      side('🎮', 'Jocuri', () => ctx.go('games')),
      side('🏪', 'Magazin', () => ctx.go('shop')),
      side('🪴', 'Decorațiuni', () => ctx.go('room')),
      side('🗺️', 'Hartă', () => ctx.go('map')),
    );
    roomBox.append(levelBadge, needs, left, right);

    const refresh = () => {
      for (const n of NEEDS) needEls[n.id].style.setProperty('--v', `${Math.round(s.pet.needs[n.id])}%`);
      const lv = levelInfo(s.totalStars || 0);
      lvlNum.textContent = lv.level;
      lvlFill.style.width = `${Math.round(lv.progress * 100)}%`;
      giftDot.hidden = s.gifts.lastDay === dayKey();
      questDot.hidden = !s.quests.list.some((q) => q.done && !q.claimed);
      const mood = moodOf(s.pet, phase);
      mimi.setMood(mood);
      if (!bubble.dataset.locked) bubble.textContent = moodText(s, mood, phase);
      zzzBox.innerHTML = '';
      if (s.pet.sleeping) for (let i = 0; i < 3; i++) zzzBox.appendChild(h('div', { class: 'zzz', style: { left: `${54 + i * 4}%`, top: '30%', animationDelay: `${i * 0.8}s` } }, 'z'));
    };
    const say = (text, ms = 2200) => {
      bubble.textContent = text;
      bubble.dataset.locked = '1';
      scope.timeout(() => { delete bubble.dataset.locked; refresh(); }, ms);
    };

    // cadoul zilnic (stele gratuite, o dată pe zi)
    async function openGift() {
      if (s.gifts.lastDay === dayKey()) {
        await modal({ icon: '🎁', title: 'Ai deschis deja cadoul de azi', body: h('p', { class: 'hint' }, 'Revino mâine pentru un cadou nou! 🌙'), actions: [{ label: 'Bine', icon: '👍', cls: 'btn-primary', value: true }] });
        return;
      }
      s.gifts.lastDay = dayKey();
      ctx.audio.play('tada');
      burst(innerWidth / 2, innerHeight / 2, ['🎁', '⭐', '💖', '✨'], 18);
      ctx.reward(DAILY_GIFT, left);
      refresh();
      await modal({ icon: '🎁', title: `Cadoul zilei: ${DAILY_GIFT} ⭐`, body: h('p', { class: 'hint' }, `${s.pet.name} îți mulțumește că ai venit azi! 💖`), actions: [{ label: 'Mulțumesc!', icon: '💖', cls: 'btn-primary', value: true }] });
    }

    // ---- atingeri pe pisicuță ----
    scope.on(svg, 'pointerdown', (e) => {
      if (mode !== 'idle') return;
      const zone = mimi.react(e.target);
      if (!zone) return;
      if (s.pet.sleeping) { if (zone === 'head') say('Shh… doarme și torcă. 💤'); return; }
      burst(e.clientX, e.clientY, zone === 'head' ? ['💖', '💗'] : ['✨', '😆'], 6);
      care(s.pet, 'love', zone === 'head' ? 5 : 3);
      care(s.pet, 'play', zone === 'tail' ? 3 : 1);
      ctx.track('pet');
      say({ head: 'Rrrr… ce bine! 💗', belly: 'Hi-hi, mă gâdili! 😆', feet: 'Hi-hi! 😆', tail: 'Miau! Cine e acolo? 👀', ear: 'Hi-hi, urechiușele! 😺' }[zone] || '💗', 1600);
      refresh();
    });
    let lastCurious = 0;
    scope.on(svg, 'pointermove', (e) => {
      if (mode !== 'idle' || s.pet.sleeping) return;
      const pt = svgPoint(svg, e.clientX, e.clientY);
      if (Math.hypot(pt.x - 200, pt.y - 330) < 140 && performance.now() - lastCurious > 6000) { lastCurious = performance.now(); mimi.flash('curious', 1200); }
    });

    // ---- joaca cu pana ----
    const wand = h('div', { class: 'wand', hidden: true }, '🪶');
    document.body.appendChild(wand);
    scope.add(() => wand.remove());
    let playDist = 0, playGiven = 0, lastPt = null;
    const playMove = (e) => {
      if (mode !== 'play') return;
      wand.style.left = `${e.clientX}px`; wand.style.top = `${e.clientY}px`;
      if (lastPt) {
        playDist += Math.min(Math.hypot(e.clientX - lastPt.x, e.clientY - lastPt.y), 60);
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
      playBar.hidden = m !== 'play';
      wand.hidden = m !== 'play';
      if (m === 'play') { playDist = 0; playGiven = 0; lastPt = null; wand.style.left = '50%'; wand.style.top = '50%'; say('Prinde pana! 🪶', 1800); }
    }

    // ---- bara de jos ----
    const dock = h('nav', { class: 'dock', 'aria-label': 'Locuri' },
      btn({ icon: '🍎', label: 'Mâncare', cls: 'nav-btn', say: true, onClick: () => ctx.go('kitchen') }),
      btn({ icon: '🛁', label: 'Baie', cls: 'nav-btn', say: true, onClick: () => ctx.go('bath') }),
      btn({ icon: '💇', label: 'Salon', cls: 'nav-btn', say: true, onClick: () => ctx.go('salon', { tab: 'face' }) }),
      btn({ icon: '👗', label: 'Ținute', cls: 'nav-btn', say: true, onClick: () => ctx.go('atelier') }),
      btn({ icon: '🌙', label: 'Somn', cls: 'nav-btn', say: true, onClick: () => ctx.go('bedroom') }),
    );

    root.appendChild(h('div', { class: 'home' }, roomBox, dock));
    const fitRoom = () => {
      const r = roomBox.getBoundingClientRect();
      if (r.height) svg.setAttribute('preserveAspectRatio', r.width / r.height > 0.95 ? 'xMidYMax meet' : 'xMidYMax slice');
    };
    fitRoom();
    scope.on(window, 'resize', fitRoom);
    scope.sub(ctx.bus.on('state', refresh));
    refresh();

    if (ctx.welcomeBack) {
      ctx.welcomeBack = false;
      scope.timeout(() => {
        mimi.flash('giggle', 1600); mimi.bounce = 1; ctx.audio.play('meow');
        const r = mimiRect(); burst(r.left + r.width / 2, r.top + r.height * 0.3, ['💖', '✨', '🎉'], 14);
        say('Te-am așteptat! Ce bine că ai venit! 💖', 3200);
      }, 500);
    } else if (ctx.justWoke) {
      ctx.justWoke = false;
      scope.timeout(() => { ctx.audio.play('yawn'); say('Bună dimineața! M-am trezit! ☀️', 2600); }, 500);
    } else if (phase === 'night' && !s.pet.sleeping && s.pet.needs.sleep < 60) {
      scope.timeout(() => say('E noapte… hai în dormitor (🌙 Somn).', 3000), 600);
    }
  },
};
