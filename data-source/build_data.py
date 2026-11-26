#!/usr/bin/env python3
# Build pipeline: scrapes game-cap.com/dqm2 (already saved as roster.json / detail_0_908.json)
# and merges the unofficial English name maps into ../src/data/monsters.json + skills.json.
# Run from this folder: python3 build_data.py
import json, re, collections, html
roster=json.load(open('roster.json'))
det=json.load(open('detail_0_908.json'))
names={**json.load(open('name-map-a.json')),**json.load(open('name-map-b.json'))}
FAM={'スライム':'Slime','ドラゴン':'Dragon','自然':'Nature','魔獣':'Beast','物質':'Material','悪魔':'Demon','ゾンビ':'Zombie','？？？':'???'}
SIZE={'S':'S','M':'M','G':'G','超G':'Super G'}

SKILL_EN={
'あらくれ':'Ruffian','いしあたま':'Blockhead','いなずまダンサー':'Lightning Dancer','えんかい':'Banquet',
'くろくかがやくやみ':'Glittering Darkness','けもの道':'Beast Trail','こうじちゅう':'Loyalty','こうねつガス':'Hot Gas',
'さいみん':'Hypnosis','しっぷう・ゼロ封じ':'Gale & Null Seal','しんそく':'Swiftness','じこぎせい':'Self-Sacrifice',
'じごく':'Hell','たたり':'Curse','ため息':'Sigh','てっぺき':'Iron Wall','どくが':'Poison Fang',
'にじくじゃく':'Rainbow Peacock','ばくひょうの剣技':'Swift Swordplay','びゃくやの剣技':'White Night Swordplay',
'ふういん':'Sealing','ふういんの技':'Sealing Arts','ふうえんの剣技':'Windfire Swordplay','ふうらいの剣技':'Drifting Swordplay',
'ほのおの魔術師':'Flame Mage','ぼうぎょ':'Defence','みずげい':'Water Tricks','むしのしらせ':'Insect Whisper',
'やみのダンサー':'Dark Dancer','ゆうき':'Courage','ゆうしゃのふえ':"Hero's Flute",'ゆうれい船':'Ghost Ship',
'ようじゅつ':'Sorcery','ようせいの息吹':'Fairy Breath','ＨＰ回復':'HP Recovery','ＭＰ回復':'MP Recovery',
'全体回復':'Group Recovery','異常回復':'Status Recovery','巨大モンスターつぶし':'Giant Slayer','メタルつぶし':'Metal Slayer',
'光の使い手':'Light Wielder','神聖':'Holy','暗黒':'Darkness','死神':'Reaper','火炎':'Flame Breath','吹雪':'Ice Breath',
'ブレス':'Breath','アッパー':'Upper','インスパイア':'Inspire','エコロジー':'Ecology','ガード':'Guard',
'グリーンファイター':'Green Fighter','コールドスリープ':'Cold Sleep','サムライ':'Samurai','ジャミング':'Jamming',
'ジャミングナイト':'Jamming Knight','スイーツカーニバル':'Sweets Carnival','スラフォース':'Slime Force',
'タイラントワーム':'Tyrant Worm','ダイナマイト':'Dynamite','ダウナー':'Downer','ダンサー':'Dancer',
'ダークビューティー':'Dark Beauty','ナイトメア':'Nightmare','ハンター':'Hunter','バウンティハンター':'Bounty Hunter',
'バラエティ':'Variety','バーサーカー':'Berserker','ピピット':'Pipit','フェザーウインド':'Feather Wind',
'ブラックファイター':'Black Fighter','ブルーファイター':'Blue Fighter','プリンス':'Prince','プリンセス':'Princess',
'ホラー':'Horror','ホワイトファイター':'White Fighter','マネマネ':'Mimicry','メタルハンター':'Metal Hunter',
'モントナー':'Moddy','レッドファイター':'Red Fighter','レンジャー':'Ranger','イエローファイター':'Yellow Fighter',
'ＶＳ呪文':'VS Spell','ＶＳ斬撃':'VS Slash','ＶＳ体技':'VS Skill','ＶＳブレス':'VS Breath','ＶＳ踊り':'VS Dance',
'最強ＶＳ呪文':'Ultimate VS Spell','最強ＶＳ体技':'Ultimate VS Skill','禁断の魔導書':'Forbidden Grimoire',
'九神将':'Nine Divine Generals','スラリン船':'Slarling Ship','スラ・ブラスター':'Slime Blaster',
'呪術師マリーン':'Sorcerer Marine','しん・りゅうおう':'Shin Dragonlord','じげんりゅう':'Dimensional Dragon',
'はぐれメタルキング':'Liquid Metal King Slime','やまたのおろち':'Yamata no Orochi','くろくかがやくやみ':'Glittering Darkness',
}
for c in ['イエロー','オレンジ','グリーン','パープル','ピンク','ブラウン','ブラック','ブルー','レッド','ゴールド','シルバー']:
    SKILL_EN['スラ忍'+c]='Slime Ninja '+c.capitalize()
LOC={
'砂漠の世界':'Desert Realm','水の世界':'Water Realm','雪と氷の世界':'Snow & Ice Realm','天空の世界':'Sky Realm',
'狭間の世界':'Rift Realm','宿り木の世界':'Mistletoe Realm','魔王の城':"Demon King's Castle",'フィールド':'field',
'溶岩の洞くつ':'Lava Cave','ゆうれい船':'Ghost Ship','国境の鉱山':'Border Mine','ドークの館':"Dork's Manor",
'宿り木の塔':'Tower of Mistletoe','まよいの森':'Lost Woods','小さな洞くつ':'Small Cave','はじまりの海岸':'Coast of Beginnings',
'青の洞くつ':'Blue Cave','西の岬の洞くつ':'West Cape Cave','北の山':'North Mountain','西の山':'West Mountain',
'地下水路':'Underground Canal','雪山の氷穴':'Snow Mountain Ice Cave','湖上の魔塔':'Lake Demon Tower',
'賢者の塔':'Tower of Sages','死者の城':'Castle of the Dead','ピラミッド':'Pyramid','いにしえの灯台':'Ancient Lighthouse',
'風の塔':'Tower of Wind','火山島の洞くつ':'Volcano Island Cave','海神の神殿':'Temple of the Sea God',
'マンモデウスの中':'Inside Mammodeus','東の洞くつ':'East Cave','扉のほこら':'Door Shrine','オアシスキャンプ':'Oasis Camp',
'カルカラ':'Kalka','アッシア':'Asiya','ポローニャ':'Polonia','ポートリッツ':'Port Ritz','ヨルド':'Yoldo',
'イーストリア':'Eastria','ウェスターニャ':'Westanya','ウィストン':'Wiston','ノースデン':'Norsden','ノフォー':'Nofo',
'ヒターノ':'Hitano','ペイ':'Pey','フント':'Funt','リバイアさま':'Lady Leviathan','オリハルゴン':'Orichalcum',
'胃ぶくろ':'stomach','最深部':'deepest part','くち':'mouth','背中':'back','外観':'exterior','頂上への道':'path to the summit',
'館内':'inside','中庭':'courtyard','高台':'plateau','流星跡':'meteor site','かまくら':'snow hut','壊れた神殿':'ruined temple',
'廃墟':'ruins','砂浜':'sandy beach','海の上':'open sea','海面':'sea surface','水面':'water surface','湖':'lake','島':'island',
'大陸':'continent','海域':'sea area','山道':'mountain path','岩場':'rocky area','穴':'hole','木':'tree','木の下':'under the tree',
'魔法陣':'magic circle','町長の屋敷':'mayor\'s mansion','隕石':'meteorite','クレーター':'crater','渦中心部':'whirlpool centre',
'1番奥':'far end','MAP中央':'map centre','MAP北側':'north side of the map','MAP南側':'south side of the map',
'MAP西側':'west side of the map','北西':'northwest','左下':'lower left','左上':'upper left','右上':'upper right','右下':'lower right',
'東':'east','西':'west','北':'north','南':'south','周辺':'area','付近':'near','近く':'near','上':'above','下':'below',
'右':'right','左':'left','入り口':'entrance','入ってすぐ':'just inside','前':'front','間':'between','の西':'west of',
'昼':'day','夜':'night','晴':'clear','雨':'rain','雪':'snow','砂嵐':'sandstorm','稀に出現':'rare spawn','召喚':'summons',
'転生':'rebirth','宝箱':'treasure chest','宝箱がある行き止まりの場所':'dead end with a chest','合体':'fuses','倒して':'defeat and',
'戻ってくると出現':'return to spawn','戦闘中に召喚':'summons during battle','休み':'rest','いない状態にする':'so it is absent',
'出た':'leaving','の島':'island','には出現しない':'does not appear in','のみ':'only','階':'F','地下':'B','・':'-','、':', ',
'あたり':'area','への道':'path to','の東':'east of','の西':'west of','の南':'south of','の北':'north of',
'村':'Village','南側':'south side','北側':'north side','東側':'east side','西側':'west side','側':'side','中央':'centre',
'の':'','を':'',
'入口前':'in front of the entrance','海上':'on the sea','から出た':'off','町':'town','周辺':'area',
'町の西側':'west side of town','あたりに出現':'appears around','あたりで':'in the area,','に戻ってくると出現':'return to spawn',
'を倒していると':'after defeating','ていると':'after defeating','に出現':'spawns','の中央':'centre of','広い場所':'open area',
}
def tr_loc(s):
    s=html.unescape(s)
    if not s or s=='なし': return None
    s=re.sub(r'[（(]([^）)]*)[）)]', lambda m:' ('+m.group(1)+')', s)
    s=re.sub(r'(\d+)\s*階', r'\1F', s)
    keys=sorted(LOC, key=len, reverse=True)
    for k in keys: s=s.replace(k, ' '+LOC[k]+' ')
    s=s.replace('：',': ').replace('（','(').replace('）',')').replace('　',' ')
    s=re.sub(r'\s+',' ',s).strip(' :,-')
    s=re.sub(r'\s*:\s*', ': ', s)
    s=re.sub(r'\(\s*', '(', s)
    s=re.sub(r'\s*\)', ')', s)
    s=re.sub(r'\s*:\s*\)', ')', s)
    s=re.sub(r'\s+,', ',', s)
    s=s.strip(' :,-')
    if re.search(r'[\u3040-\u30ff\u4e00-\u9fff]', s): return None
    return s

def en_names(s, within):
    """Replace monster names inside a location line with their English rendering.
    Only names that occur in the line are touched; longest first so a name that
    contains another one is replaced as a whole."""
    for jp in sorted(within, key=len, reverse=True):
        if jp in s: s=s.replace(jp, within[jp])
    return s
REBIRTH_RE=re.compile(r'【(.+?)の転生】')
def parse_obtain(o):
    p=[x.strip() for x in (o or '').split('|') if x.strip()]
    d={}
    for i,t in enumerate(p):
        if t in ('場所','タマゴ','他国マスター','カメハの不思議な冒険隊','錬金カギ出現','その他') and i+1<len(p):
            d[t]=p[i+1]
    out={}
    place=html.unescape(d.get('場所',''))
    rb=REBIRTH_RE.search(place)
    if rb:
        of=names.get(rb.group(1), rb.group(1))
        out['rebirth']={'of':of}
        # The 転生 tag sits inside the habitat line (before or after it); drop it
        # so only the actual place and its condition remain.
        place=REBIRTH_RE.sub('', place)
        place=re.sub(r'[（(]\s*[:：]?\s*[）)]', '', place)
        # The line names the 転生元 monster ("after defeating X"); translate it too.
        place=en_names(place, {k:v for k,v in names.items() if k in place})
    w=tr_loc(place)
    if w:
        out['where']=w
        if rb: out['rebirth']['where']=w
    egg=d.get('タマゴ','なし')
    if egg and egg!='なし':
        out['eggs']=[c for c,jp in (('white','白'),('silver','銀'),('gold','金'),('rainbow','虹')) if jp in egg]
        out['dream']='夢見るタマゴ' in egg
    # 他国マスター holds the world whose wandering master can be scouted for
    # this monster, not a monster name.
    m=d.get('他国マスター','なし')
    if m and m!='なし': out['masterWorld']=tr_loc(m) or m
    a=d.get('錬金カギ出現','なし')
    if a and a!='なし':
        out['alchemy']={'通常出現':'normal','ボス出現':'boss','報酬入手':'reward'}.get(a)
    oth=d.get('その他','なし')
    if oth and oth!='なし':
        out['other']={'配信(3DS)':'Download event (3DS)','すれちがい通信(3DS)':'StreetPass (3DS)','大型モンスター出現':'Giant monster spawn',
          '転生モンスター':'Rebirth monster','ちいさなメダル景品':'Mini Medal prize',
          'DQMテリーのワンダーランド3Dから引き継ぎ':'Transfer from DQM Terry\'s Wonderland 3D','オンライン：通信お見合い':'Online matchmaking'}.get(oth)
    return out
# ------------------------------------------------------------------ traits
# The trait text of each record is a flat '|' dump:  base traits, then
# 'プラス値特性' (+25/+50/+★), then '[M・G・超G]特性' (M/G/超G).  The split between a
# trait name and its description lines is not marked, so the name vocabulary is
# learned from the whole corpus: a description text is identical wherever its
# trait appears, which makes the common prefix of the tails after a name exactly
# that description.  Nothing is guessed per record.
PLUS_MARK=('+25','+50','+★')
SIZE_MARK=('M','G','超G')
WEAPON_JP={'剣':'Sword','ヤリ':'Lance','オノ':'Axe','ハンマー':'Hammer','ムチ':'Whip','ツメ':'Claw','杖':'Staff'}
RESIST_KEYS=['メラ','ギラ','イオ','バギ','ヒャド','ジバリア','デイン','ドルマ','ベタン','ザキ',
            '炎','吹雪','こんらん','マヒ','ねむり','マヌーサ','マホトラ','ハック',
            '呪文封じ','斬撃封じ','体技封じ','息封じ','踊り封じ','ダウン','どく','ルカニ',
            '呪い','ボミエ','マインド','フール']
RESIST_LEVELS=['普通','弱点','半減','軽減','無効','回復','反射','無効＋']

def _tokens(s):
    return [x.strip() for x in (s or '').split('|') if x.strip()]

def trait_parts(traits):
    """-> (base tokens, plus tokens, size tokens) for one record."""
    sp=traits.find('特技・特性|')
    i=traits.find('|特性|',sp)
    j=traits.find('プラス値特性',i) if i>=0 else -1
    if i<0: return [],[],[]
    base=[x for x in _tokens(traits[i+4:j if j>=0 else len(traits)]) if not x.startswith('3DS版')]
    rest=traits[j+len('プラス値特性'):] if j>=0 else ''
    k=rest.find('[M・G・超G]特性')
    plus=_tokens(rest if k<0 else rest[:k])
    size=_tokens('' if k<0 else rest[k+len('[M・G・超G]特性'):])
    return base,plus,size

def marked_pairs(tokens,marks):
    """name | MARK | desc... -> [(name, mark, [desc lines])]"""
    idx=[n for n,t in enumerate(tokens) if t in marks and n>0]
    out=[]
    for a,n in enumerate(idx):
        name=tokens[n-1]
        end=idx[a+1]-1 if a+1<len(idx) else len(tokens)
        out.append((name,tokens[n],tokens[n+1:end]))
    return out

def learn_traits(sections):
    """Learn the trait-name vocabulary and each name's fixed description text."""
    names=set(s[0] for s in sections if s)
    desc={}
    for _ in range(20):
        progress=False
        tails=collections.defaultdict(list)
        for s in sections:
            pos=0
            while pos<len(s):
                name=s[pos]
                if name not in names: names.add(name); progress=True
                if name in desc:
                    pos+=1+len(desc[name]); continue
                k=pos+1
                while k<len(s) and s[k] not in names: k+=1
                tails[name].append((tuple(s[pos+1:k]),k==len(s)))
                pos=k
        for name,ts in tails.items():
            if name in desc or len(ts)<2: continue
            pref=list(ts[0][0])
            for x,_ in ts[1:]:
                n=0
                while n<min(len(pref),len(x)) and pref[n]==x[n]: n+=1
                pref=pref[:n]
            cut=len(pref)
            for i0,tok in enumerate(pref):
                if tok in names: cut=i0; break
            pref=tuple(pref[:cut])
            if pref: desc[name]=pref; progress=True
        if not progress: break
    # names whose only occurrence ends the section: the remainder is their description
    for s in sections:
        pos=0
        while pos<len(s):
            name=s[pos]
            if name in desc:
                pos+=1+len(desc[name]); continue
            k=pos+1
            while k<len(s) and s[k] not in names: k+=1
            if k==len(s) and k>pos+1: desc[name]=tuple(s[pos+1:k])
            pos=k
    return names,desc

def segment_traits(tokens,names,desc):
    out=[]; pos=0
    while pos<len(tokens):
        name=tokens[pos]
        out.append(name)
        if name in desc:
            pos+=1+len(desc[name])
        else:
            k=pos+1
            while k<len(tokens) and tokens[k] not in names: k+=1
            pos=k
    return out

def parse_sp(traits):
    """必要SP table of a record -> [{sp, name}] (one entry per learned ability)."""
    sp=traits.find('特技・特性|'); end=traits.find('|特性|',sp)
    if sp<0 or end<0: return []
    tok=_tokens(traits[sp+len('特技・特性|'):end])
    out=[]
    for n,t in enumerate(tok):
        if t.isdigit() and n+1<len(tok):
            out.append({'sp':int(t),'name':tok[n+1]})
    return out

def parse_resist(resist):
    """30 resistance slots in RESIST_KEYS order, each a RESIST_LEVELS index or None."""
    tok=_tokens(resist[:resist.find('モンスター入手')] if 'モンスター入手' in resist else resist)
    found={}
    for n,t in enumerate(tok):
        if t in RESIST_KEYS and t not in found:
            val=tok[n+1] if n+1<len(tok) else ''
            found[t]=RESIST_LEVELS.index(val) if val in RESIST_LEVELS else None
    return [found.get(k) for k in RESIST_KEYS]

def parse_recipes(resist):
    """Special synthesis recipes recorded on the page of the monster they create.
    A recipe is a tree of one, two or four named parents plus an optional
    family requirement (種族系統配合), e.g. リザードキッズ × any Zombie-family
    monster → アルゴリザード. Only tokens the page actually prints are kept."""
    out=[]
    a=resist.find('このモンスターを作る|')
    if a<0: return out
    b=resist.find('|位階配合|位階配合', a)
    seg=resist[a+len('このモンスターを作る|'):b if b>a else a+4000]
    for chain in re.split(r'親の配合元系図を見る', seg):
        chain=chain.strip('| ').strip()
        if not chain.startswith('特殊配合|') or '↓' not in chain: continue
        left,right=chain.split('↓',1)
        tok=[x.strip() for x in left.split('|') if x.strip()][1:]
        ing=[]; fam=None; i=0
        while i<len(tok):
            if i+3<len(tok) and re.fullmatch(r'\[\w+\]',tok[i+1]) and re.fullmatch(r'位階\d+',tok[i+3]):
                jp=tok[i]
                ing.append({'id':ID_BY_JP.get(jp),'name':names.get(jp,jp)})
                i+=4
            elif tok[i]=='？' and i+2<len(tok) and tok[i+1].endswith('系'):
                fam=FAM.get(tok[i+1][:-1], tok[i+1][:-1])
                i+=3
            else:
                i+=1
        if not ing: continue
        rec={'size':len(ing)+(1 if fam else 0),'ingredients':ing}
        if fam: rec['family']=fam
        if rec not in out: out.append(rec)
    return out

def parse_breeding(resist):
    """位階No. (which equals dex order), the two 配合 flags and the recipes
    that produce this monster."""
    m=re.search(r'位階No\.\s*\|(\d+)',resist)
    if not m: return None
    f=re.search(r'配合\s*\|位階\s*\|([^|]*)\|特殊\s*\|([^|]*)',resist)
    rank_ok, special_ok = (f.group(1).strip(), f.group(2).strip()) if f else ('×','×')
    return {'rankNo':int(m.group(1)),
            'rankSynth':rank_ok=='○',
            'specialSynth':special_ok=='○',
            'recipes':parse_recipes(resist)}

def parse_weapons(resist):
    """Equippable weapon types, only where the source kept the 3DS weapon line."""
    a=resist.find('装備できる武器'); b=resist.find('モンスター入手',a)
    if a<0: return None
    m=re.search(r'3DS版：([^|]*)',resist[a:b if b>a else len(resist)])
    if not m: return None
    out=[WEAPON_JP[t] for t in m.group(1).split() if t in WEAPON_JP]
    return out or None

# learn the vocabulary once, over every record
ID_BY_JP={}
for key,v in roster.items():
    ID_BY_JP.setdefault(v['jp'], re.sub(r'^monst_|\.html$','',key))
_sections=[trait_parts(v['traits'])[0] for v in det.values() if v.get('traits')]
TNAMES,TDESC=learn_traits(_sections)
for v in det.values():
    if not v.get('traits'): continue
    _,plus,size=trait_parts(v['traits'])
    for name,_,d in marked_pairs(plus,PLUS_MARK)+marked_pairs(size,SIZE_MARK):
        if d: TDESC.setdefault(name,d)
print('traits: names',len(TNAMES),'described',len(TDESC))
print('traits: description lines that contain another trait name',
      sum(1 for d in TDESC.values() if any(t in TNAMES for t in d)))

mons=[]; skills=collections.defaultdict(lambda:{'jp':'','ids':[],'sp':[]})
for key,v in roster.items():
    d=det.get(key,{})
    mid=re.sub(r'^monst_|\.html$','',key)
    jp=v['jp']; en=names[jp]
    sid=v['skill_jp']
    sen=SKILL_EN.get(sid) or names.get(sid) or sid
    skills[sen]['jp']=sid; skills[sen]['ids'].append(mid)
    ob=parse_obtain(d.get('obtain',''))
    tr=d.get('traits','')
    base,plus,size=trait_parts(tr)
    sp=parse_sp(tr)
    if sp and not skills[sen]['sp']: skills[sen]['sp']=sp
    m={'id':mid,'no':d.get('no'),'name':en,'jp':jp,'rank':v['rank'],
       'family':FAM.get(v['family_jp'],v['family_jp']),'size':SIZE.get(v['size'],v['size']),
       'icon':v['icon'],'skill':sen,'total':int(v['total']) if str(v['total']).isdigit() else None,
       'stats':{k:d[k] for k in ('hp','mp','atk','def','agi','wis') if k in d},
       'obtain':ob,
       'traits':{'base':segment_traits(base,TNAMES,TDESC),
                 'plus':[{'tier':mk,'name':nm} for nm,mk,_ in marked_pairs(plus,PLUS_MARK)],
                 'size':[{'size':mk,'name':nm} for nm,mk,_ in marked_pairs(size,SIZE_MARK)]},
       'resist':parse_resist(d.get('resist',''))}
    br=parse_breeding(d.get('resist',''))
    if br: m['breed']=br
    wp=parse_weapons(d.get('resist',''))
    if wp: m['weapons']=wp
    mons.append(m)
mons.sort(key=lambda m:(m['no'] or 9999, m['name']))
no_map={m['id']:m for m in mons}
sk_out=[]
for name,info in skills.items():
    ms=[m for m in (no_map[i] for i in info['ids'])]
    sk_out.append({'name':name,'jp':info['jp'],'count':len(ms),'sp':info['sp'],
                   'monsters':[{'id':m['id'],'name':m['name'],'rank':m['rank']} for m in ms]})
sk_out.sort(key=lambda s:s['name'])
catalogue={k:list(v) for k,v in sorted(TDESC.items())}
json.dump(mons, open('../src/data/monsters.json','w'), ensure_ascii=False, separators=(',',':'))
json.dump(sk_out, open('../src/data/skills.json','w'), ensure_ascii=False, separators=(',',':'))
json.dump(catalogue, open('../src/data/traits.json','w'), ensure_ascii=False, separators=(',',':'))
print('skills with SP table',sum(1 for s in sk_out if s['sp']),'/',len(sk_out))
print('monsters with traits',sum(1 for m in mons if m['traits']['base']),
      'with resist',sum(1 for m in mons if any(x is not None for x in m['resist'])),
      'with weapons',sum(1 for m in mons if 'weapons' in m))
print('breed: with rank value',sum(1 for m in mons if m.get('breed')),
      'rank-synth',sum(1 for m in mons if m.get('breed',{}).get('rankSynth')),
      'special-synth',sum(1 for m in mons if m.get('breed',{}).get('specialSynth')),
      'with recipes',sum(1 for m in mons if m.get('breed',{}).get('recipes')))
print('recipes',collections.Counter(r['size'] for m in mons for r in m.get('breed',{}).get('recipes',[])))
print('rebirth records',sum(1 for m in mons if 'rebirth' in m['obtain']),
      'with location',sum(1 for m in mons if m['obtain'].get('rebirth',{}).get('where')),
      'master worlds',sum(1 for m in mons if m['obtain'].get('masterWorld')))
print('base trait counts',collections.Counter(len(m['traits']['base']) for m in mons))
print('plus tiers',collections.Counter(p['tier'] for m in mons for p in m['traits']['plus']))
print('size traits',collections.Counter(p['size'] for m in mons for p in m['traits']['size']))
print('monsters',len(mons),'with stats',sum(1 for m in mons if m['stats']),'with where',sum(1 for m in mons if 'where' in m['obtain']),'skills',len(sk_out))
print('ranks',collections.Counter(m['rank'] for m in mons))
print('families',collections.Counter(m['family'] for m in mons))
print(json.dumps(mons[0],ensure_ascii=False))
print(json.dumps([m for m in mons if m['name']=='Slime'][0],ensure_ascii=False))
