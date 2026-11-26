/**
 * Unofficial English renderings for the reference terminology.
 *
 * Every table here maps the Japanese source term to the English used across the
 * app. Japanese is always kept on screen next to it, so nothing is lost when a
 * rendering differs from another fan translation.
 */
import traitMap from './data/i18n-traits.json';
import abilityMap from './data/i18n-abilities.json';
import itemMap from './data/i18n-items.json';
import weaponMap from './data/i18n-weapons.json';

export const TRAIT_EN = traitMap as Record<string, string>;
export const ABILITY_EN = abilityMap as Record<string, string>;
export const ITEM_EN = itemMap as Record<string, string>;
export const WEAPON_EN = weaponMap as Record<string, string>;

/** Japanese item section → English heading. */
export const ITEM_CATEGORY_EN: Record<string, string> = {
  '回復・復活': 'Recovery & revival',
  '状態異常の回復': 'Status cures',
  '能力アップ（きのみ・タネ）': 'Stat boosts (acorns & seeds)',
  'スキルの証': 'Skill crests',
  '戦闘で使う道具': 'Battle items',
  'スカウト用の肉・エサ': 'Scouting meat & feed',
  'フィールドで使う道具': 'Field items',
  '売ってお金にするアイテム': 'Items to sell',
  '配合・カギ錬金': 'Synthesis & key alchemy',
  '大事な物': 'Key items',
  '店で買える素材': 'Shop materials',
  'モンスターや拾いで集める素材': 'Monster & gather materials',
  '貴重な素材（アイ・オーブ）': 'Precious materials (eyes & orbs)',
  Material: 'Materials',
};

/** Japanese resistance / element tag → English. */
const ELEMENT_EN: Record<string, string> = {
  メラ: 'Frizz',
  ギラ: 'Sizz',
  イオ: 'Bang',
  バギ: 'Woosh',
  ヒャド: 'Crack',
  ジバリア: 'Jibaria',
  デイン: 'Zap',
  ドルマ: 'Zam',
  ベタン: 'Betan',
  ザキ: 'Whack',
  炎: 'Fire',
  吹雪: 'Ice',
  無: 'Neutral',
  マホトラ: 'Drain',
  マホトーン: 'Spell seal',
  ハック: 'Hack',
  混乱: 'Confusion',
  こんらん: 'Confusion',
  眠り: 'Sleep',
  ねむり: 'Sleep',
  呪い: 'Curse',
  マヌーサ: 'Dazzle',
  どく: 'Poison',
  ルカニ: 'Sap',
  ダウン: 'Down',
  マヒ: 'Paralysis',
  フール: 'Fool',
  ボミエ: 'Decelerate',
  マインド: 'Mind',
  体技封じ: 'Skill seal',
  息封じ: 'Breath seal',
  踊り封じ: 'Dance seal',
  斬撃封じ: 'Slash seal',
  踊封じ: 'Dance seal',
};

/** `メラ･炎` → `Frizz · Fire`; unknown fragments are kept as they are. */
export function elementEn(value: string): string {
  if (!value) return '';
  return value
    .split(/[･・\s]+/)
    .filter(Boolean)
    .map((part) => ELEMENT_EN[part] ?? part)
    .join(' · ');
}

/** Japanese item source tag → English. */
export const TAG_EN: Record<string, string> = {
  店: 'Shop',
  拾う: 'Gather',
  宝箱: 'Chest',
  落とす: 'Drop',
  レアドロップ: 'Rare drop',
  クリア報酬: 'Clear reward',
  宝: 'Treasure',
  購入: 'Buy',
};

const STAT_EN: Record<string, string> = {
  最大ＨＰ: 'Max HP',
  最大ＭＰ: 'Max MP',
  攻撃力: 'Attack',
  守備力: 'Defence',
  すばやさ: 'Agility',
  かしこさ: 'Wisdom',
  ＨＰ: 'HP',
  ＭＰ: 'MP',
};

/** `攻撃力＋４` → `Attack +4` (the per-point stat bonuses of skill trees). */
export function statBonusEn(value: string): string | undefined {
  const hit = /^(.+?)＋(\d+)$/.exec(value.trim());
  if (!hit) return undefined;
  const base = STAT_EN[hit[1]];
  return base ? `${base} +${hit[2]}` : undefined;
}

export function traitEn(jp: string): string | undefined {
  return TRAIT_EN[jp] ?? statBonusEn(jp);
}

export function abilityEn(jp: string): string | undefined {
  return ABILITY_EN[jp] ?? TRAIT_EN[jp] ?? statBonusEn(jp);
}

export function itemEn(jp: string): string {
  return ITEM_EN[jp] ?? jp;
}

export function weaponEn(jp: string): string {
  return WEAPON_EN[jp] ?? jp;
}
