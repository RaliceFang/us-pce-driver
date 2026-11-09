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
ZH.update({7: '國產新轎車',
 8: '進口新轎車',
 10: '國產新輕型卡車',
 11: '進口新輕型卡車',
 14: '中古轎車淨交易',
 15: '中古轎車交易價差',
 16: '員工費用補償',
 18: '中古卡車淨交易',
 19: '中古卡車交易價差',
 21: '輪胎',
 22: '配件與零組件',
 25: '家具',
 26: '時鐘、燈具、照明設備與其他家飾',
 27: '地毯與其他地板鋪面',
 28: '窗簾與窗飾',
 30: '大型家用電器',
 31: '小型家用電器',
 33: '餐盤與餐具',
 34: '非電動炊具與餐具',
 36: '工具、五金與耗材',
 37: '戶外設備與用品',
 41: '電視',
 42: '其他視訊設備',
 43: '音響設備',
 44: '錄音錄影媒體',
 45: '音樂光碟、錄音帶、黑膠與永久數位下載',
 46: '影音光碟、錄影帶與永久數位下載',
 49: '個人電腦、平板與周邊設備',
 50: '電腦軟體與配件',
 51: '計算機、打字機與其他資訊處理設備',
 54: '機車',
 55: '自行車與配件',
 56: '休閒船艇、飛機與其他休閒交通工具',
 57: '休閒船艇',
 58: '休閒飛機',
 59: '其他休閒交通工具',
 64: '珠寶',
 65: '手錶',
 67: '治療用醫療設備',
 68: '矯正眼鏡與隱形眼鏡',
 76: '穀物與烘焙食品',
 77: '穀物',
 78: '烘焙食品',
 79: '肉類與家禽',
 80: '牛肉與小牛肉',
 81: '豬肉',
 82: '其他肉類',
 83: '家禽',
 84: '魚類與海鮮',
 85: '牛奶、乳製品與蛋類',
 86: '鮮奶',
 87: '加工乳製品',
 88: '蛋類',
 89: '油脂',
 90: '新鮮水果與蔬菜',
 91: '水果',
 92: '蔬菜',
 93: '加工水果與蔬菜',
 94: '糖與甜食',
 95: '其他未分類食品',
 97: '咖啡、茶與其他飲料原料',
 98: '礦泉水、汽水與蔬菜汁',
 100: '烈酒',
 101: '葡萄酒',
 102: '啤酒',
 106: '女性與女童服裝',
 107: '男性與男童服裝',
 108: '兒童與嬰幼兒服裝',
 110: '衣料',
 111: '軍人配發制式服裝',
 112: '鞋類與其他足部穿戴用品',
 115: '汽油與其他車用燃料',
 116: '潤滑油與油液',
 118: '燃油',
 119: '其他燃料',
 122: '藥品',
 123: '處方藥',
 124: '非處方藥',
 125: '其他醫療用品',
 127: '遊戲、玩具與嗜好用品',
 128: '寵物與相關用品',
 129: '花卉、種子與盆栽',
 130: '底片與攝影用品',
 132: '家用清潔用品',
 133: '家用紙製品',
 134: '家用紡織品',
 135: '縫紉用品',
 136: '其他家庭用品',
 138: '頭髮、牙齒、刮鬍與其他非電動個人護理用品',
 139: '化妝品、香水、沐浴與指甲護理用品',
 140: '個人護理電器',
 143: '報紙與期刊',
 144: '文具與其他印刷品',
 147: '政府雇員境外支出',
 148: '私部門雇員境外支出',
 155: '承租活動房屋',
 156: '承租固定住宅與房東提供的耐久設備',
 157: '承租固定住宅',
 158: '承租住宅房東提供的耐久設備',
 159: '承租住宅（含房東提供的耐久設備）',
 161: '自有活動房屋',
 162: '自有固定住宅',
 167: '供水與污水處理',
 168: '垃圾收集',
 174: '醫師服務',
 175: '牙醫服務',
 176: '輔助醫療服務',
 177: '居家醫療',
 178: '醫學檢驗',
 179: '其他專業醫療服務',
 180: '專科門診設施與醫療相關服務',
 181: '其他各類專業醫療服務',
 183: '醫院',
 184: '非營利醫院對家庭服務',
 185: '營利醫院',
 186: '公立醫院',
 187: '護理之家',
 188: '非營利護理之家對家庭服務',
 189: '營利與公立護理之家',
 192: '車輛保養與維修',
 193: '其他車輛服務',
 194: '車輛長期租賃',
 195: '轎車長期租賃',
 196: '卡車長期租賃',
 197: '車輛短期出租',
 198: '停車費與通行費',
 200: '陸路運輸',
 201: '鐵路運輸',
 202: '公路運輸',
 203: '城際巴士',
 204: '計程車與共乘服務',
 205: '市內大眾運輸',
 206: '其他公路運輸服務',
 207: '航空運輸',
 208: '水路運輸',
 211: '會員俱樂部與運動中心',
 212: '遊樂園、露營地與相關休閒服務',
 213: '特定觀賞娛樂入場費',
 214: '電影院',
 215: '現場表演（不含運動）',
 216: '觀賞性運動賽事',
 217: '博物館與圖書館',
 219: '有線、衛星與其他直播電視服務',
 220: '相片沖印',
 221: '攝影工作室',
 222: '影音、攝影與資訊設備維修及出租',
 223: '影音串流與租賃',
 224: '影片串流與租賃',
 225: '音樂串流與廣播服務',
 227: '賭場博弈',
 228: '彩券',
 229: '彩池制博弈淨收入',
 231: '獸醫與其他寵物服務',
 232: '套裝旅遊',
 233: '休閒交通工具與運動設備保養維修',
 236: '外購餐點與飲料',
 237: '餐點與非酒精飲料',
 238: '學校餐點',
 239: '中小學午餐',
 240: '高等教育學校午餐',
 241: '其他外購餐點',
 242: '速食與簡餐店餐點',
 243: '其他餐飲場所餐點',
 244: '酒吧餐點',
 245: '餐飲消費中的酒精飲料',
 246: '雇主提供員工餐食（含軍人）',
 247: '提供平民的餐食',
 248: '提供軍人的餐食',
 250: '旅館與汽車旅館',
 251: '學校住宿',
 254: '無償提供的金融服務',
 255: '商業銀行',
 256: '其他存款機構與受監管投資公司',
 257: '退休基金',
 258: '金融服務費與佣金',
 259: '金融服務收費與手續費',
 260: '證券佣金',
 261: '直接佣金',
 262: '交易所上市股票',
 263: '其他直接佣金',
 264: '間接佣金',
 265: '櫃檯買賣股票',
 266: '其他設算佣金',
 267: '共同基金銷售費',
 268: '投資組合管理與投資顧問服務',
 269: '信託、受託與保管業務',
 271: '人壽保險',
 272: '家庭保險淨支出',
 273: '家庭保險保費與保費補充',
 274: '減：家庭保險正常損失',
 275: '醫療保險淨支出',
 276: '醫療與住院保險',
 277: '所得損失保險',
 278: '勞工補償保險',
 279: '車輛與其他運輸保險淨支出',
 282: '電信服務',
 283: '市內固定電話服務',
 284: '長途固定電話服務',
 285: '行動電話服務',
 286: '郵政與遞送服務',
 287: '一類郵件服務',
 288: '其他遞送服務',
 289: '網際網路連線',
 291: '高等教育',
 292: '營利與公立高等教育',
 293: '非營利私立高等教育對家庭服務',
 294: '托兒所、幼兒園與中小學',
 295: '中小學',
 296: '日間照顧與托兒所',
 297: '商業與職業學校',
 299: '法律服務',
 300: '會計與其他商業服務',
 301: '報稅與相關服務',
 302: '就業仲介服務',
 303: '其他個人商業服務',
 304: '工會會費',
 305: '專業協會會費',
 306: '殯葬服務',
 308: '個人護理服務',
 309: '美髮沙龍與個人美容機構',
 310: '其他個人護理服務',
 311: '服裝與鞋類服務',
 312: '洗衣與乾洗服務',
 313: '衣物修補、出租與修改',
 314: '鞋類修理與租用',
 316: '兒童照顧',
 317: '社會救助',
 318: '老人之家',
 319: '住宿型心理健康與成癮治療',
 320: '個人與家庭服務',
 321: '職業復健服務',
 322: '社區食物、住宅、緊急與其他救濟服務',
 323: '其他未分類社會救助',
 324: '社會倡議、公民與社會組織',
 325: '宗教組織對家庭服務',
 326: '基金會、補助與捐贈機構對家庭服務',
 328: '家事服務',
 329: '搬家、倉儲與貨運服務',
 330: '家具、家飾與地板鋪面維修',
 331: '家用電器維修',
 332: '其他家庭服務',
 335: '境外旅遊客運票價',
 336: '美國居民境外旅遊',
 337: '美國學生境外支出',
 339: '外國旅客在美國旅遊',
 340: '外國人在美國醫療支出',
 341: '外國學生在美國支出',
 345: '門診服務總產出',
 346: '非營利醫院總產出',
 347: '非營利護理之家總產出',
 358: '對家庭門診服務收入',
 359: '對家庭非營利醫院服務收入',
 360: '對家庭非營利護理之家服務收入'})

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


def full_hierarchy(prices):
    """Keep every published product row, including rows with unavailable prices.

    Addenda start at 369 and overlap the product hierarchy, so exclude them.
    Published rows must never be dropped merely for incomplete price history.
    """
    tree, stack = {}, []
    for line, row in prices['rows'].items():
        if line > 368:
            break
        level = 0 if line == 1 else row['indent']//2 + 1
        while stack and tree[stack[-1]]['level'] >= level:
            stack.pop()
        parent = stack[-1] if stack else None
        if line != 1 and parent is None:
            raise ValueError(f'Orphan BEA row {line}')
        sign = (-1 if row['name'].startswith('Less:') else 1) * (tree[parent]['sign'] if parent else 1)
        tree[line] = dict(id=str(line), line=line, en=row['name'], zh=ZH.get(line,row['name']),
                          level=level, parent=str(parent) if parent else None,
                          sign=sign, children=[], code=row['code'], group='products')
        if parent is not None:
            tree[parent]['children'].append(line)
        stack.append(line)
    for node in tree.values():
        node['leaf'] = not node['children']
    tree[151]['en'] = 'Household consumption expenditures (for services)'
    tree[151]['zh'] = '家庭服務'
    tree[342]['zh'] = '非營利機構服務'
    return list(tree.values())
