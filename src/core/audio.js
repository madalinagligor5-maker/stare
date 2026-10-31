// Sunete generate în cod cu Web Audio API (nu folosim fișiere audio).
// Totul trece printr-un volum general (master) care poate fi oprit (mute).

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // număr MIDI -> frecvență
const PENTA = [0, 2, 4, 7, 9]; // gamă pentatonică: sună mereu frumos

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.volume = 0.7;
    this.muted = false;
    this.noiseBuffer = null;
    this.lastPlayed = new Map();
  }

  // Browserele cer o atingere înainte de sunet: apelăm la prima atingere.
  unlock() {
    if (!this.ctx) {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch { return; }
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyVolume();
      const len = this.ctx.sampleRate * 1;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); this.applyVolume(); }
  setMuted(m) { this.muted = !!m; this.applyVolume(); }
  applyVolume() {
    if (!this.master) return;
    const v = this.muted ? 0 : this.volume * 0.6;
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
  }

  get ready() { return !!this.ctx && !this.muted && this.volume > 0 && this.ctx.state === 'running'; }

  // Un ton simplu cu înveliș (atac / stingere) și alunecare de frecvență.
  tone({ freq = 440, to = null, type = 'sine', dur = 0.15, vol = 0.3, attack = 0.01, delay = 0, filter = null }) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.value = filter.freq || 1200;
      f.Q.value = filter.q || 1;
      osc.connect(f); node = f;
    }
    node.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  // Zgomot filtrat (apă, aplauze, foarfecă, pași).
  noise({ dur = 0.2, vol = 0.2, freq = 1000, to = null, type = 'bandpass', q = 1, delay = 0, lfo = 0 }) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g);
    if (lfo) {
      // tremur (pentru tors)
      const l = this.ctx.createOscillator();
      const lg = this.ctx.createGain();
      const am = this.ctx.createGain();
      l.frequency.value = lfo; lg.gain.value = 0.5; am.gain.value = 0.5;
      l.connect(lg); lg.connect(am.gain);
      g.connect(am); am.connect(this.master);
      l.start(t); l.stop(t + dur + 0.05);
    } else {
      g.connect(this.master);
    }
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }

  // Redă un sunet după nume. `throttle` evită sunete prea dese (ms).
  play(name, throttle = 0) {
    if (!this.ready) return;
    if (throttle) {
      const now = performance.now();
      if (now - (this.lastPlayed.get(name) || 0) < throttle) return;
      this.lastPlayed.set(name, now);
    }
    const r = Math.random();
    switch (name) {
      case 'click': this.tone({ freq: 660, to: 880, dur: 0.07, vol: 0.18, type: 'triangle' }); break;
      case 'tab': this.tone({ freq: 520, to: 700, dur: 0.09, vol: 0.15 }); break;
      case 'pop': this.tone({ freq: 380 + r * 80, to: 1100, dur: 0.09, vol: 0.28 }); break;
      case 'bubble': this.tone({ freq: 300 + r * 200, to: 1300 + r * 300, dur: 0.12, vol: 0.2 }); break;
      case 'sparkle':
        [0, 0.06, 0.12, 0.18].forEach((d, i) => this.tone({ freq: 1600 + i * 330 + r * 100, dur: 0.18, vol: 0.09, type: 'triangle', delay: d }));
        break;
      case 'star':
        this.tone({ freq: NOTE(84), dur: 0.12, vol: 0.18, type: 'triangle' });
        this.tone({ freq: NOTE(91), dur: 0.22, vol: 0.18, type: 'triangle', delay: 0.08 });
        break;
      case 'purr': this.noise({ dur: 1.3, vol: 0.35, freq: 140, type: 'lowpass', q: 0.7, lfo: 24 }); break;
      case 'giggle':
        for (let i = 0; i < 5; i++) this.tone({ freq: i % 2 ? 980 : 760, to: i % 2 ? 820 : 900, dur: 0.07, vol: 0.16, delay: i * 0.085, type: 'triangle' });
        break;
      case 'meow':
        this.tone({ freq: 520, to: 820, dur: 0.18, vol: 0.18, type: 'sawtooth', filter: { type: 'bandpass', freq: 1100, q: 2 } });
        this.tone({ freq: 820, to: 430, dur: 0.32, vol: 0.18, type: 'sawtooth', delay: 0.17, filter: { type: 'bandpass', freq: 1000, q: 2 } });
        break;
      case 'mrr': // mofturoasă, fără nimic trist
        this.tone({ freq: 420, to: 360, dur: 0.18, vol: 0.14, type: 'sawtooth', filter: { type: 'bandpass', freq: 800, q: 2 } });
        this.tone({ freq: 360, to: 460, dur: 0.18, vol: 0.14, type: 'sawtooth', delay: 0.18, filter: { type: 'bandpass', freq: 800, q: 2 } });
        break;
      case 'yawn': this.tone({ freq: 520, to: 240, dur: 0.9, vol: 0.12, type: 'sawtooth', attack: 0.2, filter: { type: 'lowpass', freq: 900 } }); break;
      case 'chomp':
        this.noise({ dur: 0.08, vol: 0.3, freq: 400, type: 'lowpass' });
        this.noise({ dur: 0.08, vol: 0.3, freq: 450, type: 'lowpass', delay: 0.16 });
        break;
      case 'step': this.noise({ dur: 0.07, vol: 0.18, freq: 300, type: 'lowpass' }); break;
      case 'whoosh': this.noise({ dur: 0.35, vol: 0.18, freq: 400, to: 2400, type: 'bandpass', q: 1.5 }); break;
      case 'brush': this.noise({ dur: 0.22, vol: 0.12, freq: 2500, to: 3500, type: 'bandpass', q: 2 }); break;
      case 'water': this.noise({ dur: 0.25, vol: 0.12, freq: 2200, type: 'bandpass', q: 0.8 }); break;
      case 'scrub': this.noise({ dur: 0.12, vol: 0.12, freq: 1300, type: 'bandpass', q: 3 }); break;
      case 'dryer': this.noise({ dur: 0.3, vol: 0.12, freq: 900, type: 'bandpass', q: 0.6 }); break;
      case 'snip':
        this.noise({ dur: 0.04, vol: 0.25, freq: 5000, type: 'highpass' });
        this.noise({ dur: 0.04, vol: 0.2, freq: 4000, type: 'highpass', delay: 0.07 });
        break;
      case 'stitch': this.tone({ freq: 900 + r * 200, to: 1200, dur: 0.05, vol: 0.1, type: 'square', filter: { type: 'lowpass', freq: 1800 } }); break;
      case 'camera':
        this.noise({ dur: 0.05, vol: 0.35, freq: 3000, type: 'highpass' });
        this.noise({ dur: 0.12, vol: 0.2, freq: 1200, type: 'bandpass', delay: 0.06 });
        break;
      case 'applause':
        for (let i = 0; i < 70; i++) this.noise({ dur: 0.05, vol: 0.12 + Math.random() * 0.1, freq: 1500 + Math.random() * 2000, q: 2, delay: Math.random() * 2.2 });
        break;
      case 'soft-no':
        this.tone({ freq: NOTE(67), dur: 0.15, vol: 0.12, type: 'triangle' });
        this.tone({ freq: NOTE(64), dur: 0.2, vol: 0.12, type: 'triangle', delay: 0.12 });
        break;
      case 'place': this.tone({ freq: 300, to: 200, dur: 0.1, vol: 0.2, type: 'triangle' }); break;
      case 'zzz': this.tone({ freq: 220, to: 180, dur: 0.6, vol: 0.08, attack: 0.2 }); break;
      case 'tada': this.melody([72, 76, 79, 84], 0.11, 'triangle', 0.16); break;
      case 'win': this.melody([67, 72, 76, 79, 84, 88], 0.09, 'triangle', 0.14); break;
      default: this.tone({ freq: 700, dur: 0.06, vol: 0.12 });
    }
  }

  // Cântă o secvență de note (numere MIDI). null = pauză.
  melody(notes, step = 0.2, type = 'triangle', vol = 0.12) {
    if (!this.ready) return;
    notes.forEach((n, i) => {
      if (n == null) return;
      this.tone({ freq: NOTE(n), dur: step * 1.6, vol, type, delay: i * step, attack: 0.02 });
    });
  }

  // Melodie scurtă generată procedural (aceeași sămânță = aceeași melodie).
  tune(seed = 1, bars = 2, base = 72, step = 0.18) {
    if (!this.ready) return 0;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const notes = [];
    let idx = 2;
    for (let i = 0; i < bars * 8; i++) {
      idx = Math.max(0, Math.min(9, idx + Math.round((rnd() - 0.5) * 3)));
      const n = base + PENTA[idx % 5] + 12 * Math.floor(idx / 5) - 12;
      notes.push(rnd() < 0.15 ? null : n);
    }
    notes.push(base);
    this.melody(notes, step, 'triangle', 0.1);
    // bas simplu
    for (let b = 0; b < bars * 2; b++) {
      this.tone({ freq: NOTE(base - 24 + (b % 2 ? 7 : 0)), dur: step * 3.5, vol: 0.08, type: 'sine', delay: b * step * 4 });
    }
    return notes.length * step;
  }
}

export const audio = new AudioEngine();
