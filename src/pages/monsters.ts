import type { Page } from '../app';
import {
  FAMILIES,
  FAMILY_COLOR,
  MONSTERS,
  RANKS,
  RESIST_KEYS,
  RESIST_LABELS,
  RESIST_LEVELS,
  SIZES,
  SKILL_BY_NAME,
  STAT_LABELS,
  STAT_MAX,
  TRAIT_DESC,
  TRAIT_DETAIL_BY_JP,
  WEAPON_TYPES,
  effectKey,
  esc,
  famBadge,
  fmt,
  hashFor,
  iconSrc,
  isFavourite,
  miniMon,
  monsterCell,
  rankBadge,
  recipeHtml,
  replaceHash,
  sizeBadge,
  sortMonsters,
  toast,
  toggleFavourite,
  traitDesc as traitDescEn,
  traitHref,
} from '../lib';
import type { Monster } from '../lib';
import { traitEn } from '../i18n';
import { skillEntryHtml } from './reference';

const PAGE_SIZE = 100;

interface ListState {
  rank: string;
  family: string;
  size: string;
  letter: string;
  q: string;
  sort: string;
  page: number;
}

function readState(params: URLSearchParams): ListState {
  return {
    rank: params.get('rank') ?? '',
    family: params.get('family') ?? '',
    size: params.get('size') ?? '',
    letter: (params.get('letter') ?? '').toUpperCase(),
    q: params.get('q') ?? '',
    sort: params.get('sort') ?? 'dex',
    page: Math.max(1, Number(params.get('page') ?? '1') || 1),
  };
}

function stateHash(s: ListState): string {
  return hashFor('monsters', {
    rank: s.rank,
    family: s.family,
    size: s.size,
    letter: s.letter || undefined,
    q: s.q,
    sort: s.sort === 'dex' ? undefined : s.sort,
    page: s.page > 1 ? String(s.page) : undefined,
  });
}

function filter(state: ListState): Monster[] {
  const q = state.q.trim().toLowerCase();
  const list = MONSTERS.filter((m) => {
    if (state.rank && m.rank !== state.rank) return false;
    if (state.family && m.family !== state.family) return false;
    if (state.size && m.size !== state.size) return false;
    if (state.letter && !m.name.toUpperCase().startsWith(state.letter)) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.jp.includes(state.q.trim()) ||
      m.skill.toLowerCase().includes(q) ||
      m.family.toLowerCase().includes(q)
    );
  });
  return sortMonsters(list, state.sort);
}

function rows(list: Monster[]): string {
  return list
    .map(
      (m) => `<tr style="--fam:${FAMILY_COLOR[m.family] ?? '#3d4658'}">
        <td class="num muted">${m.no ?? '—'}</td>
        <td>${monsterCell(m)}</td>
        <td>${rankBadge(m.rank)}</td>
        <td>${famBadge(m.family)}</td>
        <td>${sizeBadge(m.size)}</td>
        <td class="num">${fmt(m.total)}</td>
        <td><a href="${hashFor(`skill/${encodeURIComponent(m.skill)}`)}">${esc(m.skill)}</a></td>
      </tr>`,
    )
    .join('');
}

export function renderList(params: URLSearchParams): Page {
  const state = readState(params);
  const list = filter(state);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(state.page, pages);
  const slice = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const rankChips = ['', ...RANKS]
    .map(
      (r) =>
        `<a href="${hashFor('monsters', { rank: r || undefined, family: state.family || undefined, size: state.size || undefined, q: state.q || undefined, sort: state.sort === 'dex' ? undefined : state.sort })}" class="${state.rank === r ? 'active' : ''}">${r || 'All'}</a>`,
    )
    .join('');
  const familyChips = ['', ...FAMILIES]
    .map(
      (f) =>
        `<a href="${hashFor('monsters', { rank: state.rank || undefined, family: f || undefined, size: state.size || undefined, q: state.q || undefined, sort: state.sort === 'dex' ? undefined : state.sort })}" class="${state.family === f ? 'active' : ''}">${esc(f || 'All')}</a>`,
    )
    .join('');
  const letters = Array.from(new Set(MONSTERS.map((m) => m.name.charAt(0).toUpperCase()))).sort();
  const letterChips = ['', ...letters]
    .map(
      (l) =>
        `<a href="${hashFor('monsters', { rank: state.rank || undefined, family: state.family || undefined, size: state.size || undefined, q: state.q || undefined, sort: state.sort === 'dex' ? undefined : state.sort, letter: l || undefined })}" class="${state.letter === l ? 'active' : ''}">${esc(l || 'All')}</a>`,
    )
    .join('');
  const sizeChips = ['', ...SIZES]
    .map(
      (s) =>
        `<a href="${hashFor('monsters', { rank: state.rank || undefined, family: state.family || undefined, size: s || undefined, q: state.q || undefined, sort: state.sort === 'dex' ? undefined : state.sort })}" class="${state.size === s ? 'active' : ''}">${esc(s || 'All')}</a>`,
    )
    .join('');

  const sortOptions: [string, string][] = [
    ['dex', 'Dex number'],
    ['name', 'Name (A–Z)'],
    ['rank', 'Rank (F → SS)'],
    ['rank-desc', 'Rank (SS → F)'],
    ['total', 'Stat total'],
    ['hp', 'HP'],
    ['mp', 'MP'],
    ['atk', 'Attack'],
    ['def', 'Defence'],
    ['agi', 'Agility'],
    ['wis', 'Wisdom'],
  ];

  const pager = Array.from({ length: pages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pages || Math.abs(p - current) <= 2)
    .map((p, i, arr) => {
      const prev = arr[i - 1];
      const gap = prev !== undefined && p - prev > 1 ? '<span class="muted" style="padding:0 4px">…</span>' : '';
      return `${gap}<a class="btn ${p === current ? 'primary' : ''}" href="${stateHash({ ...state, page: p })}" ${p === current ? 'aria-current="page"' : ''}>${p}</a>`;
    })
    .join('');

  return {
    title: state.rank ? `Rank ${state.rank} monsters` : 'Monster dex',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Monsters</span></nav>
      <div class="page-head">
        <h1>Monster dex</h1>
        <p class="lede">
          All ${MONSTERS.length} monsters from the 3DS/SP version, with rank, family, body size, base stat total and
          signature skill set. Filter by rank, family or size, or sort by any stat to find the strongest caps.
        </p>
        <div class="meta">
          <span class="badge tag">${MONSTERS.length} records</span>
          <span class="badge tag-gold">English (unofficial)</span>
          <span class="badge size">Japanese name on each record</span>
        </div>
      </div>

      <section class="filters">
        <div class="filter-row"><span class="label">Rank</span><div class="chip-row">${rankChips}</div></div>
        <div class="filter-row"><span class="label">Family</span><div class="chip-row">${familyChips}</div></div>
        <div class="filter-row"><span class="label">Size</span><div class="chip-row">${sizeChips}</div></div>
        <div class="filter-row"><span class="label">Letter</span><div class="chip-row">${letterChips}</div></div>
        <div class="filter-row">
          <span class="label">Search</span>
          <input id="mSearch" class="field" type="search" placeholder="Name, Japanese name or skill…" value="${esc(state.q)}" style="flex:1;min-width:220px" />
          <select id="mSort" class="field">
            ${sortOptions.map(([v, label]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
          <a class="btn ghost" href="#/monsters">Reset</a>
        </div>
      </section>

      <div class="result-count">
        <span id="mCount">${list.length} monster${list.length === 1 ? '' : 's'}${state.q ? ` matching “${esc(state.q)}”` : ''}</span>
        <span>Page ${current} of ${pages}</span>
      </div>

      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th class="num" data-sort="dex">No.</th>
              <th>Monster</th>
              <th>Rank</th>
              <th>Family</th>
              <th>Size</th>
              <th class="num">Total</th>
              <th>Skill set</th>
            </tr>
          </thead>
          <tbody id="mBody">${rows(slice)}</tbody>
        </table>
      </div>
      ${pages > 1 ? `<div class="pager">${pager}</div>` : ''}
    `,
    mount: () => {
      const search = document.getElementById('mSearch') as HTMLInputElement | null;
      const sort = document.getElementById('mSort') as HTMLSelectElement | null;
      const body = document.getElementById('mBody');
      const count = document.getElementById('mCount');
      const wrap = document.querySelector('.table-wrap');

      const paint = (): void => {
        const next = filter(state);
        const pagesNow = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        state.page = Math.min(state.page, pagesNow);
        if (body) body.innerHTML = rows(next.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE));
        if (count) count.textContent = `${next.length} monster${next.length === 1 ? '' : 's'}${state.q ? ` matching “${state.q}”` : ''}`;
        if (wrap) wrap.scrollTop = 0;
        replaceHash(stateHash(state));
      };

      search?.addEventListener('input', () => {
        state.q = search.value;
        state.page = 1;
        paint();
      });
      sort?.addEventListener('change', () => {
        state.sort = sort.value;
        state.page = 1;
        paint();
      });
      document.querySelectorAll<HTMLTableCellElement>('th[data-sort]').forEach((th) => {
        th.classList.add('sortable');
        th.addEventListener('click', () => {
          state.sort = state.sort === 'total' ? 'dex' : 'total';
          if (sort) sort.value = state.sort;
          paint();
        });
      });
    },
  };
}

/* --------------------------------------------------------------- detail page */

function statGrid(m: Monster): string {
  return STAT_LABELS.map(([key, label]) => {
    const value = m.stats[key] ?? 0;
    const pct = Math.round((value / STAT_MAX[key]) * 100);
    return `<div class="stat">
      <div class="k">${label}</div>
      <div class="v">${fmt(value)}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }).join('');
}

/* ------------------------------------------------------- traits / resist / skill points */

/** Trait name, linked to its own page when the reference has one. */
function traitLabel(jp: string): string {
  const en = traitEn(jp);
  const text = en
    ? `<strong>${esc(en)}</strong> <span class="jp">${esc(jp)}</span>`
    : `<strong lang="ja">${esc(jp)}</strong>`;
  return TRAIT_DETAIL_BY_JP.has(jp) ? `<a href="${traitHref(jp)}">${text}</a>` : text;
}

/** English effect first, with the reference's own wording underneath. */
function traitDesc(jp: string): string {
  const detail = TRAIT_DETAIL_BY_JP.get(jp);
  if (!detail) {
    const lines = TRAIT_DESC[jp];
    return lines ? `<div class="small muted" lang="ja">${lines.map((l) => esc(l)).join(' ')}</div>` : '';
  }
  const en = traitDescEn(detail.effect);
  const source = `<div class="small muted" lang="ja">${esc(effectKey(detail.effect))}</div>`;
  return en ? `<div class="small muted">${esc(en)}</div>${source}` : source;
}

function traitsBlock(m: Monster): string {
  const base = m.traits.base
    .map((t) => `<li>${traitLabel(t)}${traitDesc(t)}</li>`)
    .join('');
  const plus = m.traits.plus
    .map(
      (t) => `<tr>
        <td><span class="badge tag-gold">${esc(t.tier)}</span></td>
        <td>${traitLabel(t.name)}${traitDesc(t.name)}</td>
      </tr>`,
    )
    .join('');
  const size = m.traits.size
    .map(
      (t) => `<tr>
        <td><span class="badge size">${esc(t.size)}</span></td>
        <td>${traitLabel(t.name)}${traitDesc(t.name)}</td>
      </tr>`,
    )
    .join('');

  return `<section class="card">
    <div class="card-head"><h2>Traits</h2><span class="muted small">特性</span></div>
    <div class="grid cols-2">
      <div>
        <h3 class="small muted" style="margin:0 0 8px">Body &amp; innate</h3>
        <ul class="trait-list">${base || '<li class="muted">Not recorded.</li>'}</ul>
      </div>
      <div>
        <h3 class="small muted" style="margin:0 0 8px">Unlocked by plus value and body size</h3>
        <div class="table-wrap"><table class="data" style="font-size:13px">
          <thead><tr><th>Tier</th><th>Trait</th></tr></thead>
          <tbody>${plus}${size}</tbody>
        </table></div>
      </div>
    </div>
    <p class="small muted" style="margin:10px 0 0">
      Each trait opens its own page, with the English effect first and the reference's Japanese wording underneath.
      Traits the reference keeps off its own index (the AI-action variants and the small HP-growth bonus) have no
      page to open. +25 / +50 / +★ are the plus-value thresholds, M / G / Super G the body sizes that unlock the
      last three traits.
    </p>
  </section>`;
}

function resistBlock(m: Monster): string {
  const cells = RESIST_KEYS.map((key, i) => {
    const code = m.resist[i];
    const level = code === null || code === undefined ? 'Unknown' : RESIST_LEVELS[code];
    return `<div class="resist-cell lvl-${code ?? 'x'}" title="${esc(key)}">
      <span class="k">${esc(RESIST_LABELS[key] ?? key)}</span>
      <span class="v">${esc(level)}</span>
    </div>`;
  }).join('');
  const known = m.resist.filter((v) => v !== null && v !== undefined).length;

  return `<section class="card">
    <div class="card-head"><h2>Resistances</h2><span class="muted small">耐性 · ${known}/30 recorded</span></div>
    <div class="resist-grid">${cells}</div>
    <p class="small muted" style="margin:10px 0 0">
      Weak · Half · Reduced · Null · Absorb · Reflect are the resistance steps used by the source, strongest last.
      Hover a slot for its Japanese label.
    </p>
  </section>`;
}

function weaponsBlock(m: Monster): string {
  const owned = m.weapons ?? [];
  const chips = WEAPON_TYPES.map(
    (w) =>
      `<span class="badge ${owned.includes(w) ? 'tag' : ''}" style="${
        owned.includes(w) ? '' : 'opacity:.4'
      }"${owned.includes(w) ? '' : ' aria-disabled="true"'}>${esc(w)}</span>`,
  ).join(' ');

  return `<section class="card">
    <div class="card-head"><h2>Equippable weapons</h2><span class="muted small">装備できる武器 · ${owned.length}/${WEAPON_TYPES.length}</span></div>
    ${
      owned.length
        ? `<div class="badge-list">${chips}</div>`
        : `<p class="small muted" style="margin:0">This monster cannot equip any of the seven weapon types.</p>`
    }
  </section>`;
}

function skillPointBlock(m: Monster): string {
  const skill = SKILL_BY_NAME.get(m.skill);
  const rows = skill?.sp ?? [];
  return `<section class="card">
    <div class="card-head">
      <h2>Skill set progression</h2>
      <a class="small" href="${hashFor(`skill/${encodeURIComponent(m.skill)}`)}">${esc(m.skill)}</a>
    </div>
    ${
      rows.length
                    ? `<div class="table-wrap"><table class="data" style="font-size:13px">
            <thead><tr><th class="num">SP</th><th>Learns</th></tr></thead>
            <tbody>${rows
              .map((r) => `<tr><td class="num">${r.sp}</td><td>${skillEntryHtml(r)}</td></tr>`)
              .join('')}</tbody>
          </table></div>
          <p class="small muted" style="margin:10px 0 0">
            Skill points needed, in the order the set unlocks them. Each entry opens its ability or trait page.
          </p>`
        : `<p class="small muted" style="margin:0">No skill-point table recorded for this set.</p>`
    }
  </section>`;
}

function synthesisBlock(m: Monster): string {
  const b = m.breed;
  if (!b) return '';
  const recipes = b.recipes;
  return `<section class="card">
    <div class="card-head"><h2>Synthesis</h2><span class="muted small">位階配合 · 特殊配合</span></div>
    <dl class="dl">
      <dt>Rank value</dt><dd>${b.rankNo} <span class="muted small">(位階No.)</span></dd>
      <dt>Rank synthesis</dt><dd>${
        b.rankSynth
          ? 'Yes — produceable by the 位階 ladder'
          : 'No — not a result of the 位階 ladder'
      }</dd>
      <dt>Special synthesis</dt><dd>${b.specialSynth ? 'Yes — a recipe produces it' : 'No'}</dd>
    </dl>
    ${
      recipes.length
        ? `<h3 class="small muted" style="margin:12px 0 8px">Recipes that produce it</h3>
           ${recipes.map((r) => `<div class="card" style="margin-bottom:10px">${recipeHtml(r, m)}</div>`).join('')}`
        : `<p class="small muted" style="margin:12px 0 0">The source page records no special recipe for this monster.${
            b.rankSynth ? ' Use the rank ladder: a same-family pair above its rank value can produce it.' : ''
          }</p>`
    }
    <a class="btn" style="margin-top:12px" href="${hashFor('breeding', { a: m.id })}>Open in the synthesis calculator</a>
  </section>`;
}

function obtainBlock(m: Monster): string {
  const o = m.obtain;
  const rows: string[] = [];
  if (o.rebirth) {
    const base = MONSTERS.find((x) => x.name === o.rebirth?.of || x.jp === o.rebirth?.of);
    rows.push(
      `<dt>Rebirth of</dt><dd>${base ? miniMon(base) : `<strong lang="ja">${esc(o.rebirth.of)}</strong>`}</dd>`,
    );
  }
  if (o.where) rows.push(`<dt>Habitat</dt><dd>${esc(o.where)}</dd>`);
  if (o.rebirth?.where && o.rebirth.where !== o.where) {
    rows.push(`<dt>Rebirth location</dt><dd>${esc(o.rebirth.where)}</dd>`);
  }
  if (o.masterWorld) rows.push(`<dt>Other-world master</dt><dd>${esc(o.masterWorld)}</dd>`);
  if (o.eggs?.length) {
    const names = o.eggs.map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(', ');
    rows.push(`<dt>Eggs</dt><dd>${o.dream ? 'Dream egg' : 'Egg'} — ${esc(names)}</dd>`);
  }
  if (o.alchemy) {
    const label = o.alchemy === 'boss' ? 'Boss appearance' : o.alchemy === 'reward' ? 'Reward appearance' : 'Normal appearance';
    rows.push(`<dt>Alchemy key</dt><dd>${esc(label)}</dd>`);
  }
  if (o.other) rows.push(`<dt>Special</dt><dd>${esc(o.other)}</dd>`);
  if (!rows.length) rows.push(`<dt>Obtain</dt><dd class="muted">Synthesised, event-only or boss encounter — see the walkthrough.</dd>`);
  return `<dl class="dl">${rows.join('')}</dl>`;
}

export function renderDetail(id: string): Page {
  const m = MONSTERS.find((x) => x.id === id);
  if (!m) {
    return {
      title: 'Monster not found',
      html: `<div class="card"><h1>Monster not found</h1><p>No record with the id <code>${esc(id)}</code>.</p><p><a href="#/monsters">Back to the dex</a></p></div>`,
    };
  }

  const skill = SKILL_BY_NAME.get(m.skill);
  const index = MONSTERS.indexOf(m);
  const prev = MONSTERS[index - 1];
  const next = MONSTERS[index + 1];
  const relatives = MONSTERS.filter((x) => x.family === m.family && x.id !== m.id).slice(0, 12);
  const fav = isFavourite(m.id);
  const skillsSection = skillPointBlock(m);
  const traitsSection = traitsBlock(m);
  const resistSection = resistBlock(m);
  const weaponsSection = weaponsBlock(m);

  return {
    title: m.name,
    html: `
      <nav class="breadcrumb">
        <a href="#/">Home</a><span class="sep">/</span><a href="#/monsters">Monsters</a><span class="sep">/</span>
        <a href="#/monsters?family=${encodeURIComponent(m.family)}">${esc(m.family)}</a><span class="sep">/</span>
        <span>${esc(m.name)}</span>
      </nav>

      <section class="mon-hero" style="--fam:${FAMILY_COLOR[m.family] ?? '#c8862b'}">
        <div class="portrait"><img src="${iconSrc(m.icon)}" alt="${esc(m.name)}" width="140" height="140" /></div>
        <div>
          <div class="dex">${m.no ? `No. ${String(m.no).padStart(3, '0')}` : 'No dex number'} · ${esc(m.size)} body</div>
          <h1>${esc(m.name)}</h1>
          <div class="jp">${esc(m.jp)}</div>
          <div class="badges">
            ${rankBadge(m.rank)} ${famBadge(m.family)} ${sizeBadge(m.size)}
            <span class="badge tag">Total ${fmt(m.total)}</span>
          </div>
          <p class="skill-line">
            Signature skill set:
            <a href="${hashFor(`skill/${encodeURIComponent(m.skill)}`)}"><strong>${esc(m.skill)}</strong></a>
            ${skill ? `<span class="muted">(${skill.count} monster${skill.count === 1 ? '' : 's'} share it)</span>` : ''}
          </p>
          <button class="btn fav-btn" id="favBtn" aria-pressed="${fav}">${fav ? '★ In favourites' : '☆ Add to favourites'}</button>
        </div>
      </section>

      <div class="grid cols-2">
        <section class="card">
          <div class="card-head"><h2>Base stats</h2><span class="muted small">3DS values</span></div>
          <div class="stat-grid">${statGrid(m)}</div>
          <p class="muted small" style="margin-top:10px;margin-bottom:0">
            Bars are scaled against the highest base value found anywhere in the dex
            (HP ${fmt(STAT_MAX.hp)}, Attack ${fmt(STAT_MAX.atk)}).
          </p>
        </section>

        <section class="card">
          <div class="card-head"><h2>How to obtain</h2></div>
          ${obtainBlock(m)}
          <div class="badge-list" style="margin-top:12px">
            ${m.obtain.eggs?.length ? '<span class="badge tag-gold">Hatchable</span>' : ''}
            ${m.obtain.masterWorld ? '<span class="badge tag">Scout from an other-world master</span>' : ''}
            ${m.obtain.rebirth ? '<span class="badge tag-gold">Rebirth monster</span>' : ''}
            ${m.obtain.alchemy ? '<span class="badge tag">Alchemy key</span>' : ''}
            ${m.family === '???' ? '<span class="badge tag-red">Cannot be scouted</span>' : ''}
          </div>
        </section>
      </div>

      ${synthesisBlock(m)}

      ${skillsSection}

      ${traitsSection}

      ${resistSection}

      ${weaponsSection}

      <section class="card">
        <div class="card-head"><h2>More ${esc(m.family)} monsters</h2><a class="small" href="#/monsters?family=${encodeURIComponent(m.family)}">See all</a></div>
        <div class="grid auto">
          ${relatives
            .map(
              (r) => `<a class="mini-mon" href="#/monster/${encodeURIComponent(r.id)}">
                <img src="${iconSrc(r.icon)}" alt="" width="28" height="28" loading="lazy" />
                <span>${esc(r.name)}</span>${rankBadge(r.rank)}
              </a>`,
            )
            .join('')}
        </div>
      </section>

      <div class="chapter-list" style="margin-bottom:18px">
        ${prev ? `<a class="chapter" href="#/monster/${encodeURIComponent(prev.id)}"><span class="no">←</span><span><small>Previous</small><b>${esc(prev.name)}</b></span></a>` : ''}
        ${next ? `<a class="chapter" href="#/monster/${encodeURIComponent(next.id)}"><span class="no">→</span><span><small>Next</small><b>${esc(next.name)}</b></span></a>` : ''}
      </div>
    `,
    mount: () => {
      const btn = document.getElementById('favBtn');
      btn?.addEventListener('click', () => {
        const on = toggleFavourite(m.id);
        btn.setAttribute('aria-pressed', String(on));
        btn.textContent = on ? '★ In favourites' : '☆ Add to favourites';
        toast(on ? `${m.name} added to favourites` : `${m.name} removed from favourites`);
      });
    },
  };
}
