/**
 * Hand-written reference data: ranks, families, abilities, traits, items,
 * weapons, chapters, eggs and the arena. All names are the unofficial
 * English renderings used across this compendium.
 */

export interface RankInfo {
  rank: string;
  title: string;
  blurb: string;
  statBand: string;
}

export const RANK_INFO: RankInfo[] = [
  { rank: 'F', title: 'Rank F', blurb: 'The first monsters of every playthrough — cheap, common and surprisingly useful as synthesis fodder.', statBand: '~3,200–5,200 total' },
  { rank: 'E', title: 'Rank E', blurb: 'A step up in stats and skill variety. Most early-game teams are built here.', statBand: '~3,700–6,200 total' },
  { rank: 'D', title: 'Rank D', blurb: 'Mid-game monsters with the first really useful resistances and two-slot bodies.', statBand: '~4,000–6,400 total' },
  { rank: 'C', title: 'Rank C', blurb: 'Where specialised monsters appear: metal bodies, dedicated casters and the first giants.', statBand: '~4,200–7,200 total' },
  { rank: 'B', title: 'Rank B', blurb: 'Solid all-rounders and famous series monsters. A common target for synthesis chains.', statBand: '~4,500–6,000 total' },
  { rank: 'A', title: 'Rank A', blurb: 'Story bosses, generals and high-tier breeds. Big stat caps and rare skill sets.', statBand: '~4,500–6,000 total' },
  { rank: 'S', title: 'Rank S', blurb: 'Legendary monsters. Most are built through special synthesis rather than scouted.', statBand: '~3,000–6,400 total' },
  { rank: 'SS', title: 'Rank SS', blurb: 'The top of the dex: gods, fiends and the four-monster syntheses. End-game only.', statBand: '~3,700–7,300 total' },
];

export interface FamilyInfo {
  name: string;
  jp: string;
  color: string;
  blurb: string;
  strengths: string;
  rep: string;
}

export const FAMILY_INFO: FamilyInfo[] = [
  {
    name: 'Slime',
    jp: 'スライム系',
    color: '#5aa9d6',
    blurb: 'The mascot family: squishy, cheap to raise and home to the famous metal and king slimes.',
    strengths: 'Balanced stats · healing · metal bodies',
    rep: 'suraimu',
  },
  {
    name: 'Dragon',
    jp: 'ドラゴン系',
    color: '#c1523c',
    blurb: 'Heavy HP and attack, breath attacks and the best breath resistance in the game.',
    strengths: 'HP · breath · defence',
    rep: 'doragonkizzu',
  },
  {
    name: 'Nature',
    jp: '自然系',
    color: '#4b9c5f',
    blurb: 'Plants, insects and sea life. Fast, tricky and fond of status ailments.',
    strengths: 'Agility · status · MP',
    rep: 'hanakawasemi',
  },
  {
    name: 'Beast',
    jp: '魔獣系',
    color: '#b5822f',
    blurb: 'Physical attackers with the best agility curves — natural claws and whip users.',
    strengths: 'Attack · agility · crits',
    rep: 'itarazuramogura',
  },
  {
    name: 'Material',
    jp: '物質系',
    color: '#7d8598',
    blurb: 'Living armour, golems and machines. Enormous defence and metal-body resistances.',
    strengths: 'Defence · resistances · HP',
    rep: 'obakekyandoru',
  },
  {
    name: 'Demon',
    jp: '悪魔系',
    color: '#8352c4',
    blurb: 'Spellcasters and disruptive support: the best wisdom, the frailest bodies.',
    strengths: 'Wisdom · MP · debuffs',
    rep: 'dorakii',
  },
  {
    name: 'Zombie',
    jp: 'ゾンビ系',
    color: '#6a7f52',
    blurb: 'Undead oddballs with strange resistances, self-destructive skills and cheap bodies.',
    strengths: 'Immunities · revival · attrition',
    rep: 'goosuto',
  },
  {
    name: '???',
    jp: '？？？系',
    color: '#3d4658',
    blurb: 'Bosses, gods and story monsters. Cannot be scouted — they must be synthesised or won.',
    strengths: 'Everything, at a price',
    rep: 'ryuuou',
  },
];

export interface AbilityInfo {
  name: string;
  category: 'Spell' | 'Attack' | 'Breath' | 'Recovery' | 'Support' | 'Debuff';
  effect: string;
}

export const ABILITIES: AbilityInfo[] = [
  { name: 'Frizz', category: 'Spell', effect: 'Hurls a small fireball at one enemy.' },
  { name: 'Frizzle', category: 'Spell', effect: 'A stronger fireball that scorches one enemy.' },
  { name: 'Kafrizz', category: 'Spell', effect: 'A huge ball of flame that engulfs one enemy.' },
  { name: 'Sizz', category: 'Spell', effect: 'A small blast of fire that hits every enemy.' },
  { name: 'Sizzle', category: 'Spell', effect: 'A wave of flame that hits all enemies.' },
  { name: 'Kasizz', category: 'Spell', effect: 'A sea of fire that burns every enemy.' },
  { name: 'Bang', category: 'Spell', effect: 'A small explosion that hits all enemies.' },
  { name: 'Boom', category: 'Spell', effect: 'A large explosion that hits all enemies.' },
  { name: 'Kaboom', category: 'Spell', effect: 'A devastating explosion that hits all enemies.' },
  { name: 'Woosh', category: 'Spell', effect: 'A small whirlwind that slices all enemies.' },
  { name: 'Swoosh', category: 'Spell', effect: 'A powerful whirlwind that slices all enemies.' },
  { name: 'Kaswoosh', category: 'Spell', effect: 'A tornado that tears through all enemies.' },
  { name: 'Crack', category: 'Spell', effect: 'Icicles stab one enemy.' },
  { name: 'Crac', category: 'Spell', effect: 'Larger icicles stab one enemy.' },
  { name: 'Kacrack', category: 'Spell', effect: 'A glacier crushes one enemy.' },
  { name: 'Zap', category: 'Spell', effect: 'A bolt of lightning strikes one enemy.' },
  { name: 'Zapple', category: 'Spell', effect: 'A stronger bolt of lightning.' },
  { name: 'Kazap', category: 'Spell', effect: 'A mighty thunderbolt that hits all enemies.' },
  { name: 'Zam', category: 'Spell', effect: 'A wave of dark power hits one enemy.' },
  { name: 'Zammle', category: 'Spell', effect: 'A stronger wave of dark power.' },
  { name: 'Kazammle', category: 'Spell', effect: 'A blast of darkness that hits all enemies.' },
  { name: 'Drain Magic', category: 'Debuff', effect: 'Steals MP from one enemy.' },
  { name: 'Snooze', category: 'Debuff', effect: 'Puts one enemy to sleep.' },
  { name: 'Kasnooze', category: 'Debuff', effect: 'Puts a group of enemies to sleep.' },
  { name: 'Dazzle', category: 'Debuff', effect: 'Lowers one enemy’s accuracy with a flash of light.' },
  { name: 'Fuddle', category: 'Debuff', effect: 'Confuses one enemy.' },
  { name: 'Sap', category: 'Debuff', effect: 'Lowers one enemy’s defence.' },
  { name: 'Decelerate', category: 'Debuff', effect: 'Lowers one enemy’s agility.' },
  { name: 'Accelerate', category: 'Support', effect: 'Raises one ally’s agility.' },
  { name: 'Oomph', category: 'Support', effect: 'Raises one ally’s attack.' },
  { name: 'Buff', category: 'Support', effect: 'Raises one ally’s defence.' },
  { name: 'Kabuff', category: 'Support', effect: 'Raises the whole party’s defence.' },
  { name: 'Bounce', category: 'Support', effect: 'Reflects the next spell cast at an ally.' },
  { name: 'Fizzle', category: 'Debuff', effect: 'Seals an enemy’s spells.' },
  { name: 'Heal', category: 'Recovery', effect: 'Restores a small amount of HP to one ally.' },
  { name: 'Midheal', category: 'Recovery', effect: 'Restores a moderate amount of HP to one ally.' },
  { name: 'Fullheal', category: 'Recovery', effect: 'Fully restores one ally’s HP.' },
  { name: 'Multiheal', category: 'Recovery', effect: 'Restores HP to the whole party.' },
  { name: 'Omniheal', category: 'Recovery', effect: 'Fully restores the whole party’s HP.' },
  { name: 'Zing', category: 'Recovery', effect: 'Revives one fallen ally with partial HP.' },
  { name: 'Kazing', category: 'Recovery', effect: 'Revives one fallen ally with full HP.' },
  { name: 'Tingle', category: 'Recovery', effect: 'Cures paralysis and confusion for the party.' },
  { name: 'Squelch', category: 'Recovery', effect: 'Cures poison for one ally.' },
  { name: 'Falcon Slash', category: 'Attack', effect: 'Two quick sword strikes on one enemy.' },
  { name: 'Mercurial Thrust', category: 'Attack', effect: 'Always strikes first.' },
  { name: 'Metal Slash', category: 'Attack', effect: 'A sword strike that always connects with metal bodies.' },
  { name: 'Hatchet Man', category: 'Attack', effect: 'A heavy axe blow with a high critical rate.' },
  { name: 'Knuckle Sandwich', category: 'Attack', effect: 'A powerful fist strike.' },
  { name: 'Psyche Up', category: 'Support', effect: 'Raises the user’s tension.' },
  { name: 'Flame Breath', category: 'Breath', effect: 'Fire breath that hits all enemies.' },
  { name: 'Freezing Breath', category: 'Breath', effect: 'Ice breath that hits all enemies.' },
  { name: 'Sweet Breath', category: 'Breath', effect: 'A sweet breath that may put all enemies to sleep.' },
  { name: 'Poison Breath', category: 'Breath', effect: 'A foul breath that may poison all enemies.' },
  { name: 'Boulder Toss', category: 'Attack', effect: 'Hurls a boulder at one enemy, ignoring defence.' },
  { name: 'Body Slam', category: 'Attack', effect: 'A tackle that hurts the user a little too.' },
  { name: 'War Cry', category: 'Support', effect: 'A roar that may freeze enemies in fear.' },
  { name: 'Selflessness', category: 'Support', effect: 'Takes every attack aimed at the party this turn.' },
  { name: 'Kerplunk', category: 'Recovery', effect: 'Sacrifices the user to revive and heal the party.' },
  { name: 'Kamikazee', category: 'Attack', effect: 'A last-resort blast that fells every enemy — and the caster.' },
  { name: 'Magic Barrier', category: 'Support', effect: 'Raises the party’s resistance to spells.' },
  { name: 'Insulate', category: 'Support', effect: 'Raises the party’s resistance to breath attacks.' },
];

export interface TraitInfo {
  name: string;
  category: 'Body' | 'Combat' | 'Resistance' | 'Support' | 'Drawback' | 'Plus';
  effect: string;
}

export const TRAITS: TraitInfo[] = [
  { name: 'Standard Body', category: 'Body', effect: 'An ordinary body: nothing about damage or actions is changed.' },
  { name: 'Small Body', category: 'Body', effect: 'Takes one party slot, but has a lower stat ceiling.' },
  { name: 'Gigabody', category: 'Body', effect: 'Occupies more slots in the party in exchange for raw size and power.' },
  { name: 'Metal Body', category: 'Body', effect: 'Spells and physical attacks mostly bounce off — but HP barely grows.' },
  { name: 'Early Bird', category: 'Combat', effect: 'Acts first in the round, unless another monster shares the trait.' },
  { name: 'AI 1–2 Actions', category: 'Combat', effect: 'Acts once or twice per round without orders.' },
  { name: 'AI 1–3 Actions', category: 'Combat', effect: 'Acts up to three times per round; leftover actions survive orders.' },
  { name: 'Tactical Genius', category: 'Combat', effect: 'Chooses its actions more cleverly when acting on its own.' },
  { name: 'Dodge Up', category: 'Combat', effect: 'Easier to evade enemy attacks.' },
  { name: 'Critical Up', category: 'Combat', effect: 'Landing critical hits is more likely.' },
  { name: 'Counterattack', category: 'Combat', effect: 'Sometimes strikes back when hit.' },
  { name: 'Rocket Start', category: 'Combat', effect: 'Damage dealt is up for the first three rounds, then down.' },
  { name: 'Comeback Kid', category: 'Combat', effect: 'Critical hits become more likely when badly hurt.' },
  { name: 'Poison Attack', category: 'Combat', effect: 'Physical hits may poison the target.' },
  { name: 'Sleep Attack', category: 'Combat', effect: 'Physical hits may put the target to sleep.' },
  { name: 'Paralysis Attack', category: 'Combat', effect: 'Physical hits may paralyse the target.' },
  { name: 'Confusion Attack', category: 'Combat', effect: 'Physical hits may confuse the target.' },
  { name: 'Drain Attack', category: 'Combat', effect: 'Physical hits may steal MP.' },
  { name: 'Frizz Resistance', category: 'Resistance', effect: 'Takes less damage from fire spells.' },
  { name: 'Sizz Resistance', category: 'Resistance', effect: 'Takes less damage from flame spells.' },
  { name: 'Bang Resistance', category: 'Resistance', effect: 'Takes less damage from explosion spells.' },
  { name: 'Woosh Resistance', category: 'Resistance', effect: 'Takes less damage from wind spells.' },
  { name: 'Crack Resistance', category: 'Resistance', effect: 'Takes less damage from ice spells.' },
  { name: 'Zap Resistance', category: 'Resistance', effect: 'Takes less damage from lightning spells.' },
  { name: 'Zam Resistance', category: 'Resistance', effect: 'Takes less damage from dark spells.' },
  { name: 'Fire Breath Resistance', category: 'Resistance', effect: 'Takes less damage from fire breath.' },
  { name: 'Ice Breath Resistance', category: 'Resistance', effect: 'Takes less damage from ice breath.' },
  { name: 'Sleep Resistance', category: 'Resistance', effect: 'Harder to put to sleep.' },
  { name: 'Confusion Resistance', category: 'Resistance', effect: 'Harder to confuse.' },
  { name: 'Poison Resistance', category: 'Resistance', effect: 'Harder to poison.' },
  { name: 'Paralysis Resistance', category: 'Resistance', effect: 'Harder to paralyse.' },
  { name: 'Instant Death Resistance', category: 'Resistance', effect: 'Resists instant-death spells such as Thwack.' },
  { name: 'Spell Seal Resistance', category: 'Resistance', effect: 'Resists having spells sealed.' },
  { name: 'Dance Seal Resistance', category: 'Resistance', effect: 'Resists having dances sealed.' },
  { name: 'Breath Seal Resistance', category: 'Resistance', effect: 'Resists having breath sealed.' },
  { name: 'Artful Dodger', category: 'Support', effect: 'Dodges more often and lands more critical hits.' },
  { name: 'Occasional Kabuff', category: 'Support', effect: 'Sometimes casts Kabuff on itself during battle.' },
  { name: 'Occasional Oomph', category: 'Support', effect: 'Sometimes casts Oomph on itself during battle.' },
  { name: 'Occasional Mist', category: 'Support', effect: 'Sometimes raises a protective mist during battle.' },
  { name: 'Start with White Mist', category: 'Support', effect: 'May open the battle with White Mist.' },
  { name: 'Tension Boost', category: 'Support', effect: 'Sometimes raises its own tension in battle.' },
  { name: 'Escape Artist', category: 'Drawback', effect: 'Flees from battle more easily when things go wrong.' },
  { name: 'Coward', category: 'Drawback', effect: 'Sometimes refuses to act when hurt.' },
  { name: 'Slow Starter', category: 'Drawback', effect: 'Acts later in the round than its agility suggests.' },
  { name: 'Glass Cannon', category: 'Drawback', effect: 'Hits hard but takes increased damage.' },
  { name: 'Plus 25 Trait', category: 'Plus', effect: 'Unlocked when the monster’s plus value reaches +25.' },
  { name: 'Plus 50 Trait', category: 'Plus', effect: 'Unlocked when the monster’s plus value reaches +50.' },
  { name: 'Plus Star Trait', category: 'Plus', effect: 'Unlocked when the monster reaches plus ★.' },
];

export interface ItemInfo {
  name: string;
  category: 'Recovery' | 'Cure' | 'Seed' | 'Battle' | 'Scout' | 'Field' | 'Key';
  effect: string;
  buy?: number;
  sell?: number;
}

export const ITEMS: ItemInfo[] = [
  { name: 'Medicinal Herb', category: 'Recovery', effect: 'Restores about 30 HP to one ally.', buy: 8, sell: 4 },
  { name: 'Strong Medicine', category: 'Recovery', effect: 'Restores about 60 HP to one ally.', buy: 50, sell: 15 },
  { name: 'Magic Water', category: 'Recovery', effect: 'Restores a small amount of MP to one ally.' },
  { name: 'Elf Water', category: 'Recovery', effect: 'Completely restores one ally’s MP.' },
  { name: 'Antidotal Herb', category: 'Cure', effect: 'Cures poison.', buy: 10, sell: 5 },
  { name: 'Moonwort Root', category: 'Cure', effect: 'Cures paralysis.', buy: 30, sell: 15 },
  { name: 'Smelling Salts', category: 'Cure', effect: 'Wakes a sleeping ally.', buy: 80, sell: 40 },
  { name: 'Holy Water', category: 'Field', effect: 'Keeps weak monsters away for a while.' },
  { name: 'Safe Passage Grass', category: 'Field', effect: 'Protects the party from swamp damage for a while.', buy: 60, sell: 30 },
  { name: 'Chimaera Wing', category: 'Field', effect: 'Returns the party to the last town visited.' },
  { name: 'Exit Bell', category: 'Field', effect: 'Escapes from a dungeon instantly.' },
  { name: 'Monster Bait', category: 'Scout', effect: 'Raises the scouting chance a little.', buy: 300, sell: 150 },
  { name: 'Smoked Meat', category: 'Scout', effect: 'Raises the scouting chance a fair amount.', buy: 1500, sell: 750 },
  { name: 'Naughty Book', category: 'Scout', effect: 'Makes the next wild battle male-only.', buy: 250 },
  { name: 'Pretty Boy Magazine', category: 'Scout', effect: 'Makes the next wild battle female-only.', buy: 280 },
  { name: 'Bible of Abstinence', category: 'Scout', effect: 'Removes gender from the next wild battle.' },
  { name: 'Seed of Strength', category: 'Seed', effect: 'Permanently raises attack by 1–3.' },
  { name: 'Seed of Skill', category: 'Seed', effect: 'Permanently raises MP by 1–3.' },
  { name: 'Seed of Defence', category: 'Seed', effect: 'Permanently raises defence by 1–3.' },
  { name: 'Seed of Agility', category: 'Seed', effect: 'Permanently raises agility by 1–3.' },
  { name: 'Seed of Wisdom', category: 'Seed', effect: 'Permanently raises wisdom by 1–3.' },
  { name: 'Seed of Life', category: 'Seed', effect: 'Permanently raises max HP by 1–3.' },
  { name: 'Seed of Happiness', category: 'Seed', effect: 'Raises a monster’s friendship.' },
  { name: 'Mini Medal', category: 'Key', effect: 'Trade them to the Medal Man for rare rewards.' },
  { name: 'White Egg', category: 'Key', effect: 'A common egg that hatches after 1,000 experience.', buy: 1000, sell: 500 },
  { name: 'Silver Egg', category: 'Key', effect: 'A rarer egg with a better monster pool.' },
  { name: 'Gold Egg', category: 'Key', effect: 'A valuable egg with high-rank monsters inside.' },
  { name: 'Rainbow Egg', category: 'Key', effect: 'The rarest egg — home to SS-rank monsters.' },
  { name: 'Oasis Key', category: 'Key', effect: 'Opens the door to the Desert Realm.' },
  { name: 'Pirate Key', category: 'Key', effect: 'Opens the door to the Water Realm.' },
  { name: 'Ice Key', category: 'Key', effect: 'Opens the door to the Snow & Ice Realm.' },
  { name: 'Heaven Key', category: 'Key', effect: 'Opens the door to the Sky Realm.' },
  { name: 'Rift Key', category: 'Key', effect: 'Opens the door to the Rift Realm.' },
  { name: 'Ultimate Key', category: 'Key', effect: 'Opens the post-game dungeons.' },
  { name: 'Mistletoe Key', category: 'Key', effect: 'Opens the Tower of Mistletoe.' },
];

export interface WeaponInfo {
  type: string;
  jp: string;
  blurb: string;
  weapons: { name: string; atk?: number; effect?: string; price?: number }[];
}

export const WEAPONS: WeaponInfo[] = [
  {
    type: 'Sword',
    jp: '剣',
    blurb: 'The all-rounder: reliable attack, the widest skill coverage and the best metal-hunting options.',
    weapons: [
      { name: 'Copper Sword', atk: 10, price: 270 },
      { name: 'Iron Sword' },
      { name: 'Steel Broadsword' },
      { name: 'Zombie Slayer', effect: 'Bonus damage against the Zombie family.' },
      { name: 'Metal King Sword', effect: 'A legendary blade that cuts through metal bodies.' },
    ],
  },
  {
    type: 'Lance',
    jp: '槍',
    blurb: 'Long reach and piercing thrusts; strong against the Slime family.',
    weapons: [
      { name: 'Iron Lance', atk: 9, price: 310, effect: 'Bonus damage against Slimes.' },
      { name: 'Steel Lance' },
      { name: 'Partisan' },
      { name: 'Demon Spear' },
    ],
  },
  {
    type: 'Axe',
    jp: '斧',
    blurb: 'Heavy swings and the highest single-hit damage, at the cost of accuracy.',
    weapons: [
      { name: 'Stone Axe', atk: 7, price: 180 },
      { name: 'Iron Axe' },
      { name: 'Great Axe' },
      { name: 'Hell Scythe' },
    ],
  },
  {
    type: 'Hammer',
    jp: '鎚',
    blurb: 'Crushing blows that often ignore defence; the classic golem weapon.',
    weapons: [
      { name: 'Oaken Club', atk: 3, price: 120, effect: 'Also raises defence by 5.' },
      { name: 'Iron Hammer' },
      { name: 'War Hammer' },
      { name: 'Gigant Hammer' },
    ],
  },
  {
    type: 'Whip',
    jp: '鞭',
    blurb: 'Hits every enemy at once — the best weapon for clearing groups.',
    weapons: [
      { name: 'Leather Whip', atk: 4, price: 380, effect: 'Hits all enemies.' },
      { name: 'Chain Whip' },
      { name: 'Spiked Whip' },
      { name: 'Goddess Whip' },
    ],
  },
  {
    type: 'Claw',
    jp: '爪',
    blurb: 'Fast multi-hit strikes that scale with agility.',
    weapons: [
      { name: 'Stone Claws', atk: 5, price: 200, effect: 'Also raises agility by 8.' },
      { name: 'Iron Claws' },
      { name: 'Beast Claws' },
      { name: 'Killer Claws' },
    ],
  },
  {
    type: 'Staff',
    jp: '杖',
    blurb: 'Raises wisdom and MP — the caster’s weapon of choice.',
    weapons: [
      { name: 'Cypress Staff', atk: 4, price: 150, effect: 'Also raises wisdom by 10.' },
      { name: 'Magic Staff' },
      { name: 'Light Staff' },
      { name: 'Staff of Resurrection' },
    ],
  },
];

export interface Chapter {
  slug: string;
  number: string;
  title: string;
  keyItem: string;
  realm: string;
  blurb: string;
  towns: string[];
  dungeons: string[];
  objectives: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    slug: 'desert',
    number: '1',
    title: 'The Desert Realm',
    keyItem: 'Oasis Key',
    realm: 'Desert Realm',
    blurb:
      'The first world behind a key. Greatlog’s coast gives way to Kalka Village and the sun-bleached town of Asiya, with the Pyramid waiting at the end of the sand.',
    towns: ['Greatlog', 'Kalka Village', 'Asiya'],
    dungeons: ['Coast of Beginnings', 'Underground Canal', 'Door Shrine', 'Pyramid', 'Oasis Camp'],
    objectives: [
      'Leave Greatlog and follow the coast to the Oasis Key.',
      'Cross the desert to Kalka Village and register at the inn.',
      'Reach Asiya, then open the Door Shrine with the Oasis Key.',
      'Clear the Pyramid and its basement to finish the realm.',
    ],
  },
  {
    slug: 'water',
    number: '2',
    title: 'The Water Realm',
    keyItem: 'Pirate Key',
    realm: 'Water Realm',
    blurb:
      'A drowned world of islands and lighthouses where the weather changes what you meet. Polonia, Port Ritz and Yoldo are the safe harbours.',
    towns: ['Polonia Village', 'Port Ritz', 'Yoldo Village'],
    dungeons: ['Blue Cave', 'West Cape Cave', 'Ancient Lighthouse', 'Volcano Island Cave', 'Lake Demon Tower'],
    objectives: [
      'Obtain the Pirate Key and sail out from Polonia.',
      'Light the Ancient Lighthouse to open the sea routes.',
      'Cross the whirlpool to Lady Leviathan’s stretch of water.',
      'Defeat the realm’s guardian and claim the Ice Key.',
    ],
  },
  {
    slug: 'snow',
    number: '3',
    title: 'The Snow & Ice Realm',
    keyItem: 'Ice Key',
    realm: 'Snow & Ice Realm',
    blurb:
      'Frozen forests and border mines, with Eastria, Westanya, Wiston and Norsden strung along the ice. The Lost Woods hide one of the game’s best detours.',
    towns: ['Eastria', 'Westanya', 'Wiston', 'Norsden', 'Nofo'],
    dungeons: ['Lost Woods', 'Border Mine', 'Snow Mountain Ice Cave', 'North Mountain', 'Tower of Sages', 'Castle of the Dead', 'Lake Demon Tower'],
    objectives: [
      'Unlock the realm with the Ice Key.',
      'Chart the Lost Woods — the map is the puzzle.',
      'Explore the Border Mine and the Snow Mountain Ice Cave.',
      'Enter the Castle of the Dead and take the Heaven Key.',
    ],
  },
  {
    slug: 'sky',
    number: '4',
    title: 'The Sky Realm',
    keyItem: 'Heaven Key',
    realm: 'Sky Realm',
    blurb:
      'Floating islands above the clouds: Hitano, Pey and Funt, the Tower of Wind, the Temple of the Sea God and the Demon King’s Castle.',
    towns: ['Hitano', 'Pey', 'Funt'],
    dungeons: ['Tower of Wind', 'Small Cave', 'East Cave', 'West Mountain', 'Temple of the Sea God', "Demon King's Castle"],
    objectives: [
      'Reach the Sky Realm with the Heaven Key.',
      'Climb the Tower of Wind to open the sky routes.',
      'Gather the keys to the Temple of the Sea God.',
      'Storm the Demon King’s Castle and finish the main story.',
    ],
  },
  {
    slug: 'rift',
    number: '5',
    title: 'The Rift Realm',
    keyItem: 'Rift Key',
    realm: 'Rift Realm',
    blurb:
      'A narrow world between worlds. Dork’s Manor sits at its heart, full of the game’s strangest encounters and the key to the post-game.',
    towns: ['Rift Gate'],
    dungeons: ["Dork's Manor"],
    objectives: [
      'Find the Rift Key in the late-game dungeons.',
      'Explore every floor of Dork’s Manor.',
      'Defeat the manor’s master to unlock the Ultimate Key.',
    ],
  },
  {
    slug: 'ultimate',
    number: '6',
    title: 'The Ultimate Key',
    keyItem: 'Ultimate Key',
    realm: 'Ultimate',
    blurb:
      'Post-game territory. The Ultimate Key opens remixed dungeons where the highest-rank monsters, giant bosses and rare eggs appear.',
    towns: ['Greatlog'],
    dungeons: ['Ultimate dungeons', 'Alchemy key routes'],
    objectives: [
      'Craft or find the Ultimate Key after clearing the Rift Realm.',
      'Farm alchemy keys for rank S and SS monsters.',
      'Take on the giant monsters roaming each realm.',
      'Complete the dex and the arena cups.',
    ],
  },
  {
    slug: 'mistletoe',
    number: '7',
    title: 'Tower of Mistletoe',
    keyItem: 'Mistletoe Key',
    realm: 'Mistletoe Realm',
    blurb:
      'The endless tower: seven floors of escalating encounters, a metal-slime fusion on the way up and the strongest wandering monsters in the game.',
    towns: ['Tower camp'],
    dungeons: ['Tower of Mistletoe (1F–5F)', 'Path to the summit'],
    objectives: [
      'Enter with the Mistletoe Key once the post-game opens.',
      'Climb floors 1–5, resting between runs.',
      'Watch for the Metal Slime fusion on the upper floors.',
      'Beat the summit to prove the team is finished.',
    ],
  },
];

export const EGG_INFO = [
  {
    id: 'white',
    name: 'White Egg',
    jp: 'しろいタマゴ',
    price: '1,000 G',
    blurb: 'The common egg. Needs 1,000 experience to hatch and holds rank F–D monsters.',
  },
  {
    id: 'silver',
    name: 'Silver Egg',
    jp: 'ぎんのタマゴ',
    price: '—',
    blurb: 'Mid-tier egg. Adds rank C–B monsters to the pool.',
  },
  {
    id: 'gold',
    name: 'Gold Egg',
    jp: 'きんのタマゴ',
    price: '—',
    blurb: 'Rare egg with rank A–S monsters, including some story bosses.',
  },
  {
    id: 'rainbow',
    name: 'Rainbow Egg',
    jp: 'にじのタマゴ',
    price: '—',
    blurb: 'The rarest egg. SS-rank monsters and the gran slimes live here.',
  },
] as const;

export interface DreamEggInfo {
  name: string;
  jp: string;
  note: string;
}

export const DREAM_EGGS: DreamEggInfo[] = [
  { name: 'Dream Egg (White)', jp: '夢見るタマゴ(白)', note: 'StreetPass and event egg — a wider pool than the shop egg of the same colour.' },
  { name: 'Dream Egg (Silver)', jp: '夢見るタマゴ(銀)', note: 'Unlocked through StreetPass; adds mid-rank exclusives.' },
  { name: 'Dream Egg (Gold)', jp: '夢見るタマゴ(金)', note: 'Rare StreetPass egg with high-rank monsters.' },
  { name: 'Dream Egg (Rainbow)', jp: '夢見るタマゴ(虹)', note: 'The top egg: most SS-rank monsters can only be hatched from it.' },
];

export const ARENA = [
  { cls: 'C', title: 'Class C Cup', blurb: 'The entry bracket. One-slot monsters, low stat caps.' },
  { cls: 'B', title: 'Class B Cup', blurb: 'Mixed brackets where two-slot monsters start to matter.' },
  { cls: 'A', title: 'Class A Cup', blurb: 'High-rank opponents with proper skill sets and equipment.' },
  { cls: 'S', title: 'Class S Cup', blurb: 'The champion bracket: SS-rank teams and giant bodies.' },
  { cls: 'Kids', title: 'Kids’ Cup', blurb: 'A separate bracket for the child masters of Greatlog.' },
  { cls: 'Event', title: 'Daily Events', blurb: 'The arena rotates special rules every in-game day.' },
];

export const SITE_NOTES = {
  game: 'Dragon Quest Monsters 2: Iru and Luca’s Marvelous Mysterious Key',
  gameJp: 'ドラゴンクエストモンスターズ2 イルとルカの不思議なふしぎな鍵',
  platform: 'Nintendo 3DS (2014) · iOS / Android (2020, “SP”)',
  source: 'game-cap.com/dqm2 — イルルカ攻略',
};
