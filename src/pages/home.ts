import {
  FAMILY_INFO,
  RANK_INFO,
  SITE_NOTES,
} from '../data/extras';
import { MONSTERS, SKILLS, countBy, esc, fmt, iconSrc, rankBadge } from '../lib';
import type { Page } from '../app';

const FEATURED = ['Slime', 'Dragon Kid', 'Great Sabrecub', 'Moosifer', 'Killing Machine', 'Dragonlord', 'Estark', 'Metal King Slime'];

export function render(): Page {
  const families = FAMILY_INFO.map((f) => {
    const rep = MONSTERS.find((m) => m.name === f.rep) ?? MONSTERS.find((m) => m.family === f.name);
    const total = countBy((m) => m.family === f.name);
    return `<a class="family-tile" href="#/monsters?family=${encodeURIComponent(f.name)}" style="--fam:${f.color}">
      ${rep ? `<img src="${iconSrc(rep.icon)}" alt="" width="44" height="44" loading="lazy" />` : ''}
      <span><b>${esc(f.name)}</b><small>${total} monsters · ${esc(f.jp)}</small></span>
    </a>`;
  }).join('');

  const featured = FEATURED.map((name) => MONSTERS.find((m) => m.name === name))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map(
      (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
        <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
        <span>${esc(m.name)}</span>
        ${rankBadge(m.rank)}
      </a>`,
    )
    .join('');

  const ranks = RANK_INFO.map(
    (r) => `<a class="chapter" href="#/monsters?rank=${r.rank}">
      <span class="rank badge rank-${r.rank}" style="width:38px;height:30px;font-size:15px">${r.rank}</span>
      <span style="flex:1"><b>${esc(r.title)}</b><small>${countBy((m) => m.rank === r.rank)} monsters · ${esc(r.statBand)}</small></span>
    </a>`,
  ).join('');

  return {
    title: 'Home',
    html: `
      <section class="hero">
        <img src="./img/hero.jpg" alt="A great key standing in a sunlit desert ruin" />
        <div class="hero-body">
          <div class="kicker">Offline companion · 3DS / SP</div>
          <h1>The Marvelous Mysterious Key, decoded</h1>
          <p>
            Every monster in <em>Dragon Quest Monsters 2</em> — stats, skill sets, families, eggs, items and the
            full seven-chapter walkthrough — in unofficial English, stored entirely on this device.
          </p>
          <div class="hero-stats">
            <div><strong>${fmt(MONSTERS.length)}</strong><span>monsters</span></div>
            <div><strong>${fmt(SKILLS.length)}</strong><span>skill sets</span></div>
            <div><strong>${fmt(countBy((m) => m.obtain.eggs !== undefined))}</strong><span>egg monsters</span></div>
            <div><strong>7</strong><span>chapters</span></div>
          </div>
        </div>
      </section>

      <div class="notice info">
        <p>
          <strong>English terminology.</strong> This compendium uses the unofficial English names for the 3DS
          release (<em>Iru and Luca’s Marvelous Mysterious Key</em>): families, ranks, skill sets, traits and items
          are all in English, with the original Japanese name kept on every record as a cross-reference.
        </p>
      </div>

      <section class="home-section">
        <h2>Browse the dex</h2>
        <div class="grid cols-4">${families}</div>
      </section>

      <section class="home-section">
        <h2>By rank</h2>
        <div class="chapter-list">${ranks}</div>
      </section>

      <section class="home-section">
        <h2>Start here</h2>
        <div class="grid auto">${featured}</div>
      </section>

      <section class="home-section">
        <h2>Jump in</h2>
        <div class="grid cols-3">
          <a class="tile" href="#/chart"><strong>Walkthrough</strong><span>Seven chapters, world by world, with the keys and dungeons.</span></a>
          <a class="tile" href="#/skills"><strong>Skill sets</strong><span>${SKILLS.length} skill sets, each showing every monster that learns it.</span></a>
          <a class="tile" href="#/eggs"><strong>Egg dex</strong><span>What hatches from white, silver, gold and rainbow eggs.</span></a>
          <a class="tile" href="#/tools"><strong>Team builder</strong><span>Sum up the stat caps of up to three monsters.</span></a>
          <a class="tile" href="#/weapons"><strong>Weapons</strong><span>Seven weapon types, forging and the shop list.</span></a>
          <a class="tile" href="#/about"><strong>About the data</strong><span>Where the numbers come from and what “offline” means here.</span></a>
        </div>
      </section>

      <section class="home-section">
        <h2>The game</h2>
        <div class="card">
          <dl class="dl">
            <dt>Title</dt><dd>${esc(SITE_NOTES.game)}<br /><span class="jp">${esc(SITE_NOTES.gameJp)}</span></dd>
            <dt>Platform</dt><dd>${esc(SITE_NOTES.platform)}</dd>
            <dt>Data source</dt><dd>${esc(SITE_NOTES.source)} — compiled for offline use</dd>
          </dl>
        </div>
      </section>
    `,
  };
}
