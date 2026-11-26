#!/usr/bin/env python3
"""Merge the English effect descriptions into the JSON the app bundles.

`scrape_details.py` writes the Japanese effect text of every ability and trait.
The English renderings are hand-written in desc-abilities.en.txt and
desc-traits.en.txt, one numbered line per unique effect text; the matching
source line is in desc-abilities.txt / desc-traits.txt.

Run from this folder after scrape_details.py:

    python3 translate_details.py
"""
import json
import re


def norm(text):
    return re.sub(r'\s+', ' ', text.replace('\n', ' ')).strip()


def read_en(path):
    out = {}
    for line in open(path):
        line = line.rstrip('\n')
        if not line:
            continue
        index, _, english = line.partition('\t')
        out[index] = english.strip()
    return out


def merge(details_path, index_path, en_path, out_path):
    rows = json.load(open(details_path))
    english = read_en(en_path)
    seen = []
    for row in rows:
        key = norm(row['effect'])
        if key not in seen:
            seen.append(key)

    index = {}
    for line in open(index_path):
        number, _, source = line.rstrip('\n').partition('\t')
        index[number] = norm(source)

    if len(index) != len(seen):
        raise SystemExit(f'{index_path}: {len(index)} index lines for {len(seen)} effects')
    missing = [n for n in index if n not in english]
    if missing:
        raise SystemExit(f'{en_path}: missing English for {missing}')

    by_key = {}
    for number, key in index.items():
        text = english[number]
        if key in by_key and by_key[key] != text:
            raise SystemExit(f'conflicting translation for {key!r}')
        by_key[key] = text

    uncovered = [key for key in seen if key not in by_key]
    if uncovered:
        raise SystemExit(f'{out_path}: {len(uncovered)} effects without English')

    ordered = {key: by_key[key] for key in seen}
    json.dump(ordered, open(out_path, 'w'), ensure_ascii=False, indent=2)
    open(out_path, 'a').write('\n')
    print(f'{out_path}: {len(ordered)} descriptions')


def merge_sp(details_path, index_path, en_path, out_path):
    """The SP-version trait text is a second, longer effect block."""
    rows = json.load(open(details_path))
    english = read_en(en_path)
    seen = []
    for row in rows:
        if not row.get('spEffect'):
            continue
        key = norm(row['spEffect'])
        if key not in seen:
            seen.append(key)

    index = {}
    for line in open(index_path):
        number, _, source = line.rstrip('\n').partition('\t')
        index[number] = norm(source)
    missing = [n for n in index if n not in english]
    if missing:
        raise SystemExit(f'{en_path}: missing English for {missing}')
    by_key = {index[n]: english[n] for n in index}
    uncovered = [key for key in seen if key not in by_key]
    if uncovered:
        raise SystemExit(f'{out_path}: {len(uncovered)} SP effects without English')

    ordered = {key: by_key[key] for key in seen}
    json.dump(ordered, open(out_path, 'w'), ensure_ascii=False, indent=2)
    open(out_path, 'a').write('\n')
    print(f'{out_path}: {len(ordered)} descriptions')


if __name__ == '__main__':
    merge('../src/data/ability-detail.json', 'desc-abilities.txt',
          'desc-abilities.en.txt', '../src/data/i18n-ability-desc.json')
    merge('../src/data/trait-detail.json', 'desc-traits.txt',
          'desc-traits.en.txt', '../src/data/i18n-trait-desc.json')
    merge_sp('../src/data/trait-detail.json', 'desc-traits-sp.txt',
             'desc-traits-sp.en.txt', '../src/data/i18n-trait-sp-desc.json')
