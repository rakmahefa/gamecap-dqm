import re, json, urllib.request, sys
from concurrent.futures import ThreadPoolExecutor
r=json.load(open('roster.json'))
keys=list(r.keys())
lo,hi=int(sys.argv[1]),int(sys.argv[2])
def clean(s):
    s=re.sub(r'<[^>]+>','|',s)
    s=re.sub(r'\|+','|',s)
    return s
def get(k):
    try:
        raw=urllib.request.urlopen('https://game-cap.com/dqm2/data/'+k,timeout=30).read()
    except Exception as e:
        return k,{'err':str(e)}
    h=raw.decode('shift_jis','ignore')
    h=re.sub(r'<script.*?</script>','',h,flags=re.S)
    t=clean(h)
    d={}
    m=re.search(r'\|(\d{1,3})：',t)
    if m: d['no']=m.group(1)
    for lab,key in (('HP','hp'),('MP','mp'),('攻撃','atk'),('防御','def'),('素早','agi'),('賢さ','wis'),('合計','total')):
        mm=re.search(r'\|'+lab+r'\|+\|(\d+)\|',t)
        if mm: d[key]=int(mm.group(1))
    i=t.find('モンスター入手')
    if i>0:
        seg=t[i:i+1200].split('|配合|')
        if len(seg)>1: d['obtain']=seg[0]
    i=t.find('|特性|スタンダード')
    if i<0: i=t.find('|特性|')
    if i>0:
        seg=t[i:t.find('|耐性 [SP版',i) if t.find('|耐性 [SP版',i)>0 else i+1500]
        d['traits']=seg
    i=t.find('|耐性 [SP版')
    if i>0:
        seg=t[i:i+900]
        d['resist']=seg
    return k,d
out={}
with ThreadPoolExecutor(max_workers=12) as ex:
    for k,d in ex.map(get, keys[lo:hi]):
        out[k]=d
json.dump(out, open(f'detail_{lo}_{hi}.json','w'), ensure_ascii=False)
print('done', len(out))
import collections
print(collections.Counter(['ok' if 'hp' in v else 'nohp' for v in out.values()]))
print(json.dumps(list(out.items())[0], ensure_ascii=False)[:1200])
