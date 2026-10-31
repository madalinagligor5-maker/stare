// Meniul pentru părinți (protejat de o întrebare de calcul) și ecranul de odihnă (limita zilnică).

import { h, btn, modal, confirmBox, toast, slider, downloadBlob, svgFromString } from '../core/ui.js';
import { figureSVG } from '../art/figure.js';
import { cleanName } from '../core/wardrobe.js';

// Poarta: un calcul simplu pentru adulți. Întoarce Promise<boolean>.
export function parentGate() {
  const a = 6 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  const answer = String(a * b);
  let typed = '';
  const out = h('div', { class: 'gate-a', 'aria-live': 'polite' }, '');
  const keys = h('div', { class: 'keypad' });
  return new Promise((resolve) => {
    let closeFn = null;
    const press = (k) => {
      if (k === '⌫') typed = typed.slice(0, -1);
      else if (typed.length < 3) typed += k;
      out.textContent = typed;
      if (typed === answer) { closeFn?.(true); }
      else if (typed.length >= answer.length) { out.classList.add('wiggle'); setTimeout(() => { typed = ''; out.textContent = ''; }, 500); }
    };
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0'].forEach((k) => keys.appendChild(btn({ label: k, cls: 'btn-soft', onClick: () => press(k) })));
    const body = h('div', {}, h('p', { class: 'hint' }, 'Doar pentru părinți: cât face'), h('div', { class: 'gate-q' }, `${a} × ${b} = ?`), out, keys);
    const p = modal({ title: 'Zona părinților', icon: '🔐', body, actions: [{ label: 'Renunță', icon: '✖', cls: 'btn-soft', value: false }] });
    // închidere programatică când răspunsul e corect
    closeFn = (v) => { const ov = document.querySelector('#modals .modal-overlay:last-child'); ov?.querySelector('.modal-x')?.click(); resolve(v); };
    p.then((v) => resolve(v === true ? true : false));
  });
}

export const parentsScene = {
  id: 'parents',
  title: 'Pentru părinți',
  back: 'menu',
  mount(root, ctx, params, scope) {
    const s = ctx.store.state;
    const st = s.settings;
    const save = () => { ctx.bus.emit('settings'); ctx.store.commit(); };
    const scroll = h('div', { class: 'scroll' });
    const wrap = h('div', { class: 'parents' });
    scroll.appendChild(wrap);
    root.appendChild(scroll);

    const row = (label, ...ctrls) => h('div', { class: 'set-row' }, h('span', { class: 'set-lbl' }, label), ...ctrls);
    const toggle = (key, onLabel, offLabel) => {
      const b = btn({ icon: st[key] ? '✅' : '⬜', label: st[key] ? onLabel : offLabel, cls: 'btn-soft', onClick: () => {
        st[key] = !st[key];
        b.querySelector('.btn-ico').textContent = st[key] ? '✅' : '⬜';
        b.querySelector('.btn-lbl').textContent = st[key] ? onLabel : offLabel;
        save();
      } });
      return b;
    };

    wrap.appendChild(h('div', { class: 'section-title' }, '🔊 Sunet'));
    wrap.appendChild(row('Volum', slider({ label: 'Volum', icon: '🔉', min: 0, max: 100, value: Math.round(st.volume * 100), onInput: (v) => { st.volume = v / 100; save(); } })));
    wrap.appendChild(row('Sunet', toggle('muted', 'Oprit (mut)', 'Pornit')));
    wrap.appendChild(row('Voce care citește butoanele', toggle('voice', 'Pornită', 'Oprită')));
    const hasRo = (globalThis.speechSynthesis?.getVoices?.() || []).some((v) => /^ro/i.test(v.lang));
    wrap.appendChild(h('p', { class: 'hint' }, hasRo ? 'Vocea românească a dispozitivului este disponibilă.' : 'Pe acest dispozitiv nu am găsit o voce românească; jocul folosește doar sunete de confirmare.'));

    wrap.appendChild(h('div', { class: 'section-title' }, '🌈 Accesibilitate'));
    wrap.appendChild(row('Mișcare redusă', toggle('reducedMotion', 'Da', 'Nu')));

    wrap.appendChild(h('div', { class: 'section-title' }, '⏰ Timp de joc'));
    const limits = [0, 15, 30, 45, 60, 90];
    const limitRow = h('div', { class: 'row' });
    const renderLimits = () => {
      limitRow.innerHTML = '';
      limits.forEach((m) => {
        const b = btn({ label: m ? `${m} min` : 'Fără limită', cls: st.dailyLimitMin === m ? 'on' : 'btn-soft', onClick: () => { st.dailyLimitMin = m; s.playtime.reminded = false; s.playtime.extraMin = 0; save(); renderLimits(); } });
        limitRow.appendChild(b);
      });
    };
    renderLimits();
    wrap.appendChild(row('Limită zilnică (cu memento blând)', limitRow));
    wrap.appendChild(h('p', { class: 'hint' }, `Azi s-a jucat: ${Math.floor((s.playtime.seconds || 0) / 60)} minute.`));

    wrap.appendChild(h('div', { class: 'section-title' }, '🐱 Personaj'));
    const nameInput = h('input', { class: 'text-input', type: 'text', value: s.pet.name, maxlength: 16, 'aria-label': 'Numele pisicuței' });
    wrap.appendChild(row('Numele pisicuței', nameInput, btn({ icon: '✔', label: 'Salvează', cls: 'btn-ok', onClick: () => { s.pet.name = cleanName(nameInput.value, 'Mimi').slice(0, 16); nameInput.value = s.pet.name; save(); toast(`Pisicuța se numește acum ${s.pet.name}`, '🐱'); } })));

    wrap.appendChild(h('div', { class: 'section-title' }, '💾 Salvare'));
    wrap.appendChild(row('Exportă salvarea (fișier)', btn({ icon: '⬇️', label: 'Descarcă', cls: 'btn-violet', onClick: () => {
      ctx.store.flush();
      const blob = new Blob([ctx.save.exportData(s)], { type: 'application/json' });
      downloadBlob(blob, `mimi-salvare-${new Date().toISOString().slice(0, 10)}.json`);
      toast('Salvarea a fost descărcată', '💾');
    } })));
    const fileInput = h('input', { type: 'file', accept: 'application/json,.json,text/plain', style: { display: 'none' } });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files?.[0];
      if (!f) return;
      doImport(await f.text());
      fileInput.value = '';
    });
    wrap.appendChild(fileInput);
    wrap.appendChild(row('Importă o salvare', btn({ icon: '📂', label: 'Din fișier', cls: 'btn-soft', onClick: () => fileInput.click() }), btn({ icon: '📋', label: 'Lipește text', cls: 'btn-soft', onClick: async () => {
      const area = h('textarea', { class: 'text-area', 'aria-label': 'Textul salvării', placeholder: 'Lipește aici textul salvării…' });
      const v = await modal({ title: 'Lipește salvarea', icon: '📋', body: area, actions: [{ label: 'Renunță', icon: '✖', cls: 'btn-soft', value: null }, { label: 'Importă', icon: '✔', cls: 'btn-ok', value: () => area.value }] });
      if (v) doImport(v);
    } })));

    async function doImport(text) {
      let next;
      try { next = ctx.save.importData(text); } catch (err) { toast(err.message, '⚠️', 3200); return; }
      if (!(await confirmBox('Înlocuim jocul de acum cu salvarea importată?', { icon: '📂' }))) return;
      ctx.save.save(next);
      location.reload();
    }

    wrap.appendChild(row('Șterge tot și începe de la zero', btn({ icon: '🗑️', label: 'Resetează', cls: 'btn-soft', onClick: async () => {
      if (!(await confirmBox('Sigur ștergi tot progresul?', { icon: '⚠️' }))) return;
      if (!(await confirmBox('Chiar sigur? Nu se mai poate recupera.', { icon: '🗑️', yes: 'Da, șterge' }))) return;
      ctx.save.reset();
      location.reload();
    } })));

    wrap.appendChild(h('div', { class: 'section-title' }, '🔒 Confidențialitate'));
    wrap.appendChild(h('p', { class: 'hint', style: { textAlign: 'left' } }, 'Fără reclame, fără conturi, fără cumpărături cu bani reali, fără internet obligatoriu. Nimic nu pleacă de pe acest dispozitiv: totul se salvează local, în browser.'));
  },
};

// Ecranul de odihnă (când se termină timpul zilnic).
export const restScene = {
  id: 'rest',
  title: 'Pauză',
  back: null,
  mount(root, ctx) {
    const s = ctx.store.state;
    const look = s.look;
    root.appendChild(h('div', { class: 'rest' },
      svgFromString(figureSVG({ look, design: look.outfit, expr: 'sleep' })),
      h('h2', {}, `${s.pet.name} e obosită și vrea să se odihnească.`),
      h('p', {}, 'Ne vedem mâine pentru o nouă zi de joacă! 💤'),
      btn({ icon: '🔐', label: 'Părinte: încă 15 minute', cls: 'btn-soft', onClick: async () => {
        if (!(await parentGate())) return;
        s.playtime.extraMin = (s.playtime.extraMin || 0) + 15;
        s.playtime.reminded = false;
        ctx.store.commit();
        ctx.go('home');
      } }),
    ));
    ctx.audio.melody([72, 69, 67, 64, 67, 60], 0.35, 'sine', 0.1);
  },
};
