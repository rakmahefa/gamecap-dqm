import type { Page } from '../app';
import {
  ABILITY_DETAIL,
  ABILITY_DETAIL_BY_JP,
  ABILITY_DETAIL_BY_SLUG,
  ABILITY_LIST,
  ABILITY_SETS,
  ITEMS,
  KEY_NAMES,
  KEY_REWARDS,
  MONSTERS_BY_WEAPON,
  MONSTER_BY_ID,
  MONSTER_BY_JP,
  SKILL_BY_JP,
  TRAIT_DETAIL,
  TRAIT_DETAIL_BY_JP,
  TRAIT_DETAIL_BY_SLUG,
  TRAIT_LIST,
  WEAPONS,
  abilityDesc,
  abilityHref,
  esc,
  fmt,
  hashFor,
  miniMon,
  traitDesc,
  traitHref,
  traitSpDesc,
} from '../lib';
import type { AbilityDetail, AbilityEntry, ItemEntry, KeyName, SkillEntry, TraitEntry, WeaponEntry } from '../lib';
import {
  ITEM_CATEGORY_EN,
  QUEST_EN,
  REWARD_EN,
  TAG_EN,
  abilityElementEn,
  abilityEn,
  abilityRangeEn,
  abilityTypeEn,
  elementEn,
  familyEn,
  itemEn,
  keyNameEn,
  noteNumber,
  traitEn,
  weaponEn,
} from '../i18n';

const TRAIT_CATEGORIES: { key: string; label: string }[] = [
  { key: 'Combat', label: 'Combat' },
  { key: 'Resistance', label: 'Resistance' },
  { key: 'Support', label: 'Support' },
  { key: 'Stats', label: 'Stats' },
  { key: 'Drawback', label: 'Drawback' },
];

const ABILITY_TYPES = ['Spell', 'Slash', 'Skill', 'Breath', 'Dance', 'Other'] as const;

function chips(base: string, values: string[], active: string): string {
  return ['All', ...values]
    .map(
      (v) =>
        `<a href="${hashFor(base, { cat: v === 'All' ? undefined : v })}" class="${(active || 'All') === v ? 'active' : ''}">${esc(v)}</a>`,
    )
    .join('');
}

function categoryChips(base: string, values: string[], active: string, label = 'Type'): string {
  return `<div class="filter-row"><span class="label">${esc(label)}</span><div class="chip-row">${chips(base, values, active)}</div></div>`;
}

function spBadge(sp: boolean): string {
  return sp ? ' <span class="badge tag-gold" title="Added in the SP version">SP</span>' : '';
}

/** English name with the Japanese source underneath, as used on every table. */
function bilingual(en: string, jp: string): string {
  return `<strong>${esc(en)}</strong><div class="jp">${esc(jp)}</div>`;
}

/** `ジバリア 3DS版：20pt メガンテ` — the entry plus the note about the 3DS table. */
const VERSION_NOTE = /^(.*?)\s*3DS版：\s*(\S+?)\s*pt\s*(.+)$/;

/** One skill-tree entry, linked to the page the reference points it at. */
function linkedEntry(name: string, kind?: 'ability' | 'trait', slug?: string): string {
  let target: { jp: string; href: string } | undefined;
  if (kind && slug) {
    const hit = kind === 'trait' ? TRAIT_DETAIL_BY_SLUG.get(slug) : ABILITY_DETAIL_BY_SLUG.get(slug);
    if (hit) target = { jp: hit.jp, href: kind === 'trait' ? traitHref(hit.jp) : abilityHref(hit.jp) };
  }
  if (!target) {
    const ability = ABILITY_DETAIL_BY_JP.get(name);
    const trait = TRAIT_DETAIL_BY_JP.get(name);
    if (ability) target = { jp: ability.jp, href: abilityHref(ability.jp) };
    else if (trait) target = { jp: trait.jp, href: traitHref(trait.jp) };
  }
  const en = abilityEn(name) ?? (target ? traitEn(target.jp) : undefined);
  const text = en
    ? `<strong>${esc(en)}</strong> <span class="jp">${esc(name)}</span>`
    : `<span lang="ja">${esc(name)}</span>`;
  return target ? `<a href="${target.href}">${text}</a>` : text;
}

/** A skill-point row: English name, Japanese source, link and any 3DS note. */
export function skillEntryHtml(entry: SkillEntry): string {
  const note = VERSION_NOTE.exec(entry.name);
  const head = note ? note[1].trim() : entry.name;
  const main = linkedEntry(head, entry.kind, entry.slug);
  if (!note) return main;
  const alt = linkedEntry(note[3].trim());
  return `${main}<div class="small muted">3DS version: at ${esc(noteNumber(note[2]))} SP → ${alt}</div>`;
}

/** Monster from a detail page, linked to its dex record where the name matches. */
function detailMonsterLink(m: { jp: string }): string {
  const rec = MONSTER_BY_JP.get(m.jp);
  return rec ? miniMon(rec) : `<span class="badge tag">${esc(m.jp)}</span>`;
}

/** Skill set named on a detail page, linked where the index has it. */
function detailSetLink(s: { jp: string; maxSp?: number }): string {
  const rec = SKILL_BY_JP.get(s.jp);
  const sp = s.maxSp === undefined ? '' : `<span class="muted small"> · max ${s.maxSp} SP</span>`;
  return rec
    ? `<a href="${hashFor(`skill/${encodeURIComponent(rec.name)}`)}">${esc(rec.name)}</a> <span class="jp">${esc(s.jp)}</span>${sp}`
    : `<span lang="ja">${esc(s.jp)}</span>${sp}`;
}

/** `メラ･炎` → `['メラ', '炎']`, the unit the element filter works on. */
function elementTokens(value: string): string[] {
  return value.split(/[･・\s]+/).filter(Boolean);
}

/** `メラ属性` → `Frizz` for the badge on the ability pages. */
function elementLabel(value: string): string {
  return value ? abilityElementEn(value) : '—';
}

/* ------------------------------------------------------------------ traits */

export function renderTraits(params: URLSearchParams): Page {
  const cat = params.get('cat') ?? '';
  const list = TRAIT_LIST.filter((t) => !cat || t.cat === cat)
    .slice()
    .sort((a, b) => (traitEn(a.jp) ?? a.jp).localeCompare(traitEn(b.jp) ?? b.jp));

  return {
    title: 'Traits',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Traits</span></nav>
      <div class="page-head">
        <h1>Traits</h1>
        <p class="lede">
          All ${TRAIT_LIST.length} traits of the reference index, in unofficial English. Traits are passive
          abilities baked into a monster’s body: resistances, extra actions, attack riders and drawbacks, plus the
          traits a monster unlocks at +25, +50 and +★.
        </p>
        <div class="meta">
          <span class="badge tag">${TRAIT_LIST.length} traits</span>
          <span class="badge tag-gold">${TRAIT_LIST.filter((t) => t.sp).length} added in SP</span>
        </div>
      </div>
      <section class="filters">
        ${categoryChips('traits', TRAIT_CATEGORIES.map((c) => c.key), cat)}
        <div class="filter-row">
          <span class="label">Search</span>
          <input id="tSearch" class="field" type="search" placeholder="English or Japanese name, effect…" style="flex:1;min-width:240px" />
        </div>
      </section>
      <div class="result-count"><span id="tCount">${list.length} trait${list.length === 1 ? '' : 's'}</span><span>English rendering · Japanese source text kept</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Trait</th><th>Type</th><th>Effect (source text)</th></tr></thead>
          <tbody id="tBody">
            ${list.map((t) => traitRow(t)).join('')}
          </tbody>
        </table>
      </div>
      <div class="notice" style="margin-top:16px">
        <p>
          Trait names and effects are unofficial English renderings of the Japanese 特性. Every row opens its own
          page with the full effect (SP version included), the monsters that hold the trait as a base trait, at a
          plus value or by body size, the skill sets that grant it and the new-life builds that pass it on. The
          right-hand column keeps the reference’s own wording.
        </p>
      </div>
    `,
    mount: () => {
      const input = document.getElementById('tSearch') as HTMLInputElement | null;
      const body = document.getElementById('tBody');
      const count = document.getElementById('tCount');
      if (!input || !body || !count) return;
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        const rows = list.filter((t) => {
          if (!q) return true;
          const en = (traitEn(t.jp) ?? '').toLowerCase();
          return en.includes(q) || t.jp.includes(q) || t.desc.toLowerCase().includes(q);
        });
        body.innerHTML = rows.map((t) => traitRow(t)).join('');
        count.textContent = `${rows.length} trait${rows.length === 1 ? '' : 's'}`;
      });
    },
  };
}

function traitRow(t: TraitEntry): string {
  const detail = TRAIT_DETAIL_BY_JP.get(t.jp);
  const desc = detail ? traitDesc(detail.effect) : undefined;
  return `<tr>
    <td><a href="${traitHref(t.jp)}">${bilingual(traitEn(t.jp) ?? t.jp, t.jp)}</a>${spBadge(t.sp)}${
      desc ? `<div class="small muted">${esc(desc)}</div>` : ''
    }</td>
    <td><span class="badge ${t.cat === 'Drawback' ? 'tag-red' : 'tag'}">${esc(t.cat)}</span></td>
    <td class="small muted" lang="ja">${esc(t.desc.replace(/ \/ /g, ' / '))}</td>
  </tr>`;
}

/* --------------------------------------------------------------- abilities */

export function renderAbilities(params: URLSearchParams): Page {
  const cat = params.get('cat') ?? '';
  const list = ABILITY_LIST.filter((a) => !cat || a.type === cat)
    .slice()
    .sort((a, b) => (abilityEn(a.jp) ?? a.jp).localeCompare(abilityEn(b.jp) ?? b.jp));

  // The source writes combined elements as `メラ･炎`; the filter works per token so
  // “Fire” also finds every Fire spell.
  const elements = [
    ...new Set(ABILITY_LIST.flatMap((a) => elementTokens(a.element))),
  ].sort((a, b) => elementEn(a).localeCompare(elementEn(b)));
  const ranges = [...new Set(ABILITY_DETAIL.map((d) => d.range).filter(Boolean))].sort((a, b) =>
    abilityRangeEn(a).localeCompare(abilityRangeEn(b)),
  );

  return {
    title: 'Spells & abilities',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Spells &amp; abilities</span></nav>
      <div class="page-head">
        <h1>Spells &amp; abilities</h1>
        <p class="lede">
          Every ability of the reference index — spells, slashes, body skills, breaths and dances — with its type,
          the resistance it is checked against, its damage cap and the skill sets that teach it.
        </p>
        <div class="meta">
          <span class="badge tag">${ABILITY_LIST.length} abilities</span>
          <span class="badge tag-gold">${ABILITY_LIST.filter((a) => a.sp).length} added in SP</span>
        </div>
      </div>
      <section class="filters">
        ${categoryChips('abilities', [...ABILITY_TYPES], cat)}
        <div class="filter-row">
          <span class="label">Search</span>
          <input id="aSearch" class="field" type="search" placeholder="Name or effect, English or Japanese…" style="flex:1;min-width:240px" />
          <select id="aSort" class="field">
            <option value="name">Name (A–Z)</option>
            <option value="mp">MP cost (low → high)</option>
            <option value="cap">Damage cap (high → low)</option>
          </select>
        </div>
        <div class="filter-row">
          <span class="label">Element</span>
          <select id="aElement" class="field">
            <option value="">All elements</option>
            ${elements
              .map((e) => `<option value="${esc(e)}">${esc(e ? elementEn(e) : 'No element')}</option>`)
              .join('')}
          </select>
          <span class="label">Range</span>
          <select id="aRange" class="field">
            <option value="">Any range</option>
            ${ranges
              .map((r) => `<option value="${esc(r)}">${esc(abilityRangeEn(r))}</option>`)
              .join('')}
          </select>
          <span class="label">Max MP</span>
          <input id="aMp" class="field" type="number" min="0" max="180" placeholder="any" style="width:100px" />
        </div>
        <div class="filter-row">
          <label class="small"><input type="checkbox" id="aSp" /> SP only</label>
          <label class="small"><input type="checkbox" id="aTree" /> In a skill tree</label>
          <a class="btn ghost" href="#/abilities">Reset</a>
        </div>
      </section>
      <div class="result-count">
        <span id="aCount">${list.length} abilit${list.length === 1 ? 'y' : 'ies'}</span>
        <span>Every row opens its own page: MP cost, range, effect, element peers and holders</span>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr><th>Ability</th><th>Type</th><th class="num">MP</th><th>Checked against</th><th class="num">Cap</th><th>Taught by</th></tr>
          </thead>
          <tbody id="aBody">
            ${list.map((a) => abilityRow(a, ABILITY_DETAIL_BY_JP.get(a.jp))).join('')}
          </tbody>
        </table>
      </div>
      <div class="notice info" style="margin-top:16px">
        <p>
          <strong>Cap</strong> is the damage ceiling the reference prints for the ability (999 for most physical
          skills, a lower number for spells). “Taught by” counts the skill sets whose skill-point table contains the
          ability; open one to see the exact SP cost. The search box and the element, range, MP and SP filters work
          on the list already narrowed by the type chips above.
        </p>
      </div>
    `,
    mount: () => {
      const body = document.getElementById('aBody');
      const count = document.getElementById('aCount');
      const search = document.getElementById('aSearch') as HTMLInputElement | null;
      const element = document.getElementById('aElement') as HTMLSelectElement | null;
      const range = document.getElementById('aRange') as HTMLSelectElement | null;
      const mp = document.getElementById('aMp') as HTMLInputElement | null;
      const spOnly = document.getElementById('aSp') as HTMLInputElement | null;
      const treeOnly = document.getElementById('aTree') as HTMLInputElement | null;
      const sort = document.getElementById('aSort') as HTMLSelectElement | null;
      if (!body || !count) return;
      const rows = Array.from(body.querySelectorAll<HTMLTableRowElement>('[data-ab-row]'));

      const mpOf = (r: HTMLTableRowElement): number =>
        r.dataset.mp ? Number(r.dataset.mp) : Number.MAX_SAFE_INTEGER;
      const capOf = (r: HTMLTableRowElement): number =>
        r.dataset.cap ? Number(r.dataset.cap) : -1;
      const nameOf = (r: HTMLTableRowElement): string => r.dataset.sortName ?? '';

      const apply = (): void => {
        const q = (search?.value ?? '').trim().toLowerCase();
        const maxMp = mp?.value.trim() ? Number(mp.value) : null;
        const wanted = element?.value ?? '';
        const wantedRange = range?.value ?? '';
        const key = sort?.value ?? 'name';

        const ordered = [...rows].sort((a, b) => {
          if (key === 'mp') return mpOf(a) - mpOf(b) || nameOf(a).localeCompare(nameOf(b));
          if (key === 'cap') return capOf(b) - capOf(a) || nameOf(a).localeCompare(nameOf(b));
          return nameOf(a).localeCompare(nameOf(b));
        });
        for (const r of ordered) body.appendChild(r);

        let shown = 0;
        for (const r of rows) {
          let ok = true;
          if (q && !(r.dataset.search ?? '').includes(q)) ok = false;
          if (ok && wanted && !elementTokens(r.dataset.element ?? '').includes(wanted)) ok = false;
          if (ok && wantedRange && r.dataset.range !== wantedRange) ok = false;
          if (ok && maxMp !== null && (!r.dataset.mp || Number(r.dataset.mp) > maxMp)) ok = false;
          if (ok && spOnly?.checked && r.dataset.sp !== '1') ok = false;
          if (ok && treeOnly?.checked && Number(r.dataset.sets ?? 0) === 0) ok = false;
          r.hidden = !ok;
          if (ok) shown += 1;
        }
        count.textContent = `${shown} abilit${shown === 1 ? 'y' : 'ies'}`;
      };

      search?.addEventListener('input', apply);
      element?.addEventListener('change', apply);
      range?.addEventListener('change', apply);
      mp?.addEventListener('input', apply);
      spOnly?.addEventListener('change', apply);
      treeOnly?.addEventListener('change', apply);
      sort?.addEventListener('change', apply);
    },
  };
}

function abilityRow(a: AbilityEntry, detail?: AbilityDetail): string {
  const uses = ABILITY_SETS.get(a.jp) ?? [];
  const desc = detail ? abilityDesc(detail.effect) : undefined;
  const sets = uses
    .slice(0, 2)
    .map((u) => `<a href="${hashFor(`skill/${encodeURIComponent(u.skill)}`)}">${esc(u.skill)}</a>`)
    .join(', ');
  const search = [abilityEn(a.jp) ?? '', a.jp, desc ?? '', detail?.effect ?? '']
    .join(' ')
    .toLowerCase();
  return `<tr data-ab-row
    data-search="${esc(search)}"
    data-sort-name="${esc((abilityEn(a.jp) ?? a.jp).toLowerCase())}"
    data-element="${esc(elementTokens(a.element).join(' '))}"
    data-range="${esc(detail?.range ?? '')}"
    data-mp="${detail?.mp ?? ''}"
    data-cap="${a.cap ?? ''}"
    data-sp="${a.sp ? 1 : 0}"
    data-sets="${uses.length}">
    <td><a href="${abilityHref(a.jp)}">${bilingual(abilityEn(a.jp) ?? a.jp, a.jp)}</a>${spBadge(a.sp)}${
      desc ? `<div class="small muted">${esc(desc)}</div>` : ''
    }</td>
    <td><span class="badge tag">${esc(a.type)}</span></td>
    <td class="num">${detail?.mp ?? '—'}</td>
    <td class="small">${a.element ? esc(elementEn(a.element)) : '<span class="muted">—</span>'}</td>
    <td class="num">${a.cap ?? '—'}</td>
    <td class="small muted">${
      uses.length
        ? `<strong>${uses.length}</strong> set${uses.length === 1 ? '' : 's'} · ${sets}${uses.length > 2 ? '…' : ''}`
        : 'Not in a skill tree recorded here'
    }</td>
  </tr>`;
}

/* --------------------------------------------- ability & trait detail pages */

function statCard(label: string, value: string): string {
  return `<div class="stat"><div class="k">${esc(label)}</div><div class="v">${value}</div></div>`;
}

function detailPager(
  prev: { jp: string } | undefined,
  next: { jp: string } | undefined,
  nameOf: (jp: string) => string,
  hrefOf: (jp: string) => string,
): string {
  if (!prev && !next) return '';
  return `<div class="chapter-list" style="margin-bottom:18px">
    ${prev ? `<a class="chapter" href="${hrefOf(prev.jp)}"><span class="no">←</span><span><small>Previous</small><b>${esc(nameOf(prev.jp))}</b></span></a>` : ''}
    ${next ? `<a class="chapter" href="${hrefOf(next.jp)}"><span class="no">→</span><span><small>Next</small><b>${esc(nameOf(next.jp))}</b></span></a>` : ''}
  </div>`;
}

export function renderAbilityDetail(jp: string): Page {
  const d = ABILITY_DETAIL_BY_JP.get(jp);
  if (!d) {
    return {
      title: 'Ability not found',
      html: `<div class="card"><h1>Ability not found</h1><p>No ability called <code>${esc(jp)}</code> in the reference index.</p><p><a href="#/abilities">Back to spells &amp; abilities</a></p></div>`,
    };
  }
  const index = ABILITY_DETAIL.findIndex((x) => x.jp === jp);
  const prev = ABILITY_DETAIL[index - 1];
  const next = ABILITY_DETAIL[index + 1];
  const entry = ABILITY_LIST.find((a) => a.jp === jp);
  const en = abilityEn(jp) ?? jp;
  const desc = abilityDesc(d.effect);
  const element = elementLabel(d.elementJp);
  const peers = d.peers.filter((p) => p.jp !== jp);

  return {
    title: en,
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/abilities">Spells &amp; abilities</a><span class="sep">/</span><span>${esc(en)}</span></nav>
      <div class="page-head">
        <h1>${esc(en)}${spBadge(entry?.sp ?? false)}</h1>
        <div class="jp">${esc(jp)}</div>
        <div class="meta">
          <span class="badge tag">${esc(abilityTypeEn(d.typeJp))}</span>
          <span class="badge tag">${esc(element)}</span>
          ${d.mp !== null ? `<span class="badge tag">MP ${d.mp}</span>` : ''}
          ${d.capText && d.capText !== '-' ? `<span class="badge tag">Cap ${esc(d.capText)}</span>` : ''}
        </div>
      </div>

      <section class="card">
        <div class="card-head"><h2>Effect</h2><span class="muted small">効果</span></div>
        ${desc ? `<p style="margin:0 0 10px">${esc(desc)}</p>` : `<p class="muted small" style="margin:0 0 10px">No English rendering recorded.</p>`}
        <p class="small muted" lang="ja" style="margin:0">${esc(d.effect)}</p>
      </section>

      <div class="grid cols-4">
        ${statCard('Type', esc(abilityTypeEn(d.typeJp)))}
        ${statCard('Range', esc(d.range ? abilityRangeEn(d.range) : '—'))}
        ${statCard('MP cost', d.mp === null ? '—' : String(d.mp))}
        ${statCard('Damage cap', d.capText && d.capText !== '-' ? esc(d.capText) : '—')}
        ${statCard('Element', esc(element))}
        ${statCard('Taught by', `<strong>${d.sets.length}</strong> set${d.sets.length === 1 ? '' : 's'}`)}
        ${statCard('Known by', `<strong>${d.monsters.length}</strong> monster${d.monsters.length === 1 ? '' : 's'}`)}
        ${statCard('Added', entry?.sp ? 'SP version' : 'Base release')}
      </div>

      ${
        peers.length
          ? `<section class="card">
              <div class="card-head"><h2>${esc(element)} abilities</h2><span class="muted small">同じ属性の特技</span></div>
              <div class="table-wrap"><table class="data">
                <thead><tr><th>Ability</th><th>Type</th><th>Element</th></tr></thead>
                <tbody>${peers
                  .map(
                    (p) => `<tr>
                      <td>${
                        ABILITY_DETAIL_BY_JP.has(p.jp)
                          ? `<a href="${abilityHref(p.jp)}"><strong>${esc(abilityEn(p.jp) ?? p.jp)}</strong></a><div class="jp">${esc(p.jp)}</div>`
                          : bilingual(abilityEn(p.jp) ?? p.jp, p.jp)
                      }</td>
                      <td class="small">${esc(abilityTypeEn(p.type))}</td>
                      <td class="small">${esc(elementEn(p.element))}</td>
                    </tr>`,
                  )
                  .join('')}</tbody>
              </table></div>
            </section>`
          : ''
      }

      <section class="card">
        <div class="card-head"><h2>Skill sets that teach it</h2><span class="muted small">特技を覚えれるスキル · ${d.sets.length}</span></div>
        ${
          d.sets.length
            ? `<div class="table-wrap"><table class="data">
                <thead><tr><th>Skill set</th><th class="num">Max SP</th></tr></thead>
                <tbody>${d.sets
                  .map(
                    (s) => `<tr><td>${detailSetLink(s)}</td><td class="num">${s.maxSp}</td></tr>`,
                  )
                  .join('')}</tbody>
              </table></div>`
            : '<p class="muted small" style="margin:0">No skill set in the reference index teaches it.</p>'
        }
      </section>

      <section class="card">
        <div class="card-head"><h2>Monsters that know it</h2><span class="muted small">特技を持つモンスター</span></div>
        ${
          d.monsters.length
            ? `<div class="grid auto">${d.monsters.map(detailMonsterLink).join('')}</div>`
            : '<p class="muted small" style="margin:0">No dex monster has it innately; it is only learnt from a skill set.</p>'
        }
      </section>

      ${detailPager(prev, next, (name) => abilityEn(name) ?? name, abilityHref)}
    `,
  };
}

export function renderTraitDetail(jp: string): Page {
  const d = TRAIT_DETAIL_BY_JP.get(jp);
  if (!d) {
    return {
      title: 'Trait not found',
      html: `<div class="card"><h1>Trait not found</h1><p>No trait called <code>${esc(jp)}</code> in the reference index.</p><p><a href="#/traits">Back to traits</a></p></div>`,
    };
  }
  const index = TRAIT_DETAIL.findIndex((x) => x.jp === jp);
  const prev = TRAIT_DETAIL[index - 1];
  const next = TRAIT_DETAIL[index + 1];
  const entry = TRAIT_LIST.find((t) => t.jp === jp);
  const en = traitEn(jp) ?? jp;
  const desc = traitDesc(d.effect);
  const spDesc = d.spEffect ? traitSpDesc(d.spEffect) : undefined;
  const holders = d.base.length + d.plus.length + d.size.length;

  return {
    title: en,
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><a href="#/traits">Traits</a><span class="sep">/</span><span>${esc(en)}</span></nav>
      <div class="page-head">
        <h1>${esc(en)}${spBadge(entry?.sp ?? false)}</h1>
        <div class="jp">${esc(jp)}</div>
        <div class="meta">
          ${entry ? `<span class="badge ${entry.cat === 'Drawback' ? 'tag-red' : 'tag'}">${esc(entry.cat)}</span>` : ''}
          ${d.spEffect ? '<span class="badge tag-gold">SP upgrade</span>' : ''}
          <span class="badge tag">${holders} holder${holders === 1 ? '' : 's'} recorded</span>
        </div>
      </div>

      <section class="card">
        <div class="card-head"><h2>Effect</h2><span class="muted small">効果</span></div>
        ${desc ? `<p style="margin:0 0 10px">${esc(desc)}</p>` : `<p class="muted small" style="margin:0 0 10px">No English rendering recorded.</p>`}
        <p class="small muted" lang="ja" style="margin:0">${esc(d.effect)}</p>
      </section>

      ${
        d.spEffect
          ? `<section class="card">
              <div class="card-head"><h2>SP trait effect</h2><span class="muted small">SP特性の効果</span></div>
              ${spDesc ? `<p style="margin:0 0 10px">${esc(spDesc)}</p>` : `<p class="muted small" style="margin:0 0 10px">No English rendering recorded.</p>`}
              <p class="small muted" lang="ja" style="margin:0">${esc(d.spEffect)}</p>
              <p class="small muted" style="margin:10px 0 0">In the SP version this trait replaces its base effect with the text above.</p>
            </section>`
          : ''
      }

      <div class="grid cols-4">
        ${statCard('Classification', entry ? esc(entry.cat) : '—')}
        ${statCard('Base holders', String(d.base.length))}
        ${statCard('Plus-value holders', String(d.plus.length))}
        ${statCard('Size holders', String(d.size.length))}
      </div>

      ${traitHolderSection('Base trait', '通常で特性を持つモンスター', d.base)}
      ${traitHolderSection('At a plus value', 'プラス値特性を持つモンスター', d.plus)}
      ${traitHolderSection('By body size', 'M・G・超G特性を持つモンスター', d.size)}

      <section class="card">
        <div class="card-head"><h2>Skill sets that grant it</h2><span class="muted small">特性を覚えれるスキル</span></div>
        ${
          d.sets.length
            ? `<div class="table-wrap"><table class="data">
                <thead><tr><th>Skill set</th><th class="num">Max SP</th></tr></thead>
                <tbody>${d.sets.map((s) => `<tr><td>${detailSetLink(s)}</td><td class="num">${s.maxSp}</td></tr>`).join('')}</tbody>
              </table></div>`
            : '<p class="muted small" style="margin:0">No skill set in the reference index grants it.</p>'
        }
      </section>

      ${
        d.builds.length
          ? `<section class="card">
              <div class="card-head"><h2>New-life builds that pass it on</h2><span class="muted small">3DS版：新生配合で使う育成型 · ${d.builds.length}</span></div>
              <div class="table-wrap"><table class="data">
                <thead><tr><th class="num">Rating</th><th>Build</th></tr></thead>
                <tbody>${d.builds
                  .map((b) => `<tr><td class="num">${esc(b.rating)}</td><td lang="ja">${esc(b.name)}</td></tr>`)
                  .join('')}</tbody>
              </table></div>
              <p class="small muted" style="margin:10px 0 0">Build names are the reference’s Japanese community entries; the rating is the score it prints.</p>
            </section>`
          : ''
      }

      ${detailPager(prev, next, (name) => traitEn(name) ?? name, traitHref)}
    `,
  };
}

function traitHolderSection(title: string, source: string, list: { jp: string }[]): string {
  if (!list.length) return '';
  return `<section class="card">
    <div class="card-head"><h2>${esc(title)}</h2><span class="muted small">${esc(source)} · ${list.length}</span></div>
    <div class="grid auto">${list.map(detailMonsterLink).join('')}</div>
  </section>`;
}

/* ------------------------------------------------------------------- items */

export function renderItems(params: URLSearchParams): Page {
  const cat = params.get('cat') ?? '';
  const kind = params.get('kind') ?? '';
  const list = ITEMS.filter((i) => (!cat || i.category === cat) && (!kind || i.kind === kind));
  const categories = [...new Set(ITEMS.map((i) => i.category))];

  return {
    title: 'Items',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Items</span></nav>
      <div class="page-head">
        <h1>Items</h1>
        <p class="lede">
          The full reference lists: ${ITEMS.filter((i) => i.kind === 'item').length} items and key items, plus the
          ${ITEMS.filter((i) => i.kind === 'material').length} forging materials used at the smithy. Buy and sell
          prices, effects and the source tags are the ones the reference prints.
        </p>
        <div class="meta">
          <span class="badge tag">${ITEMS.length} entries</span>
          <span class="badge tag-gold">Items · key items · materials</span>
        </div>
      </div>
      <section class="filters">
        <div class="filter-row">
          <span class="label">Kind</span>
          <div class="chip-row">
            <a href="${hashFor('items', { cat: cat || undefined })}" class="${kind ? '' : 'active'}">All</a>
            <a href="${hashFor('items', { kind: 'item', cat: cat || undefined })}" class="${kind === 'item' ? 'active' : ''}">Items &amp; key items</a>
            <a href="${hashFor('items', { kind: 'material', cat: cat || undefined })}" class="${kind === 'material' ? 'active' : ''}">Materials</a>
          </div>
        </div>
        <div class="filter-row">
          <span class="label">Section</span>
          <div class="chip-row">
            ${['All', ...categories]
              .map(
                (c) =>
                  `<a href="${hashFor('items', { cat: c === 'All' ? undefined : c, kind: kind || undefined })}" class="${(cat || 'All') === c ? 'active' : ''}">${esc(ITEM_CATEGORY_EN[c] ?? c)}</a>`,
              )
              .join('')}
          </div>
        </div>
      </section>
      <div class="result-count"><span>${list.length} entr${list.length === 1 ? 'y' : 'ies'}</span><span>Prices where the reference records them</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Item</th><th>Section</th><th>Effect (source text)</th><th>Where</th><th class="num">Buy</th><th class="num">Sell</th></tr></thead>
          <tbody>${list.map((i) => itemRow(i)).join('')}</tbody>
        </table>
      </div>
    `,
  };
}

function itemRow(i: ItemEntry): string {
  const where = i.tags.length
    ? i.tags.map((t) => `<span class="badge size">${esc(TAG_EN[t] ?? t)}</span>`).join(' ')
    : '<span class="muted">—</span>';
  return `<tr>
    <td>${bilingual(itemEn(i.jp), i.jp)}${i.kind === 'material' ? ' <span class="badge tag-gold">Material</span>' : ''}</td>
    <td class="small">${esc(ITEM_CATEGORY_EN[i.category] ?? i.category)}</td>
    <td class="small muted" lang="ja">${esc(i.effect)}</td>
    <td>${where}</td>
    <td class="num">${i.buy === null ? '—' : `${fmt(i.buy)} G`}</td>
    <td class="num">${i.sell === null ? '—' : `${fmt(i.sell)} G`}</td>
  </tr>`;
}

/* ----------------------------------------------------------------- weapons */

export function renderWeapons(): Page {
  const types = [...new Set(WEAPONS.map((w) => w.type))];

  return {
    title: 'Weapons & forging',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Weapons</span></nav>
      <div class="page-head">
        <h1>Weapons &amp; forging</h1>
        <p class="lede">
          All ${WEAPONS.length} weapons of the seven types, with attack, shop price, the effect the reference records
          and where each one is sold or dropped. The equippable weapon types of every monster are now recorded too, so
          each type lists the monsters that can use it.
        </p>
        <div class="meta">
          <span class="badge tag">${WEAPONS.length} weapons</span>
          <span class="badge tag-gold">${types.length} types</span>
        </div>
      </div>

      <div class="notice info">
        <p>
          <strong>Forging.</strong> Bring a weapon and a material to the smithy: one material adds one effect — an
          ability, a trait or a resistance — and the weapon keeps its base attack. The materials are on the
          <a href="#/items?kind=material">items page</a>, and the monsters that can equip each type are listed under
          every table.
        </p>
      </div>

      <div class="grid cols-2">
        ${types
          .map(
            (type) => `<section class="card">
              <div class="card-head"><h2>${esc(type)}</h2><span class="muted small">${MONSTERS_BY_WEAPON.get(type)?.length ?? 0} monsters can equip</span></div>
              <div class="table-wrap">
                <table class="data" style="font-size:13px">
                  <thead><tr><th>Weapon</th><th class="num">ATK</th><th class="num">Buy</th><th>Effect</th></tr></thead>
                  <tbody>${WEAPONS.filter((w) => w.type === type).map((w) => weaponRow(w)).join('')}</tbody>
                </table>
              </div>
            </section>`,
          )
          .join('')}
      </div>

      <section class="card">
        <div class="card-head"><h2>Weapon availability</h2><span class="muted small">Sold at · dropped by</span></div>
        <div class="table-wrap">
          <table class="data" style="font-size:13px">
            <thead><tr><th>Weapon</th><th>Sold at</th><th>Dropped by</th></tr></thead>
            <tbody>
              ${WEAPONS.filter((w) => (w.shops?.length ?? 0) || (w.drops?.length ?? 0))
                .map(
                  (w) => `<tr>
                    <td>${esc(weaponEn(w.name))}<div class="jp">${esc(w.name)}</div></td>
                    <td class="small muted" lang="ja">${(w.shops ?? []).map((s) => esc(s)).join('<br />') || '—'}</td>
                    <td class="small">${(w.drops ?? []).map((d) => dropLink(d)).join(', ') || '—'}</td>
                  </tr>`,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <div class="notice">
        <p>
          Shop names and drop lines are the reference’s Japanese text; drop entries are linked to the English monster
          record where the name matches.
        </p>
      </div>
    `,
  };
}

function weaponRow(w: WeaponEntry): string {
  return `<tr>
    <td><strong>${esc(weaponEn(w.name))}</strong><div class="jp">${esc(w.name)}</div></td>
    <td class="num">${w.atk ?? '—'}</td>
    <td class="num">${w.buy === null ? '—' : fmt(w.buy)}</td>
    <td class="small muted" lang="ja">${esc(w.effect || '')}</td>
  </tr>`;
}

/** `ウパソルジャー（D）` → index entry with its English name. */
function dropLink(value: string): string {
  const jp = value.replace(/[（(].*$/, '').trim();
  const m = MONSTER_BY_JP.get(jp);
  return m
    ? `<a href="#/monster/${encodeURIComponent(m.id)}">${esc(m.name)}</a>`
    : `<span lang="ja">${esc(value)}</span>`;
}

/* -------------------------------------------------------------------- keys */

function keyRow(k: KeyName): string {
  const search = [keyNameEn(k.jp), k.jp, k.title, k.condition, k.quest ?? '', k.reward ?? ''].join(' ');
  return `<tr data-key-row data-search="${esc(search.toLowerCase())}">
    <td><strong>${esc(keyNameEn(k.jp))}</strong><div class="jp">${esc(k.jp)}</div>${
      k.sp ? ' <span class="badge tag-gold" title="Added in the SP version">SP</span>' : ''
    }</td>
    <td lang="ja">${esc(k.title)}</td>
    <td class="small" lang="ja">${esc(k.condition)}${
      k.families?.length ? `<div class="muted">系統：${k.families.map((f) => esc(familyEn(f))).join(' · ')}</div>` : ''
    }</td>
    <td class="small muted" lang="ja">${
      k.quest ? `${esc(QUEST_EN[k.quest] ?? k.quest)}<div class="jp">${esc(k.quest)}</div>` : '—'
    }${k.reward ? `<div class="small">→ ${esc(REWARD_EN[k.reward] ?? k.reward)}</div>` : ''}</td>
    <td class="num">${k.price === undefined ? '—' : fmt(k.price)}</td>
  </tr>`;
}

function keySection(half: 'prefix' | 'suffix'): string {
  const list = KEY_NAMES.filter((k) => k.half === half);
  const label = half === 'prefix' ? 'First halves' : 'Second halves';
  const jp = half === 'prefix' ? '前半' : '後半';
  return `<section class="card">
    <div class="card-head"><h2>${label}</h2><span class="muted small">${jp} · ${list.length} names</span></div>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>Name</th><th>Title (称号)</th><th>Unlocked by</th><th>Key quest</th><th class="num">Price</th></tr></thead>
        <tbody>${list.map(keyRow).join('')}</tbody>
      </table>
    </div>
  </section>`;
}

export function renderAlchemyKeys(): Page {
  const prefixes = KEY_NAMES.filter((k) => k.half === 'prefix');
  const suffixes = KEY_NAMES.filter((k) => k.half === 'suffix');
  const priced = KEY_NAMES.filter((k) => k.price !== undefined);

  return {
    title: 'Alchemy keys',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Alchemy keys</span></nav>
      <div class="page-head">
        <h1>Alchemy keys</h1>
        <p class="lede">
          A key’s name is built from a first half and a second half. ${prefixes.length} first halves and
          ${suffixes.length} second halves exist; each one is unlocked by a title (称号), and the second half also
          decides the key’s quest and the bucket its reward comes from.
        </p>
        <div class="meta">
          <span class="badge tag">${prefixes.length} first halves</span>
          <span class="badge tag">${suffixes.length} second halves</span>
          <span class="badge tag-gold">${KEY_NAMES.filter((k) => k.sp).length} added in SP</span>
          <a class="badge tag" href="#/key-rewards">${KEY_REWARDS.length} reward monsters</a>
        </div>
      </div>
      <section class="filters">
        <div class="filter-row">
          <span class="label">Search</span>
          <input id="kSearch" class="field" type="search" placeholder="Name, title or condition…" style="flex:1;min-width:240px" />
          <a class="btn ghost" href="#/keys">Reset</a>
        </div>
      </section>
      ${keySection('prefix')}
      ${keySection('suffix')}
      <div class="notice">
        <p>
          Key names, titles and conditions are the reference’s Japanese text; the name halves are shown with an
          English rendering. A price is printed only for the ${priced.length} second halves a rebirth monster adds to
          the list.
        </p>
      </div>
    `,
    mount: () => {
      const input = document.getElementById('kSearch') as HTMLInputElement | null;
      if (!input) return;
      const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('[data-key-row]'));
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        for (const row of rows) {
          const hit = !q || (row.dataset.search ?? '').includes(q);
          row.hidden = !hit;
        }
      });
    },
  };
}

export function renderKeyRewards(): Page {
  const ranks = ['SS', 'S', 'A', 'B'];

  return {
    title: 'Alchemy-key rewards',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Key rewards</span></nav>
      <div class="page-head">
        <h1>Alchemy-key reward monsters</h1>
        <p class="lede">
          ${KEY_REWARDS.length} monsters can be handed out as the reward of an alchemy-key quest. The reward rank is
          decided by the second half of the key’s name, not by the monster fought inside.
        </p>
      </div>
      <div class="grid cols-4">
        ${ranks
          .map(
            (r) => `<div class="stat"><div class="k">Rank ${esc(r)}</div><div class="v">${KEY_REWARDS.filter((k) => k.rank === r).length}</div></div>`,
          )
          .join('')}
      </div>
      ${ranks
        .map(
          (r) => `<section class="card">
            <div class="card-head"><h2>Rank ${esc(r)}</h2><span class="muted small">${KEY_REWARDS.filter((k) => k.rank === r).length} monsters</span></div>
            <div class="grid auto">
              ${KEY_REWARDS.filter((k) => k.rank === r)
                .map((k) => {
                  const m = MONSTER_BY_ID.get(k.id);
                  return m ? miniMon(m) : `<span class="badge tag">${esc(k.jp)}</span>`;
                })
                .join('')}
            </div>
          </section>`,
        )
        .join('')}
      <div class="notice info">
        <p>
          A key quest only rolls the reward after a clear, and even an S evaluation is a lottery, so the monster is
          never guaranteed. Rewards come from the second half of the key name; the first half decides which monsters
          appear inside the quest. See <a href="#/keys">alchemy keys</a> for every first and second half.
        </p>
      </div>
    `,
  };
}
