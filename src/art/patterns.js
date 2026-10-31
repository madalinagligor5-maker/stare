// Modele (buline, dungi...) și aspectul materialelor (satin, tul...) pentru haine.

import { MOTIFS, starPoints } from './svg.js';

// <pattern> SVG pentru un model. Întoarce '' dacă modelul e "none".
export function patternDef(id, kind, color) {
  const P = (w, hgt, inner, extra = '') => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${hgt}" ${extra}>${inner}</pattern>`;
  switch (kind) {
    case 'buline': return P(22, 22, `<circle cx="5" cy="5" r="4" fill="${color}"/><circle cx="16" cy="16" r="4" fill="${color}"/>`);
    case 'dungi': return P(16, 16, `<rect x="0" y="0" width="7" height="16" fill="${color}"/>`);
    case 'carouri': return P(24, 24, `<rect width="24" height="9" fill="${color}" opacity=".45"/><rect width="9" height="24" fill="${color}" opacity=".45"/><rect x="15" width="2" height="24" fill="${color}" opacity=".6"/><rect y="15" width="24" height="2" fill="${color}" opacity=".6"/>`);
    case 'flori': return P(34, 34, `<g transform="translate(9 9) scale(.7)">${MOTIFS.floare(color)}</g><g transform="translate(26 26) scale(.55)">${MOTIFS.floare(color)}</g>`);
    case 'inimioare': return P(30, 30, `<g transform="translate(8 8) scale(.6)">${MOTIFS.inima(color)}</g><g transform="translate(23 23) scale(.6)">${MOTIFS.inima(color)}</g>`);
    case 'stele': return P(30, 30, `<polygon points="${starPoints(8, 8, 6, 2.6)}" fill="${color}"/><polygon points="${starPoints(23, 22, 4.5, 2)}" fill="${color}"/>`);
    case 'fluturi': return P(40, 40, `<g transform="translate(11 11) scale(.7)">${MOTIFS.fluture(color)}</g><g transform="translate(30 30) scale(.55) rotate(20)">${MOTIFS.fluture(color)}</g>`);
    case 'curcubeu': {
      const cols = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];
      return P(300, 72, cols.map((c, i) => `<rect y="${i * 12}" width="300" height="12" fill="${c}" opacity=".75"/>`).join(''));
    }
    case 'zigzag': return P(20, 14, `<path d="M0 10 L5 4 L10 10 L15 4 L20 10" stroke="${color}" stroke-width="3" fill="none"/>`);
    default: return '';
  }
}

// Definițiile + stratul de deasupra care dă aspectul materialului.
// Întoarce { defs, overlay } — overlay se desenează decupat după forma hainei.
export function materialLayer(p, kind) {
  switch (kind) {
    case 'satin':
      return {
        defs: `<linearGradient id="${p}-sat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".45"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".28"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>`,
        overlay: `<rect x="0" y="180" width="300" height="240" fill="url(#${p}-sat)"/>`,
      };
    case 'tul':
      return {
        defs: `<pattern id="${p}-tul" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="3" cy="3" r="1" fill="#fff" opacity=".55"/></pattern>`,
        overlay: `<rect x="0" y="180" width="300" height="240" fill="#fff" opacity=".18"/><rect x="0" y="180" width="300" height="240" fill="url(#${p}-tul)"/>`,
      };
    case 'catifea':
      return {
        defs: `<radialGradient id="${p}-cat" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>`,
        overlay: `<rect x="0" y="180" width="300" height="240" fill="url(#${p}-cat)"/>`,
      };
    case 'denim':
      return {
        defs: `<pattern id="${p}-den" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(35)"><rect width="6" height="2" fill="#fff" opacity=".14"/><rect y="3" width="6" height="1" fill="#000" opacity=".1"/></pattern>`,
        overlay: `<rect x="0" y="180" width="300" height="240" fill="url(#${p}-den)"/>`,
      };
    case 'stralucitor': {
      let dots = '';
      for (let i = 0; i < 26; i++) {
        const x = (i * 53) % 260 + 20, y = 190 + ((i * 97) % 210);
        dots += `<path class="twinkle" style="animation-delay:${(i % 7) * 0.3}s" d="M${x} ${y - 5} L${x + 1.3} ${y - 1.3} L${x + 5} ${y} L${x + 1.3} ${y + 1.3} L${x} ${y + 5} L${x - 1.3} ${y + 1.3} L${x - 5} ${y} L${x - 1.3} ${y - 1.3} Z" fill="#fff"/>`;
      }
      return {
        defs: `<pattern id="${p}-glt" patternUnits="userSpaceOnUse" width="10" height="10"><circle cx="2" cy="3" r="1" fill="#fff" opacity=".8"/><circle cx="7" cy="8" r=".8" fill="#fff9c4" opacity=".9"/></pattern>`,
        overlay: `<rect x="0" y="180" width="300" height="240" fill="url(#${p}-glt)"/>${dots}`,
      };
    }
    case 'bumbac':
    default:
      return {
        defs: `<pattern id="${p}-bum" patternUnits="userSpaceOnUse" width="4" height="4"><rect width="4" height="1" fill="#000" opacity=".05"/><rect width="1" height="4" fill="#000" opacity=".04"/></pattern>`,
        overlay: `<rect x="0" y="180" width="300" height="240" fill="url(#${p}-bum)"/>`,
      };
  }
}
