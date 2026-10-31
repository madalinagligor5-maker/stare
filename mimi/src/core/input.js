// Atingere + mouse unificate prin Pointer Events. Tragere (drag), ciupire (pinch) și rotire cu 2 degete.

// Transformă coordonatele ecranului în coordonatele SVG-ului (viewBox).
export function svgPoint(svg, clientX, clientY) {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const inv = m.inverse();
  return { x: clientX * inv.a + clientY * inv.c + inv.e, y: clientX * inv.b + clientY * inv.d + inv.f };
}

// Gest complet pe un element: un deget = trage, două degete = mărește/rotește.
// handlers: onStart(p, e), onMove(p, delta, e), onPinch({scale, rotate}), onEnd(p, info), onTap(p, e)
// `toLocal(clientX, clientY)` transformă coordonatele (implicit: ecran).
export function gesture(el, handlers, scope, toLocal = (x, y) => ({ x, y })) {
  const pointers = new Map();
  let start = null;
  let moved = 0;
  let pinch = null;
  let last = null;

  const down = (e) => {
    if (e.button !== undefined && e.button > 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    if (pointers.size === 1) {
      start = toLocal(e.clientX, e.clientY);
      last = start;
      moved = 0;
      pinch = null;
      if (handlers.onStart?.(start, e) === false) { pointers.delete(e.pointerId); start = null; return; }
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(b.x - a.x, b.y - a.y) || 1, ang: Math.atan2(b.y - a.y, b.x - a.x) };
      handlers.onPinchStart?.();
    }
    e.preventDefault();
  };

  const move = (e) => {
    if (!pointers.has(e.pointerId) || !start) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      handlers.onPinch?.({ scale: d / pinch.d, rotate: ((ang - pinch.ang) * 180) / Math.PI });
      moved = 99;
      return;
    }
    const p = toLocal(e.clientX, e.clientY);
    moved += Math.hypot(p.x - last.x, p.y - last.y);
    handlers.onMove?.(p, { dx: p.x - last.x, dy: p.y - last.y, total: { x: p.x - start.x, y: p.y - start.y } }, e);
    last = p;
  };

  const up = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 0 && start) {
      const p = toLocal(e.clientX, e.clientY);
      const info = { moved, pinched: !!pinch };
      if (moved < 6 && !pinch) handlers.onTap?.(p, e);
      handlers.onEnd?.(p, info, e);
      start = null;
      pinch = null;
    } else if (pointers.size === 1 && pinch) {
      // după ciupire continuăm tragerea cu degetul rămas
      const [only] = [...pointers.values()];
      last = toLocal(only.x, only.y);
      pinch = null;
      handlers.onPinchEnd?.();
    }
  };

  const opts = { passive: false };
  if (scope) {
    scope.on(el, 'pointerdown', down, opts);
    scope.on(el, 'pointermove', move, opts);
    scope.on(el, 'pointerup', up);
    scope.on(el, 'pointercancel', up);
  } else {
    el.addEventListener('pointerdown', down, opts);
    el.addEventListener('pointermove', move, opts);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }
}

// Gest în coordonatele unui SVG.
export function svgGesture(svg, handlers, scope, target = svg) {
  gesture(target, handlers, scope, (x, y) => svgPoint(svg, x, y));
}
