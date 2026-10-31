// Sistemul de scene. Fiecare scenă primește un Scope care strânge tot ce trebuie
// curățat la plecare (ascultători globali, cronometre, bucle de animație, abonări la bus).
// Așa nu rămân "scurgeri de memorie" când schimbi scenele de multe ori.

let activeHandles = 0; // pentru testul de scurgeri

export class Scope {
  constructor() { this.cleanups = []; this.disposed = false; }

  add(fn) {
    if (this.disposed) { fn(); return fn; }
    activeHandles++;
    this.cleanups.push(fn);
    return fn;
  }

  on(target, event, fn, opts) {
    target.addEventListener(event, fn, opts);
    this.add(() => target.removeEventListener(event, fn, opts));
    return fn;
  }

  timeout(fn, ms) {
    const id = setTimeout(() => { if (!this.disposed) fn(); }, ms);
    this.add(() => clearTimeout(id));
    return id;
  }

  interval(fn, ms) {
    const id = setInterval(() => { if (!this.disposed) fn(); }, ms);
    this.add(() => clearInterval(id));
    return id;
  }

  // Buclă de animație: fn(dt secunde, timp ms). Se oprește singură la curățare.
  loop(fn) {
    let id = 0;
    let last = performance.now();
    const tick = (t) => {
      if (this.disposed) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      fn(dt, t);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    this.add(() => cancelAnimationFrame(id));
  }

  sub(unsubscribe) { return this.add(unsubscribe); }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const fn of this.cleanups.reverse()) {
      try { fn(); } catch (err) { console.error('[scope]', err); }
      activeHandles--;
    }
    this.cleanups = [];
  }
}

export function getActiveHandles() { return activeHandles; }

export class SceneManager {
  constructor(root, ctx) {
    this.root = root;
    this.ctx = ctx;
    this.registry = new Map();
    this.current = null; // { id, scene, el, scope, params }
    this.busy = false;
    this.pending = null;
    this.stack = [];
  }

  register(scene) { this.registry.set(scene.id, scene); }

  // Schimbă scena. dir: 'fwd' | 'back' (pentru direcția glisării).
  async go(id, params = {}, dir = 'fwd') {
    if (this.busy) { this.pending = [id, params, dir]; return; }
    const scene = this.registry.get(id);
    if (!scene) { console.error('Scenă necunoscută:', id); return; }
    this.busy = true;
    const old = this.current;
    const el = document.createElement('section');
    el.className = `scene scene-${id}`;
    el.dataset.scene = id;
    const scope = new Scope();
    this.root.appendChild(el);
    try {
      scene.mount(el, this.ctx, params, scope);
    } catch (err) {
      console.error(`[scene ${id}]`, err);
    }
    this.current = { id, scene, el, scope, params };
    this.ctx.bus.emit('scene:changed', { id, scene, params });
    document.body.dataset.scene = id;

    const reduce = this.ctx.store.state.settings.reducedMotion;
    if (old) {
      const dur = reduce ? 120 : 300;
      el.classList.add(reduce ? 'enter-fade' : dir === 'back' ? 'enter-left' : 'enter-right');
      old.el.classList.add(reduce ? 'leave-fade' : dir === 'back' ? 'leave-right' : 'leave-left');
      old.el.style.pointerEvents = 'none';
      await new Promise((r) => setTimeout(r, dur));
      old.scope.dispose();
      try { old.scene.unmount?.(old.el, this.ctx); } catch (err) { console.error(err); }
      old.el.remove();
      el.classList.remove('enter-fade', 'enter-left', 'enter-right');
    }
    this.busy = false;
    if (this.pending) {
      const p = this.pending; this.pending = null;
      this.go(...p);
    }
  }

  back() {
    const back = this.current?.scene.back;
    if (!back) return;
    const target = typeof back === 'function' ? back(this.current.params) : back;
    if (target) this.go(target.id || target, target.params || {}, 'back');
  }
}
