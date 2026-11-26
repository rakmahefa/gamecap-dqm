import type { Page } from '../app';
import { SITE_NOTES } from '../data/extras';
import { ABILITY_LIST, ITEMS, KEY_REWARDS, MONSTERS, SKILLS, TRAIT_LIST, WEAPONS, countBy } from '../lib';

const ICON_COUNT = new Set(MONSTERS.map((m) => m.icon)).size;

export function render(): Page {
  const eggMonsters = countBy((m) => m.obtain.eggs !== undefined);
  const withHabitat = countBy((m) => Boolean(m.obtain.where));
  const ss = countBy((m) => m.rank === 'SS');

  return {
    title: 'About',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>About</span></nav>
      <div class="page-head">
        <h1>About this compendium</h1>
        <p class="lede">
          A rebuilt, fully offline version of the Japanese DQM2 reference site — same catalogue and same data
          structure, with all terminology in unofficial English.
        </p>
      </div>

      <section class="card">
        <div class="card-head"><h2>What is inside</h2></div>
        <div class="grid cols-4">
          <div class="stat"><div class="k">Monsters</div><div class="v">${MONSTERS.length}</div></div>
          <div class="stat"><div class="k">Skill sets</div><div class="v">${SKILLS.length}</div></div>
          <div class="stat"><div class="k">Abilities</div><div class="v">${ABILITY_LIST.length}</div></div>
          <div class="stat"><div class="k">Traits</div><div class="v">${TRAIT_LIST.length}</div></div>
          <div class="stat"><div class="k">Items &amp; materials</div><div class="v">${ITEMS.length}</div></div>
          <div class="stat"><div class="k">Weapons</div><div class="v">${WEAPONS.length}</div></div>
          <div class="stat"><div class="k">Hatchable</div><div class="v">${eggMonsters}</div></div>
          <div class="stat"><div class="k">Rank SS</div><div class="v">${ss}</div></div>
        </div>
        <ul style="margin-top:14px">
          <li><strong>Monster dex</strong> — all ${MONSTERS.length} records with rank, family, body size, base HP/MP/Attack/Defence/Agility/Wisdom, stat total, signature skill set, habitat, other-world master’s world, egg pool, rebirth form and special acquisition routes.</li>
          <li><strong>Skill sets</strong> — ${SKILLS.length} sets, each listing every monster that learns it, grouped by rank.</li>
          <li><strong>Reference data</strong> — the full ${TRAIT_LIST.length}-trait index with its classification, ${ABILITY_LIST.length} spells and abilities with type, element and cap, ${ITEMS.length} items, key items and forging materials, and all ${WEAPONS.length} weapons of the seven types with prices and drop sources.</li>
          <li><strong>Alchemy keys</strong> — the ${KEY_REWARDS.length} reward monsters an alchemy-key quest can hand out, by reward rank.</li>
          <li><strong>Walkthrough</strong> — seven chapters with key items, towns, dungeons and objectives.</li>
          <li><strong>Synthesis</strong> — a two-monster rank-value calculator, the ${countBy((m) => (m.breed?.recipes.length ?? 0) > 0)} monsters with a printed special or four-monster recipe, and the rebirth-monster list.</li>
          <li><strong>Egg dex, arena and planning tools</strong> — egg pools by colour, arena cups, a team builder and a stat comparison.</li>
        </ul>
        <p class="small muted" style="margin-bottom:0">${withHabitat} records carry a translated habitat line; the rest are dungeon, boss, egg or synthesis exclusives.</p>
      </section>

      <section class="card">
        <div class="card-head"><h2>What “100% offline” means here</h2></div>
        <ul>
          <li>Every monster, skill set, item and page is bundled into the app at build time — no API calls, no database, no cloud.</li>
          <li>All ${ICON_COUNT} monster icons, the hero illustration, the stylesheet and the scripts are local files shipped with the build.</li>
          <li>A service worker caches the whole app on first load (including every icon), so it keeps working with the network switched off, on a plane or from a USB stick.</li>
          <li>No analytics, no fonts from a CDN, no trackers, no cookies. The only stored data is your favourites list, in this browser’s <code>localStorage</code>.</li>
        </ul>
      </section>

      <section class="card">
        <div class="card-head"><h2>Terminology</h2></div>
        <p>
          The 3DS game was never released in English, so every name here is an <strong>unofficial English
          rendering</strong>. Traits, abilities, items and weapons are all translated that way, and the Japanese
          source term is kept beside each one. Well-established Dragon Quest localisations are reused wherever they exist
          (<em>Slime</em>, <em>Dracky</em>, <em>Frizz</em>, <em>Killing Machine</em>, <em>Dragonlord</em>…); the rest are
          translated or localised in the same style. The original Japanese name (名前) is shown on every monster
          record so you can cross-check it with the Japanese game.
        </p>
        <dl class="dl">
          <dt>Families</dt><dd>Slime · Dragon · Nature · Beast · Material · Demon · Zombie · ??? (系統)</dd>
          <dt>Ranks</dt><dd>F → E → D → C → B → A → S → SS (ランク)</dd>
          <dt>Skill sets</dt><dd>スキル — the trees a monster learns from</dd>
          <dt>Traits</dt><dd>特性 — passive body abilities</dd>
          <dt>Keys</dt><dd>カギ — each world is opened by a key</dd>
        </dl>
      </section>

      <section class="card">
        <div class="card-head"><h2>The game</h2></div>
        <dl class="dl">
          <dt>Title</dt><dd>${SITE_NOTES.game}</dd>
          <dt>Japanese</dt><dd class="jp">${SITE_NOTES.gameJp}</dd>
          <dt>Platform</dt><dd>${SITE_NOTES.platform}</dd>
          <dt>Reference</dt><dd>${SITE_NOTES.source}</dd>
        </dl>
      </section>

      <div class="notice">
        <p>
          <strong>Credits &amp; disclaimer.</strong> Compiled as a fan reference from the Japanese community wiki
          game-cap.com/dqm2. <em>Dragon Quest</em>, <em>Dragon Quest Monsters</em> and all monster, spell and item
          names are trademarks of Square Enix / Armor Project. This app is non-commercial, contains no game code and
          is not affiliated with Square Enix.
        </p>
      </div>
    `,
  };
}
