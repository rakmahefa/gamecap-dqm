#!/usr/bin/env python3
"""Scrape the arena (モンスター格闘場) and the Kameha reward list.

    python3 scrape_guides.py

Writes ../src/data/arena.json and ../src/data/kameha.json.
"""
import html
import json
import re
import urllib.request

BASE = 'https://game-cap.com/dqm2/'
UA = {'User-Agent': 'dqm2-offline-compendium/1.0 (fan reference build)'}


def get(path):
    raw = urllib.request.urlopen(urllib.request.Request(BASE + path, headers=UA), timeout=45).read()
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
    for tr in re.split(r'<tr[^>]*>', page.split('<aside')[0])[1:]:
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr.split('</tr>')[0], re.S)
        if cells:
            out.append([text_of(c) for c in cells])
    return out


def dump(name, data):
    json.dump(data, open(f'../src/data/{name}', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'{name}: {len(data)} top-level entries')


def scrape_arena():
    cups = []
    for cls, path in (('C', 'chart/c.html'), ('B', 'chart/b.html'),
                      ('A', 'chart/a.html'), ('S', 'chart/s.html')):
        table = rows(get(path))
        cup = {'class': cls, 'fee': None, 'prize': None, 'advice': '', 'rounds': []}
        current = None
        expect_note = False
        for cells in table:
            if expect_note and len(cells) == 1:
                if current is not None:
                    current['note'] = cells[0]
                expect_note = False
                continue
            if len(cells) == 1:
                line = cells[0]
                if line == '備考':
                    expect_note = True
                    continue
                hit = re.match(r'^' + cls + r'クラス(\d)回戦', line)
                if hit:
                    current = {'name': f'Round {hit.group(1)}', 'monsters': [], 'note': ''}
                    cup['rounds'].append(current)
                    continue
                if '参加料' in line or '賞品' in line:
                    cup['advice'] = (cup['advice'] + ' ' + line).strip()
                continue
            if cells[0] == '名前':
                continue
            if cells[0] == '備考':
                if current is not None:
                    current['note'] = cells[1] if len(cells) > 1 else ''
                continue
            if current is not None and len(cells) >= 2:
                current['monsters'].append({'name': cells[0], 'hp': cells[1]})
        fee = re.search(r'参加料は([\d,]+)G', cup['advice'])
        if fee:
            cup['fee'] = int(fee.group(1).replace(',', ''))
        prize = re.search(r'賞品は([^。\s]+)', cup['advice'])
        if prize:
            cup['prize'] = prize.group(1)
        cups.append(cup)

    # 勝ち抜きバトル — rewards by streak, how far a loss sends you back.
    page = get('chart/kachinuki.html').split('<aside')[0]
    streak = {'rewards': [], 'restart': [], 'note': ''}
    for cells in rows(get('chart/kachinuki.html')):
        if len(cells) == 3 and cells[0] not in ('勝ち抜き数',):
            streak['rewards'].append({'streak': cells[0], 'gold': cells[1], 'prize': cells[2]})
        elif len(cells) == 2 and cells[0] not in ('前回の勝ち抜き数',):
            streak['restart'].append({'from': cells[0], 'start': cells[1]})
    body = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', page)))
    hit = re.search(r'出てくる敵の傾向(.{10,400}?)(?:パーティー作り|ページ先頭)', body)
    if hit:
        streak['note'] = hit.group(1).strip()

    dump('arena.json', {'cups': cups, 'streak': streak})
    print('  rounds:', sum(len(c['rounds']) for c in cups),
          '| monsters:', sum(len(r['monsters']) for c in cups for r in c['rounds']),
          '| streak rewards:', len(streak['rewards']))


FLAGS = ['scout', 'master', 'rankBreed', 'specialBreed', 'egg', 'key', 'kameha', 'other']
FLAG_LABELS = ['スカウト', '他国マスター', '位階配合', '特殊配合', 'たまご', '錬金カギ', 'カメハ', 'その他']


def scrape_kameha():
    table = rows(get('data/kameha.html'))
    by_jp = {m['jp']: m for m in json.load(open('../src/data/monsters.json'))}
    rewards = []
    rank = None
    started = False
    for cells in table:
        if cells[0] == 'ランク':
            started = True
            continue
        if not started:
            continue
        if len(cells) >= 9 and re.fullmatch(r'[FEDCBAS]{1,2}', cells[0]):
            rank = cells[0]
            record = {'rank': rank, 'jp': cells[1]}
            for key, value in zip(FLAGS, cells[2:10]):
                record[key] = value == '○'
            m = by_jp.get(record['jp'])
            if m:
                record['id'] = m['id']
                record['name'] = m['name']
            rewards.append(record)
        elif len(cells) == 1 and re.fullmatch(r'[FEDCBAS]{1,2}', cells[0]):
            rank = cells[0]
    dump('kameha.json', rewards)
    print('  with a dex record:', sum(1 for r in rewards if r.get('id')), '/', len(rewards))


if __name__ == '__main__':
    scrape_arena()
    scrape_kameha()
