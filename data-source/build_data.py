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
}
def tr_loc(s):
    s=html.unescape(s)
    if not s or s=='なし': return None
    s=re.sub(r'[（(]([^）)]*)[）)]', lambda m:' ('+m.group(1)+')', s)
    keys=sorted(LOC, key=len, reverse=True)
    for k in keys: s=s.replace(k, ' '+LOC[k]+' ')
    s=s.replace('：',': ').replace('（','(').replace('）',')').replace('　',' ')
    s=re.sub(r'\s+',' ',s).strip(' :,-')
    if re.search(r'[\u3040-\u30ff\u4e00-\u9fff]', s): return None
    return s
def parse_obtain(o):
    p=[x.strip() for x in (o or '').split('|') if x.strip()]
    d={}
    for i,t in enumerate(p):
        if t in ('場所','タマゴ','他国マスター','カメハの不思議な冒険隊','錬金カギ出現','その他') and i+1<len(p):
            d[t]=p[i+1]
    out={}
    w=tr_loc(d.get('場所',''))
    if w: out['where']=w
    egg=d.get('タマゴ','なし')
    if egg and egg!='なし':
        out['eggs']=[c for c,jp in (('white','白'),('silver','銀'),('gold','金'),('rainbow','虹')) if jp in egg]
        out['dream']='夢見るタマゴ' in egg
    m=d.get('他国マスター','なし')
    if m and m!='なし': out['master']=tr_loc(m) or 'Other-world master'
    a=d.get('錬金カギ出現','なし')
    if a and a!='なし':
        out['alchemy']={'通常出現':'normal','ボス出現':'boss','報酬入手':'reward'}.get(a)
    oth=d.get('その他','なし')
    if oth and oth!='なし':
        out['other']={'配信(3DS)':'Download event (3DS)','すれちがい通信(3DS)':'StreetPass (3DS)','大型モンスター出現':'Giant monster spawn',
          '転生モンスター':'Rebirth monster','ちいさなメダル景品':'Mini Medal prize',
          'DQMテリーのワンダーランド3Dから引き継ぎ':'Transfer from DQM Terry\'s Wonderland 3D','オンライン：通信お見合い':'Online matchmaking'}.get(oth)
    return out
mons=[]; skills=collections.defaultdict(lambda:{'jp':'','ids':[]})
for key,v in roster.items():
    d=det.get(key,{})
    mid=re.sub(r'^monst_|\.html$','',key)
    jp=v['jp']; en=names[jp]
    sid=v['skill_jp']
    sen=SKILL_EN.get(sid) or names.get(sid) or sid
    skills[sen]['jp']=sid; skills[sen]['ids'].append(mid)
    ob=parse_obtain(d.get('obtain',''))
    m={'id':mid,'no':d.get('no'),'name':en,'jp':jp,'rank':v['rank'],
       'family':FAM.get(v['family_jp'],v['family_jp']),'size':SIZE.get(v['size'],v['size']),
       'icon':v['icon'],'skill':sen,'total':int(v['total']) if str(v['total']).isdigit() else None,
       'stats':{k:d[k] for k in ('hp','mp','atk','def','agi','wis') if k in d},
       'obtain':ob}
    mons.append(m)
mons.sort(key=lambda m:(m['no'] or 9999, m['name']))
no_map={m['id']:m for m in mons}
sk_out=[]
for name,info in skills.items():
    ms=[m for m in (no_map[i] for i in info['ids'])]
    sk_out.append({'name':name,'jp':info['jp'],'count':len(ms),'monsters':[{'id':m['id'],'name':m['name'],'rank':m['rank']} for m in ms]})
sk_out.sort(key=lambda s:s['name'])
json.dump(mons, open('../src/data/monsters.json','w'), ensure_ascii=False, separators=(',',':'))
json.dump(sk_out, open('../src/data/skills.json','w'), ensure_ascii=False, separators=(',',':'))
print('monsters',len(mons),'with stats',sum(1 for m in mons if m['stats']),'with where',sum(1 for m in mons if 'where' in m['obtain']),'skills',len(sk_out))
print('ranks',collections.Counter(m['rank'] for m in mons))
print('families',collections.Counter(m['family'] for m in mons))
print(json.dumps(mons[0],ensure_ascii=False))
print(json.dumps([m for m in mons if m['name']=='Slime'][0],ensure_ascii=False))
