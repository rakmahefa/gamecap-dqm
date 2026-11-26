#!/usr/bin/env python3
"""Build the English effect texts for items and weapons.

`items.json` and `weapons.json` keep the reference's Japanese effect text.
This script writes ../src/data/i18n-item-desc.json and
../src/data/i18n-weapon-desc.json, keyed by the whitespace-normalised Japanese
text, for the app to show beside the source.

Most item effects are formulaic, so they are not written out by hand:

* skill crests (`味方1体がスキル「…」を覚える。`) use the English name of the
  skill set from skills.json;
* synthesis materials are `、`-separated lists of bonuses translated one part
  at a time (MATERIAL_EN).

Everything else, and every weapon effect, is hand-written in ITEM_EN /
WEAPON_EN below. The script refuses to write a file when a text has no
rendering, so a new scrape cannot silently ship untranslated effects.

Run from this folder:

    python3 translate_effects.py
"""
import json
import re

ITEM_EN = {
    '味方1体のHPを30回復する。': 'Restores 30 HP to one ally.',
    '味方1体のHPを60回復する。': 'Restores 60 HP to one ally.',
    '味方1体のHPを120回復する。': 'Restores 120 HP to one ally.',
    '味方1体のHPを240回復する。': 'Restores 240 HP to one ally.',
    '味方全体のHPを50～60回復する。戦闘中は、スタンバイのモンスターには効果がない。':
        'Restores 50–60 HP to all allies. In battle, standby monsters are not affected.',
    '味方全体のHPを100～120回復する。戦闘中は、スタンバイのモンスターには効果がない。':
        'Restores 100–120 HP to all allies. In battle, standby monsters are not affected.',
    '味方1体のMPを30回復する。': 'Restores 30 MP to one ally.',
    '味方1体のMPを90回復する。': 'Restores 90 MP to one ally.',
    '味方1体のMPを完全に回復する。': 'Fully restores one ally’s MP.',
    '味方1体を復活させ、HPを最大値の半分まで回復する。':
        'Revives one ally and restores HP up to half its maximum.',
    'すべての味方を復活させ、味方全体のHPを完全に回復する。戦闘中は、スタンバイのモンスターには効果がない。':
        'Revives every ally and fully restores the party’s HP. In battle, standby monsters are not affected.',
    '味方1体の毒を治す。': 'Cures one ally’s poison.',
    '味方1体のマヒを治す。': 'Cures one ally’s paralysis.',
    '味方1体の混乱と眠りを治す。': 'Cures one ally’s confusion and sleep.',
    '味方1体の悪い状態変化を治す。': 'Cures every bad status change on one ally.',
    '味方1体の最大HPを2～4上げる。': 'Raises one ally’s max HP by 2–4.',
    '味方1体の最大MPを2～4上げる。': 'Raises one ally’s max MP by 2–4.',
    '味方1体の攻撃力を1～2上げる。': 'Raises one ally’s Attack by 1–2.',
    '味方1体の守備力を1～2上げる。': 'Raises one ally’s Defence by 1–2.',
    '味方1体のすばやさを1～2上げる。': 'Raises one ally’s Agility by 1–2.',
    '味方1体のかしこさを1～2上げる。': 'Raises one ally’s Wisdom by 1–2.',
    '味方1体のスキルポイントを3増やす。': 'Adds 3 skill points to one ally.',
    '味方1体をレベルアップさせる。': 'Levels one ally up.',
    '味方全体のテンションを1段階上げる。': 'Raises the whole party’s tension by one stage.',
    '4～7ラウンドの間、味方1体の耐性を1段階上げる。':
        'For 4–7 rounds, raises one ally’s resistances by one stage.',
    '4～7ラウンドの間、味方全体の耐性を1段階上げる。':
        'For 4–7 rounds, raises the whole party’s resistances by one stage.',
    '4～7ラウンドの間、味方1体の息への耐性を2段階上げる。':
        'For 4–7 rounds, raises one ally’s breath resistance by two stages.',
    '4～7ラウンドの間、味方全体の息への耐性を1段階上げる。':
        'For 4–7 rounds, raises the whole party’s breath resistance by one stage.',
    '2～5ラウンドの間、味方1体の攻撃力を2段階上げる。':
        'For 2–5 rounds, raises one ally’s Attack by two stages.',
    '2～5ラウンドの間、味方全体の攻撃力を1段階上げる。':
        'For 2–5 rounds, raises the whole party’s Attack by one stage.',
    '4～7ラウンドの間、味方1体の守備力を2段階上げる。':
        'For 4–7 rounds, raises one ally’s Defence by two stages.',
    '4～7ラウンドの間、味方全体の守備力を1段階上げる。':
        'For 4–7 rounds, raises the whole party’s Defence by one stage.',
    '4～7ラウンドの間、味方1体のすばやさを2段階上げる。':
        'For 4–7 rounds, raises one ally’s Agility by two stages.',
    '4～7ラウンドの間、味方全体のすばやさを1段階上げる。':
        'For 4–7 rounds, raises the whole party’s Agility by one stage.',
    '4～7ラウンドの間、味方1体のかしこさを2段階上げる。':
        'For 4–7 rounds, raises one ally’s Wisdom by two stages.',
    '4～7ラウンドの間、味方全体のかしこさを1段階上げる。':
        'For 4–7 rounds, raises the whole party’s Wisdom by one stage.',
    '4～7ラウンドの間、敵1体の呪文を封じる。': 'For 4–7 rounds, seals one enemy’s spells.',
    '2～5ラウンドの間、敵1体の攻撃力を2段階下げる。':
        'For 2–5 rounds, lowers one enemy’s Attack by two stages.',
    '2～5ラウンドの間、敵全体の攻撃力を1段階下げる。':
        'For 2–5 rounds, lowers the whole enemy party’s Attack by one stage.',
    '4～7ラウンドの間、敵1体の守備力を2段階下げる。':
        'For 4–7 rounds, lowers one enemy’s Defence by two stages.',
    '4～7ラウンドの間、敵全体の守備力を1段階下げる。':
        'For 4–7 rounds, lowers the whole enemy party’s Defence by one stage.',
    '4～7ラウンドの間、敵1体のすばやさを2段階下げる。':
        'For 4–7 rounds, lowers one enemy’s Agility by two stages.',
    '4～7ラウンドの間、敵全体のすばやさを1段階下げる。':
        'For 4–7 rounds, lowers the whole enemy party’s Agility by one stage.',
    '4～7ラウンドの間、敵1体のかしこさを2段階下げる。':
        'For 4–7 rounds, lowers one enemy’s Wisdom by two stages.',
    '4～7ラウンドの間、敵全体のかしこさを1段階下げる。':
        'For 4–7 rounds, lowers the whole enemy party’s Wisdom by one stage.',
    '敵1体に0～1のダメージを与える。': 'Deals 0–1 damage to one enemy.',
    '敵1体に1～3のダメージを与える。': 'Deals 1–3 damage to one enemy.',
    '敵1体のHPを残り1にする。ザキ系への耐性が「弱点」か「普通」の敵にだけ効く。':
        'Leaves one enemy with 1 HP. Only works on enemies whose Whack resistance is Weak or Normal.',
    '敵1体を、何かしらの悪い状態にする。': 'Inflicts a random bad status on one enemy.',
    '敵全体を、スカウトゲージが最初から上がっている状態にして、毒にする。':
        'Starts the whole enemy party with a partly filled scout gauge and poisons them.',
    '敵全体を、スカウトゲージが最初から上がっている状態にする。':
        'Starts the whole enemy party with a partly filled scout gauge.',
    '敵全体を、スカウトゲージが最初から上がっている状態にする。上がる量は魔物のエサの2倍。':
        'Starts the whole enemy party with a partly filled scout gauge, at twice the rate of Monster Feed.',
    '敵全体を、スカウトゲージが最初から上がっている状態にする。上がる量は魔物のエサの4倍。':
        'Starts the whole enemy party with a partly filled scout gauge, at four times the rate of Monster Feed.',
    '敵全体を、スカウトゲージが最初から上がっている状態にする。上がる量は魔物のエサの8倍。':
        'Starts the whole enemy party with a partly filled scout gauge, at eight times the rate of Monster Feed.',
    '敵全体を、スカウトゲージが最初から100％の状態にする。':
        'Starts the whole enemy party with the scout gauge at 100%.',
    'つぎの戦闘で出てくる野生モンスターが、すべて♀になる。':
        'All wild monsters in the next battle become female.',
    'つぎの戦闘で出てくる野生モンスターが、すべて♂になる。':
        'All wild monsters in the next battle become male.',
    'つぎの戦闘で出てくる野生モンスターが、すべて両性になる。':
        'All wild monsters in the next battle become both sexes.',
    'しばらくの間、毒の沼などでダメージを受けなくなる。毒の沼などがない場所では使えない。':
        'Prevents damage from poison swamps and similar ground for a while. Cannot be used where there is none.',
    '10回戦闘するか、別の世界へ移動するまでの間、戦闘で手に入る経験値とお金が2倍になる。':
        'Doubles experience and gold from battles for 10 battles, or until you travel to another world.',
    '売るとお金になる（店では買えない）。': 'Sells for gold (cannot be bought in shops).',
    '新生配合ができるようになる。': 'Unlocks new-life synthesis.',
    'カギ錬金で、ふしぎなカギを作るときに使う。': 'Used in key alchemy to craft mysterious keys.',
    'モントナーの見た目を変えられる。': 'Changes Moddy’s appearance.',
    '持っていると、お店の商品が2割引きになる。': 'While held, shop prices are 20% lower.',
    '木の実パイが入った包み。': 'A parcel containing a nut pie.',
    '砂漠の世界の秘宝。水を渡るチカラが秘められている。':
        'A treasure of the desert world. It holds the power to cross water.',
    '灯台にささげると、潮が満ちるという神秘の石。':
        'A mysterious stone said to raise the tide when offered at the lighthouse.',
    '精霊の使いであることを証明する、聖なる印。': 'A holy seal proving one serves the spirits.',
    'なぞの少女の魂。': 'The soul of a mysterious girl.',
    '北の山に生えている、とても珍しい薬草。': 'A very rare herb that grows in the northern mountains.',
    '水の世界の秘宝。大きな岩を壊すチカラが秘められている。':
        'A treasure of the water world. It holds the power to shatter great rocks.',
    '雪と氷の世界の秘宝。空を飛ぶチカラが秘められている。':
        'A treasure of the world of snow and ice. It holds the power of flight.',
    '聖なるチカラを宿す、ありがたい本。': 'A sacred book imbued with holy power.',
    '聖なるチカラを宿す、美しい法衣。': 'A beautiful robe imbued with holy power.',
    '聖なるチカラを宿す、すばらしい杯。': 'A splendid chalice imbued with holy power.',
    'ワルぼうの姿をかたどった、等身大の黄金の像。': 'A life-size golden statue of Warubou.',
    '天空の世界の秘宝。聖なるチカラが秘められている。':
        'A treasure of the sky world. It holds holy power.',
    'ピラミッドの入り口の扉を開けるカギ。': 'The key that opens the pyramid’s entrance.',
    '海神の神殿の入り口の扉を開けるカギ。':
        'The key that opens the entrance of the Sea God’s temple.',
    '湖上の魔塔の2階へつづく扉を開けるカギ。':
        'The key that opens the door to the second floor of the magic tower on the lake.',
    '金色に輝く勾玉。': 'A magatama that gleams gold.',
    '瑠璃色に輝く勾玉。': 'A magatama that gleams lapis blue.',
    '銀色に輝く勾玉。': 'A magatama that gleams silver.',
    '虹色に輝く勾玉。': 'A magatama that gleams in rainbow colours.',
    'ふ化させると、モンスターが仲間になる。': 'Hatches into a monster that joins your party.',
    'メダルおじいさんに渡すと、いろいろなものと交換してもらえる。':
        'Give it to Medal Grandpa to exchange for various rewards.',
    'マルタの国の超しもふりにくの専門店で、超しもふりにくと交換してもらえる。':
        'Exchanged for Super Marbled Meat at the Super Marbled Meat shop in Malta.',
    'ふしぎなカギの世界に散らばる宝物のかけら。':
        'A fragment of treasure scattered through the mysterious key worlds.',
    'ふしぎなカギをたばねるための金具。': 'A clasp for bundling mysterious keys.',
}

# One `、` part of a synthesis material's bonus list.
MATERIAL_EN = {
    '攻撃力＋10': 'Attack +10',
    'デイン耐性アップ': 'Zap resistance up',
    'かしこさ＋20': 'Wisdom +20',
    '体技封じ耐性アップ': 'Skill-seal resistance up',
    'マインド耐性アップ': 'Rest resistance up',
    'マホトラ耐性アップ': 'Drain resistance up',
    '守備力＋40': 'Defence +40',
    'HP成長力アップ小': 'HP growth up (small)',
    'HP成長力アップ': 'HP growth up',
    '眠り耐性アップ': 'Sleep resistance up',
    'ヒャド耐性アップ': 'Crack resistance up',
    '守備力＋20': 'Defence +20',
    '守備力＋60': 'Defence +60',
    '守備力成長力アップ小': 'Defence growth up (small)',
    '守備力＋10': 'Defence +10',
    '経験値増': 'Experience up',
    'ダウン耐性アップ': 'Down resistance up',
    'ルカニ耐性アップ': 'Sap resistance up',
    'ザキ耐性アップ': 'Whack resistance up',
    'かしこさ＋40': 'Wisdom +40',
    '守備力成長力アップ': 'Defence growth up',
    'すばやさ＋10': 'Agility +10',
    'すばやさ成長力アップ': 'Agility growth up',
    'MP成長力アップ小': 'MP growth up (small)',
    'すばやさ＋5': 'Agility +5',
    'すばやさ＋20': 'Agility +20',
    'アンチみかわしアップ': 'Anti-Dodge Up',
    'すばやさ成長力アップ小': 'Agility growth up (small)',
    'マヌーサ耐性アップ': 'Dazzle resistance up',
    'すばやさ＋30': 'Agility +30',
    'みかわしアップ': 'Dodge Up',
    'バギ耐性アップ': 'Woosh resistance up',
    'かしこさ＋10': 'Wisdom +10',
    'かしこさ＋60': 'Wisdom +60',
    '息封じ耐性アップ': 'Breath-seal resistance up',
    '攻撃力＋5': 'Attack +5',
    '攻撃力＋20': 'Attack +20',
    '攻撃力＋30': 'Attack +30',
    '会心出やすい': 'Critical Up',
    'スカウトアタック2倍': 'Scout attack ×2',
    'マヒ耐性アップ': 'Paralysis resistance up',
    'ギガキラー': 'Giga Killer',
    'せんせいりつアップ': 'Pre-emptive Up',
    'ジバリア耐性アップ': 'Jibaria resistance up',
    'しょうひMPせつやく': 'MP cost reduction',
    'MP成長力アップ': 'MP growth up',
    'かしこさ成長力アップ': 'Wisdom growth up',
    'スキル成長力アップ小': 'Skill growth up (small)',
    '呪文封じ耐性アップ': 'Spell-seal resistance up',
    'ギラ耐性アップ': 'Sizz resistance up',
    'にげあし': 'Escape Artist',
    '吹雪耐性アップ': 'Ice Breath resistance up',
    'かしこさ成長力アップ小': 'Wisdom growth up (small)',
    '経験値アップ小': 'Experience up (small)',
    'テンションバーン＋': 'Tension Burn +',
    'メラ耐性アップ': 'Frizz resistance up',
    'ゴールド増': 'Gold Up',
    'メタルキラー': 'Metal Killer',
    '混乱耐性アップ': 'Confusion resistance up',
    '呪文会心出やすい': 'Spell Critical Up',
    'ベタン耐性アップ': 'Betan resistance up',
    'イオ耐性アップ': 'Bang resistance up',
    '攻撃力成長力アップ': 'Attack growth up',
    '攻撃力成長力アップ小': 'Attack growth up (small)',
    '踊り封じ耐性アップ': 'Dance-seal resistance up',
    '炎耐性アップ': 'Fire resistance up',
    '斬撃封じ耐性アップ': 'Slash-seal resistance up',
    'ドルマ耐性アップ': 'Zam resistance up',
    'スタンダードキラー': 'Standard Killer',
    'スキル成長力アップ': 'Skill growth up',
    'ボミエ耐性アップ': 'Decelerate resistance up',
    'アイテム％アップ': 'Item Drop Up',
    'ゴールドアップ小': 'Gold Up (small)',
    'フール耐性アップ': 'Fool resistance up',
    '呪い耐性アップ': 'Curse resistance up',
    '毒耐性アップ': 'Poison resistance up',
    'ハック耐性アップ': 'Hack resistance up',
}

WEAPON_EN = {
    'ゾンビ系へのダメージが２０％アップ。': 'Damage to Zombie monsters +20%.',
    'ドラゴン系へのダメージが５％アップ。': 'Damage to Dragon monsters +5%.',
    'レベルアップ時スキルポイントが１．５倍。': 'Skill points on level up ×1.5.',
    'ゾンビ系へのダメージが１０％アップ。': 'Damage to Zombie monsters +10%.',
    'ドラゴン系へのダメージが１０％アップ。': 'Damage to Dragon monsters +10%.',
    'ダメージ＋１、メタル系に必中。': 'Damage +1; always hits Metal monsters.',
    'ゾンビ系へのダメージが１５％アップ。': 'Damage to Zombie monsters +15%.',
    'ドラゴン系へのダメージが１５％アップ。': 'Damage to Dragon monsters +15%.',
    '与えたダメージの半分のＨＰを回復（上限１００）。':
        'Restores HP equal to half the damage dealt (max 100).',
    '系統バーンの確率上昇。': 'Raises the Tension Burn chance against every family.',
    'ドラゴン系へのダメージが２０％アップ。': 'Damage to Dragon monsters +20%.',
    'すばやさ＋２０、かしこさ＋２０。': 'Agility +20, Wisdom +20.',
    'メタル系へのダメージが＋３。': 'Damage to Metal monsters +3.',
    'ルカナンの効果。': 'Has the effect of Kasap.',
    'スライム系へのダメージが５％アップ。': 'Damage to Slime monsters +5%.',
    'ダモーレの効果。': 'Has the effect of Damore.',
    '自然系へのダメージが５％アップ、会心の一撃発生確率アップ。':
        'Damage to Nature monsters +5%; critical-hit chance up.',
    '戦闘後の獲得経験値が１０％増える。': 'Experience from battles +10%.',
    '悪魔系へのダメージが５％アップ。': 'Damage to Demon monsters +5%.',
    '物質系へのダメージが５％アップ。': 'Damage to Material monsters +5%.',
    'ゾンビ系へのダメージが５％アップ。': 'Damage to Zombie monsters +5%.',
    '魔獣系へのダメージが５％アップ、会心の一撃発生確率アップ。':
        'Damage to Beast monsters +5%; critical-hit chance up.',
    '守備力＋１４、自然系へのダメージが１５％アップ。':
        'Defence +14; damage to Nature monsters +15%.',
    '悪魔系へのダメージが１５％アップ、会心の一撃発生確率アップ。':
        'Damage to Demon monsters +15%; critical-hit chance up.',
    '会心の一撃発生確率アップ。': 'Critical-hit chance up.',
    '魔獣系と自然系へのダメージが５％アップ。': 'Damage to Beast and Nature monsters +5%.',
    '戦闘後のアイテム入手確率が上がる。': 'Item drop chance after battle up.',
    '魔獣系と自然系へのダメージが１０％アップ。': 'Damage to Beast and Nature monsters +10%.',
    '魔獣系と自然系へのダメージが１５％アップ。': 'Damage to Beast and Nature monsters +15%.',
    'ブレイク封じの効果。': 'Has the effect of Break Seal.',
    '魔獣系と自然系へのダメージが２０％アップ。': 'Damage to Beast and Nature monsters +20%.',
    'テンションを下げる効果がある。': 'Lowers the target’s tension.',
    '守備力＋３。': 'Defence +3.',
    '物質系とスライム系へのダメージが１０％アップ。':
        'Damage to Material and Slime monsters +10%.',
    '守備力＋１２。': 'Defence +12.',
    '守備力＋１０、戦闘後の獲得ゴールドが２０％増える。':
        'Defence +10; gold from battles +20%.',
    '守備力＋８。': 'Defence +8.',
    'ザキの効果。': 'Has the effect of Whack.',
    '物質系へのダメージが１５％アップ。': 'Damage to Material monsters +15%.',
    '守備力＋１３。': 'Defence +13.',
    '守備力＋１８。': 'Defence +18.',
    '物質系とスライム系へのダメージが２０％アップ。':
        'Damage to Material and Slime monsters +20%.',
    '全体攻撃ができる。': 'Attacks all enemies.',
    '全体攻撃ができる、テンションバーンの発動確率が少し上がる。':
        'Attacks all enemies; Tension Burn chance slightly up.',
    '呪文の会心の一撃発生確率アップ。': 'Spell critical-hit chance up.',
    'すばやさ＋８。': 'Agility +8.',
    'すばやさ＋２０。': 'Agility +20.',
    'すばやさ＋１０。': 'Agility +10.',
    'すばやさ＋１４、戦闘から必ず逃げられる（ボス戦以外）。':
        'Agility +14; always escape from battle (except boss fights).',
    'すばやさ＋５２。': 'Agility +52.',
    'すばやさ＋２４、メタル系に必中、与えるダメージ＋１。':
        'Agility +24; always hits Metal monsters; damage dealt +1.',
    'すばやさ＋１９、悪魔系へのダメージが１５％アップ。':
        'Agility +19; damage to Demon monsters +15%.',
    'すばやさ＋２４。': 'Agility +24.',
    'すばやさ＋２６。': 'Agility +26.',
    'すばやさ＋２９、メタル系に必中、与えるダメージ＋２。':
        'Agility +29; always hits Metal monsters; damage dealt +2.',
    'メタルキラーの効果。': 'Has the effect of Metal Killer.',
    'すばやさ＋４０。': 'Agility +40.',
    'すばやさ＋３０、悪魔系へのダメージが２０％アップ。':
        'Agility +30; damage to Demon monsters +20%.',
    'すばやさ＋１８。': 'Agility +18.',
    'すばやさ＋３７。': 'Agility +37.',
    '配合時に装備すると子供がオスになる。':
        'When equipped during synthesis, the child is male.',
    '配合時に装備すると子供がメスになる。':
        'When equipped during synthesis, the child is female.',
    'かしこさ＋１０。': 'Wisdom +10.',
    '装備すると新生配合ができる。': 'Allows new-life synthesis when equipped.',
    '配合時に装備すると装備している親と同じ種族になる。':
        'When equipped during synthesis, the child takes the same species as the equipped parent.',
    'かしこさ＋２４、スカウトアタックの威力が２倍になる。':
        'Wisdom +24; scout attack power doubled.',
    'かしこさ＋２２。': 'Wisdom +22.',
    'かしこさ＋３３。': 'Wisdom +33.',
    'ラッキーの効果。': 'Has the effect of Lucky.',
    'かしこさ＋４８。': 'Wisdom +48.',
    'かしこさ＋３８。': 'Wisdom +38.',
    'かしこさ＋４６。': 'Wisdom +46.',
    'かしこさ＋５０。': 'Wisdom +50.',
    'ときどき「いてつくはどう」の効果。': 'Occasionally has the effect of Freezing Wave.',
}

SKILL_CREST = re.compile(r'^味方1体がスキル「(.+?)」を覚える。$')


def norm(text):
    return re.sub(r'\s+', ' ', text.replace('\n', ' ')).strip()


def translate_item(effect, skills):
    if effect in ITEM_EN:
        return ITEM_EN[effect]
    crest = SKILL_CREST.match(effect)
    if crest:
        name = skills.get(crest.group(1))
        if not name:
            raise SystemExit(f'unknown skill set in crest: {crest.group(1)!r}')
        return f'One ally learns the {name} skill.'
    parts = [p.strip() for p in effect.split('、')]
    if parts and all(p in MATERIAL_EN for p in parts):
        return ', '.join(MATERIAL_EN[p] for p in parts) + '.'
    return None


def build(rows, field, translate, out_path):
    seen = []
    for row in rows:
        key = norm(row.get(field) or '')
        if key and key not in seen:
            seen.append(key)
    english = {}
    missing = []
    for key in seen:
        text = translate(key)
        if not text:
            missing.append(key)
        else:
            english[key] = text
    if missing:
        raise SystemExit(f'{out_path}: {len(missing)} effects without English:\n' + '\n'.join(missing))
    json.dump(english, open(out_path, 'w'), ensure_ascii=False, indent=2)
    open(out_path, 'a').write('\n')
    print(f'{out_path}: {len(english)} descriptions')


def main():
    items = json.load(open('../src/data/items.json'))
    weapons = json.load(open('../src/data/weapons.json'))
    skills = {s['jp']: s['name'] for s in json.load(open('../src/data/skills.json'))}
    build(items, 'effect', lambda e: translate_item(e, skills), '../src/data/i18n-item-desc.json')
    build(weapons, 'effect', lambda e: WEAPON_EN.get(e) or None, '../src/data/i18n-weapon-desc.json')


if __name__ == '__main__':
    main()
