/**
 * Shared types, data access and small rendering helpers.
 * Everything is bundled locally — no fetch() to any server.
 */
import rawMonsters from './data/monsters.json';
import rawSkills from './data/skills.json';
import rawTraitDesc from './data/traits.json';
import rawAbilities from './data/abilities.json';
import rawTraitExtra from './data/trait-extra.json';
import rawItems from './data/items.json';
import rawWeapons from './data/weapons.json';
import rawKeyRewards from './data/key-rewards.json';
import rawKeyNames from './data/key-names.json';
import rawArena from './data/arena.json';
import rawKameha from './data/kameha.json';
import rawMonsterWeapons from './data/monster-weapons.json';
import rawAbilityDetail from './data/ability-detail.json';
import rawTraitDetail from './data/trait-detail.json';
import rawAbilityDesc from './data/i18n-ability-desc.json';
import rawTraitDescEn from './data/i18n-trait-desc.json';
import rawTraitSpDesc from './data/i18n-trait-sp-desc.json';

export type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
export type StatKey = 'hp' | 'mp' | 'atk' | 'def' | 'agi' | 'wis';

export interface Obtain {
  where?: string;
  eggs?: ('white' | 'silver' | 'gold' | 'rainbow')[];
  dream?: boolean;
  /** World whose wandering other-world master can be scouted for this monster (他国マスター). */
  masterWorld?: string;
  alchemy?: 'normal' | 'boss' | 'reward';
  other?: string;
  /** Rebirth monster (転生モンスター): what it is the rebirth of, and where. */
  rebirth?: { of: string; where?: string };
}

export interface BreedIngredient {
  id?: string;
  name: string;
}

export interface BreedRecipe {
  /** Number of parents the recipe takes: 2 or 4. */
  size: number;
  ingredients: BreedIngredient[];
  /** Set when the page requires any monster of this family as the other parent. */
  family?: string;
}

export interface BreedInfo {
  /** 位階No. — the hidden rank order, identical to the dex order in this data. */
  rankNo: number;
  /** True when the monster can be produced by rank synthesis (位階配合). */
  rankSynth: boolean;
  /** True when the monster can be produced by a special recipe (特殊配合). */
  specialSynth: boolean;
  recipes: BreedRecipe[];
}

export interface TraitRef {
  tier: string;
  name: string;
}

export interface SizeTraitRef {
  size: string;
  name: string;
}

export interface MonsterTraits {
  base: string[];
  plus: TraitRef[];
  size: SizeTraitRef[];
}

export interface Monster {
  id: string;
  no: number | null;
  name: string;
  jp: string;
  rank: Rank;
  family: string;
  size: string;
  icon: string;
  skill: string;
  total: number | null;
  stats: Partial<Record<StatKey, number>>;
  obtain: Obtain;
  traits: MonsterTraits;
  /** 30 slots in RESIST_KEYS order; index into RESIST_LEVELS, or null when unknown. */
  resist: (number | null)[];
  /** Only where the source kept the 3DS weapon line. */
  weapons?: string[];
  breed?: BreedInfo;
}

export interface SkillEntry {
  sp: number;
  name: string;
  /** Page the reference links the entry to, where it links one. */
  kind?: 'ability' | 'trait';
  /** Slug of that ability / trait detail page. */
  slug?: string;
}

export interface SkillSet {
  name: string;
  jp: string;
  count: number;
  sp: SkillEntry[];
  monsters: { id: string; name: string; rank: Rank }[];
  /** Japanese name of the set this one evolves from / into. */
  evolvesFrom?: string;
  evolvesTo?: string;
  /** What the set is used for in key fusion (組み合わせ用途). */
  combinesFor?: string;
  /** Other way the set is learnt (他入手) — crests and the like. */
  other?: string;
}

export interface AbilityEntry {
  jp: string;
  type: string;
  element: string;
  cap: number | null;
  sp: boolean;
}

export interface TraitEntry {
  jp: string;
  desc: string;
  cat: string;
  sp: boolean;
}

/** A monster as the ability / trait detail pages list it. */
export interface DetailMonster {
  jp: string;
  rank: string;
  family: string;
  size: string;
}

/** One ability page of the reference (特技): combat data, element peers,
 *  the skill sets that teach it and the monsters that know it. */
export interface AbilityDetail {
  jp: string;
  slug: string;
  typeJp: string;
  range: string;
  mp: number | null;
  capText: string;
  elementJp: string;
  effect: string;
  peers: { jp: string; type: string; element: string }[];
  sets: { jp: string; maxSp: number }[];
  monsters: DetailMonster[];
}

/** One trait page of the reference (特性): the effect, the SP upgrade, the
 *  monsters that hold it and the new-life builds that pass it on. */
export interface TraitDetail {
  jp: string;
  slug: string;
  effect: string;
  spEffect?: string | null;
  base: DetailMonster[];
  plus: DetailMonster[];
  size: DetailMonster[];
  sets: { jp: string; maxSp: number }[];
  builds: { rating: string; name: string }[];
}

export interface ItemEntry {
  jp: string;
  kind: 'item' | 'material';
  category: string;
  effect: string;
  buy: number | null;
  sell: number | null;
  tags: string[];
}

export interface WeaponEntry {
  name: string;
  type: string;
  atk: number | null;
  effect: string;
  buy: number | null;
  sell: number | null;
  shops?: string[];
  drops?: string[];
}

export interface KeyReward {
  id: string;
  jp: string;
  rank: string;
  family: string;
  sp: boolean;
}

/** Monster arena: the four class cups and the endurance battle. */
export interface ArenaRound {
  name: string;
  monsters: { name: string; hp: string }[];
  note: string;
}

export interface ArenaCup {
  class: string;
  fee: number | null;
  prize: string | null;
  advice: string;
  rounds: ArenaRound[];
}

export interface ArenaData {
  cups: ArenaCup[];
  streak: {
    rewards: { streak: string; gold: string; prize: string }[];
    restart: { from: string; start: string }[];
    note: string;
  };
}

/** A monster the Kameha prince hands out, with every other route flagged. */
export interface KamehaReward {
  rank: Rank;
  jp: string;
  id?: string;
  name?: string;
  scout: boolean;
  master: boolean;
  rankBreed: boolean;
  specialBreed: boolean;
  egg: boolean;
  key: boolean;
  kameha: boolean;
  other: boolean;
}

/** One half of an alchemy-key name (錬金カギの名前). */
export interface KeyName {
  jp: string;
  half: 'prefix' | 'suffix';
  sp: boolean;
  /** Title (称号) that unlocks this half. */
  title: string;
  condition: string;
  families?: string[];
  /** Key-quest content tied to the name. */
  quest?: string;
  reward?: string;
  /** Price of the key once this second half is used, where the source prices it. */
  price?: number;
}

export const MONSTERS = rawMonsters as unknown as Monster[];
export const SKILLS = rawSkills as unknown as SkillSet[];
export const TRAIT_DESC = rawTraitDesc as unknown as Record<string, string[]>;
export const ABILITY_LIST = rawAbilities as unknown as AbilityEntry[];
export const TRAIT_LIST = rawTraitExtra as unknown as TraitEntry[];
export const ITEMS = rawItems as unknown as ItemEntry[];
export const WEAPONS = rawWeapons as unknown as WeaponEntry[];
export const KEY_REWARDS = rawKeyRewards as unknown as KeyReward[];
export const KEY_NAMES = rawKeyNames as unknown as KeyName[];
export const ARENA_DATA = rawArena as unknown as ArenaData;
export const KAMEHA = rawKameha as unknown as KamehaReward[];
export const ABILITY_DETAIL = rawAbilityDetail as unknown as AbilityDetail[];
export const TRAIT_DETAIL = rawTraitDetail as unknown as TraitDetail[];

/** English effect text, keyed by the whitespace-normalised Japanese effect. */
export const ABILITY_DESC_EN = rawAbilityDesc as unknown as Record<string, string>;
export const TRAIT_DESC_EN = rawTraitDescEn as unknown as Record<string, string>;
export const TRAIT_SP_DESC_EN = rawTraitSpDesc as unknown as Record<string, string>;

export const ABILITY_DETAIL_BY_JP = new Map(ABILITY_DETAIL.map((a) => [a.jp, a]));
export const TRAIT_DETAIL_BY_JP = new Map(TRAIT_DETAIL.map((t) => [t.jp, t]));
export const ABILITY_DETAIL_BY_SLUG = new Map(ABILITY_DETAIL.map((a) => [a.slug, a]));
export const TRAIT_DETAIL_BY_SLUG = new Map(TRAIT_DETAIL.map((t) => [t.slug, t]));

/** Effect texts are stored with line breaks; lookups use the single-line form. */
export function effectKey(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function abilityDesc(effect: string): string | undefined {
  return ABILITY_DESC_EN[effectKey(effect)];
}

export function traitDesc(effect: string): string | undefined {
  return TRAIT_DESC_EN[effectKey(effect)];
}

export function traitSpDesc(effect: string): string | undefined {
  return TRAIT_SP_DESC_EN[effectKey(effect)];
}

/* The monster pages carry the equippable weapon types as CSS state, which the
 * first scrape dropped. `monster-weapons.json` holds them for all 908 records. */
const MONSTER_WEAPON_FLAGS = rawMonsterWeapons as unknown as Record<string, string[]>;
for (const m of MONSTERS) {
  const flags = MONSTER_WEAPON_FLAGS[m.id];
  if (flags) m.weapons = flags;
}

/** 30 resistance slots, in the order the source page lists them. */
export const RESIST_KEYS = [
  'メラ', 'ギラ', 'イオ', 'バギ', 'ヒャド', 'ジバリア', 'デイン', 'ドルマ', 'ベタン', 'ザキ',
  '炎', '吹雪', 'こんらん', 'マヒ', 'ねむり', 'マヌーサ', 'マホトラ', 'ハック',
  '呪文封じ', '斬撃封じ', '体技封じ', '息封じ', '踊り封じ', 'ダウン', 'どく', 'ルカニ',
  '呪い', 'ボミエ', 'マインド', 'フール',
];

/** Unofficial English renderings of the resistance slots. */
export const RESIST_LABELS: Record<string, string> = {
  'メラ': 'Frizz',
  'ギラ': 'Sizz',
  'イオ': 'Bang',
  'バギ': 'Woosh',
  'ヒャド': 'Crack',
  'ジバリア': 'Jibaria',
  'デイン': 'Zap',
  'ドルマ': 'Zam',
  'ベタン': 'Betan',
  'ザキ': 'Thwack',
  '炎': 'Fire breath',
  '吹雪': 'Ice breath',
  'こんらん': 'Confusion',
  'マヒ': 'Paralysis',
  'ねむり': 'Sleep',
  'マヌーサ': 'Dazzle',
  'マホトラ': 'Drain',
  'ハック': 'Hack',
  '呪文封じ': 'Spell seal',
  '斬撃封じ': 'Slash seal',
  '体技封じ': 'Skill seal',
  '息封じ': 'Breath seal',
  '踊り封じ': 'Dance seal',
  'ダウン': 'Down',
  'どく': 'Poison',
  'ルカニ': 'Sap',
  '呪い': 'Curse',
  'ボミエ': 'Decelerate',
  'マインド': 'Mind',
  'フール': 'Fool',
};

export const RESIST_LEVELS = ['Normal', 'Weak', 'Half', 'Reduced', 'Null', 'Absorb', 'Reflect', 'Null+'];

export const WEAPON_TYPES = ['Sword', 'Lance', 'Axe', 'Hammer', 'Whip', 'Claw', 'Staff'];

/** English renderings already used for the most common traits. */
export const TRAIT_EN: Record<string, string> = {
  'スタンダードボディ': 'Standard Body',
  'スモールボディ': 'Small Body',
  'メガボディ': 'Mega Body',
  'ギガボディ': 'Gigabody',
  '超ギガボディ': 'Super Gigabody',
  'ライトメタルボディ': 'Light Metal Body',
  'ハードメタルボディ': 'Hard Metal Body',
  'ギャンブルボディ': 'Gamble Body',
  'AI1〜2回行動': 'AI 1–2 actions',
  'AI2回行動': 'AI 2 actions',
  'AI1〜3回行動': 'AI 1–3 actions',
  'AI2〜3回行動': 'AI 2–3 actions',
  'AI3回行動': 'AI 3 actions',
  'こうどうはやい': 'Early Bird',
  'こうどうおそい': 'Slow Starter',
  'みかわしアップ': 'Dodge Up',
  '会心出やすい': 'Critical Up',
  'ひん死で会心': 'Comeback Kid',
  'カウンター': 'Counterattack',
  'ロケットスタート': 'Rocket Start',
  'れんぞく': 'Continuous Attacks',
  'どく攻撃': 'Poison Attack',
  'ねむり攻撃': 'Sleep Attack',
  'マヒ攻撃': 'Paralysis Attack',
  'ラブリー': 'Lovely',
  '自動ＭＰ回復': 'Auto MP Recovery',
  'スカウト％アップ': 'Scout Chance Up',
  'いきなりテンション': 'Sudden Tension',
  '封じブレイク': 'Seal Break',
  '一族のほこり': 'Family Pride',
  'ときどきピオラ': 'Occasional Accelerate',
  '強ガードブレイク': 'Strong Guard Break',
};

export const RANKS: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS'];
export const FAMILIES = ['Slime', 'Dragon', 'Nature', 'Beast', 'Material', 'Demon', 'Zombie', '???'];
export const SIZES = ['S', 'M', 'G', 'Super G'];
export const STAT_LABELS: [StatKey, string][] = [
  ['hp', 'HP'],
  ['mp', 'MP'],
  ['atk', 'Attack'],
  ['def', 'Defence'],
  ['agi', 'Agility'],
  ['wis', 'Wisdom'],
];

export const MONSTER_BY_ID = new Map(MONSTERS.map((m) => [m.id, m]));
export const MONSTER_BY_JP = new Map(MONSTERS.map((m) => [m.jp, m]));
export const SKILL_BY_NAME = new Map(SKILLS.map((s) => [s.name, s]));
export const SKILL_BY_JP = new Map(SKILLS.map((s) => [s.jp, s]));

/** Which skill sets teach a given ability, and at how many skill points. */
export interface AbilityUse {
  skill: string;
  jp: string;
  sp: number;
  count: number;
}

export const ABILITY_SETS = (() => {
  const map = new Map<string, AbilityUse[]>();
  for (const set of SKILLS) {
    for (const entry of set.sp) {
      const list = map.get(entry.name) ?? [];
      if (!list.some((u) => u.skill === set.name)) {
        list.push({ skill: set.name, jp: set.jp, sp: entry.sp, count: set.count });
      }
      map.set(entry.name, list);
    }
  }
  return map;
})();

/** Monsters that can equip a given weapon type. */
export const MONSTERS_BY_WEAPON = (() => {
  const map = new Map<string, Monster[]>();
  for (const w of WEAPON_TYPES) map.set(w, []);
  for (const m of MONSTERS) {
    for (const type of m.weapons ?? []) {
      map.get(type)?.push(m);
    }
  }
  return map;
})();

export const FAMILY_COLOR: Record<string, string> = {
  Slime: '#5aa9d6',
  Dragon: '#c1523c',
  Nature: '#4b9c5f',
  Beast: '#b5822f',
  Material: '#7d8598',
  Demon: '#8352c4',
  Zombie: '#6a7f52',
  '???': '#3d4658',
};

export const RANK_COLOR: Record<string, string> = {
  F: '#8b93a1',
  E: '#3f8fc4',
  D: '#3f9a63',
  C: '#b98a25',
  B: '#c96f2c',
  A: '#b8443a',
  S: '#7a4fc0',
  SS: '#a5761f',
};

/** Highest base stat per key, used to scale bars. */
export const STAT_MAX: Record<StatKey, number> = (() => {
  const max: Record<StatKey, number> = { hp: 1, mp: 1, atk: 1, def: 1, agi: 1, wis: 1 };
  for (const m of MONSTERS) {
    for (const k of Object.keys(max) as StatKey[]) {
      const v = m.stats[k];
      if (v && v > max[k]) max[k] = v;
    }
  }
  return max;
})();

export function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string;
  });
}

export function fmt(n: number | null | undefined): string {
  return typeof n === 'number' ? n.toLocaleString('en-US') : '—';
}

export function iconSrc(icon: string): string {
  return `./img/monster/${icon}.webp`;
}

export function rankBadge(rank: string): string {
  return `<span class="badge rank rank-${esc(rank)}">${esc(rank)}</span>`;
}

export function famBadge(family: string): string {
  const cls = family === '???' ? 'fam-unknown' : `fam-${family}`;
  return `<span class="badge fam ${cls}">${esc(family)}</span>`;
}

export function sizeBadge(size: string): string {
  return `<span class="badge size">${esc(size)}</span>`;
}

export function miniMon(m: Monster): string {
  return `<a class="mini-mon" href="#/monster/${encodeURIComponent(m.id)}">
    <img src="${iconSrc(m.icon)}" alt="" width="28" height="28" loading="lazy" />
    <span>${esc(m.name)}</span>${rankBadge(m.rank)}
  </a>`;
}

/** One synthesis recipe as an ingredient list and its result. */
export function recipeHtml(r: BreedRecipe, result: Monster): string {
  const counts = new Map<string, { name: string; id?: string; n: number }>();
  for (const ing of r.ingredients) {
    const key = ing.id ?? `name:${ing.name}`;
    const hit = counts.get(key);
    if (hit) hit.n += 1;
    else counts.set(key, { name: ing.name, id: ing.id, n: 1 });
  }
  const parts = [...counts.values()].map((c) => {
    const m = c.id ? MONSTER_BY_ID.get(c.id) : undefined;
    const label = m ? miniMon(m) : `<span class="badge tag">${esc(c.name)}</span>`;
    return c.n > 1 ? `${label}<span class="muted small">×${c.n}</span>` : label;
  });
  if (r.family) parts.push(`<span class="badge fam fam-${r.family === '???' ? 'unknown' : r.family}">any ${esc(r.family)}</span>`);
  return `<div class="recipe">
    <div class="recipe-parts">${parts.join('<span class="muted">＋</span>')}</div>
    <div class="recipe-arrow" aria-hidden="true">↓</div>
    <div class="recipe-result">${miniMon(result)}</div>
    <div class="small muted">${r.size === 4 ? 'Four-monster recipe' : 'Two-monster recipe'}</div>
  </div>`;
}

export function monsterCell(m: Monster): string {
  return `<div class="m-name">
    <img src="${iconSrc(m.icon)}" alt="" loading="lazy" width="34" height="34" />
    <a href="#/monster/${encodeURIComponent(m.id)}">${esc(m.name)}</a>
  </div>`;
}

export function sumStats(m: Monster): number {
  return (Object.values(m.stats) as number[]).reduce((a, b) => a + b, 0);
}

export function abilityHref(jp: string): string {
  return hashFor(`ability/${encodeURIComponent(jp)}`);
}

export function traitHref(jp: string): string {
  return hashFor(`trait/${encodeURIComponent(jp)}`);
}

export function hashFor(path: string, params?: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  }
  const s = q.toString();
  return `#/${path}${s ? `?${s}` : ''}`;
}

export function go(path: string): void {
  location.hash = path.startsWith('#') ? path : `#/${path}`;
}

export function replaceHash(path: string): void {
  const url = `${location.pathname}${location.search}${path.startsWith('#') ? path : `#/${path}`}`;
  history.replaceState(null, '', url);
}

/* ---------------- favourites (localStorage only) ---------------- */

const FAV_KEY = 'dqm2-offline:favourites';

export function getFavourites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavourite(id: string): boolean {
  return getFavourites().includes(id);
}

export function toggleFavourite(id: string): boolean {
  const list = getFavourites();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  } catch {
    /* storage can be disabled — favourites simply do not persist */
  }
  return next.includes(id);
}

/* ---------------- toast ---------------- */

let toastTimer: number | undefined;

export function toast(message: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, 2000);
}

/* ---------------- ranking helpers ---------------- */

export function rankOrder(rank: string): number {
  const i = RANKS.indexOf(rank as Rank);
  return i === -1 ? 99 : i;
}

export function sortMonsters(list: Monster[], sort: string): Monster[] {
  const copy = [...list];
  switch (sort) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'rank':
      return copy.sort((a, b) => rankOrder(a.rank) - rankOrder(b.rank) || a.name.localeCompare(b.name));
    case 'rank-desc':
      return copy.sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank) || a.name.localeCompare(b.name));
    case 'total':
      return copy.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    case 'hp':
      return copy.sort((a, b) => (b.stats.hp ?? 0) - (a.stats.hp ?? 0));
    case 'mp':
      return copy.sort((a, b) => (b.stats.mp ?? 0) - (a.stats.mp ?? 0));
    case 'atk':
      return copy.sort((a, b) => (b.stats.atk ?? 0) - (a.stats.atk ?? 0));
    case 'def':
      return copy.sort((a, b) => (b.stats.def ?? 0) - (a.stats.def ?? 0));
    case 'agi':
      return copy.sort((a, b) => (b.stats.agi ?? 0) - (a.stats.agi ?? 0));
    case 'wis':
      return copy.sort((a, b) => (b.stats.wis ?? 0) - (a.stats.wis ?? 0));
    default:
      return copy.sort((a, b) => (a.no ?? 9999) - (b.no ?? 9999));
  }
}

export function searchMonsters(term: string, limit = 8): Monster[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const scored: { m: Monster; s: number }[] = [];
  for (const m of MONSTERS) {
    const name = m.name.toLowerCase();
    let s = -1;
    if (name === q) s = 0;
    else if (name.startsWith(q)) s = 1;
    else if (name.includes(q)) s = 2;
    else if (m.jp.includes(term.trim())) s = 3;
    else if (m.skill.toLowerCase().includes(q)) s = 4;
    if (s >= 0) scored.push({ m, s });
  }
  scored.sort((a, b) => a.s - b.s || a.m.name.localeCompare(b.m.name));
  return scored.slice(0, limit).map((x) => x.m);
}

export function representative(family: string): Monster | undefined {
  return MONSTERS.find((m) => m.family === family && (m.no ?? 9999) > 2);
}

export function countBy(predicate: (m: Monster) => boolean): number {
  return MONSTERS.reduce((n, m) => (predicate(m) ? n + 1 : n), 0);
}
