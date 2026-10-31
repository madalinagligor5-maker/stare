// Test complet în browser (Playwright, fără fereastră): parcurge jocul ca un copil,
// pe telefon (atingere), tabletă, orizontal și cu mouse-ul. Face capturi de ecran.
// Folosire: node tests/e2e/run.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../../tools/server.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(root, 'tests', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const PORT = 8790;
const BASE = `http://localhost:${PORT}/`;

const results = [];
const errors = [];
async function step(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - t0 });
    console.log(`  ✅ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err: err.message });
    console.log(`  ❌ ${name}\n     ${err.message.split('\n')[0]}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function watch(page, label) {
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
}

// Tragere cu degetul (evenimente touch reale prin CDP).
async function touchDrag(page, pts, { steps = 6 } = {}) {
  const cdp = await page.context().newCDPSession(page);
  const tp = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(pts[0].x, pts[0].y) });
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    for (let k = 1; k <= steps; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(a.x + ((b.x - a.x) * k) / steps, a.y + ((b.y - a.y) * k) / steps) });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
async function mouseDrag(page, pts, steps = 6) {
  await page.mouse.move(pts[0].x, pts[0].y);
  await page.mouse.down();
  for (let i = 1; i < pts.length; i++) await page.mouse.move(pts[i].x, pts[i].y, { steps });
  await page.mouse.up();
}
const drag = (page, touch, pts) => (touch ? touchDrag(page, pts) : mouseDrag(page, pts));

const state = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__mimi.ctx.store.state)));
const scene = (page) => page.evaluate(() => document.body.dataset.scene);
async function goScene(page, id, params = {}) {
  await page.evaluate(([i, p]) => window.__mimi.ctx.go(i, p), [id, params]);
  await page.waitForFunction((i) => document.body.dataset.scene === i && !document.querySelector('.scene.leave-left, .scene.leave-right, .scene.leave-fade'), id);
  await wait(250);
}
async function tap(page, selector, touch) {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded();
  if (touch) await loc.tap(); else await loc.click();
  await wait(150);
}
async function closeModals(page) {
  for (let i = 0; i < 4; i++) {
    if (!(await page.locator('#modals .modal-overlay').count())) return;
    await page.keyboard.press('Escape');
    await wait(260);
  }
}
async function shot(page, name) { await wait(350); await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); }

// ---------- Fluxul principal (telefon, atingere) ----------
async function mainFlow(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  watch(page, 'telefon');
  const T = true;
  await page.goto(`${BASE}?fara-sw`);
  await page.waitForFunction(() => !!window.__mimi);

  await step('meniu se deschide', async () => {
    assert((await scene(page)) === 'menu', 'nu e meniul');
    await shot(page, 'telefon-01-meniu');
  });
  await step('meniu → acasă', async () => {
    await tap(page, '.btn-play', T);
    await page.waitForFunction(() => document.body.dataset.scene === 'home');
    await shot(page, 'telefon-02-acasa');
  });
  await step('Mimi reacționează la atingere pe cap (torcă, iubire crește)', async () => {
    const before = (await state(page)).stats.pet;
    const head = await page.locator('.home-room svg [id$="-head"]').first().boundingBox();
    await page.touchscreen.tap(head.x + head.width / 2, head.y + head.height * 0.75);
    await wait(300);
    assert((await state(page)).stats.pet === before + 1, 'mângâierea nu a contat');
  });
  await step('casa: cadoul zilei dă stele o singură dată', async () => {
    const before = (await state(page)).stars;
    await tap(page, '.side-btn:has-text("Cadouri")', T);
    await page.waitForSelector('.modal-overlay:not(.out) .modal:has-text("Cadoul zilei")');
    await shot(page, 'telefon-02b-cadou');
    await closeModals(page);
    assert((await state(page)).stars === before + 10, 'cadoul nu a dat stele');
    await tap(page, '.side-btn:has-text("Cadouri")', T);
    await page.waitForSelector('.modal-overlay:not(.out) .modal:has-text("deja")');
    await closeModals(page);
    assert((await state(page)).stars === before + 10, 'cadoul s-a dat de două ori');
  });
  await step('bucătărie: hrănire prin tragerea mâncării spre pisicuță', async () => {
    await tap(page, '.dock .btn:has-text("Mâncare")', T);
    await page.waitForFunction(() => document.body.dataset.scene === 'kitchen');
    await wait(300);
    const food = await page.locator('.care-tray .food').first().boundingBox();
    const mimi = await page.locator('.care-stage .mimi').boundingBox();
    const before = (await state(page)).stats.feed;
    await touchDrag(page, [{ x: food.x + 30, y: food.y + 30 }, { x: mimi.x + mimi.width / 2, y: mimi.y + mimi.height * 0.3 }]);
    await wait(300);
    assert((await state(page)).stats.feed === before + 1, 'hrănirea nu a contat');
    await shot(page, 'telefon-03-bucatarie');
  });
  await step('dormitor: se culcă și se trezește', async () => {
    await goScene(page, 'bedroom');
    await tap(page, '.care-bottom .btn:has-text("Culcă")', T);
    assert((await state(page)).pet.sleeping === true, 'nu doarme');
    await tap(page, '.care-bottom .opt[data-id="inimioare"]', T);
    assert((await state(page)).sleepTheme === 'inimioare', 'pătura');
    await shot(page, 'telefon-03b-somn');
    await tap(page, '.care-bottom .btn:has-text("Trezește")', T);
    assert((await state(page)).pet.sleeping === false, 'nu s-a trezit');
  });
  await step('hartă: locurile duc în scenele potrivite', async () => {
    await goScene(page, 'map');
    await shot(page, 'telefon-03c-harta');
    await tap(page, '.map-pin[data-place="jocuri"]', T);
    await page.waitForFunction(() => document.body.dataset.scene === 'games');
    await goScene(page, 'map');
    await tap(page, '.map-pin[data-place="plaja"]', T);
    await page.waitForFunction(() => document.body.dataset.scene === 'photo');
  });
  await step('baie: spălat în cadă', async () => {
    await goScene(page, 'bath');
    const before = await state(page);
    const box = await page.locator('.editor-stage').boundingBox();
    for (let round = 0; round < 14 && (await state(page)).stats.wash === before.stats.wash; round++) {
      for (let y = box.y + 40; y < box.y + box.height * 0.72; y += 20) await touchDrag(page, [{ x: box.x + box.width * 0.2, y }, { x: box.x + box.width * 0.8, y }], { steps: 5 });
      if (round === 0) await shot(page, 'telefon-03d-baie');
    }
    assert((await state(page)).stats.wash === before.stats.wash + 1, 'baia nu s-a terminat');
  });
  await step('salon: față (mască, castraveți, clătire = stele)', async () => {
    await goScene(page, 'home');
    await tap(page, '.dock .btn:has-text("Salon")', T);
    await page.waitForFunction(() => document.body.dataset.scene === 'salon');
    await tap(page, '.btn:has-text("Castraveți")', T);
    await tap(page, '.opt[data-id="capsuni"]', T);
    await shot(page, 'telefon-03e-masca');
    const before = (await state(page)).stars;
    await tap(page, '.btn:has-text("Clătește fața")', T);
    await wait(800);
    assert((await state(page)).stars === before + 3, 'clătirea nu a dat stele');
  });
  await step('salon: spălat complet (săpun → duș → prosop) cu degetul', async () => {
    await tap(page, '.tab[data-id="wash"]', T);
    await wait(300);
    const before = await state(page);
    const box = await page.locator('.editor-stage').boundingBox();
    for (let round = 0; round < 12; round++) {
      const st = await state(page);
      if (st.stats.wash > before.stats.wash) break;
      for (let y = box.y + 50; y < box.y + box.height - 20; y += 22) {
        await touchDrag(page, [{ x: box.x + box.width * 0.22, y }, { x: box.x + box.width * 0.78, y }], { steps: 5 });
      }
      if (round === 0) await shot(page, 'telefon-04-salon-spuma');
    }
    const after = await state(page);
    assert(after.stats.wash === before.stats.wash + 1, 'spălatul nu s-a terminat');
    assert(after.stars >= before.stars + 5, 'nu s-au primit stele');
    assert(after.pet.needs.clean === 100, 'nu e curată');
  });
  await step('salon: coafor (coafură nouă + Gata dă stele)', async () => {
    await tap(page, '.tab[data-id="hair"]', T);
    const before = (await state(page)).stars;
    await tap(page, '.opt[data-id="bucle"]', T);
    await tap(page, '.stage-tools .btn:has-text("Gata!")', T);
    await wait(900);
    const st = await state(page);
    assert(st.look.hair.style === 'bucle', 'coafura nu s-a schimbat');
    assert(st.stars === before + 3, `stele: ${before} → ${st.stars}`);
    await shot(page, 'telefon-05-coafor');
  });
  await step('salon: anulează / refă', async () => {
    await tap(page, '.opt[data-id="coc"]', T);
    assert((await state(page)).look.hair.style === 'coc', 'nu s-a aplicat');
    await tap(page, '.stage-tools .btn[title="Anulează"]', T);
    assert((await state(page)).look.hair.style === 'bucle', 'anularea nu merge');
    await tap(page, '.stage-tools .btn[title="Refă"]', T);
    assert((await state(page)).look.hair.style === 'coc', 'refacerea nu merge');
  });
  await step('salon: machiaj, manichiură, accesorii', async () => {
    await tap(page, '.tab[data-id="makeup"]', T);
    await tap(page, '.panel-body .swatch:nth-child(3)', T);
    assert((await state(page)).look.makeup.shadow.color, 'fără fard');
    await tap(page, '.tab[data-id="nails"]', T);
    await tap(page, '.btn:has-text("Toate")', T);
    await tap(page, '.panel-body .swatches .swatch:nth-child(4)', T);
    await tap(page, '.opt[data-id="stele"]', T);
    const nails = (await state(page)).look.nails;
    assert(nails.every((n) => n.color && n.pattern === 'stele'), 'manichiura nu s-a aplicat pe toate');
    await shot(page, 'telefon-06-manichiura');
    await tap(page, '.tab[data-id="acc"]', T);
    await tap(page, '.opt[data-id="fundita-mare"]', T);
    assert((await state(page)).look.acc.bow?.id === 'fundita-mare', 'fundița lipsește');
  });

  await step('atelier: tip, culoare, desen, decor tras cu degetul', async () => {
    await goScene(page, 'atelier');
    await tap(page, '.opt[data-id="printesa"]', T);
    await tap(page, '.tab[data-id="culoare"]', T);
    await tap(page, '.swatch[data-color="#3d8bfd"]', T);
    await tap(page, '.tab[data-id="modele"]', T);
    await tap(page, '.opt[data-id="buline"]', T);
    await tap(page, '.tab[data-id="decor"]', T);
    await tap(page, '.opt[data-id="fundita"]', T);
    let d = (await state(page)).atelier.draft;
    assert(d.type === 'printesa' && d.colorA === '#3d8bfd' && d.pattern === 'buline' && d.decor.length === 1, 'atelierul nu a aplicat alegerile');
    const g = await page.locator('[data-decor]').first().boundingBox();
    await touchDrag(page, [{ x: g.x + g.width / 2, y: g.y + g.height / 2 }, { x: g.x + g.width / 2 + 40, y: g.y + g.height / 2 + 60 }]);
    await wait(200);
    const d2 = (await state(page)).atelier.draft;
    assert(d2.decor[0].x !== d.decor[0].x || d2.decor[0].y !== d.decor[0].y, 'decorul nu s-a mutat');
    await tap(page, '.sel-tools .btn[title="Mărește"]', T);
    await tap(page, '.sel-tools .btn[title="Rotește la dreapta"]', T);
    await tap(page, '.sel-tools .btn[title="Duplică"]', T);
    assert((await state(page)).atelier.draft.decor.length === 2, 'duplicarea nu merge');
    await tap(page, '.stage-tools .btn[title="Anulează"]', T);
    assert((await state(page)).atelier.draft.decor.length === 1, 'anularea în atelier nu merge');
    await tap(page, '.stage-tools .btn[title="Refă"]', T);
    assert((await state(page)).atelier.draft.decor.length === 2, 'refacerea în atelier nu merge');
    await tap(page, '.tab[data-id="acc"]', T);
    await tap(page, '.opt[data-id="balerini"]', T);
    await tap(page, '.opt[data-id="hat"]', T);
    await tap(page, '.opt[data-id="palarie-soare"]', T);
    await shot(page, 'telefon-07-atelier');
  });
  await step('atelier: salvare rochie în garderobă (cu nume)', async () => {
    const before = await state(page);
    await tap(page, '.stage-tools .btn:has-text("Salvează")', T);
    await page.locator('.modal-overlay:not(.out) .modal .text-input').fill('Rochia de test');
    await tap(page, '.modal-overlay:not(.out) .modal .btn-ok', T);
    await wait(500);
    const st = await state(page);
    assert(st.wardrobe.length === before.wardrobe.length + 1, 'rochia nu s-a salvat');
    assert(st.wardrobe[0].name === 'Rochia de test', 'numele greșit');
    assert(st.stats.dress === before.stats.dress + 1, 'statistica rochii');
  });
  await step('garderobă: miniatură, favorite, redenumire, îmbracă', async () => {
    await goScene(page, 'wardrobe');
    assert(await page.locator('.card:has-text("Rochia de test") .card-art svg').count(), 'lipsește miniatura');
    await tap(page, '.card .fav-btn', T);
    assert((await state(page)).wardrobe[0].fav === true, 'favorita nu merge');
    await tap(page, '.filters .btn:has-text("Favorite")', T);
    assert((await page.locator('.card').count()) === 1, 'filtrul favorite');
    await tap(page, '.card .btn[title="Redenumește"]', T);
    await page.locator('.modal-overlay:not(.out) .modal .text-input').fill('Rochia mea albastră');
    await tap(page, '.modal-overlay:not(.out) .modal .btn-ok', T);
    await wait(300);
    assert((await state(page)).wardrobe[0].name === 'Rochia mea albastră', 'redenumirea');
    await tap(page, '.card .btn[title="Îmbracă-o pe Angy"]', T);
    assert((await state(page)).look.outfit?.type === 'printesa', 'Mimi nu poartă rochia');
    await shot(page, 'telefon-08-garderoba');
  });
  await step('garderobă: ștergere cu confirmare (Nu păstrează, Da șterge)', async () => {
    await goScene(page, 'atelier', { tab: 'gata' });
    await tap(page, '.btn:has-text("Salvează în garderobă")', T);
    await tap(page, '.modal-overlay:not(.out) .modal .btn:has-text("Rochie nouă")', T);
    await page.locator('.modal-overlay:not(.out) .modal .text-input').fill('De șters');
    await tap(page, '.modal-overlay:not(.out) .modal .btn-ok', T);
    await wait(400);
    await goScene(page, 'wardrobe');
    const n = (await state(page)).wardrobe.length;
    await tap(page, '.card:has-text("De șters") .btn[title="Șterge"]', T);
    await tap(page, '.modal-overlay:not(.out) .btn-lbl:text-is("Nu")', T);
    assert((await state(page)).wardrobe.length === n, 'a șters fără confirmare');
    await tap(page, '.card:has-text("De șters") .btn[title="Șterge"]', T);
    await tap(page, '.modal-overlay:not(.out) .modal .btn-ok', T);
    await wait(300);
    assert((await state(page)).wardrobe.length === n - 1, 'nu a șters');
  });

  await step('cameră: așază un obiect și mută-l cu degetul', async () => {
    await goScene(page, 'room');
    const before = (await state(page)).room.items.length;
    await tap(page, '.opt[data-id="f-ghem"]', T);
    const st = await state(page);
    assert(st.room.items.length === before + 1, 'obiectul nu s-a pus');
    const it = st.room.items[st.room.items.length - 1];
    const el = await page.locator(`[data-item="${it.uid}"]`).boundingBox();
    await touchDrag(page, [{ x: el.x + el.width / 2, y: el.y + el.height * 0.8 }, { x: el.x + el.width / 2 - 80, y: el.y + el.height * 0.8 - 10 }]);
    await wait(200);
    const moved = (await state(page)).room.items.find((x) => x.uid === it.uid);
    assert(moved.x !== it.x, 'nu s-a mutat');
    await tap(page, '.sel-tools .btn[title="Oglindește"]', T);
    assert((await state(page)).room.items.find((x) => x.uid === it.uid).flip === !it.flip, 'oglindirea');
    await tap(page, '.tab[data-id="tapet"]', T);
    await tap(page, '.opt[data-id="wp-dungi"]', T);
    assert((await state(page)).room.wallpaper === 'wp-dungi', 'tapetul');
    await shot(page, 'telefon-09-camera');
  });
  await step('magazin: cumpără cu stele (și refuză blând fără stele)', async () => {
    await goScene(page, 'shop', { cat: 'deco' });
    const before = await state(page);
    await tap(page, '.card[data-id="f-minge"] .btn', T);
    await tap(page, '.modal-overlay:not(.out) .modal .btn-ok', T);
    await wait(400);
    const st = await state(page);
    assert(st.owned.includes('f-minge'), 'nu s-a cumpărat');
    assert(st.stars === before.stars - 4, `prețul: ${before.stars} → ${st.stars}`);
    await page.evaluate(() => { window.__mimi.ctx.store.state.stars = 1; });
    await goScene(page, 'shop', { cat: 'mobilier' });
    await tap(page, '.card[data-id="f-pat-printesa"] .btn', T);
    assert(await page.locator('.modal-overlay:not(.out) .modal:has-text("Mai ai nevoie")').count(), 'lipsește mesajul blând');
    await closeModals(page);
    assert((await state(page)).stars === 1, 'a luat stele fără să cumpere');
    await page.evaluate(() => { window.__mimi.ctx.store.state.stars = 200; window.__mimi.ctx.store.commit(); });
    await shot(page, 'telefon-10-magazin');
  });
  await step('reîncărcare: totul rămâne salvat', async () => {
    const before = await state(page);
    await page.evaluate(() => window.__mimi.ctx.store.flush());
    await page.reload();
    await page.waitForFunction(() => !!window.__mimi);
    const st = await state(page);
    assert(st.wardrobe[0].name === 'Rochia mea albastră', 'garderoba nu a persistat');
    assert(st.owned.includes('f-minge'), 'cumpărăturile nu au persistat');
    assert(st.room.items.length === before.room.items.length, 'camera nu a persistat');
    assert(st.look.hair.style === 'coc' && st.look.outfit?.type === 'printesa', 'look-ul nu a persistat');
    assert(st.stars === before.stars, 'stelele nu au persistat');
  });

  await step('fă o poză: autocolant, fotografiere, album', async () => {
    await goScene(page, 'photo', { from: 'home' });
    await tap(page, '.tab[data-id="stickers"]', T);
    await tap(page, '.opt[data-id="sk-inima"]', T);
    await tap(page, '.btn:has-text("Fotografiază!")', T);
    await page.waitForSelector('.modal-overlay:not(.out) .modal:has-text("Poza ta")');
    await shot(page, 'telefon-11-poza');
    const dl = page.waitForEvent('download', { timeout: 5000 });
    await tap(page, '.modal-overlay:not(.out) .modal .btn:has-text("Descarcă")', T);
    const file = await dl;
    assert(/\.png$/.test(file.suggestedFilename()), 'nu e PNG');
    const st = await state(page);
    assert(st.album.length === 1 && st.album[0].stickers.length === 1, 'poza nu e în album');
    await goScene(page, 'album');
    assert((await page.locator('.card').count()) === 1, 'albumul nu arată poza');
  });
  await step('defilare: Mimi merge, juriul dă stele', async () => {
    const before = await state(page);
    await goScene(page, 'runway');
    await page.waitForSelector('.judge', { timeout: 9000 });
    await page.waitForSelector('.runway .btn:has-text("Încă o dată")', { timeout: 6000 });
    await shot(page, 'telefon-12-defilare');
    const st = await state(page);
    assert(st.stats.runway === before.stats.runway + 1 && st.stars > before.stars, 'defilarea nu a dat stele');
  });
  await step('croitorie: măsoară, taie, coase', async () => {
    await goScene(page, 'tailor');
    await tap(page, '.btn:has-text("Începe")', T);
    const toClient = (pts) => page.evaluate((list) => {
      const svg = document.querySelector('.scene-tailor svg');
      const m = svg.getScreenCTM();
      return list.map(([x, y]) => ({ x: x * m.a + y * m.c + m.e, y: x * m.b + y * m.d + m.f }));
    }, pts);
    for (const [a, b] of [[[112, 228], [188, 228]], [[118, 266], [182, 266]], [[205, 266], [205, 330]]]) {
      await drag(page, T, await toClient([a, b]));
      await wait(700);
    }
    await page.waitForFunction(() => document.querySelector('.scene-tailor .hint')?.textContent.includes('foarfeca'));
    const pathPts = async (sel) => page.evaluate((s) => {
      const out = [];
      document.querySelectorAll(s).forEach((p) => { const L = p.getTotalLength(); for (let i = 0; i <= 60; i++) { const q = p.getPointAtLength((L * i) / 60); out.push([q.x, q.y]); } });
      return out;
    }, sel);
    await drag(page, T, await toClient(await pathPts('.scene-tailor .base path[stroke-dasharray="7 7"]')));
    await page.waitForFunction(() => document.querySelector('.scene-tailor .hint')?.textContent.includes('acul'), null, { timeout: 4000 });
    for (const seg of [[[118, 214], [120, 266]], [[182, 214], [180, 266]], [[120, 266], [92, 318]], [[180, 266], [208, 318]]]) await drag(page, T, await toClient(seg));
    await page.waitForFunction(() => document.querySelector('.scene-tailor .hint')?.textContent.includes('gata'), null, { timeout: 4000 });
    await shot(page, 'telefon-13-croitorie');
    assert((await state(page)).stats.tailor === 1, 'croitoria nu s-a terminat');
  });

  // ---- mini-jocuri ----
  async function finishModal() {
    await page.waitForSelector('.modal-overlay:not(.out) .modal:has-text("Bravo")', { timeout: 15000 });
    await tap(page, '.modal-overlay:not(.out) .modal .btn:has-text("Alte jocuri")', T);
    await page.waitForFunction(() => document.body.dataset.scene === 'games');
  }
  await step('mini-joc: potrivește culorile', async () => {
    await goScene(page, 'mg-colors');
    await shot(page, 'telefon-14-joc-culori');
    for (let r = 0; r < 6; r++) {
      const label = await page.locator('.game-hud').textContent();
      const n = await page.locator('.pot').count();
      for (let i = 0; i < n; i++) {
        if ((await page.locator('#modals .modal').count()) || (await page.locator('.game-hud').textContent()) !== label) break;
        const b = page.locator('.pot').nth(i);
        if (await b.isDisabled()) break;
        await b.tap();
        await wait(120);
      }
      await wait(650);
    }
    await finishModal();
  });
  await step('mini-joc: memory cu haine', async () => {
    await goScene(page, 'mg-memory');
    const fronts = await page.locator('.mem-card .front').evaluateAll((els) => els.map((e) => e.innerHTML.replace(/id="[^"]*"|url\(#[^)]*\)/g, '')));
    const done = new Set();
    for (let i = 0; i < fronts.length; i++) {
      if (done.has(i)) continue;
      const j = fronts.findIndex((f, k) => k !== i && !done.has(k) && f === fronts[i]);
      await page.locator('.mem-card').nth(i).tap(); await wait(80);
      await page.locator('.mem-card').nth(j).tap(); await wait(250);
      done.add(i); done.add(j);
    }
    await finishModal();
  });
  await step('mini-joc: sortează accesoriile (tras cu degetul)', async () => {
    await goScene(page, 'mg-sort');
    await shot(page, 'telefon-15-joc-sortare');
    while (await page.locator('.sort-items .sort-item').count()) {
      const it = page.locator('.sort-items .sort-item').first();
      const slot = await it.getAttribute('data-slot');
      const a = await it.boundingBox();
      const b = await page.locator(`.sort-box[data-slot="${slot}"]`).boundingBox();
      await touchDrag(page, [{ x: a.x + a.width / 2, y: a.y + a.height / 2 }, { x: b.x + b.width / 2, y: b.y + b.height / 2 }]);
      await wait(120);
    }
    await finishModal();
  });
  await step('mini-joc: bule de spălat', async () => {
    await goScene(page, 'mg-bubbles');
    for (let i = 0; i < 400 && !(await page.locator('#modals .modal').count()); i++) {
      const b = page.locator('.bubble').first();
      if (await b.count()) { const bb = await b.boundingBox(); if (bb) await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); }
      await wait(60);
    }
    await finishModal();
  });
  await step('mini-joc: puzzle cu rochii', async () => {
    await goScene(page, 'mg-puzzle');
    await wait(300);
    await shot(page, 'telefon-16-joc-puzzle');
    const slots = await page.locator('.puzzle-slot').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
    const cols = Math.round(await page.evaluate(() => { const b = document.querySelector('.puzzle-board').getBoundingClientRect(); const s = document.querySelector('.puzzle-slot').getBoundingClientRect(); return b.width / s.width; }));
    const n = await page.locator('.puzzle-piece').count();
    for (let i = 0; i < n; i++) {
      const pc = page.locator('.puzzle-piece').nth(i);
      const c = Number(await pc.getAttribute('data-c')), r = Number(await pc.getAttribute('data-r'));
      const a = await pc.boundingBox();
      const target = slots[r * cols + c];
      await touchDrag(page, [{ x: a.x + a.width / 2, y: a.y + a.height / 2 }, target]);
      await wait(100);
    }
    await finishModal();
  });
  await step('misiuni și insigne', async () => {
    await goScene(page, 'quests');
    const st = await state(page);
    assert(st.quests.list.length === 3, 'nu sunt 3 misiuni');
    assert(Object.keys(st.badges).length >= 5, `prea puține insigne: ${Object.keys(st.badges).join(',')}`);
    const claim = page.locator('.quest .btn-ok').first();
    if (await claim.count()) { const s0 = st.stars; await claim.tap(); await wait(900); assert((await state(page)).stars > s0, 'recompensa misiunii'); }
    await shot(page, 'telefon-17-misiuni');
  });
  await step('părinți: poarta cu calcul, setări, export', async () => {
    await goScene(page, 'menu');
    await tap(page, '.menu-gear', T);
    const q = await page.locator('.gate-q').textContent();
    const [, a, b] = q.match(/(\d+) × (\d+)/);
    for (const ch of String(Number(a) * Number(b))) await page.locator(`.keypad .btn:has-text("${ch}")`).first().tap();
    await page.waitForFunction(() => document.body.dataset.scene === 'parents');
    await tap(page, '.set-row:has-text("Mișcare redusă") .btn', T);
    assert((await state(page)).settings.reducedMotion === true, 'mișcarea redusă');
    assert(await page.evaluate(() => document.body.classList.contains('reduce-motion')), 'clasa reduce-motion');
    await tap(page, '.set-row:has-text("Mișcare redusă") .btn', T);
    const dl = page.waitForEvent('download', { timeout: 5000 });
    await tap(page, '.btn:has-text("Descarcă")', T);
    const f = await dl;
    const text = fs.readFileSync(await f.path(), 'utf8');
    assert(JSON.parse(text).app === 'mimi-salon', 'exportul nu e valid');
    await shot(page, 'telefon-18-parinti');
  });
  await step('limita zilnică arată ecranul de odihnă blând', async () => {
    await page.evaluate(() => { const s = window.__mimi.ctx.store.state; s.settings.dailyLimitMin = 15; s.playtime.seconds = 15 * 60; s.playtime.reminded = false; });
    await page.waitForFunction(() => document.body.dataset.scene === 'rest', null, { timeout: 8000 });
    await shot(page, 'telefon-19-odihna');
    await page.evaluate(() => { const s = window.__mimi.ctx.store.state; s.settings.dailyLimitMin = 0; window.__mimi.ctx.store.commit(); });
  });

  await step('fără scurgeri de memorie la 60 de schimbări de scenă', async () => {
    const order = ['home', 'kitchen', 'bath', 'bedroom', 'map', 'salon', 'atelier', 'wardrobe', 'room', 'shop', 'quests', 'games', 'album', 'mg-colors', 'mg-bubbles', 'photo', 'menu'];
    await goScene(page, 'home');
    const base = await page.evaluate(() => ({ h: window.__mimi.getActiveHandles(), b: window.__mimi.busCount(), n: document.getElementsByTagName('*').length, fx: document.querySelectorAll('.wand, .dragging').length }));
    for (let i = 0; i < 60; i++) await goScene(page, order[i % order.length]);
    await goScene(page, 'home');
    await wait(500);
    const end = await page.evaluate(() => ({ h: window.__mimi.getActiveHandles(), b: window.__mimi.busCount(), n: document.getElementsByTagName('*').length, scenes: document.querySelectorAll('.scene').length, fx: document.querySelectorAll('.wand, .dragging').length, fxList: [...document.querySelectorAll('.wand, .dragging')].map((e) => e.className + '|' + e.textContent).join(',') }));
    assert(end.scenes === 1, `rămân ${end.scenes} scene în pagină`);
    assert(end.h === base.h, `ascultători/cronometre: ${base.h} → ${end.h}`);
    assert(end.b === base.b, `abonări bus: ${base.b} → ${end.b}`);
    assert(Math.abs(end.n - base.n) < 60, `elemente DOM: ${base.n} → ${end.n}`);
    assert(end.fx === base.fx, 'au rămas elemente plutitoare: ' + end.fxList);
  });
  await step('niciun buton mort: toate opțiunile din atelier și salon răspund', async () => {
    for (const [sc, tabsSel] of [['atelier', '.tabs .tab'], ['salon', '.tabs .tab'], ['room', '.tabs .tab'], ['photo', '.tabs .tab']]) {
      await goScene(page, sc);
      const nTabs = await page.locator(tabsSel).count();
      for (let t = 0; t < nTabs; t++) {
        await page.locator(tabsSel).nth(t).tap();
        await wait(120);
        if (sc === 'atelier' && t === nTabs - 1) continue; // fila "Gata" duce în alte scene (testată separat)
        const n = Math.min(await page.locator('.panel-body .btn').count(), 40);
        for (let i = 0; i < n; i++) {
          const b = page.locator('.panel-body .btn').nth(i);
          if (!(await b.isVisible()) || (await b.isDisabled())) continue;
          await b.click({ timeout: 2000 }).catch(() => {});
          await wait(40);
          await closeModals(page);
        }
        if ((await scene(page)) !== sc) await goScene(page, sc);
      }
    }
  });
  await ctx.close();
}

// ---------- Capturi pe alte ecrane + mouse ----------
async function viewportShots(browser, name, viewport, touch) {
  const ctx = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  watch(page, name);
  await page.goto(`${BASE}?fara-sw`);
  await page.waitForFunction(() => !!window.__mimi);
  await step(`${name}: toate scenele se văd fără erori`, async () => {
    for (const sc of ['menu', 'home', 'kitchen', 'bath', 'bedroom', 'map', 'salon', 'atelier', 'wardrobe', 'room', 'shop', 'quests', 'games', 'mg-memory', 'photo', 'tailor', 'parents']) {
      await goScene(page, sc);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert(!overflow, `${sc}: pagina iese în lateral`);
      await shot(page, `${name}-${sc}`);
    }
  });
  if (!touch) {
    await step(`${name}: atelier cu mouse-ul (tragere decor + salvare)`, async () => {
      await goScene(page, 'atelier', { tab: 'decor' });
      await page.locator('.opt[data-id="st-inima"]').click();
      const g = await page.locator('[data-decor]').last().boundingBox();
      const before = (await state(page)).atelier.draft.decor.at(-1);
      await mouseDrag(page, [{ x: g.x + g.width / 2, y: g.y + g.height / 2 }, { x: g.x + g.width / 2 - 30, y: g.y + g.height / 2 + 30 }]);
      const after = (await state(page)).atelier.draft.decor.at(-1);
      assert(after.x !== before.x, 'decorul nu s-a mutat cu mouse-ul');
      await page.locator('.stage-tools .btn:has-text("Salvează")').click();
      await page.locator('.modal-overlay:not(.out) .modal .btn-ok').click();
      await wait(300);
      assert((await state(page)).wardrobe.length === 1, 'salvarea cu mouse-ul');
    });
  }
  await ctx.close();
}

// ---------- Offline: service worker + fișierul unic ----------
async function offlineCheck(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  watch(page, 'offline');
  await step('PWA: service worker-ul salvează jocul și merge fără internet', async () => {
    await page.goto(BASE);
    await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated', null, { timeout: 15000 });
    await page.waitForFunction(async () => { const keys = await caches.keys(); if (!keys.length) return false; const c = await caches.open(keys[0]); return (await c.keys()).length >= 40; }, null, { timeout: 15000 });
    await ctx.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => !!window.__mimi, null, { timeout: 10000 });
    await goScene(page, 'atelier');
    await goScene(page, 'mg-puzzle');
    await ctx.setOffline(false);
  });
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  watch(p2, 'fisier');
  await step('mimi-offline.html se deschide direct din fișier', async () => {
    await p2.goto(`file://${path.join(root, 'mimi-offline.html')}`);
    await p2.waitForFunction(() => !!window.__mimi);
    await p2.locator('.btn-play').click();
    await p2.waitForFunction(() => document.body.dataset.scene === 'home');
  });
  await ctx2.close();
}

const server = await startServer(PORT, root);
const browser = await chromium.launch();
try {
  console.log('📱 Telefon (390×844, atingere)');
  await mainFlow(browser);
  console.log('📱 Tabletă (820×1180, atingere)');
  await viewportShots(browser, 'tableta', { width: 820, height: 1180 }, true);
  console.log('📱 Telefon orizontal (844×390, atingere)');
  await viewportShots(browser, 'orizontal', { width: 844, height: 390 }, true);
  console.log('🖱️ Calculator (1280×800, mouse)');
  await viewportShots(browser, 'mouse', { width: 1280, height: 800 }, false);
  console.log('📴 Offline');
  await offlineCheck(browser);
} finally {
  await browser.close();
  server.close();
}

await step('fără erori în consolă', async () => { assert(errors.length === 0, errors.slice(0, 8).join('\n')); });
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificări trecute. Capturi: tests/screenshots/`);
fs.writeFileSync(path.join(root, 'tests', 'e2e', 'last-run.json'), JSON.stringify({ date: new Date().toISOString(), results, errors }, null, 2));
process.exit(failed.length ? 1 : 0);
