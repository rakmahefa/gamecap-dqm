#!/usr/bin/env python3
"""Scrape the *list* pages of game-cap.com/dqm2 into the JSON the app ships.

build_data.py builds monsters/skills/traits from the saved roster dump.  This
script fills the tables that dump does not carry: the ability (特技) index, the
trait (特性) index with its classification, the item / material lists, the
weapon list, the alchemy-key reward list, and the per-monster equippable weapon
flags (which only exist as CSS state on the monster pages).

Run from this folder, after build_data.py:

    python3 scrape_lists.py
"""
import concurrent.futures as futures
import html
import json
import re
import sys
import urllib.request

BASE = 'https://game-cap.com/dqm2/'
UA = {'User-Agent': 'dqm2-offline-compendium/1.0 (fan reference build)'}
_cache = {}


def get(path):
    url = BASE + path
    if url in _cache:
        return _cache[url]
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=45).read()
    text = None
    for enc in ('utf-8', 'cp932'):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            pass
    if text is None:
        text = raw.decode('cp932', errors='replace')
    _cache[url] = text
    return text


def content(page):
    """Body without the shared sidebar / footer navigation."""
    return page.split('<aside')[0]


def text_of(fragment):
    fragment = re.sub(r'<br\s*/?>', ' ', fragment)
    fragment = re.sub(r'<[^>]+>', '', fragment)
    text = re.sub(r'\s+', ' ', html.unescape(fragment)).strip()
    # The SP badge sits inside the name cell: keep the flag, drop the label.
    return re.sub(r'\s*SP版追加\s*$', '', text).strip()


def rows(page):
    """Every <tr> of the page as a list of cell texts (plus raw HTML)."""
    out = []
    for tr in re.split(r'<tr[^>]*>', page)[1:]:
        tr = tr.split('</tr>')[0]
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
        if cells:
            out.append(([text_of(c) for c in cells], tr))
    return out


def dump(name, data):
    path = f'../src/data/{name}'
    json.dump(data, open(path, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'{name}: {len(data) if isinstance(data, list) else len(data.keys())} entries')


# --------------------------------------------------------------- traits (特性)
TRAIT_CATEGORY = {'1': 'Combat', '2': 'Resistance', '3': 'Support',
                  '4': 'Stats', '5': 'Drawback'}

def scrape_traits():
    traits = {}
    # Kana pages carry every trait with its Japanese explanation.
    for n in ['51', '52', '53', '54', '55', '56', '57', '58']:
        page = content(get(f'data/tokuseilist{n}.html'))
        for cells, tr in rows(page):
            if len(cells) < 2:
                continue
            name = cells[0]
            if not name or name == '名前':
                continue
            traits.setdefault(name, {'jp': name, 'desc': cells[1]})
            if 'SP版追加' in tr:
                traits[name]['sp'] = True
    # Classification pages give the type; they list the same names.
    for n, cat in TRAIT_CATEGORY.items():
        page = content(get(f'data/tokuseilist{n}.html'))
        for cells, tr in rows(page):
            if len(cells) < 2 or cells[0] == '名前':
                continue
            traits.setdefault(cells[0], {'jp': cells[0], 'desc': cells[1]})
            traits[cells[0]]['cat'] = cat
    page = content(get('data/tokuseilist100.html'))
    for cells, tr in rows(page):
        if len(cells) < 2 or cells[0] == '名前':
            continue
        traits.setdefault(cells[0], {'jp': cells[0], 'desc': cells[1]})
        traits[cells[0]]['sp'] = True
    out = [traits[k] for k in sorted(traits)]
    for t in out:
        t.setdefault('cat', 'Other')
        t.setdefault('sp', False)
    dump('trait-extra.json', out)


# ------------------------------------------------------------ abilities (特技)
ABILITY_TYPE = {'呪文': 'Spell', '斬撃': 'Slash', '体技': 'Skill',
                '息': 'Breath', '踊り': 'Dance', '他': 'Other'}

def scrape_abilities():
    found = {}
    for n in ['51', '52', '53', '54', '55', '56', '57', '58']:
        page = content(get(f'data/tokugilist{n}.html'))
        for cells, tr in rows(page):
            if len(cells) < 3 or cells[0] == '名前':
                continue
            name = cells[0]
            if name in found:
                continue
            kind = cells[1]
            element = cells[2] if len(cells) > 2 else ''
            cap = cells[3] if len(cells) > 3 else ''
            found[name] = {
                'jp': name,
                'type': ABILITY_TYPE.get(kind, kind or 'Other'),
                'element': '' if element in ('-', '') else element,
                'cap': int(cap) if cap.isdigit() else None,
                'sp': 'SP版追加' in tr,
            }
    page = content(get('data/tokugilist100.html'))
    for cells, tr in rows(page):
        if len(cells) < 3 or cells[0] == '名前':
            continue
        name = cells[0]
        rec = found.setdefault(name, {
            'jp': name,
            'type': ABILITY_TYPE.get(cells[1], cells[1] or 'Other'),
            'element': '' if len(cells) < 3 or cells[2] in ('-', '') else cells[2],
            'cap': int(cells[3]) if len(cells) > 3 and cells[3].isdigit() else None,
        })
        rec['sp'] = True
    out = [found[k] for k in sorted(found)]
    dump('abilities.json', out)


# ----------------------------------------------------------------- items (道具)
def scrape_items():
    items = []

    def section_of(page):
        """[(category, row_html)] for the grouped item lists."""
        chunks = re.split(r'<section class="dqm2-d4-sec', page)[1:]
        for chunk in chunks:
            head = re.search(r'<h2>(.*?)</h2>', chunk, re.S)
            category = text_of(head.group(1)) if head else ''
            category = re.sub(r'\d+種類$', '', category).strip()
            for li in re.split(r'<li class="dqm2-d6-row"', chunk)[1:]:
                yield category, li

    page = content(get('data/itemlist1.html'))
    for category, li in section_of(page):
        name = re.search(r'class="dqm2-d6-row-name"[^>]*>(.*?)</a>', li, re.S)
        effect = re.search(r'class="dqm2-d6-row-text"[^>]*>(.*?)</span>', li, re.S)
        price = re.search(r'class="dqm2-d6-price"[^>]*>(.*?)</span>', li, re.S)
        if not name:
            continue
        buy = sell = None
        if price:
            m = re.search(r'買\s*([\d,]+)G', price.group(1))
            buy = int(m.group(1).replace(',', '')) if m else None
            m = re.search(r'売\s*([\d,]+)G', price.group(1))
            sell = int(m.group(1).replace(',', '')) if m else None
        tags = [text_of(t) for t in re.findall(r'class="dqm2-d6-tag[^"]*"[^>]*>(.*?)</span>', li, re.S)]
        items.append({
            'jp': text_of(name.group(1)),
            'kind': 'item',
            'category': category,
            'effect': text_of(effect.group(1)) if effect else '',
            'buy': buy,
            'sell': sell,
            'tags': [t for t in tags if t],
        })

    page = content(get('data/itemlist2.html'))
    for category, li in section_of(page):
        name = re.search(r'class="dqm2-d6-row-name"[^>]*>(.*?)</a>', li, re.S)
        effect = re.search(r'class="dqm2-d6-row-text"[^>]*>(.*?)</span>', li, re.S)
        price = re.search(r'class="dqm2-d6-price"[^>]*>(.*?)</span>', li, re.S)
        if not name:
            continue
        buy = sell = None
        if price:
            m = re.search(r'買\s*([\d,]+)G', price.group(1))
            buy = int(m.group(1).replace(',', '')) if m else None
            m = re.search(r'売\s*([\d,]+)G', price.group(1))
            sell = int(m.group(1).replace(',', '')) if m else None
        tags = [text_of(t) for t in re.findall(r'class="dqm2-d6-tag[^"]*"[^>]*>(.*?)</span>', li, re.S)]
        items.append({
            'jp': text_of(name.group(1)),
            'kind': 'material',
            'category': category or 'Material',
            'effect': text_of(effect.group(1)) if effect else '',
            'buy': buy,
            'sell': sell,
            'tags': [t for t in tags if t],
        })

    seen = set()
    unique = []
    for it in items:
        if it['jp'] in seen and it['kind'] == 'item':
            continue
        seen.add(it['jp'] + it['kind'])
        unique.append(it)
    dump('items.json', unique)


# --------------------------------------------------------------- weapons (武器)
WEAPON_TYPES = {'剣': 'Sword', '槍': 'Lance', 'ヤリ': 'Lance', '斧': 'Axe', 'オノ': 'Axe',
                '鎚': 'Hammer', 'ハンマー': 'Hammer', '鞭': 'Whip', 'ムチ': 'Whip',
                '爪': 'Claw', 'ツメ': 'Claw', '杖': 'Staff', 'つえ': 'Staff'}

def scrape_weapons():
    weapons = []
    detail_pages = []
    for n in range(1, 8):
        page = content(get(f'data/bukilist{n}.html'))
        head = re.search(r'<h1[^>]*>(.*?)</h1>', page, re.S)
        label = re.search(r'武器：(.+)', text_of(head.group(1))) if head else None
        wtype = WEAPON_TYPES.get(label.group(1).strip(), label.group(1).strip() if label else '')

        def grab(html_page, wtype, bucket):
            for cells, tr in rows(html_page):
                if len(cells) < 3 or cells[0] == '名前':
                    continue
                name = cells[0]
                atk = int(cells[1]) if cells[1].isdigit() else None
                desc = cells[2] if len(cells) > 2 else ''
                bucket.append({'name': name, 'type': wtype, 'atk': atk,
                               'effect': '' if desc in ('-', '') else desc})
                link = re.search(r'href="(buki_[a-z0-9_]+\.html)"', tr)
                if link:
                    detail_pages.append((link.group(1), len(bucket) - 1))

        grab(page, wtype, weapons)

    def detail(path):
        page = content(get(f'data/{path}'))
        body = text_of(page)
        buy = sell = atk = None
        table = rows(page)
        for i, (cells, _) in enumerate(table):
            nums = [int(c.replace(',', '')) for c in cells if c.replace(',', '').isdigit()]
            if '買値' in cells:
                if len(nums) >= 2:
                    buy, sell = nums[0], nums[1]
                elif i + 1 < len(table):
                    nxt = [int(c.replace(',', '')) for c in table[i + 1][0] if c.replace(',', '').isdigit()]
                    if len(nxt) >= 2:
                        buy, sell = nxt[0], nxt[1]
            if '攻撃力' in cells and nums:
                atk = nums[0]
        shops = re.findall(r'店で買う\s*：\s*(.*?)(?=店で買う|モンスター入手|レアドロップ|window)', body)
        drop_line = re.search(r'レアドロップ\s*：\s*(.*?)(?=window|$)', body)
        drops = []
        if drop_line:
            drops = [d.strip() for d in re.split(r'[、,]', drop_line.group(1)) if d.strip()]
        return {
            'buy': buy,
            'sell': sell,
            'atk': atk,
            'shops': [s.strip() for s in shops][:6],
            'drops': drops[:10],
        }

    with futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(detail, [p for p, _ in detail_pages]))
    for (_, index), extra in zip(detail_pages, results):
        weapons[index].update({k: v for k, v in extra.items() if v is not None or k in ('buy', 'sell')})

    dump('weapons.json', weapons)


# ---------------------------------------------------- alchemy keys (錬金カギ報酬)
def scrape_key_rewards():
    page = content(get('etc/kagihoushu.html'))
    by_jp = {m['jp']: m['id'] for m in json.load(open('../src/data/monsters.json'))}
    rewards = []
    current_rank = None
    for section in re.split(r'<h2[^>]*>', page)[1:]:
        m = re.match(r'(SS|S|A|B)ランク', text_of(section[:400]))
        if m:
            current_rank = m.group(1)
        for card in re.finditer(
                r'class="dqm2-d4-cardname"[^>]*>(.*?)</a>(.*?)</li>', section, re.S):
            name = text_of(card.group(1))
            meta = text_of(card.group(2))
            if not name:
                continue
            family = re.sub(r'(SPで報告あり|SPで確認|3DS版の情報)', '', meta).strip()
            rewards.append({
                'id': by_jp.get(name),
                'jp': name,
                'rank': current_rank,
                'family': family,
                'sp': 'SPで報告あり' in card.group(2),
            })
    seen = set()
    unique = []
    for r in rewards:
        key = r['jp']
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)
    dump('key-rewards.json', unique)
    print('  matched to a monster id:', sum(1 for r in unique if r['id']), '/', len(unique))


# ------------------------------------------- per-monster weapon flags (装備武器)
def scrape_monster_weapons():
    monsters = json.load(open('../src/data/monsters.json'))
    flags = {}

    def one(m):
        try:
            page = content(get(f"data/monst_{m['id']}.html"))
        except Exception:
            return m['id'], None
        chips = re.findall(
            r'<span class="dqm2-k113-weapon-chip[^"]*"[^>]*data-dqm2-equip="([01])"[^>]*>(.*?)</span>',
            page, re.S)
        if not chips:
            return m['id'], None
        owned = [WEAPON_TYPES.get(text_of(label), text_of(label))
                 for flag, label in chips if flag == '1']
        return m['id'], owned

    with futures.ThreadPoolExecutor(max_workers=10) as pool:
        for mid, owned in pool.map(one, monsters):
            if owned is not None:
                flags[mid] = owned
    dump('monster-weapons.json', flags)
    print('monsters with a weapon block:', len(flags),
          '| with at least one type:', sum(1 for v in flags.values() if v))


if __name__ == '__main__':
    # `python3 scrape_lists.py traits abilities items weapons keys monster-weapons`
    steps = sys.argv[1:] or ['traits', 'abilities', 'items', 'weapons', 'keys', 'monster-weapons']
    run = {
        'traits': scrape_traits,
        'abilities': scrape_abilities,
        'items': scrape_items,
        'weapons': scrape_weapons,
        'keys': scrape_key_rewards,
        'monster-weapons': scrape_monster_weapons,
    }
    for step in steps:
        run[step]()
