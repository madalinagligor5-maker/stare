# 🐱 Mimi – Salon și Atelier

Un joc pentru fetițe de 4–8 ani, în limba română: pisicuța **Mimi** are nevoie de grijă, merge la salon,
poartă rochii create de tine în atelier, defilează pe podium și locuiește într-o cameră pe care o decorezi.

- **Fără reclame, fără conturi, fără cumpărături cu bani reali, fără internet obligatoriu.**
- Nimic nu pleacă de pe dispozitiv: progresul se salvează local, în browser.
- Merge pe telefon (vertical și orizontal), tabletă și calculator, cu degetul sau cu mouse-ul.
- Funcționează complet offline și se poate „instala” pe ecranul telefonului (PWA).

---

## ▶️ Cum deschid jocul

**Varianta cea mai simplă:** dublu-clic pe fișierul **`mimi-offline.html`**. Se deschide în browser și merge imediat (tot jocul e într-un singur fișier).

**Varianta cu server local** (pentru dezvoltare, sau ca să meargă și partea de instalare/offline):

```bash
cd mimi
node tools/server.mjs        # apoi deschide http://localhost:8080
```

(Orice alt server simplu merge și el, de exemplu `python3 -m http.server 8080`.)

> `index.html` deschis direct cu dublu-clic **nu** merge, pentru că browserele nu lasă modulele JavaScript să se încarce din fișiere locale; jocul îți arată atunci un mesaj care te trimite la `mimi-offline.html`.

## 📱 Cum îl instalez pe telefonul nepoatei

Jocul trebuie să fie publicat pe un site (gratuit, vezi mai jos), apoi:

**Android (Chrome):**
1. Deschide adresa jocului în Chrome.
2. Apasă meniul **⋮** → **Adaugă pe ecranul de pornire** / **Instalează aplicația**.
3. Apare iconița cu Mimi. De acum jocul merge și fără internet.

**iPhone / iPad (Safari):**
1. Deschide adresa jocului în Safari.
2. Apasă butonul **Distribuie** (pătratul cu săgeată) → **Adaugă la ecranul principal**.
3. Deschide jocul o dată cât ai internet; după aceea merge și offline.

Sfat: intră o dată în **⚙️ Pentru părinți** (rotița din ecranul de start; răspunzi la un calcul simplu) și setează o **limită zilnică de joc** dacă vrei. Când se termină timpul, Mimi „se duce la culcare” cu un mesaj blând.

## 🌐 Publicare gratuită

### GitHub Pages
1. Pune folderul `mimi/` într-un depozit GitHub (poate fi chiar acesta).
2. Pe GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, alege ramura și folderul rădăcină (`/root`).
3. După un minut, jocul e la `https://NUMELE-TAU.github.io/NUMELE-DEPOZITULUI/mimi/`.
   (Dacă vrei ca jocul să fie direct la rădăcină, pune conținutul folderului `mimi/` într-un depozit separat.)

### Netlify (cel mai rapid, fără cont GitHub)
1. Intră pe <https://app.netlify.com/drop>.
2. Trage folderul `mimi/` în pagină.
3. Primești imediat o adresă publică. Gata!

Toate căile din joc sunt relative, deci merge în orice subfolder.

## 👗 Cum adaug haine noi (sau mobilă, coafuri…)

Tot conținutul e în **`src/data/`**. Logica jocului nu trebuie modificată: adaugi o intrare și apare automat în atelier, magazin, colecții, teste.

| Ce vrei să adaugi | Fișier | Listă |
|---|---|---|
| Tip de rochie | `src/data/clothes.js` | `DRESS_TYPES` |
| Material / model (desen) | `src/data/clothes.js` | `MATERIALS`, `PATTERNS` (+ desenul în `src/art/patterns.js`) |
| Decor pe rochie (fundiță, ștampilă…) | `src/data/clothes.js` | `DECOR` |
| Pantofi, șosete, poșete, bijuterii, pălării, mănuși, aripioare, coroane | `src/data/clothes.js` | `OUTFIT_ACC` |
| Coafuri, decor de păr, accesorii de salon | `src/data/beauty.js` | `HAIRSTYLES`, `HAIR_DECOR`, `LOOK_ACC` |
| Mobilă, tapet, podea, colecții | `src/data/furniture.js` | `FURNITURE`, `WALLPAPERS`, `FLOORS`, `COLLECTIONS` |
| Culori | `src/data/colors.js` | |
| Misiuni zilnice și insigne | `src/data/quests.js` | `QUEST_POOL`, `BADGES` |
| Fundaluri, rame, autocolante pentru poze | `src/data/photo.js` | |

**Exemplu – o poșetă nouă.** În `OUTFIT_ACC` copiezi o intrare și o schimbi:

```js
{ id: 'poseta-floare', slot: 'bag', name: 'Poșetă floare', price: 8,
  draw: (c) => `<circle cx="222" cy="306" r="16" fill="${c}"/>` },
```

- `id` – unic (testele verifică asta);
- `price` – stele (0 sau lipsă = gratuit); `collection: 'gradina'` o pune într-o colecție;
- `draw(culoare)` – desen SVG în coordonatele corpului lui Mimi (fișierul are la început o notă cu pozițiile: umeri, talie, labe, tălpi).

După ce adaugi **fișiere** noi (nu doar intrări), rulează `node tools/update-sw.mjs` (lista pentru offline) și `node tools/bundle.mjs` (refacerea `mimi-offline.html`).

## 🧪 Teste

```bash
cd mimi
npm test            # teste automate: salvare/încărcare/migrare, Anulează/Refă, economie, garderobă,
                    # misiuni, nevoi, toate desenele din catalog, lista offline, fără linkuri externe
npm run e2e         # joacă tot jocul în Chrome fără fereastră (are nevoie de Playwright: npm i)
```

Testul `e2e` parcurge: meniu → acasă (mângâiat, hrănit trăgând mâncarea, somn) → salon (spălat complet, coafor, machiaj,
manichiură, accesorii, Anulează/Refă) → atelier (tip, culoare, desen, decor tras cu degetul, duplicare, Anulează/Refă,
salvare) → garderobă (favorite, filtre, redenumire, ștergere cu confirmare) → cameră → magazin → **reîncărcare
(verifică salvarea)** → poză + album → defilare → croitorie → cele 5 mini-jocuri → misiuni → părinți (export) → limita zilnică;
apoi 60 de schimbări de scenă (scurgeri de memorie), apăsarea tuturor opțiunilor din editoare, capturi pe telefon
(390×844), tabletă (820×1180) și orizontal (844×390), un test cu mouse-ul și verificarea modului offline.
Capturile sunt în `tests/screenshots/`, iar rezultatul ultimei rulări în `tests/e2e/last-run.json`.

## 🗂️ Cum e organizat codul

```
mimi/
  index.html, manifest.webmanifest, sw.js   pagina, instalarea, offline
  mimi-offline.html                         tot jocul într-un fișier (generat de tools/bundle.mjs)
  styles/main.css
  src/main.js            pornire: salvare, progres (stele, misiuni, insigne, colecții), timp, bara de sus
  src/core/              state & salvare (save.js, defaults.js), event bus, scene (+ Scope anti-scurgeri),
                         audio procedural (Web Audio), atingere/gesturi, interfață, istoric, economie, garderobă, misiuni, nevoi
  src/art/               desene SVG pe straturi: Mimi/manechin, haine, păr, camera, Mimi „vie” (animații)
  src/data/              cataloagele (vezi tabelul de mai sus)
  src/scenes/            meniu, acasă, salon, atelier, croitorie, defilare, garderobă, poză/album, cameră, magazin,
                         misiuni, mini-jocuri, părinți
  tools/                 server local, refacere listă offline, iconițe, fișierul unic
  tests/unit, tests/e2e  teste
```

Salvarea are **versiune de schemă** (acum 3) și migrări de la versiunile vechi (`src/core/save.js`). Din meniul pentru
părinți poți **exporta** salvarea într-un fișier și o poți **importa** pe alt dispozitiv.
