// Istoric pentru Anulează / Refă. Ținem "fotografii" (copii) ale stării.
// Ultimul element din `past` este starea curentă.

import { clone } from './util.js';

export class History {
  constructor(limit = 60) {
    this.limit = Math.max(2, limit);
    this.past = [];
    this.future = [];
  }

  // Pornește istoricul de la o stare (fără nimic de anulat).
  reset(snapshot) {
    this.past = [clone(snapshot)];
    this.future = [];
  }

  // Salvează o stare nouă. Dacă e identică cu cea curentă, nu face nimic.
  push(snapshot) {
    const json = JSON.stringify(snapshot);
    const current = this.past[this.past.length - 1];
    if (current !== undefined && JSON.stringify(current) === json) return false;
    this.past.push(JSON.parse(json));
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
    return true;
  }

  get canUndo() { return this.past.length > 1; }
  get canRedo() { return this.future.length > 0; }

  current() { return clone(this.past[this.past.length - 1]); }

  undo() {
    if (!this.canUndo) return null;
    this.future.push(this.past.pop());
    return this.current();
  }

  redo() {
    if (!this.canRedo) return null;
    this.past.push(this.future.pop());
    return this.current();
  }
}
