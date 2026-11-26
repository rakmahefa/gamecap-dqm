#!/usr/bin/env python3
"""Scrape the *individual* ability (特技) and trait (特性) pages.

`scrape_lists.py` reads the index pages, which only carry name, type, element,
cap and the one-line trait text.  Each entry also has its own page on the
reference holding the data the index omits:

  ability 種類 / 範囲 / 消費MP / 上限値 / 属性 / 効果, the other abilities of the
          same element, the skill sets that teach it (with their maximum SP)
          and the monsters that know it.
  trait   効果 (and the SP upgrade), the monsters that hold it as a base trait,
          at a plus value or by body size, the skill sets that grant it, and the
          3DS new-life builds that pass it on.

The Japanese effect text is kept verbatim; the English renderings live in
src/data/i18n-ability-desc.json and src/data/i18n-trait-desc.json.

Run from this folder, after scrape_lists.py:

    python3 scrape_details.py
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
    return raw.decode('cp932', errors='replace')


def content(page):
    return page.split('<aside')[0]


def clean(fragment):
    fragment = re.sub(r'<br\s*/?>', '\n', fragment)
    fragment = re.sub(r'<[^>]+>', '', fragment)
    text = html.unescape(fragment)
    # A few pages lose the wave dash between two digits to the Shift_JIS round-trip.
    text = re.sub(r'(?<=[0-9０-９])\?(?=[0-9０-９])', '～', text)
    lines = [re.sub(r'[ \t\u3000]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line).strip()


def strip_sp(fragment):
    return re.sub(r'\s*SP版追加\s*$', '', fragment).strip()


def tables(page):
    """[(heading, [[cell, ...], ...])] for every <table class="style"> block.

    The section title is either a #444444 header cell or, on the ability and
    trait pages, the first single-cell row of the block.
    """
    out = []
    for chunk in re.split(r'<table class="style"', page)[1:]:
        chunk = chunk.split('</table>')[0]
        heading = ''
        head = re.search(r'bgcolor="#444444"[^>]*>(.*?)</t[dh]>', chunk, re.S)
        if head:
            heading = clean(head.group(1))
        rows = []
        for tr in re.split(r'<tr[^>]*>', chunk)[1:]:
            tr = tr.split('</tr>')[0]
            cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)
            if cells:
                rows.append(([clean(c) for c in cells], tr))
        if not heading and rows and len(rows[0][0]) == 1 and rows[0][0][0]:
            heading = rows[0][0][0]
            rows = rows[1:]
        out.append((heading, rows))
    return out


def monster_from_row(cells):
    """[rank, name, family, size] (the name cell may carry HTML we already lost)."""
    if len(cells) < 4:
        return None
    rank, name, family, size = cells[0], cells[1], cells[2], cells[3]
    if not name or name in ('名前', 'なし') or rank in ('ﾗﾝｸ', 'ランク'):
        return None
    return {'jp': name, 'rank': rank, 'family': family, 'size': size}


def skill_from_row(cells):
    if len(cells) < 2 or not cells[1].isdigit():
        return None
    return {'jp': strip_sp(cells[0]), 'maxSp': int(cells[1])}


# ------------------------------------------------------------------ abilities
def ability_page(slug):
    page = content(get(f'data/tokugi_{slug}.html'))
    rec = {'slug': slug}
    field_labels = {'種類', '範囲', '消費MP', '上限値', '属性', '効果'}
    peers, sets, monsters = [], [], []
    for heading, rows in tables(page):
        if heading.endswith('特技'):
            for cells, _ in rows:
                if len(cells) >= 3 and not cells[0].startswith('属性') and cells[0] != '名前':
                    peers.append({'jp': strip_sp(cells[0]), 'type': cells[1], 'element': cells[2]})
            continue
        if 'スキル' in heading and '覚え' in heading:
            for cells, _ in rows:
                rec_set = skill_from_row(cells)
                if rec_set:
                    sets.append(rec_set)
            continue
        if 'モンスター' in heading:
            for cells, _ in rows:
                m = monster_from_row(cells)
                if m:
                    monsters.append(m)
            continue
        # the first table: name, then label row → value row
        for i, (cells, _) in enumerate(rows):
            if not any(c in field_labels for c in cells):
                continue
            values = rows[i + 1][0] if i + 1 < len(rows) else []
            for j, label in enumerate(cells):
                if label not in field_labels:
                    continue
                value = values[j] if j < len(values) else ''
                if label == '種類':
                    rec['typeJp'] = value
                elif label == '範囲':
                    rec['range'] = value
                elif label == '消費MP':
                    rec['mp'] = int(value) if value.isdigit() else None
                elif label == '上限値':
                    rec['capText'] = value
                elif label == '属性':
                    rec['elementJp'] = value
                elif label == '効果':
                    rec['effect'] = value
    rec.setdefault('mp', None)
    rec.setdefault('elementJp', '')
    rec.setdefault('range', '')
    rec.setdefault('effect', '')
    rec['peers'] = peers
    rec['sets'] = sets
    rec['monsters'] = monsters
    return rec


# --------------------------------------------------------------------- traits
def trait_page(slug):
    page = content(get(f'data/tokusei_{slug}.html'))
    rec = {'slug': slug}
    for heading, rows in tables(page):
        # effect block: [効果] [text] ([SP特性の効果] [text])
        cells = [cells for cells, _ in rows]
        for i, row in enumerate(cells):
            if row and row[0] == '効果' and i + 1 < len(cells):
                rec['effect'] = cells[i + 1][0] if cells[i + 1] else ''
            if row and row[0] == 'SP特性の効果' and i + 1 < len(cells):
                rec['spEffect'] = cells[i + 1][0] if cells[i + 1] else ''
        if 'スキル' in heading and '覚え' in heading:
            rec['sets'] = [s for s in (skill_from_row(c) for c, _ in rows) if s]
            continue
        if '新生配合' in heading:
            builds = []
            for cells, _ in rows:
                if len(cells) >= 2 and cells[1]:
                    builds.append({'rating': cells[0], 'name': strip_sp(cells[1])})
            rec['builds'] = builds
            continue
        bucket = None
        if heading.startswith('通常'):
            bucket = 'base'
        elif heading.startswith('プラス値'):
            bucket = 'plus'
        elif 'M・G・超G' in heading:
            bucket = 'size'
        if bucket:
            rec[bucket] = [m for m in (monster_from_row(c) for c, _ in rows) if m]
    for key in ('base', 'plus', 'size', 'sets', 'builds'):
        rec.setdefault(key, [])
    rec.setdefault('effect', '')
    rec.setdefault('spEffect', None)
    return rec


# ----------------------------------------------------------------------- main
def slugs_from_index(prefix):
    found = {}
    for n in ['51', '52', '53', '54', '55', '56', '57', '58', '100']:
        page = content(get(f'data/{prefix}list{n}.html'))
        for slug, label in re.findall(r'%s_([a-z0-9_]+)\.html"[^>]*>(?:<[^>]+>)*([^<]+)' % prefix, page):
            found.setdefault(slug, clean(label))
    for n in ['1', '2', '3', '4', '5', '6', '11', '12', '13', '14']:
        if 'tokugi' not in prefix and 'tokusei' not in prefix:
            break
        try:
            page = content(get(f'data/{prefix}list{n}.html'))
        except Exception:
            continue
        for slug, label in re.findall(r'%s_([a-z0-9_]+)\.html"[^>]*>(?:<[^>]+>)*([^<]+)' % prefix, page):
            found.setdefault(slug, clean(label))
    return found


def collect(page_fn, prefix, out):
    slugs = slugs_from_index(prefix)
    print(f'{prefix}: {len(slugs)} detail pages')
    results = []
    with futures.ThreadPoolExecutor(max_workers=8) as pool:
        futs = {pool.submit(page_fn, slug): slug for slug in slugs}
        for fut in futures.as_completed(futs):
            slug = futs[fut]
            try:
                rec = fut.result()
            except Exception as exc:  # pragma: no cover - network hiccup
                print(f'  ! {slug}: {exc}')
                continue
            rec['jp'] = slugs[slug]
            results.append(rec)
    results.sort(key=lambda r: r['jp'])
    json.dump(results, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'{out}: {len(results)} entries')


if __name__ == '__main__':
    collect(ability_page, 'tokugi', '../src/data/ability-detail.json')
    collect(trait_page, 'tokusei', '../src/data/trait-detail.json')
