import re, json, urllib.request, sys
from concurrent.futures import ThreadPoolExecutor
r=json.load(open('roster.json')); keys=list(r.keys())
lo,hi=int(sys.argv[1]),int(sys.argv[2])
def get(k):
    try:
        h=urllib.request.urlopen('https://game-cap.com/dqm2/data/'+k,timeout=30).read().decode('shift_jis','ignore')
    except Exception as e: return k,{'err':str(e)}
    h=re.sub(r'<script.*?</script>','',h,flags=re.S)
    t=re.sub(r'<[^>]+>','|',h); t=re.sub(r'[\r\n\t]+','',t); t=re.sub(r'\|+','|',t)
    d={}
    m=re.search(r'\|(\d{1,3})：',t); d['no']=int(m.group(1)) if m else None
    for lab,key in (('HP','hp'),('MP','mp'),('攻撃','atk'),('防御','def'),('素早','agi'),('賢さ','wis'),('合計','total')):
        mm=re.search(r'\|'+lab+r'\|(\d+)\|',t)
        if mm: d[key]=int(mm.group(1))
    i=t.find('モンスター入手')
    if i>0:
        seg=t[i:i+900].split('|配合|')[0]
        d['obtain']=seg
    i=t.find('|特性|')
    if i>0:
        j=t.find('|耐性 [SP版',i); d['traits']=t[i:j if j>0 else i+1400]
    i=t.find('|耐性 [SP版')
    if i>0: d['resist']=t[i:i+800]
    return k,d
out={}
for lo2 in range(lo,hi,150):
    with ThreadPoolExecutor(max_workers=14) as ex:
        for k,d in ex.map(get, keys[lo2:min(lo2+150,hi)]): out[k]=d
    print('chunk',lo2,len(out),flush=True)
json.dump(out, open(f'detail_{lo}_{hi}.json','w'), ensure_ascii=False)
print('ok',sum(1 for v in out.values() if 'hp' in v),'/',len(out))
