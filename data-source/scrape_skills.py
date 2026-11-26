#!/usr/bin/env python3
"""Scrape the reference skill index into ../src/data/skills.json.

The dex build (build_data.py) only knows the skill set each monster *spawns*
with.  The reference's own skill index lists 425 sets, and each set page also
carries the monsters that learn it, its skill-point table and the set it
evolves from / into.

    python3 scrape_skills.py
"""
import concurrent.futures as futures
import html
import json
import re
import urllib.request

BASE = 'https://game-cap.com/dqm2/'
UA = {'User-Agent': 'dqm2-offline-compendium/1.0 (fan reference build)'}


def get(path):
    req = urllib.request.Request(BASE + path, headers=UA)
    raw = urllib.request.urlopen(req, timeout=45).read()
    for enc in ('utf-8', 'cp932'):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            pass
    return raw.decode('cp932', errors='replace')


def text_of(fragment):
    fragment = re.sub(r'<br\s*/?>', ' ', fragment)
    fragment = re.sub(r'<[^>]+>', '', fragment)
    return re.sub(r'\s+', ' ', html.unescape(fragment)).strip()


def rows(page):
    out = []
    for tr in re.split(r'<tr[^>]*>', page)[1:]:
        tr = tr.split('</tr>')[0]
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
        if cells:
            out.append([text_of(c) for c in cells])
    return out


def index_slugs():
    slugs = set()
    for n in ['1', '2', '3', '4', '5', '51', '52', '53', '54', '55', '56', '57', '58', '100']:
        page = get(f'data/skilllist{n}.html').split('<aside')[0]
        slugs |= set(re.findall(r'href="(skill_[a-z0-9_]+\.html)"', page))
    return sorted(slugs)


def field(text, label):
    """Value cell that follows a label such as 進化元スキル."""
    m = re.search(label + r'\s*\|+\s*([^|]+)', text)
    if not m:
        return None
    value = m.group(1).strip()
    return None if value in ('なし', '', '-') else value


def one(slug):
    page = get(f'data/{slug}').split('<aside')[0]
    slug_id = re.sub(r'^skill_|\.html$', '', slug)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', page, re.S)
    jp = text_of(h1.group(1)) if h1 else slug_id

    sp = []
    monsters = []
    in_monsters = False
    for cells in rows(page):
        if cells[0] == '必要SP':
            continue
        if cells[0] == 'スキルを持つモンスター':
            in_monsters = True
            continue
        if in_monsters and cells[0] == 'RANK':
            continue
        if in_monsters and len(cells) >= 3 and re.fullmatch(r'[FEDCBAS]+|SS', cells[0]):
            monsters.append({'rank': cells[0], 'jp': cells[1], 'family': cells[2]})
            continue
        if cells and cells[0].isdigit() and len(cells) >= 2:
            sp.append({'sp': int(cells[0]), 'name': cells[1]})
    text = re.sub(r'<[^>]+>', '|', page)
    text = re.sub(r'\|{2,}', '|', html.unescape(text))
    return {
        'id': slug_id,
        'jp': jp,
        'sp': sp,
        'monsters': monsters,
        'evolvesFrom': field(text, '進化元スキル'),
        'evolvesTo': field(text, '進化先スキル'),
        'combinesFor': field(text, '組み合わせ用途'),
        'other': field(text, '他入手'),
    }


def merge(sets):
    """Fold the scraped index into skills.json, keeping the English names the
    dex build already produced and the ids the app links to."""
    existing = {s['jp']: s for s in json.load(open('../src/data/skills.json'))}
    names = json.load(open('../src/data/i18n-skills.json'))
    monsters = json.load(open('../src/data/monsters.json'))
    by_jp = {m['jp']: m for m in monsters}

    out = []
    for s in sets:
        holders = []
        for holder in s['monsters']:
            m = by_jp.get(holder['jp'])
            if m and m['id'] not in {h['id'] for h in holders}:
                holders.append({'id': m['id'], 'name': m['name'], 'rank': m['rank']})
        name = existing.get(s['jp'], {}).get('name')
        # The dex build left the sets it could not name as their Japanese title.
        if not name or name == s['jp']:
            name = names.get(s['jp']) or name or s['jp']
        record = {
            'name': name,
            'jp': s['jp'],
            'count': len(holders),
            'sp': s['sp'],
            'monsters': holders,
        }
        for key in ('evolvesFrom', 'evolvesTo', 'combinesFor', 'other'):
            if s.get(key):
                record[key] = s[key]
        out.append(record)
    out.sort(key=lambda s: s['name'])
    json.dump(out, open('../src/data/skills.json', 'w'), ensure_ascii=False,
              separators=(',', ':'))
    return out


if __name__ == '__main__':
    slugs = index_slugs()
    print('index entries:', len(slugs))
    with futures.ThreadPoolExecutor(max_workers=8) as pool:
        sets = list(pool.map(one, slugs))
    sets.sort(key=lambda s: s['jp'])
    print('sets:', len(sets),
          '| with SP table:', sum(1 for s in sets if s['sp']),
          '| with holders:', sum(1 for s in sets if s['monsters']),
          '| evolutions:', sum(1 for s in sets if s['evolvesTo']),
          '| evolution sources:', sum(1 for s in sets if s['evolvesFrom']))
    merged = merge(sets)
    print('skills.json now holds', len(merged), 'sets |',
          sum(1 for s in merged if s['name'] == s['jp']), 'untranslated')
