#!/usr/bin/env python3
"""Tag every skill-point entry of ../src/data/skills.json with the page the
reference links it to.

The SP tables of the reference link each entry either to an ability page
(`tokugi_*.html`) or to a trait page (`tokusei_*.html`).  Several names exist
as both (どく攻撃, いてつくはどう …), so the link is the only way to tell which
one a skill set actually teaches; stat bonuses such as 最大ＨＰ＋１６ all point
at one family page (最大ＨＰ＋).  `scrape_skills.py` drops the anchors; this
script re-reads the pages and adds `kind` ("ability" / "trait") and `slug`
(the detail page's slug) to each entry.  Everything else is left untouched.

    python3 scrape_skill_links.py
"""
import concurrent.futures as futures
import html
import json
import re
import urllib.request

BASE = 'https://game-cap.com/dqm2/'
UA = {'User-Agent': 'dqm2-offline-compendium/1.0 (fan reference build)'}
LISTS = ['1', '2', '3', '4', '5', '51', '52', '53', '54', '55', '56', '57', '58', '100']


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


def slugs():
    found = set()
    for n in LISTS:
        page = get(f'data/skilllist{n}.html').split('<aside')[0]
        found |= set(re.findall(r'href="(skill_[a-z0-9_]+\.html)"', page))
    return sorted(found)


def one(slug):
    """{name: (kind, detail slug)} for one skill-set page."""
    page = get(f'data/{slug}').split('<aside')[0]
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', page, re.S)
    jp = text_of(h1.group(1)) if h1 else slug
    kinds = {}
    for tr in re.split(r'<tr[^>]*>', page)[1:]:
        tr = tr.split('</tr>')[0]
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
        if len(cells) < 2 or not re.fullmatch(r'\d+', text_of(cells[0])):
            continue
        anchor = re.search(r'<a href="(tokugi|tokusei)_([a-z0-9_]+)\.html"', cells[1])
        if anchor:
            kind = 'ability' if anchor.group(1) == 'tokugi' else 'trait'
            kinds[text_of(cells[1])] = (kind, anchor.group(2))
    return jp, kinds


def main():
    pages = slugs()
    print('skill pages:', len(pages))
    by_jp = {}
    with futures.ThreadPoolExecutor(max_workers=12) as pool:
        for i, (jp, kinds) in enumerate(pool.map(one, pages), 1):
            by_jp.setdefault(jp, {}).update(kinds)
            if i % 50 == 0:
                print('  fetched', i)
    print('sets with links:', len(by_jp))

    sets = json.load(open('../src/data/skills.json'))
    tagged = missing = 0
    for s in sets:
        kinds = by_jp.get(s['jp'], {})
        for entry in s['sp']:
            entry.pop('kind', None)
            entry.pop('slug', None)
            hit = kinds.get(entry['name'])
            if hit:
                entry['kind'], entry['slug'] = hit
                tagged += 1
            else:
                missing += 1
    json.dump(sets, open('../src/data/skills.json', 'w'), ensure_ascii=False,
              separators=(',', ':'))
    print('entries tagged:', tagged, '| without a link (stat bonuses, 3DS notes):', missing)


if __name__ == '__main__':
    main()
