"""Line IDs, never series codes, identify rows (BEA repeats series codes)."""
ZH = {
1:'整體 PCE',2:'商品',3:'耐久財',4:'汽車與零組件',5:'新車',6:'新轎車',9:'新輕型卡車',
12:'中古車淨購買',13:'中古轎車',17:'中古輕型卡車',20:'汽車零組件與配件',
23:'家具與耐久家用設備',24:'家具與家飾',29:'家用電器',32:'玻璃器皿、餐具與家用器具',35:'家用與園藝工具設備',
38:'休閒商品與交通工具',39:'影音、攝影與資訊設備',40:'影音設備',47:'攝影設備',48:'資訊處理設備',
52:'運動用品、槍械與彈藥',53:'運動與休閒交通工具',60:'休閒書籍',61:'樂器',62:'其他耐久財',
63:'珠寶與手錶',66:'治療器具與設備',69:'教育書籍',70:'行李與個人物品',71:'電話與通訊設備',
72:'非耐久財',73:'食物與飲料（居家消費）',74:'居家食物與非酒精飲料',75:'居家食物',
96:'居家非酒精飲料',99:'居家酒精飲料',103:'農場自產自用食物',104:'服裝與鞋類',105:'服裝',
109:'其他衣料與鞋類',113:'汽油與其他能源商品',114:'車用燃料、潤滑油與油液',117:'燃油與其他燃料',
120:'其他非耐久財',121:'藥品與其他醫療用品',126:'休閒用品',131:'家庭用品',137:'個人護理用品',
141:'菸草',142:'報刊與文具',145:'美國居民境外商品淨支出',146:'美國居民境外商品支出',149:'減：對非居民實物匯款',
150:'服務',151:'家庭服務消費支出',152:'住宅與公用事業',153:'住宅',154:'非農租戶住宅租金',
160:'自有住宅設算租金',163:'農場住宅租賃價值',164:'集體住宅',165:'家庭公用事業',166:'供水與衛生服務',
169:'電力與天然氣',170:'電力',171:'天然氣',172:'醫療服務',173:'門診服務',182:'醫院與護理之家服務',
190:'運輸服務',191:'車輛服務',199:'公共運輸',209:'休閒服務',210:'俱樂部、運動中心、公園與文化場所',
218:'影音、攝影與資訊設備服務',226:'博弈',230:'其他休閒服務',234:'餐飲與住宿',235:'餐飲服務（核心）',
249:'住宿',252:'金融服務與保險',253:'金融服務',270:'保險',280:'其他服務',281:'通訊服務',290:'教育服務',
298:'專業與其他服務',307:'個人護理與衣物服務',315:'社會服務與宗教活動',327:'家庭維護',
333:'境外旅遊淨支出',334:'美國居民境外旅遊支出',338:'減：非居民在美國的支出',
342:'服務家庭之非營利機構淨消費',343:'非營利機構總產出',344:'醫療總產出',348:'休閒服務總產出',
349:'教育服務總產出',350:'社會服務總產出',351:'宗教組織總產出',352:'基金會與捐贈服務總產出',
353:'社會倡議組織總產出',354:'公民與社會組織總產出',355:'專業倡議組織總產出',
356:'減：非營利機構商品與服務銷售收入',357:'減：對家庭醫療服務收入',361:'減：對家庭休閒服務收入',
362:'減：對家庭教育服務收入',363:'減：對家庭社會服務收入',364:'減：對家庭宗教服務收入',
365:'減：對家庭基金會與捐贈服務收入',366:'減：對家庭社會倡議服務收入',
367:'減：對家庭公民與社會組織服務收入',368:'減：對家庭專業倡議服務收入',
}
GROUPS = [
    dict(id='food',en='Food',zh='食物',color='#4c92e8'),
    dict(id='energy',en='Energy',zh='能源',color='#ef8848'),
    dict(id='core_goods',en='Core goods',zh='核心商品',color='#b68ada'),
    dict(id='core_services',en='Core services',zh='核心服務',color='#e7c34a'),
]
MAJOR_LINES = [4,5,6,7,9,10,11,12,15,16,17,18,19,20,21,22]
MAJOR_DETAIL = dict(zip(MAJOR_LINES,[4,23,38,62,73,104,113,120,152,172,190,209,234,252,280,342]))

def hierarchy(prices, spending, history_months, max_level=4):
    rows = prices['rows']
    tree, stack = {}, []
    for line, row in rows.items():
        if line > 368:
            break  # Addenda overlap the consumption tree.
        level = 0 if line == 1 else row['indent']//2 + 1
        while stack and tree[stack[-1]]['level'] >= level:
            stack.pop()
        parent = stack[-1] if stack else None
        if line != 1 and parent is None:
            raise ValueError(f'Orphan BEA row {line}')
        relative_sign = -1 if row['name'].startswith('Less:') else 1
        sign = relative_sign * (tree[parent]['sign'] if parent else 1)
        tree[line] = dict(id=str(line),line=line,en=row['name'],zh=ZH.get(line,row['name']),
                          level=level,parent=str(parent) if parent else None,
                          sign=sign,children=[],code=row['code'])
        if parent is not None:
            tree[parent]['children'].append(line)
        stack.append(line)

    def usable(line):
        p, v = rows[line]['values'], spending['rows'][line]['values']
        return all(p.get(m) is not None and p[m] > 0 and v.get(m) is not None for m in history_months)

    def select(line):
        node = tree[line]
        children = node['children']
        # Utilities cross the energy/core boundary. Always split water/sanitation
        # from electricity/gas even when the requested depth stops at utilities.
        if children and (node['level'] < max_level or line in (152,165) or not usable(line)):
            try:
                chosen = [j for child in children for j in select(child)]
                # Reject duplicated subtrees or broken BEA indentation.
                for m in history_months:
                    total = sum(tree[j]['sign']*spending['rows'][j]['values'][m] for j in chosen)
                    parent = tree[line]['sign']*spending['rows'][line]['values'][m]
                    if abs(total-parent) > 2+0.6*len(chosen):
                        raise ValueError(f'Nonadditive children at line {line}, {m}')
                return chosen
            except ValueError:
                if line in (152,165) or not usable(line):
                    raise
        if not usable(line):
            raise ValueError(f'No complete price history or usable child partition: line {line}')
        return [line]

    leaves = select(1)
    if leaves == [1]:
        raise ValueError('BEA hierarchy failed; refusing headline-only decomposition')
    active = set(leaves)
    for line in leaves:
        parent = tree[line]['parent']
        while parent:
            active.add(int(parent))
            parent = tree[int(parent)]['parent']
    for line in active:
        node = tree[line]
        node['leaf'] = line in leaves
        ancestors, cursor = [], line
        while cursor:
            ancestors.append(cursor)
            cursor = int(tree[cursor]['parent']) if tree[cursor]['parent'] else None
        node['group'] = ('food' if 73 in ancestors else 'energy' if 113 in ancestors or 169 in ancestors
                         else 'core_goods' if 2 in ancestors else 'core_services')
    return [tree[i] for i in sorted(active)], leaves
