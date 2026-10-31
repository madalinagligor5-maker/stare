// Bucăți folosite de mai multe scene: cumpărare, roata de culori, previzualizări mici.

import { h, btn, modal, toast, svgFromString, burst } from '../core/ui.js';
import { buyItem, canAfford, isUnlocked } from '../core/economy.js';
import { hexToHsl, hslToHex, clamp } from '../core/util.js';
import { patternDef } from '../art/patterns.js';
import { newPrefix } from '../art/svg.js';

// Încearcă să deblocheze un obiect. Întoarce Promise<boolean> (true = acum e deblocat).
export async function buyFlow(ctx, item) {
  const s = ctx.store.state;
  if (isUnlocked(s, item)) return true;
  if (!canAfford(s, item)) {
    const need = item.price - s.stars;
    const go = await modal({
      icon: '⭐', title: `Mai ai nevoie de ${need} ⭐`,
      body: h('p', { class: 'hint' }, `„${item.name}” costă ${item.price} ⭐. Câștigi stele din mini-jocuri, salon, misiuni și defilări!`),
      actions: [{ label: 'Bine', icon: '👍', cls: 'btn-soft', value: false }, { label: 'Mini-jocuri', icon: '🎲', cls: 'btn-primary', value: true }],
    });
    if (go) ctx.go('games');
    return false;
  }
  const ok = await modal({
    icon: '🔓', title: `Deblochezi „${item.name}”?`,
    body: h('p', { class: 'hint' }, `Costă ${item.price} ⭐ (ai ${s.stars} ⭐)`),
    actions: [{ label: 'Nu acum', icon: '✖', cls: 'btn-soft', value: false }, { label: `Da, ${item.price} ⭐`, icon: '✔', cls: 'btn-ok', value: true }],
  });
  if (!ok) return false;
  const res = buyItem(s, item);
  if (!res.ok) return false;
  ctx.audio.play('tada');
  burst(innerWidth / 2, innerHeight / 2, ['🎉', '⭐', '✨'], 14);
  toast(`Ai deblocat „${item.name}”!`, '🔓');
  ctx.track('buy', { id: item.id });
  ctx.bus.emit('progress:check');
  ctx.store.commit();
  return true;
}

// Opțiuni cu lacăt pentru obiectele care costă.
export function withLocks(state, list) {
  return list.map((it) => ({ ...it, locked: !isUnlocked(state, it) }));
}

// Roata de culori: atingi ca să alegi nuanța (unghi) și intensitatea (distanța de la centru).
export function colorWheel(onPick, size = 150) {
  const wheel = h('div', {
    class: 'color-wheel', role: 'slider', 'aria-label': 'Roata de culori', tabindex: '0',
    style: {
      width: `${size}px`, height: `${size}px`, borderRadius: '50%', flex: '0 0 auto', touchAction: 'none', cursor: 'crosshair',
      background: 'radial-gradient(circle, #fff 0%, rgba(255,255,255,0) 70%), conic-gradient(from 90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
      boxShadow: '0 4px 0 rgba(90,40,90,.16), inset 0 0 0 6px #fff', position: 'relative',
    },
  });
  const dot = h('div', { style: { position: 'absolute', width: '22px', height: '22px', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 0 0 2px #4a2d4f', transform: 'translate(-50%,-50%)', left: '50%', top: '50%', pointerEvents: 'none' } });
  wheel.appendChild(dot);
  let down = false;
  const pick = (e, final) => {
    const r = wheel.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const dist = clamp(Math.hypot(x, y) / (r.width / 2), 0, 1);
    // conic începe de la dreapta (90deg = sus în CSS); unghiul în sensul acelor de ceas de la "dreapta"
    let hue = (Math.atan2(y, x) * 180) / Math.PI;
    if (hue < 0) hue += 360;
    const color = hslToHex(hue, 40 + dist * 60, 96 - dist * 46);
    dot.style.left = `${50 + (x / r.width) * 100}%`;
    dot.style.top = `${50 + (y / r.height) * 100}%`;
    dot.style.background = color;
    onPick(color, final);
  };
  wheel.addEventListener('pointerdown', (e) => { down = true; wheel.setPointerCapture(e.pointerId); pick(e, false); });
  wheel.addEventListener('pointermove', (e) => { if (down) pick(e, false); });
  wheel.addEventListener('pointerup', (e) => { if (down) { down = false; pick(e, true); } });
  wheel.addEventListener('pointercancel', () => { down = false; });
  return wheel;
}

// Schimbă luminozitatea unei culori (pentru glisorul "mai deschis / mai închis").
export function withLightness(hex, l) {
  const c = hexToHsl(hex);
  return hslToHex(c.h, c.s, clamp(l, 8, 95));
}

// Previzualizare model (pătrățel).
export function patternPreview(kind, base, color) {
  const p = newPrefix('pp');
  const def = patternDef(`${p}`, kind, color);
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs>${def}</defs><rect width="48" height="48" rx="10" fill="${base}"/>${def ? `<rect width="48" height="48" rx="10" fill="url(#${p})"/>` : ''}</svg>`;
}

// Previzualizare pentru un desen centrat în (0,0).
export function centeredPreview(markup, r = 34) {
  return `<svg viewBox="${-r} ${-r} ${r * 2} ${r * 2}" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
}

export const ACC_VIEW = {
  shoes: '108 360 84 48', socks: '108 312 84 92', bag: '196 262 50 58', jewelry: '86 192 128 92',
  hat: '56 -46 188 120', gloves: '78 236 144 72', wings: '26 150 248 170', crown: '96 0 108 62',
  bow: '56 30 190 90', crown2: '60 10 180 110', glasses: '80 96 140 64', earrings: '50 80 200 40', scarf: '106 186 88 80',
};

export function viewPreview(markup, viewBox) {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
}

// Mic panou de culori + roată + glisor de luminozitate.
export function colorPicker({ colors, value, onPick, allowNone = false, wheel = true, swatchesFn }) {
  const box = h('div', { class: 'row', style: { alignItems: 'flex-start', flexWrap: 'nowrap', gap: '10px' } });
  const sw = swatchesFn(colors, value, (c) => onPick(c, true), { allowNone });
  sw.style.flex = '1';
  sw.style.minWidth = '0';
  box.appendChild(sw);
  if (wheel) box.appendChild(colorWheel((c, final) => onPick(c, final), 110));
  return box;
}

export { svgFromString, btn };
