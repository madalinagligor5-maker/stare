// Piese de interfață: butoane, ferestre, mesaje, stele care zboară, voce.
// Toate butoanele create aici au o acțiune (nu există butoane "moarte").

let ctx = null;
export function initUI(context) { ctx = context; }

// Construiește un element HTML: h('div', {class:'x', onClick: fn}, copii...)
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// Creează un <svg> dintr-un text.
export function svgFromString(markup) {
  const div = document.createElement('div');
  div.innerHTML = markup.trim();
  return div.firstElementChild;
}

// Buton mare, cu iconiță + text scurt. Sunet de confirmare și (opțional) voce.
export function btn({ icon = '', label = '', onClick, cls = '', sound = 'click', title, say = false, disabled = false, attrs = {} }) {
  if (typeof onClick !== 'function') throw new Error(`Buton fără acțiune: ${label || icon}`);
  const b = h('button', { class: `btn ${cls}`.trim(), type: 'button', title: title || label || undefined, 'aria-label': title || label || undefined, disabled, ...attrs });
  if (icon) b.appendChild(h('span', { class: 'btn-ico', 'aria-hidden': 'true' }, icon));
  if (label) b.appendChild(h('span', { class: 'btn-lbl' }, label));
  onTap(b, (e) => {
    if (b.disabled) return;
    if (sound) ctx?.audio.play(sound);
    if (say && (label || title)) speak(title || label);
    onClick(e);
  });
  return b;
}

// Atingere sigură: răspunde imediat când ridici degetul (fără să aștepte "click"-ul browserului,
// care uneori se pierde după o tragere). Mouse-ul și tastatura folosesc click-ul obișnuit.
let lastTap = { t: -1e9, x: 0, y: 0 };
let ghostGuard = false;
// După o atingere tratată, browserul trimite și un "click" în același loc. Dacă între timp
// s-a închis o fereastră, click-ul ar nimeri butonul de dedesubt; îl oprim.
function installGhostGuard() {
  if (ghostGuard || typeof document === 'undefined') return;
  ghostGuard = true;
  document.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    if (performance.now() - lastTap.t < 700 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
}

export function onTap(el, fn) {
  installGhostGuard();
  let down = null;
  let firedAt = -1e9;
  el.addEventListener('pointerdown', (e) => {
    down = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  el.addEventListener('pointercancel', () => { down = null; });
  el.addEventListener('pointerup', (e) => {
    if (!down || e.pointerId !== down.id) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 12) return;
    const r = el.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    firedAt = performance.now();
    lastTap = { t: firedAt, x: e.clientX, y: e.clientY };
    fn(e);
  });
  el.addEventListener('click', (e) => {
    if (performance.now() - firedAt < 700) return; // deja tratat la ridicarea degetului
    fn(e);
  });
}

// ---- Voce (citește cu voce tare pentru copiii care nu știu încă să citească) ----
let roVoice;
function findVoice() {
  if (roVoice !== undefined) return roVoice;
  const synth = globalThis.speechSynthesis;
  if (!synth) { roVoice = null; return null; }
  const voices = synth.getVoices();
  if (!voices.length) return undefined;
  roVoice = voices.find((v) => /^ro/i.test(v.lang)) || null;
  return roVoice;
}
export function speak(text) {
  if (!ctx?.store.state.settings.voice || ctx.store.state.settings.muted) return;
  const v = findVoice();
  if (!v) return; // fără voce românească instalată, nu citim greșit
  try {
    const u = new SpeechSynthesisUtterance(String(text).replace(/[^\p{L}\p{N}\s.,!?-]/gu, ''));
    u.voice = v; u.lang = v.lang; u.rate = 0.95; u.pitch = 1.2;
    u.volume = ctx.store.state.settings.volume;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch { /* ignorăm */ }
}

// ---- Mesaje scurte ----
export function toast(text, icon = '✨', ms = 2200) {
  const layer = document.getElementById('toasts');
  if (!layer) return;
  const t = h('div', { class: 'toast', role: 'status' }, h('span', { class: 'toast-ico' }, icon), h('span', {}, text));
  layer.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

// ---- Ferestre (modal) ----
// actions: [{label, icon, cls, value}] -> Promise cu `value`-ul ales (null dacă se închide).
export function modal({ title = '', icon = '', body = null, actions = [], dismissible = true, cls = '' }) {
  return new Promise((resolve) => {
    const layer = document.getElementById('modals');
    let done = false;
    const close = (value) => {
      if (done) return;
      done = true;
      overlay.classList.add('out');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => overlay.remove(), 200);
      resolve(value);
    };
    const onKey = (e) => { if (e.key === 'Escape' && dismissible) close(null); };
    const box = h('div', { class: `modal ${cls}`.trim(), role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Fereastră' },
      icon ? h('div', { class: 'modal-ico' }, icon) : null,
      title ? h('h2', { class: 'modal-title' }, title) : null,
      body ? h('div', { class: 'modal-body' }, body) : null,
      h('div', { class: 'modal-actions' }, actions.map((a) => btn({ icon: a.icon, label: a.label, cls: a.cls || '', onClick: () => close(typeof a.value === 'function' ? a.value() : a.value) }))),
    );
    const overlay = h('div', { class: 'modal-overlay' }, box);
    overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay && dismissible) close(null); });
    document.addEventListener('keydown', onKey);
    layer.appendChild(overlay);
    if (dismissible) box.prepend(btn({ icon: '✖', cls: 'btn-icon modal-x', title: 'Închide', onClick: () => close(null) }));
    const first = box.querySelector('input, .modal-actions .btn');
    setTimeout(() => first?.focus(), 50);
  });
}

export function confirmBox(text, { icon = '🤔', yes = 'Da', no = 'Nu' } = {}) {
  return modal({
    title: text, icon,
    actions: [{ label: no, icon: '✖', cls: 'btn-soft', value: false }, { label: yes, icon: '✔', cls: 'btn-ok', value: true }],
  }).then((v) => v === true);
}

export function promptText(title, initial = '', { icon = '✏️', max = 24 } = {}) {
  const input = h('input', { class: 'text-input', type: 'text', value: initial, maxlength: max, 'aria-label': title, autocomplete: 'off' });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.closest('.modal')?.querySelector('.btn-ok')?.click(); });
  return modal({
    title, icon, body: input,
    actions: [{ label: 'Renunță', icon: '✖', cls: 'btn-soft', value: null }, { label: 'Gata', icon: '✔', cls: 'btn-ok', value: () => input.value }],
  });
}

// ---- Efecte ----
// Confetti / inimioare / stele care sar dintr-un punct al ecranului.
export function burst(x, y, items = ['⭐', '✨', '💖'], count = 12) {
  if (ctx?.store.state.settings.reducedMotion) count = Math.min(count, 4);
  const layer = document.getElementById('fx');
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const p = h('div', { class: 'particle' }, items[i % items.length]);
    const ang = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 90;
    p.style.left = `${x}px`; p.style.top = `${y}px`;
    p.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(ang) * dist - 40}px`);
    p.style.setProperty('--rot', `${Math.random() * 360 - 180}deg`);
    p.style.animationDelay = `${Math.random() * 0.1}s`;
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

export function burstAt(el, items, count) {
  const r = el?.getBoundingClientRect?.();
  if (!r) return burst(innerWidth / 2, innerHeight / 2, items, count);
  burst(r.left + r.width / 2, r.top + r.height / 2, items, count);
}

// Stele care zboară spre contorul de sus.
export function flyStars(fromEl, n) {
  const target = document.getElementById('star-count');
  const layer = document.getElementById('fx');
  if (!target || !layer) return;
  const r0 = fromEl?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const r1 = target.getBoundingClientRect();
  const k = Math.min(8, Math.max(1, n));
  for (let i = 0; i < k; i++) {
    const s = h('div', { class: 'fly-star' }, '⭐');
    s.style.left = `${r0.left + r0.width / 2}px`;
    s.style.top = `${r0.top + r0.height / 2}px`;
    s.style.setProperty('--tx', `${r1.left + r1.width / 2 - (r0.left + r0.width / 2)}px`);
    s.style.setProperty('--ty', `${r1.top + r1.height / 2 - (r0.top + r0.height / 2)}px`);
    s.style.animationDelay = `${i * 0.07}s`;
    layer.appendChild(s);
    setTimeout(() => s.remove(), 1200 + i * 70);
  }
  setTimeout(() => { target.parentElement?.classList.remove('bump'); void target.offsetWidth; target.parentElement?.classList.add('bump'); }, 700);
}

// ---- Controale ----
export function slider({ label, min = 0, max = 100, value = 50, step = 1, onInput, icon = '' }) {
  const input = h('input', { type: 'range', min, max, step, value, 'aria-label': label });
  input.addEventListener('input', () => onInput(Number(input.value)));
  return h('label', { class: 'slider' }, icon ? h('span', { class: 'slider-ico' }, icon) : null, h('span', { class: 'slider-lbl' }, label), input);
}

// Rând de culori. colors: ['#hex', ...]. onPick(hex). `allowNone` adaugă "fără".
export function swatches(colors, selected, onPick, { allowNone = false, noneLabel = 'Fără' } = {}) {
  const row = h('div', { class: 'swatches', role: 'listbox' });
  const items = [];
  if (allowNone) {
    const b = btn({ icon: '🚫', title: noneLabel, cls: 'swatch swatch-none', sound: 'pop', onClick: () => { mark(b); onPick(null); } });
    if (!selected) b.classList.add('on');
    items.push(b); row.appendChild(b);
  }
  for (const c of colors) {
    const b = btn({ title: `Culoare ${c}`, cls: 'swatch', sound: 'pop', onClick: () => { mark(b); onPick(c); } });
    b.style.setProperty('--sw', c);
    b.dataset.color = c;
    if (selected && c.toLowerCase() === String(selected).toLowerCase()) b.classList.add('on');
    items.push(b); row.appendChild(b);
  }
  function mark(el) { items.forEach((i) => i.classList.toggle('on', i === el)); }
  return row;
}

// Rând de opțiuni (iconițe). options: [{id, icon (text sau nod), name, locked, price}]
export function optionRow(options, selectedId, onPick, { cls = '' } = {}) {
  const row = h('div', { class: `options ${cls}`.trim() });
  const items = [];
  for (const o of options) {
    const content = typeof o.icon === 'string' && o.icon.trim().startsWith('<svg') ? svgFromString(o.icon) : null;
    const b = btn({
      icon: content ? '' : o.icon,
      label: o.name,
      cls: `opt ${o.locked ? 'locked' : ''}`,
      sound: 'pop',
      onClick: () => { if (!o.locked) mark(b); onPick(o, b); },
    });
    if (content) b.prepend(h('span', { class: 'opt-art', 'aria-hidden': 'true' }, content));
    if (o.locked) b.appendChild(h('span', { class: 'lock-badge' }, `🔒 ${o.price}⭐`));
    b.dataset.id = o.id;
    if (o.id === selectedId) b.classList.add('on');
    items.push(b); row.appendChild(b);
  }
  function mark(el) { items.forEach((i) => i.classList.toggle('on', i === el)); }
  row.mark = (id) => items.forEach((i) => i.classList.toggle('on', i.dataset.id === id));
  return row;
}

// Taburi: [{id, icon, name}] -> onPick(id)
export function tabs(list, selected, onPick) {
  const row = h('div', { class: 'tabs', role: 'tablist' });
  const items = list.map((t) => {
    const b = btn({ icon: t.icon, label: t.name, cls: 'tab', sound: 'tab', say: true, onClick: () => { mark(t.id); onPick(t.id); } });
    b.setAttribute('role', 'tab');
    b.dataset.id = t.id;
    row.appendChild(b);
    return b;
  });
  function mark(id) { items.forEach((i) => { i.classList.toggle('on', i.dataset.id === id); i.setAttribute('aria-selected', i.dataset.id === id); }); }
  mark(selected);
  row.mark = mark;
  return row;
}

// Descarcă un fișier (blob) pe dispozitiv.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename, style: { display: 'none' } });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}
