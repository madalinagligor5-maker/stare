// Misiunile zilei și insignele câștigate.

import { h, btn, burstAt } from '../core/ui.js';
import { ensureDailyQuests, claimQuest } from '../core/quests.js';
import { QUEST_POOL, BADGES } from '../data/quests.js';

const GO = { wash: ['salon', { tab: 'wash' }], dress: ['atelier'], feed: ['home'], play: ['home'], pet: ['home'], sleep: ['home'], photo: ['atelier', { tab: 'gata' }], runway: ['atelier', { tab: 'gata' }], minigame: ['games'], nails: ['salon', { tab: 'nails' }], hair: ['salon', { tab: 'hair' }], makeup: ['salon', { tab: 'makeup' }], place: ['room'], tailor: ['tailor'] };

export const questsScene = {
  id: 'quests',
  title: 'Misiuni și insigne',
  back: 'home',
  mount(root, ctx) {
    const s = ctx.store.state;
    ensureDailyQuests(s, QUEST_POOL);
    const scroll = h('div', { class: 'scroll' });
    root.appendChild(scroll);

    function render() {
      scroll.innerHTML = '';
      scroll.appendChild(h('div', { class: 'section-title' }, '🗓️ Misiunile de azi'));
      for (const q of s.quests.list) {
        const def = QUEST_POOL.find((d) => d.id === q.id);
        if (!def) continue;
        const action = q.claimed
          ? h('div', { class: 'owned-badge' }, '✓ Primit')
          : q.done
            ? btn({ icon: '⭐', label: `Ia ${def.reward}`, cls: 'btn-ok', say: true, onClick: (e) => {
              const n = claimQuest(s, QUEST_POOL, q.id);
              if (!n) return;
              s.stats.quest += 1;
              ctx.audio.play('tada');
              burstAt(e.currentTarget, ['⭐', '🎉', '✨'], 12);
              ctx.reward(n, e.currentTarget);
              ctx.bus.emit('progress:check');
              render();
            } })
            : btn({ icon: '▶️', label: 'Hai!', cls: 'btn-primary', onClick: () => { const g = GO[def.event]; if (g) ctx.go(g[0], g[1] || {}); } });
        scroll.appendChild(h('div', { class: 'quest' },
          h('div', { class: 'quest-ico' }, def.icon),
          h('div', { class: 'quest-main' },
            h('div', { class: 'quest-text' }, def.text),
            h('div', { class: 'progress', style: { marginTop: '6px' } }, h('div', { style: { width: `${Math.round((q.progress / def.count) * 100)}%` } })),
            h('div', { class: 'hint', style: { textAlign: 'left', margin: '2px 0 0' } }, `${q.progress}/${def.count} • ${def.reward} ⭐`)),
          action));
      }
      scroll.appendChild(h('p', { class: 'hint' }, 'Mâine vin misiuni noi! 🌙'));
      const earned = BADGES.filter((b) => s.badges[b.id]).length;
      scroll.appendChild(h('div', { class: 'section-title' }, `🏅 Insigne (${earned}/${BADGES.length})`));
      const grid = h('div', { class: 'badge-grid' });
      for (const b of BADGES) {
        const has = !!s.badges[b.id];
        grid.appendChild(h('div', { class: `badge ${has ? '' : 'locked'}`, title: b.desc },
          h('span', { class: 'b-ico' }, has ? b.icon : '🔒'), h('div', { class: 'b-name' }, b.name), h('div', { class: 'b-desc' }, b.desc)));
      }
      scroll.appendChild(grid);
      scroll.appendChild(h('div', { class: 'section-title' }, '📊 Ce am făcut până acum'));
      const st = s.stats;
      scroll.appendChild(h('p', { class: 'hint', style: { textAlign: 'left' } },
        `👗 ${st.dress} rochii • 🫧 ${st.wash} băițe • 📸 ${st.photo} poze • ✨ ${st.runway} defilări • 🎲 ${st.minigame} jocuri • ⭐ ${s.totalStars} stele câștigate`));
    }
    render();
  },
};
