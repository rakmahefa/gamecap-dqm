/**
 * The reference's system guides, translated.
 *
 * Each section is a faithful English rendering of a section of the Japanese
 * source page: the same rules, the same numbers. Ability, item and monster
 * names stay as the Japanese the reference prints them, so the pages can link
 * them to the tables that already carry an English rendering.
 */
export interface GuideTable {
  head: string[];
  rows: string[][];
}

export interface GuideSection {
  heading: string;
  jp?: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: GuideTable;
  note?: string;
}

export interface Guide {
  id: string;
  title: string;
  jp: string;
  lede: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    id: 'new-life',
    title: 'New-life synthesis',
    jp: '新生配合',
    lede:
      'The ultimate synthesis, unlocked after the story at the Shrine of Falling Stars. It passes one trait of a parent onto the child and pushes the child straight to plus value ★.',
    sections: [
      {
        heading: 'What the SP version changes',
        jp: 'SP版での違い',
        bullets: [
          'No しんせいの宝珠 is needed: once a synthesis brings a parent’s plus value to ★, new-life synthesis becomes available.',
          'Size traits are inherited too, so any monster can change size. Inherit a parent’s 超ギガボディ and the child becomes Super G as well (超ギガボディ（超G）).',
        ],
        note:
          'The しんせいの宝珠 and the size / 超ギガボディ inheritance rules described below are the 3DS version’s.',
      },
      {
        heading: 'How it works',
        jp: '新生配合について',
        paragraphs: [
          'After clearing the story, the Shrine of Falling Stars (星降りのほこら) offers this final synthesis. A new-born monster inherits one of the traits its parents held.',
        ],
      },
      {
        heading: 'Conditions',
        jp: '新生配合の条件',
        bullets: [
          'Equip one of the two parents with しんせいのタクト.',
          'Own a しんせいの宝珠 — one is consumed by the synthesis.',
          'The child must be born with a plus value of 100 or more.',
        ],
        paragraphs: [
          'The child is always the monster that held the しんせいのタクト, and it is born at SS rank.',
        ],
      },
      {
        heading: 'What the child gets',
        jp: '新生配合の能力',
        paragraphs: [
          'A new-born monster is born at plus value ＋★, so its ＋★ trait is active; the ＋★ traits are among the strongest in the game. The 宝珠 is a precious item, so decide which monster deserves it before spending one.',
        ],
      },
      {
        heading: 'Trait inheritance rules',
        jp: '特性の引き継ぎ',
        paragraphs: [
          'Inheriting traits freely would make monsters far too strong, so the game restricts it:',
        ],
        bullets: [
          'A trait the monster already has cannot be inherited.',
          'A trait that belongs to a smaller body size than its own cannot be inherited.',
          'A trait either parent gained from a skill cannot be inherited.',
          '超ギガボディ can only be inherited by モントナー.',
        ],
      },
      {
        heading: 'Negative traits',
        jp: 'マイナス特性',
        paragraphs: [
          'When inherited traits would make a monster too strong, one of the following drawbacks can be added.',
        ],
        table: {
          head: ['Trait', 'Japanese', 'Effect'],
          rows: [
            ['Unlucky', 'アンラッキー', 'Luck gets worse as HP drops.'],
            ['Flustered', 'オロオロ', 'Sometimes dithers and does not act.'],
            ['The Strong Relax', '強者のよゆう', 'Sometimes does not act on even rounds.'],
            ['Auto MP Down', '自動ＭＰダウン', 'Loses about 10% of max MP after acting.'],
            ['MP Cost ×2', 'しょうひＭＰ×２', 'MP costs are doubled.'],
            ['Damage Up Body', 'ダメージ増ボディ', 'Damage taken grows as rounds pass.'],
            ['Provoke', 'ちょうはつ', 'May automatically raise all enemies’ tension in battle.'],
            ['Worn Out', 'ヘロヘロ', 'Sometimes does not act on odd rounds.'],
          ],
        },
      },
    ],
  },
  {
    id: 'scouting',
    title: 'How to scout',
    jp: 'スカウトの方法',
    lede:
      'Scouting is a battle action, not a menu: the chance depends on the meat you feed, the monster’s remaining HP, your team’s attack and the target itself.',
    sections: [
      {
        heading: 'The flow',
        jp: 'スカウトの流れ',
        bullets: [
          'The success rate changes with the item used, the strength of your team and the strength of the enemy.',
          'Only one monster can be scouted per battle, and a successful scout ends the battle immediately.',
          'After a failed attempt the enemy is either watching (ようすをみる) — you may try again next turn — or angry (いかり), which ends scouting for that battle.',
          'Even after a failed scout there is a small chance the monster gets up after the battle and asks to join.',
        ],
      },
      {
        heading: 'What raises the chance',
        jp: 'スカウト攻略',
        bullets: [
          'Feed meat: 魔物のエサ, くんせいにく, ほねつきにく and the like raise the scout attack by a fixed amount. Better meat helps more, and you can feed several times until the monster is full.',
          'Lower its HP: the less HP the target has left, the higher the chance — weaken it without killing it.',
          'Raise your attack: a higher attack stat on your team helps, so cast バイキルト or raise tension before scouting.',
          'Bring the scout traits: スカウト％アップ, スカウト％アップ＋ and スカウト％アップＳ on a team member all raise the chance.',
          'Higher rank and bigger body size make a monster harder to scout.',
          'Already owning the same monster lowers the chance of scouting another.',
        ],
      },
    ],
  },
  {
    id: 'medals',
    title: 'Mini medals',
    jp: 'ちいさなメダル',
    lede:
      'Hand your mini medals to the medal grandpa in the house left of the main street: every threshold on his list pays out an item or a monster.',
    sections: [
      {
        heading: 'Exchange list',
        jp: '交換アイテム',
        paragraphs: [
          'The total number of medals handed over is what counts: each time it reaches a threshold below, that reward is given. The list runs to 150 medals in 12 steps.',
        ],
        table: {
          head: ['Medals', 'Reward'],
          rows: [
            ['5', 'ダモーレスピア★'],
            ['10', '給仕服の型紙2'],
            ['15', 'メタルスライム♂'],
            ['20', '勝負服の型紙4'],
            ['30', 'はぐれメタル♀'],
            ['40', 'レア勝負服の型紙5'],
            ['50', 'メタルキング'],
            ['60', 'メタルキングの剣'],
            ['75', 'みやびな服の型紙5'],
            ['100', 'ゴールデンスライム'],
            ['125', 'ぎんがのつるぎ★★'],
            ['150', 'はぐれメタルキング'],
          ],
        },
        note: 'Past 150 medals: one of the five orb colours every 5 medals, one of the four egg colours every 10.',
      },
      {
        heading: 'The fastest way to farm them',
        jp: '一番早い集め方',
        paragraphs: [
          'Empty your medal pouch at the medal grandpa first, then beat the other-world master 船乗り: with zero medals in hand, the other-world masters you meet in the two spots below are almost always 船乗り.',
        ],
        bullets: [
          'Tower of Mistletoe 3F — Warp to the path to 4F, go right to the other-world master. Sighting rate 100%; defeating or scouting it in 1–2 turns pays 10 medals.',
          'Sky Realm, in front of the Dead Man’s Castle — Warp there and turn the camera left. Sighting rate about 20%, but everything is reachable by Warp, so it is quick to retry.',
        ],
        table: {
          head: ['Turns taken (Tower 3F)', 'Medals'],
          rows: [
            ['1–2', '10'],
            ['3', '9'],
            ['4', '8'],
            ['5', '7'],
            ['6', '6'],
            ['7', '5'],
          ],
        },
        note: 'In front of the Dead Man’s Castle: 1–6 turns pays 6 medals, 7 turns 5, 8 turns 4, 9 turns 3, 10 turns 2.',
      },
      {
        heading: 'After 150 medals',
        jp: '150枚以降',
        paragraphs: [
          'The reward is saved just before it is handed over, so resetting cannot reroll it. From this point the grandpa only accepts exactly 5 or exactly 10 medals in hand — a stray number locks you out of the “empty pouch, farm 船乗り” trick, so fight while counting turns.',
        ],
        bullets: [
          'Time the last fight so the total lands exactly on 150.',
          'For the next orb, take exactly 5: beat a 船乗り on turn 7, at either spot.',
          'For the next egg, take exactly 10: beat the Tower 3F 船乗り in 1–2 turns.',
          'Repeat those two steps; if the count drifts, adjust it with the mimics below.',
        ],
      },
      {
        heading: 'Fixing a stray count',
        jp: '枚数の調整',
        paragraphs: [
          'If you end up with an awkward number, farm ミミック or あくまのつぼ for a few medals. ミミック appears about half the time from the green chest at the top left of Wind Tower 1F; leave for another world and come back and the chest is ready again.',
        ],
      },
    ],
  },
  {
    id: 'scout-q',
    title: 'Scout quests',
    jp: 'スカウトQ',
    lede:
      'After clearing the Desert Realm and winning the kids’ master tournament at the arena, the ranch father hands out 15 quests: bring the monster he asks for and he pays the reward.',
    sections: [
      {
        heading: 'All 15 requests',
        jp: '全15問',
        table: {
          head: ['No.', 'Bring', 'Reward'],
          rows: [
            ['1', 'リーファ with the プリンセス skill', 'ふしぎなきのみ'],
            ['2', 'おばけヒトデ', '♂の杖'],
            ['3', 'Any four Slime-family monsters', 'はがねのつるぎ★'],
            ['4', 'モーザ', 'レア船員服の型紙2'],
            ['5', 'ハートナイト', 'せかいじゅのは'],
            ['6', 'A monster with plus value 25+', 'ラッキースティック★'],
            ['7', 'A monster with the 守備力アップ2 skill', '♀の杖'],
            ['8', 'ダークホビット', 'ちいさなメダル×10'],
            ['9', 'しんかいりゅう', 'しもふりにく'],
            ['10', 'A monster with plus value 50+', 'レブナントイーター★'],
            ['11', 'A monster born by new-life synthesis', 'ゼロ封じの証'],
            ['12', '大地の竜バウギア', 'ゴールドカード'],
            ['13', 'A monster with the 超ギガボディ trait', 'レア給仕服の型紙5'],
            ['14', 'スラキャンサー', '戦士の証'],
            ['15', '天魔クァバルナ', '聖剣レオソード★'],
          ],
        },
      },
      {
        heading: 'Where the harder requests come from',
        jp: '各クエストの攻略',
        bullets: [
          '1 · リーファ: synthesise はなカワセミ × リーファ and pass the プリンセス skill down.',
          '2 · おばけヒトデ: on the coast near Polonia Village in the Water Realm.',
          '3 · Slimes: スライムツリー (start beach), スライム (Desert Realm), バブルスライム (Water Realm, ghost ship) and ホイミスライム (Water Realm field).',
          '4 · モーザ: キラーエイプ × グランドシャーク.',
          '5 · ハートナイト: beat スライムナイト around Vesta Nya in the Snow & Ice Realm a few times and it shows up.',
          '6–7 · Plus value and skills: synthesise three or four times for +25; a 守備力アップ skill total of 100 across the pair evolves into 守備力アップ2.',
          '8 · ダークホビット: ボストロール (Desert Realm, east cave) × しりょうのきし (Sky Realm, Dead Man’s Castle); after the story it also appears on the path to Tower of Mistletoe 3F.',
          '9 · しんかいりゅう: スカイドラゴン × ギガンテス, both Sky Realm field.',
          '10 · Plus value 50: keep synthesising.',
          '11 · New-life synthesis: in SP, bring a synthesis to plus value ★; in 3DS, equip しんせいのタクト with the parents’ plus values above 99 in total.',
          '12 · 大地の竜バウギア: グレイトドラゴン × 死神きぞく makes ブラックドラゴン, then ブラックドラゴン × キングリザード.',
          '13 · 超ギガボディ: scout オリハルゴン, マンモデウス or リバイアさま; in SP it can also be inherited by new-life synthesis.',
          '14 · スラキャンサー: in the lava cave opened by the final key.',
          '15 · 天魔クァバルナ: synthesise it — the combination is on its monster page.',
        ],
      },
    ],
  },
  {
    id: 'matchmaking',
    title: 'Online matchmaking',
    jp: '通信お見合い',
    lede:
      'The SP version’s 通信お見合い pairs one of your monsters with a daily candidate. This page covers that online feature only — it is not the shrine priest’s お見合い.',
    sections: [
      {
        heading: 'How to use it',
        jp: '通信お見合いの使い方',
        bullets: [
          'Open the game’s 通信 menu.',
          'Choose 通信お見合い from オンライン他国マスター.',
          'Pick one of the candidates and one of your own monsters, then confirm the result.',
          'The candidate list refreshes every day at 4:00 JST. The feature needs a network connection.',
        ],
        note:
          'It is separate from いろんな人と対戦, the versus mode that ended on 23 January 2025.',
      },
      {
        heading: 'Monsters the reference lists as matchmaking rewards',
        jp: '当サイトで入手経路として掲載中',
        paragraphs: [
          'Four monsters are currently recorded with 通信お見合い as an acquisition route. That is the number the reference has confirmed, not the total number of candidates in the game.',
        ],
        bullets: ['メルトア', '魔竜ネドラ', '魔勇者アンルシア', 'フォロボシータ'],
      },
    ],
  },
];

export const GUIDE_BY_ID = new Map(GUIDES.map((g) => [g.id, g]));
