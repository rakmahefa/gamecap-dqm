import type { Page } from '../app';
import { ARENA, CHAPTERS, DREAM_EGGS, EGG_INFO } from '../data/extras';
import { MONSTERS, esc, famBadge, fmt, hashFor, iconSrc, rankBadge } from '../lib';
import type { Monster } from '../lib';

/* ------------------------------------------------------------------ chart */

const REALM_BY_SLUG: Record<string, string> = {
  desert: 'Desert Realm',
  water: 'Water Realm',
  snow: 'Snow & Ice Realm',
  sky: 'Sky Realm',
  rift: 'Rift Realm',
  ultimate: 'Ultimate',
  mistletoe: 'Mistletoe',
};

export function renderChart(slug?: string): Page {
  if (!slug) {
    return {
      title: 'Walkthrough',
      html: `
        <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Walkthrough</span></nav>
        <div class="page-head">
          <h1>Walkthrough</h1>
          <p class="lede">
            Seven chapters, one per key. Each page lists the key item, the towns and dungeons of that world, the
            objectives in order, and the monsters the dex records for that realm.
          </p>
        </div>
        <div class="chapter-list">
          ${CHAPTERS.map(
            (c) => `<a class="chapter" href="${hashFor(`chart/${c.slug}`)}">
              <span class="no">${esc(c.number)}</span>
              <span style="flex:1"><b>${esc(c.title)}</b><small>${esc(c.keyItem)} · ${esc(c.towns.length)} towns · ${esc(c.dungeons.length)} dungeons</small></span>
            </a>`,
          ).join('')}
        </div>
        <div class="grid cols-2" style="margin-top:18px">
          <a class="tile" href="#/eggs"><strong>Egg dex</strong><span>Every egg colour and the monsters that hatch from it.</span></a>
          <a class="tile" href="#/arena"><strong>Monster arena</strong><span>Cups, classes and the daily events.</span></a>
        </div>
      `,
    };
  }

  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) {
    return {
      title: 'Chapter not found',
      html: `<div class="card"><h1>Chapter not found</h1><p><a href="#/chart">Back to the walkthrough</a></p></div>`,
    };
  }

  const realm = REALM_BY_SLUG[chapter.slug] ?? chapter.realm;
  const found = MONSTERS.filter((m) => (m.obtain.where ?? '').includes(realm)).slice(0, 40);
  const index = CHAPTERS.indexOf(chapter);
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];

  return {
    title: `${chapter.number}. ${chapter.title}`,
    html: `
      <nav class="breadcrumb">
        <a href="#/">Home</a><span class="sep">/</span><a href="#/chart">Walkthrough</a><span class="sep">/</span>
        <span>${esc(chapter.title)}</span>
      </nav>
      <div class="page-head">
        <h1>${esc(chapter.number)}. ${esc(chapter.title)}</h1>
        <div class="meta">
          <span class="badge tag-gold">Key item: ${esc(chapter.keyItem)}</span>
          <span class="badge tag">${esc(chapter.realm)}</span>
        </div>
        <p class="lede" style="margin-top:10px">${esc(chapter.blurb)}</p>
      </div>

      <div class="grid cols-2">
        <section class="card">
          <div class="card-head"><h2>Objectives</h2></div>
          <ol class="steps">
            ${chapter.objectives.map((o) => `<li><b>${esc(o)}</b></li>`).join('')}
          </ol>
        </section>
        <div>
          <section class="card">
            <div class="card-head"><h2>Towns</h2></div>
            <div class="badge-list">${chapter.towns.map((t) => `<span class="badge tag">${esc(t)}</span>`).join('')}</div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Dungeons &amp; landmarks</h2></div>
            <div class="badge-list">${chapter.dungeons.map((t) => `<span class="badge size">${esc(t)}</span>`).join('')}</div>
          </section>
        </div>
      </div>

      <section class="card">
        <div class="card-head"><h2>Monsters recorded in this realm</h2><span class="muted small">${found.length} shown</span></div>
        ${
          found.length
            ? `<div class="grid auto">${found
                .map(
                  (m: Monster) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                    <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
                    <span>${esc(m.name)}</span>${rankBadge(m.rank)}
                  </a>`,
                )
                .join('')}</div>`
            : `<p class="muted">This realm’s encounters are dungeon-specific — use the dex filters instead.</p>`
        }
      </section>

      <div class="chapter-list" style="margin-bottom:18px">
        ${prev ? `<a class="chapter" href="${hashFor(`chart/${prev.slug}`)}"><span class="no">←</span><span><small>Previous chapter</small><b>${esc(prev.title)}</b></span></a>` : ''}
        ${next ? `<a class="chapter" href="${hashFor(`chart/${next.slug}`)}"><span class="no">→</span><span><small>Next chapter</small><b>${esc(next.title)}</b></span></a>` : ''}
      </div>
    `,
  };
}

/* ------------------------------------------------------------------ eggs */

export function renderEggs(): Page {
  const sections = EGG_INFO.map((egg) => {
    const list = MONSTERS.filter((m) => m.obtain.eggs?.includes(egg.id) && !m.obtain.dream);
    const dream = MONSTERS.filter((m) => m.obtain.eggs?.includes(egg.id) && m.obtain.dream);
    return { egg, list, dream };
  });

  return {
    title: 'Egg dex',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Eggs</span></nav>
      <div class="page-head">
        <h1>Egg dex</h1>
        <p class="lede">
          Eggs are bought, found in chests or received over StreetPass, then carried until they hatch. Colour
          decides the pool: white eggs give rank F–D monsters, rainbow eggs give SS-rank monsters.
        </p>
      </div>

      <div class="grid cols-4">
        ${EGG_INFO.map(
          (e) => `<div class="card" style="text-align:center">
            <div class="egg egg-${e.id}" style="margin:6px auto 10px"></div>
            <strong>${esc(e.name)}</strong>
            <div class="jp">${esc(e.jp)}</div>
            <p class="small muted" style="margin-top:6px">${esc(e.blurb)}</p>
            <div class="badge tag-gold">${esc(e.price)}</div>
          </div>`,
        ).join('')}
      </div>

      ${sections
        .map(
          ({ egg, list, dream }) => `<section class="card">
            <div class="card-head">
              <h2><span class="egg egg-${egg.id}" style="width:20px;height:26px;display:inline-block;vertical-align:-6px;margin-right:8px"></span>${esc(egg.name)}</h2>
              <span class="muted small">${list.length} monster${list.length === 1 ? '' : 's'}</span>
            </div>
            <div class="grid auto">
              ${list
                .map(
                  (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                    <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
                    <span>${esc(m.name)}</span>${rankBadge(m.rank)}
                  </a>`,
                )
                .join('')}
            </div>
            ${
              dream.length
                ? `<h3 style="margin-top:16px">Dream egg pool</h3>
                   <p class="small muted">These appear from the dream version of the ${esc(egg.name.toLowerCase())}.</p>
                   <div class="grid auto">${dream
                     .map(
                       (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                         <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
                         <span>${esc(m.name)}</span>${rankBadge(m.rank)}
                       </a>`,
                     )
                     .join('')}</div>`
                : ''
            }
          </section>`,
        )
        .join('')}

      <section class="card">
        <div class="card-head"><h2>Dream eggs</h2><span class="muted small">StreetPass &amp; events</span></div>
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Egg</th><th>Japanese</th><th>Notes</th></tr></thead>
            <tbody>
              ${DREAM_EGGS.map(
                (d) => `<tr><td><strong>${esc(d.name)}</strong></td><td class="jp">${esc(d.jp)}</td><td>${esc(d.note)}</td></tr>`,
              ).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <div class="notice">
        <p>
          Egg pools are generated from the obtain data recorded for every monster in this compendium:
          <strong>${fmt(MONSTERS.filter((m) => m.obtain.eggs).length)}</strong> monsters can hatch from an egg.
        </p>
      </div>
    `,
  };
}

/* ------------------------------------------------------------------ arena */

export function renderArena(): Page {
  return {
    title: 'Monster arena',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Monster arena</span></nav>
      <div class="page-head">
        <h1>Monster arena</h1>
        <p class="lede">
          Greatlog’s arena runs a bracket for every class. You enter with a team of up to three monsters and the
          arena decides the rules; rewards scale with the class and with the day’s event.
        </p>
      </div>
      <div class="grid cols-2">
        ${ARENA.map(
          (a) => `<div class="card">
            <div class="card-head"><h2>${esc(a.title)}</h2><span class="badge rank rank-${esc(a.cls === 'Kids' || a.cls === 'Event' ? 'A' : a.cls)}">${esc(a.cls)}</span></div>
            <p class="small muted">${esc(a.blurb)}</p>
          </div>`,
        ).join('')}
      </div>
      <div class="notice info">
        <p>
          <strong>Team sizing.</strong> A battle team holds three body slots: an S monster takes one, M takes two,
          G takes three. Mixed teams are fine — the arena only checks the total.
        </p>
      </div>
      <section class="card">
        <div class="card-head"><h2>Useful arena monsters</h2><a class="small" href="#/monsters?sort=total">Highest stat totals</a></div>
        <div class="grid auto">
          ${MONSTERS.slice()
            .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
            .slice(0, 12)
            .map(
              (m) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
                <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
                <span>${esc(m.name)}</span>${rankBadge(m.rank)}
              </a>`,
            )
            .join('')}
        </div>
      </section>
    `,
  };
}

export function renderFamilyLegend(): string {
  return ['Slime', 'Dragon', 'Nature', 'Beast', 'Material', 'Demon', 'Zombie', '???']
    .map((f) => famBadge(f))
    .join(' ');
}
