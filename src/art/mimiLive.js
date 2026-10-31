// Angy "vie": respiră, clipește, mișcă urechile și coada, se uită după deget,
// reacționează diferit când o atingi pe cap, pe burtică sau pe coadă.

import { renderFigure } from './figure.js';
import { newPrefix } from './svg.js';

const EXPR_BY_MOOD = { fericita: 'happy', mofturoasa: 'pout', adormita: 'sleep', curioasa: 'curious' };

export class MimiLive {
  // group: un <g> din SVG în care se desenează Angy
  constructor(group, { getLook, getDesign = () => null, scope, audio = null, reducedMotion = () => false, onReact = null, hairState = () => null }) {
    this.g = group;
    this.getLook = getLook;
    this.getDesign = getDesign;
    this.audio = audio;
    this.reducedMotion = reducedMotion;
    this.onReact = onReact;
    this.hairState = hairState;
    this.p = newPrefix('mimi');
    this.mood = 'fericita';
    this.tempExpr = null;
    this.tempUntil = 0;
    this.blinkAt = performance.now() + 1500;
    this.blinkT = -1;
    this.earT = { L: 0, R: 0, targetL: 0, targetR: 0, next: performance.now() + 2000 };
    this.pupil = { x: 0, y: 0, tx: 0, ty: 0 };
    this.lastPointer = 0;
    this.turn = 0; // 0..1 întoarcere (când o atingi pe coadă)
    this.turnT = -1;
    this.bounce = 0;
    this.render();
    if (scope) {
      scope.loop((dt, t) => this.update(dt, t));
      scope.on(window, 'pointermove', (e) => this.lookAtClient(e.clientX, e.clientY));
      scope.on(window, 'pointerdown', (e) => this.lookAtClient(e.clientX, e.clientY));
    }
  }

  get expr() {
    if (this.tempExpr && performance.now() < this.tempUntil) return this.tempExpr;
    return EXPR_BY_MOOD[this.mood] || 'happy';
  }

  render() {
    this.renderedExpr = this.expr;
    this.g.innerHTML = renderFigure({ look: this.getLook(), design: this.getDesign(), kind: 'mimi', expr: this.renderedExpr, p: this.p, hairState: this.hairState() });
    const q = (id) => this.g.querySelector(`#${this.p}-${id}`);
    this.refs = {
      all: q('all'), head: q('head'), tail: q('tail'), earL: q('earL'), earR: q('earR'),
      eyeL: q('eyeL'), eyeR: q('eyeR'), pupL: q('pupL'), pupR: q('pupR'),
    };
  }

  setMood(mood) {
    if (mood === this.mood) return;
    this.mood = mood;
    if (!this.tempExpr) this.render();
  }

  // Expresie pentru scurt timp (ms), apoi revine la starea de bază.
  flash(expr, ms = 1500) {
    this.tempExpr = expr;
    this.tempUntil = performance.now() + ms;
    this.render();
  }

  lookAtClient(cx, cy) {
    const m = this.g.getScreenCTM?.();
    if (!m) return;
    const inv = m.inverse();
    const x = cx * inv.a + cy * inv.c + inv.e;
    const y = cx * inv.b + cy * inv.d + inv.f;
    const dx = x - 150, dy = y - 128;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 160);
    this.pupil.tx = (dx / d) * 5 * k;
    this.pupil.ty = (dy / d) * 4.5 * k;
    this.lastPointer = performance.now();
  }

  // Ce zonă a lui Angy a fost atinsă (după elementul atins).
  zoneOf(target) {
    if (!target?.closest) return null;
    if (target.closest(`#${this.p}-tail`)) return 'tail';
    if (target.closest(`#${this.p}-earL`) || target.closest(`#${this.p}-earR`)) return 'ear';
    if (target.closest(`#${this.p}-head`)) return 'head';
    if (target.closest('.fig-legs')) return 'feet';
    if (target.closest(`#${this.p}-body`) || target.closest('.fig-dress') || target.closest('.fig-over')) return 'belly';
    return null;
  }

  // Reacție la atingere. Întoarce zona (sau null).
  react(target) {
    const zone = this.zoneOf(target);
    if (!zone) return null;
    if (this.mood === 'adormita' && zone !== 'head') {
      this.audio?.play('zzz');
      this.onReact?.('sleepy', zone);
      return zone;
    }
    switch (zone) {
      case 'head':
        this.flash('purr', 1800); this.audio?.play('purr'); break;
      case 'ear':
        this.earT.targetL = -22; this.earT.targetR = 22; this.earT.next = performance.now() + 400;
        this.flash('giggle', 900); this.audio?.play('giggle'); break;
      case 'belly':
      case 'feet':
        this.flash('giggle', 1400); this.audio?.play('giggle'); this.bounce = 1; break;
      case 'tail':
        this.turnT = 0; this.flash('curious', 1300); this.audio?.play('meow'); break;
      default: break;
    }
    this.onReact?.(zone, zone);
    return zone;
  }

  update(dt, t) {
    if (!this.refs?.all) return;
    if (this.tempExpr && t > this.tempUntil) { this.tempExpr = null; this.render(); }
    if (this.renderedExpr !== this.expr) this.render();
    const reduce = this.reducedMotion();
    const r = this.refs;
    const sleeping = this.expr === 'sleep';

    // respirație (mai lentă în somn) + mic salt după gâdilat
    const br = reduce ? 0 : Math.sin(t / (sleeping ? 900 : 520)) * (sleeping ? 0.02 : 0.012);
    this.bounce = Math.max(0, this.bounce - dt * 2.5);
    const hop = reduce ? 0 : Math.sin(this.bounce * Math.PI) * 10 * this.bounce;
    // întoarcere (coada)
    let flip = 1;
    if (this.turnT >= 0) {
      this.turnT += dt / (reduce ? 0.3 : 1.1);
      const k = this.turnT;
      flip = Math.cos(Math.min(1, k) * Math.PI * 2);
      if (k >= 1) { this.turnT = -1; flip = 1; }
    }
    r.all.setAttribute('transform', `translate(150 400) scale(${flip.toFixed(3)} ${(1 + br).toFixed(4)}) translate(-150 ${(-400 - hop).toFixed(2)})`);
    if (r.head) r.head.setAttribute('transform', `translate(0 ${(reduce ? 0 : Math.sin(t / 520 + 0.6) * 1.2).toFixed(2)})`);

    // coada
    if (r.tail) {
      const a = reduce ? 0 : Math.sin(t / (sleeping ? 1400 : 700)) * (sleeping ? 3 : 9);
      r.tail.setAttribute('transform', `rotate(${a.toFixed(2)} 182 330)`);
    }

    // urechi: tresar din când în când
    const e = this.earT;
    if (t > e.next) {
      if (e.targetL || e.targetR) { e.targetL = 0; e.targetR = 0; e.next = t + 2500 + Math.random() * 4000; }
      else if (!reduce && !sleeping) { const which = Math.random(); e.targetL = which < 0.6 ? -14 : 0; e.targetR = which > 0.4 ? 14 : 0; e.next = t + 180; }
    }
    e.L += (e.targetL - e.L) * Math.min(1, dt * 18);
    e.R += (e.targetR - e.R) * Math.min(1, dt * 18);
    if (r.earL) r.earL.setAttribute('transform', `rotate(${e.L.toFixed(2)} 100 62)`);
    if (r.earR) r.earR.setAttribute('transform', `rotate(${e.R.toFixed(2)} 200 62)`);

    // clipit
    if (r.eyeL && r.pupL) {
      if (this.blinkT < 0 && t > this.blinkAt) this.blinkT = 0;
      let sy = 1;
      if (this.blinkT >= 0) {
        this.blinkT += dt / 0.16;
        sy = Math.max(0.08, Math.abs(1 - this.blinkT * 2));
        if (this.blinkT >= 1) { this.blinkT = -1; this.blinkAt = t + 2200 + Math.random() * 3500; sy = 1; }
      }
      r.eyeL.setAttribute('transform', `translate(114 128) scale(1 ${sy.toFixed(3)}) translate(-114 -128)`);
      r.eyeR.setAttribute('transform', `translate(186 128) scale(1 ${sy.toFixed(3)}) translate(-186 -128)`);
      // privirea urmărește degetul; dacă nu atingi nimic, se uită ușor în jur
      if (t - this.lastPointer > 4000) {
        this.pupil.tx = Math.sin(t / 1900) * 3;
        this.pupil.ty = Math.sin(t / 2700) * 1.5;
      }
      const pu = this.pupil;
      pu.x += (pu.tx - pu.x) * Math.min(1, dt * 10);
      pu.y += (pu.ty - pu.y) * Math.min(1, dt * 10);
      const tr = `translate(${pu.x.toFixed(2)} ${pu.y.toFixed(2)})`;
      r.pupL.setAttribute('transform', tr);
      r.pupR.setAttribute('transform', tr);
    }
  }
}
