import type { Page } from '../app';
import { ABILITIES, ITEMS, TRAITS, WEAPONS } from '../data/extras';
import { esc, fmt, hashFor } from '../lib';

const TRAIT_CATEGORIES = ['Body', 'Combat', 'Resistance', 'Support', 'Drawback', 'Plus'] as const;
const ABILITY_CATEGORIES = ['Spell', 'Attack', 'Breath', 'Recovery', 'Support', 'Debuff'] as const;
const ITEM_CATEGORIES = ['Recovery', 'Cure', 'Seed', 'Battle', 'Scout', 'Field', 'Key'] as const;

function chips(base: string, values: readonly string[], active: string): string {
  return ['All', ...values]
    .map(
      (v) =>
        `<a href="${hashFor(base, { cat: v === 'All' ? undefined : v })}" class="${(active || 'All') === v ? 'active' : ''}">${esc(v)}</a>`,
    )
    .join('');
}

function categoryChips(base: string, values: readonly string[], active: string): string {
  return `<div class="filter-row"><span class="label">Type</span><div class="chip-row">${chips(base, values, active)}</div></div>`;
}

/* ------------------------------------------------------------------ traits */

export function renderTraits(params: URLSearchParams): Page {
  const cat = params.get('cat') ?? '';
  const list = TRAITS.filter((t) => !cat || t.category === cat);

  return {
    title: 'Traits',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Traits</span></nav>
      <div class="page-head">
        <h1>Traits</h1>
        <p class="lede">
          Traits are passive abilities baked into a monster’s body: resistances, extra actions, attack riders and
          drawbacks. Plus-value traits unlock as a monster’s plus value climbs (+25, +50, +★).
        </p>
      </div>
      <section class="filters">${categoryChips('traits', TRAIT_CATEGORIES, cat)}</section>
      <div class="result-count"><span>${list.length} trait${list.length === 1 ? '' : 's'}</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Trait</th><th>Type</th><th>Effect</th></tr></thead>
          <tbody>
            ${list
              .map(
                (t) => `<tr><td><strong>${esc(t.name)}</strong></td>
                <td><span class="badge ${t.category === 'Drawback' ? 'tag-red' : t.category === 'Plus' ? 'tag-gold' : 'tag'}">${esc(t.category)}</span></td>
                <td>${esc(t.effect)}</td></tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="notice" style="margin-top:16px">
        <p>
          Trait names are unofficial English renderings. The Japanese release lists them as 特性 (<em>tokusei</em>);
          the same effect appears on every monster that carries it.
        </p>
      </div>
    `,
  };
}

/* ------------------------------------------------------------------ abilities */

export function renderAbilities(params: URLSearchParams): Page {
  const cat = params.get('cat') ?? '';
  const list = ABILITIES.filter((a) => !cat || a.category === cat);

  return {
    title: 'Spells & abilities',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Spells &amp; abilities</span></nav>
      <div class="page-head">
        <h1>Spells &amp; abilities</h1>
        <p class="lede">
          Reference list of the spells, attacks, breaths and support abilities learned from skill sets, using the
          established Dragon Quest English names (Frizz, Sizz, Woosh, Crack, Zap, Zam…).
        </p>
      </div>
      <section class="filters">${categoryChips('abilities', ABILITY_CATEGORIES, cat)}</section>
      <div class="result-count"><span>${list.length} abilit${list.length === 1 ? 'y' : 'ies'}</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Ability</th><th>Type</th><th>Effect</th></tr></thead>
          <tbody>
            ${list
              .map(
                (a) => `<tr><td><strong>${esc(a.name)}</strong></td>
                <td><span class="badge tag">${esc(a.category)}</span></td>
                <td>${esc(a.effect)}</td></tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="notice" style="margin-top:16px">
        <p>
          Every monster also learns abilities from its own skill set — see
          <a href="#/skills">skill sets</a> for the monster-by-monster breakdown.
        </p>
      </div>
    `,
  };
}

/* ------------------------------------------------------------------ items */

export function renderItems(params: URLSearchParams): Page {
  const cat = params.get('cat') ?? '';
  const list = ITEMS.filter((i) => !cat || i.category === cat);

  return {
    title: 'Items',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Items</span></nav>
      <div class="page-head">
        <h1>Items</h1>
        <p class="lede">
          Herbs, cures, seeds, scouting meat and the key items that open each world. Buy and sell prices are shown
          where the shop list is known.
        </p>
      </div>
      <section class="filters">${categoryChips('items', ITEM_CATEGORIES, cat)}</section>
      <div class="result-count"><span>${list.length} item${list.length === 1 ? '' : 's'}</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Item</th><th>Type</th><th>Effect</th><th class="num">Buy</th><th class="num">Sell</th></tr></thead>
          <tbody>
            ${list
              .map(
                (i) => `<tr><td><strong>${esc(i.name)}</strong></td>
                <td><span class="badge ${i.category === 'Key' ? 'tag-gold' : 'tag'}">${esc(i.category)}</span></td>
                <td>${esc(i.effect)}</td>
                <td class="num">${i.buy === undefined ? '—' : `${fmt(i.buy)} G`}</td>
                <td class="num">${i.sell === undefined ? '—' : `${fmt(i.sell)} G`}</td></tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `,
  };
}

/* ------------------------------------------------------------------ weapons */

export function renderWeapons(): Page {
  return {
    title: 'Weapons & forging',
    html: `
      <nav class="breadcrumb"><a href="#/">Home</a><span class="sep">/</span><span>Weapons</span></nav>
      <div class="page-head">
        <h1>Weapons &amp; forging</h1>
        <p class="lede">
          Seven weapon types, each with its own attack pattern. A monster can only equip the types marked on its
          record. At the forge, extra materials add abilities, traits and resistances on top of the base weapon.
        </p>
      </div>

      <div class="notice info">
        <p>
          <strong>Forging in one line:</strong> bring a weapon plus materials to the smithy in Greatlog. Each
          material adds one effect — an ability (e.g. Attack +10), a trait (e.g. Metal Killer) or a resistance
          (e.g. Crack Resistance) — and the weapon keeps its base attack.
        </p>
      </div>

      <div class="grid cols-2">
        ${WEAPONS.map(
          (w) => `<section class="card">
            <div class="card-head"><h2>${esc(w.type)}</h2><span class="jp">${esc(w.jp)}</span></div>
            <p class="small muted">${esc(w.blurb)}</p>
            <table class="data" style="font-size:13px">
              <thead><tr><th>Weapon</th><th class="num">ATK</th><th class="num">Price</th><th>Note</th></tr></thead>
              <tbody>
                ${w.weapons
                  .map(
                    (x) => `<tr><td>${esc(x.name)}</td>
                    <td class="num">${x.atk === undefined ? '—' : `+${x.atk}`}</td>
                    <td class="num">${x.price === undefined ? '—' : `${fmt(x.price)} G`}</td>
                    <td class="small muted">${esc(x.effect ?? '')}</td></tr>`,
                  )
                  .join('')}
              </tbody>
            </table>
          </section>`,
        ).join('')}
      </div>

      <div class="notice">
        <p>
          Attack values are listed only where the shop table is confirmed (Greatlog’s opening stock). The remaining
          weapons are the well-known entries of each family, kept as a reference for forging planning.
        </p>
      </div>
    `,
  };
}
