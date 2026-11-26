# DQM2 Offline Compendium

An **unofficial, fully offline companion** for *Dragon Quest Monsters 2: Iru and Luca’s Marvelous Mysterious Key*
(ドラゴンクエストモンスターズ2 イルとルカの不思議なふしぎな鍵 — Nintendo 3DS, 2014 / iOS & Android “SP”, 2020).

The Japanese reference site [game-cap.com/dqm2](https://game-cap.com/dqm2/) rebuilt as a single-page TypeScript app,
with every term in **unofficial English**: families, ranks, skill sets, traits, items, keys and the seven-chapter
walkthrough. No network calls, no accounts, no analytics — the app ships with its own data and artwork and keeps
working with the network switched off.

---

## Contents

| Section | What it holds |
| --- | --- |
| **Monster dex** | 908 monsters with dex number, rank, family, body size, base HP/MP/Attack/Defence/Agility/Wisdom, stat total, signature skill set, habitat, egg pool and special acquisition routes |
| **Filters** | Rank (F→SS), family (8), size (S/M/G/Super G), A–Z index, free-text search, sort by any stat, pagination |
| **Monster pages** | Portrait, badges, scaled stat bars, obtain details, shared-family shortcuts, previous/next by dex number, favourites |
| **Synthesis** | Family-combination table for rank synthesis (位階配合) plus a “what will I get?” family-pair lookup |
| **Skill sets** | 261 sets, each listing every monster that learns it, grouped by rank |
| **Spells & abilities** | Reference of the established English spell names (Frizz, Sizz, Woosh, Crack, Zap, Zam…) |
| **Traits** | Body, combat, resistance, support, drawback and plus-value traits |
| **Weapons** | Seven weapon types, shop stock, forging notes |
| **Items** | Herbs, cures, seeds, scouting meat, eggs and key items with buy/sell prices where known |
| **Walkthrough** | Seven chapters: key item, towns, dungeons, objectives and the monsters recorded in that realm |
| **Egg dex** | White / silver / gold / rainbow eggs plus the dream eggs, with their hatching pools |
| **Arena** | Class C/B/A/S cups, kids’ cup and daily events |
| **Tools** | Three-slot team builder with summed stat caps, and a two-monster stat comparison |

---

## Quick start

```bash
npm install      # or: npm ci
npm run dev      # http://localhost:3000
npm run build    # typecheck + production build into dist/
npm run preview  # serve the built dist/
```

`dist/` is a self-contained static site: copy it to a USB stick or any static host and it runs as-is
(`file://` works too, since the build uses a relative base). On every push to `main` the CI publishes that same
build to GitHub Pages — see [Continuous integration & Pages deploy](#continuous-integration--pages-deploy).

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server on `0.0.0.0:3000` |
| `npm run build` | `tsc --noEmit` then `vite build` → `dist/` |
| `npm run typecheck` | TypeScript only, no output |
| `npm run preview` | Serve the built bundle |

---

## How the offline part works

- All data lives in `src/data/*.json` and is bundled at build time — there is no API, database or fetch of content.
- The 902 monster icons (WebP, ~4 MB total), the hero illustration and the stylesheet are plain files under `public/`.
- `public/sw.js` precaches the shell, the hashed JS/CSS bundles **and every icon** on the first visit, then serves
  cache-first. After one load the app works with the network off.
- No web fonts, no CDN scripts, no trackers, no cookies. The only stored state is the favourites list in
  `localStorage`.

---

## Project layout

```
index.html                 app shell (header, nav, search, sidebar, footer)
vite.config.ts             relative base + dev server on 0.0.0.0:3000
src/
  app.ts                   hash router, sidebar, global search, service-worker registration
  lib.ts                   types, data access, badges, filters, sorting, favourites
  styles.css               design system (manual-style surfaces, wiki tables, rank/family colours)
  data/
    monsters.json          908 records (generated)
    skills.json            261 skill sets (generated)
    extras.ts              ranks, families, abilities, traits, items, weapons, chapters, eggs, arena
  pages/
    home.ts monsters.ts skills.ts breeding.ts reference.ts chart.ts tools.ts about.ts
public/
  img/monster/*.webp       902 monster icons
  img/hero.jpg             hero illustration
  sw.js                    service worker (precache + cache-first)
  offline-assets.json      manifest of every icon, consumed by the service worker
  favicon.svg manifest.webmanifest
data-source/               extraction + translation pipeline (not shipped in the build)
  scrape.py detail2.py build_data.py
  name-map-a.json name-map-b.json      unofficial English name maps
  roster.json detail_0_908.json        raw records scraped from game-cap.com/dqm2
.github/workflows/ci.yml   typecheck · build · verify offline bundle · upload dist artifact
```

---

## Data pipeline

The shipped JSON is generated, not hand-edited. From `data-source/`:

```bash
python3 build_data.py     # roster.json + detail_0_908.json + name maps → ../src/data/*.json
```

- `scrape.py` collects the roster (rank, family, size, stat total, skill set, icon number).
- `detail2.py` collects per-monster base stats and acquire routes from the individual pages.
- `name-map-a.json` / `name-map-b.json` hold the Japanese → English name mapping for all 908 monsters.
- `build_data.py` merges everything, translates habitat strings through a place-name dictionary (≈70 entries) and
  folds boss skill sets back onto their monster names.

Data is read from the 3DS + SP roster (908 entries). The original Japanese name is kept on every record.

---

## Terminology

The 3DS game was never localised, so **every name here is an unofficial English rendering**. Established Dragon Quest
localisations are reused where they exist (*Slime*, *Dracky*, *Frizz*, *Killing Machine*, *Dragonlord*…); the rest are
translated in the same style. Families: Slime · Dragon · Nature · Beast · Material · Demon · Zombie · ???.
Ranks: F → E → D → C → B → A → S → SS.

### Coverage & limitations

- Monster records (stats, rank, family, size, skill set, obtain data) are complete for all 908 entries.
- Traits, abilities, items and weapons are **curated reference lists**, not the full in-game catalogues.
- Per-monster trait lists and skill-point tables are not included.
- Synthesis covers the family-combination table and candidate lookup; exact special recipes and the precise
  rank-value formula are not modelled.
- Habitat text is present for 190 records (the rest are boss, egg, event or synthesis exclusives).

---

## Continuous integration & Pages deploy

`.github/workflows/ci.yml` runs on every push to `main`, every pull request and manually.

**Job `build`**

1. `npm ci` with the npm cache,
2. `npm run typecheck`,
3. `npm run build`,
4. a bundle check (shell, service worker, offline manifest and ≥ 900 icons present),
5. uploads `dist/` as the **`dqm2-offline-compendium`** artifact (14-day retention) — download it from the workflow
   run to get a ready-to-use offline build.

**Job `deploy-pages`** (push to `main` only, never on pull requests)

1. queries the repository Pages API first and prints whether a Pages site exists, its URL, build type, source,
   custom domain and certificate — failing with an explicit message instead of an opaque action error when the
   repository has no Pages site (or its source is not “GitHub Actions”),
2. downloads the `dqm2-offline-compendium` artifact that `build` just produced (no rebuild),
3. re-checks the bundle,
4. adds `.nojekyll` so Pages serves the files untouched,
5. uploads it as the Pages artifact and deploys it through `actions/deploy-pages`,
6. publishes the environment URL in the job summary (`github-pages` environment).

The build uses a relative base (`base: './'`), so the same artifact works at a project-site URL such as
`https://<user>.github.io/<repo>/` as well as on a custom domain or from `file://`.

### Enabling the deployment (repository settings)

1. **Settings → Pages → Build and deployment → Source: _GitHub Actions_.** This is the only required setting;
   do not pick “Deploy from a branch”, the workflow ships its own artifact.
2. The first run creates the **`github-pages`** environment (Settings → Environments). If that environment has
   protection rules, allow the `main` branch or remove required reviewers, otherwise the deploy step waits for approval.
3. Private repositories need a plan that includes Pages (Pro / Team / Enterprise); public repositories get it for free.
4. Organisation policies must permit Pages publishing for the repository.

Pages serves the site over HTTPS, which the service worker needs — so the published URL is as offline-capable as
the local build (visit once, then it keeps working with the network off).

---

## Credits & disclaimer

Compiled as a fan reference from the Japanese community wiki [game-cap.com/dqm2](https://game-cap.com/dqm2/).
*Dragon Quest*, *Dragon Quest Monsters* and all monster, spell, item and character names are trademarks of
Square Enix / Armor Project. This project is non-commercial, contains no game code or ROM data, and is not
affiliated with Square Enix.
