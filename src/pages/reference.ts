import type { Page } from '../app';
import {
  ABILITY_LIST,
  ABILITY_SETS,
  ITEMS,
  KEY_NAMES,
  KEY_REWARDS,
  MONSTERS_BY_WEAPON,
  MONSTER_BY_ID,
  MONSTER_BY_JP,
  TRAIT_LIST,
  WEAPONS,
  esc,
  fmt,
  hashFor,
  miniMon,
} from '../lib';
import type { AbilityEntry, ItemEntry, KeyName, TraitEntry, WeaponEntry } from '../lib';
import {
  ITEM_CATEGORY_EN,
  QUEST_EN,
  REWARD_EN,
  TAG_EN,
  abilityEn,
  elementEn,
  familyEn,
  itemEn,
  keyNameEn,
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
          Trait names are unofficial English renderings of the Japanese 特性. The right-hand column is the effect
          text exactly as the reference prints it, so a rendering can always be checked against the source.
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
  return `<tr>
    <td>${bilingual(traitEn(t.jp) ?? t.jp, t.jp)}${spBadge(t.sp)}</td>
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
      <section class="filters">${categoryChips('abilities', [...ABILITY_TYPES], cat)}</section>
      <div class="result-count">
        <span>${list.length} abilit${list.length === 1 ? 'y' : 'ies'}</span>
        <span>Names use the established Dragon Quest English spellings where they exist</span>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead>
            <tr><th>Ability</th><th>Type</th><th>Checked against</th><th class="num">Cap</th><th>Taught by</th></tr>
          </thead>
          <tbody>
            ${list.map((a) => abilityRow(a)).join('')}
          </tbody>
        </table>
      </div>
      <div class="notice info" style="margin-top:16px">
        <p>
          <strong>Cap</strong> is the damage ceiling the reference prints for the ability (999 for most physical
          skills, a lower number for spells). “Taught by” counts the skill sets whose skill-point table contains the
          ability; open one to see the exact SP cost.
        </p>
      </div>
    `,
  };
}

function abilityRow(a: AbilityEntry): string {
  const uses = ABILITY_SETS.get(a.jp) ?? [];
  const sets = uses
    .slice(0, 2)
    .map((u) => `<a href="${hashFor(`skill/${encodeURIComponent(u.skill)}`)}">${esc(u.skill)}</a>`)
    .join(', ');
  return `<tr>
    <td>${bilingual(abilityEn(a.jp) ?? a.jp, a.jp)}${spBadge(a.sp)}</td>
    <td><span class="badge tag">${esc(a.type)}</span></td>
    <td class="small">${a.element ? esc(elementEn(a.element)) : '<span class="muted">—</span>'}</td>
    <td class="num">${a.cap ?? '—'}</td>
    <td class="small muted">${
      uses.length
        ? `<strong>${uses.length}</strong> set${uses.length === 1 ? '' : 's'} · ${sets}${uses.length > 2 ? '…' : ''}`
        : 'Not in a skill tree recorded here'
    }</td>
  </tr>`;
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
