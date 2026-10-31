// Event bus: părțile jocului își trimit mesaje fără să se cunoască între ele.
// on() întoarce o funcție de dezabonare (scenele o dau Scope-ului ca să nu rămână ascultători agățați).

export function createBus() {
  const listeners = new Map();
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => listeners.get(event)?.delete(fn);
    },
    emit(event, data) {
      const set = listeners.get(event);
      if (!set) return;
      for (const fn of [...set]) {
        try { fn(data); } catch (err) { console.error(`[bus] ${event}:`, err); }
      }
    },
    // câți ascultători există (folosit la testul de scurgeri de memorie)
    count() {
      let n = 0;
      for (const set of listeners.values()) n += set.size;
      return n;
    },
  };
}

export const bus = createBus();
