import re, json, urllib.request, time
base='https://game-cap.com/dqm2/data/'
pages=[f'monstlist{i}.html' for i in range(21,29)]
seen={}
for p in pages:
    try:
        raw=urllib.request.urlopen(base+p, timeout=30).read()
        h=raw.decode('shift_jis','ignore')
    except Exception as e:
        print('ERR',p,e); continue
    rows=re.findall(r'<tr>(.*?)</tr>', h, re.S)
    for r in rows:
        m=re.search(r'href="(monst_[^"]+\.html)"[^>]*>([^<]+)</a>', r)
        if not m: continue
        tds=re.findall(r'<td[^>]*>(.*?)</td>', r, re.S)
        if len(tds)<7: continue
        clean=lambda s: re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',s)).strip()
        vals=[clean(t) for t in tds]
        icon=re.search(r'icon-no="(\d+)"', r)
        seen.setdefault(m.group(1), {
          'icon': icon.group(1) if icon else None,
          'jp': clean(m.group(2)),
          'rank': vals[0], 'family_jp': vals[2], 'size': vals[3], 'ai': vals[4],
          'total': vals[5], 'skill_jp': vals[6],
        })
    print(p, len(seen))
json.dump(seen, open('roster.json','w'), ensure_ascii=False, indent=0)
print('TOTAL', len(seen))
