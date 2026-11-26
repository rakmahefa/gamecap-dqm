import type { Page } from '../app';
import { GUIDES, GUIDE_BY_ID } from '../data/guides';
import type { GuideSection } from '../data/guides';
import { KAMEHA, MONSTER_BY_ID, MONSTER_BY_JP, RANKS, esc, hashFor, miniMon, rankBadge } from '../lib';
import { itemEn } from '../i18n';

/** One section: heading, paragraphs, bullets, optional table and a note. */
function section(s: GuideSection): string {
  const table = s.table
    ? `<div class="table-wrap"><table class="data">
        <thead><tr>${s.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows
          .map(
            (r) =>
              `<tr>${r
                .map((cell, i) => `<td${i === 0 ? ' class="num"' : ''}>${cellHtml(cell)}</td>`)
                .join('')}</tr>`,
          )
          .join('')}</tbody>
      </table></div>`
    : '';
  return `<section class="card">
    <div class="card-head"><h2>${esc(s.heading)}</h2>${s.jp ? `<span class="muted small" lang="ja">${esc(s.jp)}</span>` : ''}</div>
    ${(s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}
    ${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    ${table}
    ${s.note ? `<p class="small muted" style="margin:10px 0 0">${esc(s.note)}</p>` : ''}
  </section>`;
}

/** A table cell: a known monster becomes a link, an item gets its English name. */
function cellHtml(cell: string): string {
  const monster = MONSTER_BY_JP.get(cell.replace(/\s*[（(].*$/, '').trim());
  if (monster) return miniMon(monster);
  const item = itemEn(cell);
  return item !== cell ? `<strong>${esc(item)}</strong> <span class="jp">${esc(cell)}</span>` : esc(cell);
}

export function renderGuides(): Page {
  return {
    title: 'Guides',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Guides</span></nav>
      <div class="page-head">
        <h1>System guides</h1>
        <p class="lede">
          The reference’s system articles, translated: synthesis and its new-life form, scouting, mini medals, the
          15 scout quests and the SP online matchmaking. The arena and the Kameha exchange are next to them in the
          sidebar.
        </p>
      </div>
      <div class="grid cols-2">
        ${GUIDES.map(
          (g) => `<a class="card" href="${hashFor(`guide/${g.id}`)}" style="text-decoration:none">
            <div class="card-head"><h2>${esc(g.title)}</h2><span class="muted small" lang="ja">${esc(g.jp)}</span></div>
            <p class="small muted" style="margin:0">${esc(g.lede)}</p>
            <p class="small" style="margin:8px 0 0">${g.sections.length} sections →</p>
          </a>`,
        ).join('')}
      </div>
    `,
  };
}

export function renderGuide(id: string): Page {
  const guide = GUIDE_BY_ID.get(id);
  if (!guide) {
    return {
      title: 'Guide not found',
      html: `<div class="card"><h1>Guide not found</h1><p>No guide called <code>${esc(id)}</code>.</p><p><a href="#/guides">All guides</a></p></div>`,
    };
  }
  const index = GUIDES.indexOf(guide);
  return {
    title: guide.title,
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/guides">Guides</a><span class="sep">/</span><span>${esc(guide.title)}</span></nav>
      <div class="page-head">
        <h1>${esc(guide.title)}</h1>
        <div class="jp" lang="ja">${esc(guide.jp)}</div>
        <p class="lede">${esc(guide.lede)}</p>
      </div>
      ${guide.sections.map(section).join('')}
      <div class="notice info">
        <p>
          Translated from the reference article; the Japanese names of items, monsters and skills are kept so they can
          be checked against the source game.
        </p>
      </div>
      <div class="pager">
        ${index > 0 ? `<a class="btn ghost" href="${hashFor(`guide/${GUIDES[index - 1].id}`)}">← ${esc(GUIDES[index - 1].title)}</a>` : '<span></span>'}
        ${index < GUIDES.length - 1 ? `<a class="btn ghost" href="${hashFor(`guide/${GUIDES[index + 1].id}`)}">${esc(GUIDES[index + 1].title)} →</a>` : '<span></span>'}
      </div>
    `,
  };
}

/* ------------------------------------------------------------------ kameha */

const KAMEHA_ROUTES: { key: keyof KamehaFlags; label: string }[] = [
  { key: 'scout', label: 'Scout' },
  { key: 'master', label: 'Other-world master' },
  { key: 'rankBreed', label: 'Rank synthesis' },
  { key: 'specialBreed', label: 'Special synthesis' },
  { key: 'egg', label: 'Egg' },
  { key: 'key', label: 'Alchemy key' },
  { key: 'kameha', label: 'Kameha' },
  { key: 'other', label: 'Other' },
];

interface KamehaFlags {
  scout: boolean;
  master: boolean;
  rankBreed: boolean;
  specialBreed: boolean;
  egg: boolean;
  key: boolean;
  kameha: boolean;
  other: boolean;
}

export function renderKameha(params: URLSearchParams): Page {
  const active = params.get('rank') ?? '';
  const rows = (rank: string): string =>
    KAMEHA.filter((k) => !rank || k.rank === rank)
      .map((k) => {
        const m = k.id ? MONSTER_BY_ID.get(k.id) : undefined;
        return `<tr>
          <td>${rankBadge(k.rank)}</td>
          <td>${
            m
              ? `<a href="#/monster/${encodeURIComponent(m.id)}"><strong>${esc(m.name)}</strong></a><div class="jp">${esc(k.jp)}</div>`
              : `<span lang="ja">${esc(k.jp)}</span>`
          }</td>
          ${KAMEHA_ROUTES.map((r) => `<td>${k[r.key] ? '○' : '<span class="muted">×</span>'}</td>`).join('')}
        </tr>`;
      })
      .join('');

  const counts = RANKS.map((r) => ({ rank: r, n: KAMEHA.filter((k) => k.rank === r).length }));

  return {
    title: 'Kameha exchange',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/guides">Guides</a><span class="sep">/</span><span>Kameha exchange</span></nav>
      <div class="page-head">
        <h1>Kameha prince’s exchange</h1>
        <div class="jp" lang="ja">カメハ王子の不思議な冒険隊</div>
        <p class="lede">
          Hand monsters to the Kameha prince and he hands back a different monster or a stigmata (紋晶). This table
          lists all ${KAMEHA.length} monsters he can give and, for each one, the other routes the reference records.
        </p>
        <div class="meta">
          ${counts.map((c) => `<span class="badge tag">${c.rank} · ${c.n}</span>`).join('')}
        </div>
      </div>
      <section class="filters">
        <div class="filter-row">
          <span class="label">Rank</span>
          <div class="chip-row">
            <a href="#/kameha" class="${active ? '' : 'active'}">All</a>
            ${RANKS.map((r) => `<a href="${hashFor('kameha', { rank: r })}" class="${active === r ? 'active' : ''}">${r}</a>`).join('')}
          </div>
        </div>
      </section>
      <div class="table-wrap">
        <table class="data" style="font-size:13px">
          <thead><tr><th>Rank</th><th>Monster</th>${KAMEHA_ROUTES.map((r) => `<th>${esc(r.label)}</th>`).join('')}</tr></thead>
          <tbody>${rows(active)}</tbody>
        </table>
      </div>
      <div class="notice">
        <p>
          ○ marks a recorded route, × a route the current data does not record for that monster — never a guarantee
          that no other route exists. The stigmata levels depend on how many and which ranks you hand over: a handful
          of monsters already gives Lv3, and eight C-rank or better monsters is the reference’s yardstick for a high
          chance of Lv★.
        </p>
      </div>
    `,
  };
}
