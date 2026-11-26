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
| **Monster pages** | Portrait, badges, scaled stat bars, traits (base, +25/+50/+★ and M/G/Super G), 30-slot resistance table, equippable weapon types (all seven flags recorded), skill-point progression, rank value (位階No.) and synthesis recipes, obtain details (habitat, other-world master’s world, rebirth form and location), shared-family shortcuts, previous/next by dex number, favourites |
| **Synthesis** | Two-monster calculator using the rank values (位階配合) with special (特殊配合) and four-monster (4体配合) recipe lookup, the family-combination table, and the rebirth-monster list |
| **Skill sets** | All 425 sets, each with the full skill-point → ability progression in English and Japanese, the monsters that learn it grouped by rank, and the 41 evolution pairs (進化元 → 進化先) |
| **Spells & abilities** | All 303 abilities of the reference index in unofficial English, with type (spell, slash, skill, breath, dance), the resistance each is checked against, its damage cap, the SP badge and the skill sets that teach it |
| **Traits** | All 240 traits with their classification (combat, resistance, support, stats, drawback), English name and the Japanese source text; the traits a monster unlocks at +25/+50/+★ stay on its page |
| **Weapons** | All 110 weapons of the seven types: attack, shop price, effect, where each is sold and which monster drops it; the equippable types of all 908 monsters |
| **Items** | 180 items and key items plus 75 forging materials, with effects, buy/sell prices and source tags |
| **Alchemy keys** | All 76 first halves and 110 second halves of a key name (20 added in SP), each with the title and condition that unlock it, the quest/reward a second half brings and its price where the source prints one |
| **Alchemy-key rewards** | The 115 monsters an alchemy-key quest can hand out, by reward rank (SS/S/A/B) |
| **Walkthrough** | Seven chapters: key item, towns, dungeons, objectives and the monsters recorded in that realm |
| **Egg dex** | White / silver / gold / rainbow eggs plus the dream eggs, with their hatching pools |
| **Arena** | The four class cups with entry fee, prize, every opponent and its HP and the reference’s notes for each round, plus the endurance battle’s streak rewards and where a loss sends you back |
| **Guides** | Translated system articles: new-life synthesis, scouting, mini medals, the 15 scout quests and the SP online matchmaking |
| **Kameha exchange** | All 353 monsters the Kameha prince hands out, with the route of each one (scout, other-world master, synthesis, egg, key, other) |
| **Tools** | Three-slot team builder with summed stat caps, and a two-monster stat comparison |
| **Rebirth monsters** | Every record the source tags as a rebirth monster (転生モンスター) — the 19 rows of the rebirth chart plus the one only a monster page records — with the monster each is the rebirth of and its location |

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
  i18n.ts                  Japanese → English term lookups for traits, abilities, items, weapons
  data/
    monsters.json          908 records incl. traits, resistances and weapon flags (generated)
    skills.json            425 skill sets with SP progression, holders and evolution links (generated)
    key-names.json         76 + 110 alchemy-key name halves with titles and conditions (generated)
    arena.json             class cups with opponents and HP, endurance rewards, restart rules (generated)
    kameha.json            353 Kameha reward monsters with their other routes (generated)
    traits.json            192 trait names with their description text (generated)
    abilities.json         303 abilities: type, element, damage cap, SP flag (generated)
    trait-extra.json       240 traits with classification and source text (generated)
    items.json             180 items / key items + 75 materials (generated)
    weapons.json           110 weapons with price, effect, shops and drop sources (generated)
    key-rewards.json       115 alchemy-key reward monsters by rank (generated)
    monster-weapons.json   equippable weapon types for all 908 monsters (generated)
    i18n-*.json            English renderings for every term in the tables above
    extras.ts              ranks, families, chapters, eggs and the long-form notes
    guides.ts              translated system guides (new-life synthesis, scouting, medals…)
  pages/
    home.ts monsters.ts skills.ts breeding.ts reference.ts chart.ts tools.ts about.ts
public/
  img/monster/*.webp       902 monster icons
  img/hero.jpg             hero illustration
  sw.js                    service worker (precache + cache-first)
  offline-assets.json      manifest of every icon, consumed by the service worker
  favicon.svg manifest.webmanifest
data-source/               extraction + translation pipeline (not shipped in the build)
  scrape.py detail2.py build_data.py  monsters, skills, traits from the saved roster dump
  scrape_lists.py                      ability/trait/item/weapon/key indices, key names,
                                       rebirth chart + weapon flags
  scrape_skills.py                     the 425-set skill index with holders and evolutions
  scrape_guides.py                     arena cups + endurance rewards, Kameha reward list
  name-map-a.json name-map-b.json      unofficial English name maps
  roster.json detail_0_908.json        raw records scraped from game-cap.com/dqm2
.github/workflows/ci.yml   typecheck · build · verify offline bundle · upload dist artifact
```

---

## Data pipeline

The shipped JSON is generated, not hand-edited. From `data-source/`:

```bash
python3 build_data.py      # roster.json + detail_0_908.json + name maps → monsters/skills/traits
python3 scrape_lists.py    # list pages → abilities, trait-extra, items, weapons, key-rewards,
                           #              key-names, rebirth chart + the per-monster weapon flags
                           # (subset: python3 scrape_lists.py weapons keys key-names rebirth)
python3 scrape_skills.py   # skilllist + skill_*.html → all 425 sets, their holders, SP tables
                           #              and evolution links, merged into skills.json
python3 scrape_guides.py   # chart/c,b,a,s + kachinuki + Kameha → arena.json, kameha.json
```

- `scrape.py` collects the roster (rank, family, size, stat total, skill set, icon number).
- `detail2.py` collects per-monster base stats and acquire routes from the individual pages.
- `name-map-a.json` / `name-map-b.json` hold the Japanese → English name mapping for all 908 monsters.
- `build_data.py` merges everything, translates habitat strings through a place-name dictionary (≈90 entries),
  substitutes monster names inside location lines, and folds boss skill sets back onto their monster names.
- The same pass reads the `配合` block of each page: the hidden rank value (位階No.), the 位階配合 / 特殊配合 flags,
  the special and four-monster recipe trees, and the `他国マスター` world and `転生` tag of the obtain block.

Data is read from the 3DS + SP roster (908 entries). The original Japanese name is kept on every record.

---

## Terminology

The 3DS game was never localised, so **every name here is an unofficial English rendering**. Established Dragon Quest
localisations are reused where they exist (*Slime*, *Dracky*, *Frizz*, *Killing Machine*, *Dragonlord*…); the rest are
translated in the same style. Families: Slime · Dragon · Nature · Beast · Material · Demon · Zombie · ???.
Ranks: F → E → D → C → B → A → S → SS.

### Coverage & limitations

- Monster records (stats, rank, family, size, skill set, obtain data) are complete for all 908 entries.
- Per-monster traits (with their +25/+50/+★ and M/G/超G tiers), the 30-slot resistance table and the skill-point
  progression of all 425 sets are extracted from the source pages (`build_data.py` for the sets a dex monster uses,
  `scrape_skills.py` for the rest of the reference index).
- The **Traits**, **Spells & abilities**, **Items**, **Weapons** and **Alchemy-key rewards** pages are built from the
  reference’s own index pages (`data-source/scrape_lists.py`), so their counts match it: 240 traits, 303 abilities,
  180 items + 75 materials, 110 weapons and 115 reward monsters.
- Equippable-weapon flags are now read from the `data-dqm2-equip` state of each of the 908 monster pages, so every
  record shows its seven weapon types instead of the 20 that kept a plain-text line.
- Effect texts on the traits, items and weapons pages stay in Japanese: they are the reference’s own wording, and
  every one of them is shown next to an English name rather than rewritten.
- The skill index is complete: all 425 sets of the reference, the 41 evolution pairs and the sets that no dex
  monster holds (crest sets, evolved sets and the job sets).
- The alchemy-key name index is complete too: 76 first halves, 110 second halves (20 of them SP-only), with the
  title and condition that unlock each one.
- Synthesis is modelled from the scrape: all 908 records carry their rank value (位階No.), 403 are marked as
  rank-synthesis results and 427 as special-synthesis results. 419 records carry the two- or four-monster recipe the
  source prints on their page (67 of them four-monster); recipes the page does not print are not inferred.
- 146 records name the world of an other-world master (他国マスター). 20 records are rebirth monsters after merging
  the 19 entries of `chart/009.html`; every one of them carries the location the chart prints, and the longer
  location text a monster page states is kept instead of the chart’s shorter line.
- Habitat text is present for 257 records (the rest are boss, egg, event or synthesis exclusives).
- The arena page is complete for the four class cups (8 rounds, 42 opponents with their HP) and the endurance battle
  (11 reward steps, 7 restart brackets). Round notes and opponent HP stay in the reference’s Japanese.
- The system guides are translated from the reference articles; item, monster and skill names inside them stay in
  Japanese so they can be looked up in the other tables.

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
