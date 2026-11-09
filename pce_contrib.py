#!/usr/bin/env python3
"""BEA official monthly contributions with detailed two-period Fisher reconstruction."""
from __future__ import annotations
import argparse
import csv
import json
from datetime import datetime, timezone

import openpyxl

from pce.source import ROOT, URLS, download, fingerprint, read_table
from pce.math import rate, linked_yoy
from pce.chain import build_chain, reconstruct, OFFICIAL_LINES
from pce.catalog import GROUPS, MAJOR_LINES, MAJOR_DETAIL, ZH, full_hierarchy

def strict_sum(values):
    return None if any(v is None for v in values) else sum(values)

def component(id, en, zh, color, monthly, months, index):
    return dict(id=id,en=en,zh=zh,color=color,
                mom=[monthly.get(m) for m in months],yoy=linked_yoy(months,monthly,index))

def build(start='1990-01', offline=False, max_level=4):
    paths = {kind: download(kind,offline) for kind in URLS}
    books = {kind: openpyxl.load_workbook(path,read_only=True,data_only=True) for kind,path in paths.items()}
    try:
        prices = read_table(books['underlying'],'U20404-M')
        spending = read_table(books['underlying'],'U20405-M')
        official = read_table(books['nipa'],'T20808-M')
        main_prices = read_table(books['nipa'],'T20804-M')
        main_spending = read_table(books['nipa'],'T20805-M')
        quarter_prices=read_table(books['underlying'],'U20404-Q','Q')
        quarter_spending=read_table(books['underlying'],'U20405-Q','Q')
        quarter_official=read_table(books['nipa'],'T20408-Q','Q')
    finally:
        for book in books.values(): book.close()
    tables = [prices,spending,official,main_prices,main_spending]
    if len({t['published'] for t in tables}) != 1 or len({t['months'][-1] for t in tables}) != 1:
        raise ValueError('BEA workbook vintages differ; retry after both files are updated')
    all_months = prices['months']
    if spending['months'] != all_months or main_prices['months'] != all_months:
        raise ValueError('Price / spending month alignment differs')
    if start not in all_months or all_months.index(start) < 13:
        raise ValueError('--start must be an available month with 13 prior observations')
    first = all_months.index(start)
    calc_months = all_months[first-12:]
    history = all_months[first-13:]  # One more month for linked January's monthly contributions.
    pr, ex, off = prices['rows'], spending['rows'], official['rows']
    index, core = pr[1]['values'], pr[374]['values']
    months = all_months[first:]
    # Independent BEA tables; match by the published line map, not guessed codes.
    benchmark_count = 0
    for main_line, detail_line in {1:1,25:374,**MAJOR_DETAIL}.items():
        for m in months:
            if main_prices['rows'][main_line]['values'][m] != pr[detail_line]['values'][m]:
                raise ValueError(f'BEA price-table disagreement: {m}, main line {main_line}')
            if main_spending['rows'][main_line]['values'][m] != ex[detail_line]['values'][m]:
                raise ValueError(f'BEA expenditure-table disagreement: {m}, main line {main_line}')
            benchmark_count += 2
    headline = {tf:[] for tf in ('mom','yoy','core_mom','core_yoy')}
    for i,m in enumerate(calc_months):
        previous = calc_months[i-1] if i else None
        base = calc_months[i-12] if i>=12 else None
        for key, series, b in [('mom',index,previous),('yoy',index,base),
                               ('core_mom',core,previous),('core_yoy',core,base)]:
            headline[key].append(rate(series.get(m),series.get(b)))

    palette = ['#6f91df','#8db9ef','#aa82cf','#ca9ddc','#4c92e8','#5bafc1','#ef8848','#d1a672',
               '#e5c44e','#78b38a','#b7965d','#b2ca74','#e4a66c','#d37c8a','#789fa1','#92929a']
    def make(id,en,zh,color,values):
        return component(id,en,zh,color,values,calc_months,index)
    major = [make(f'm{line}',off[line]['name'],ZH[MAJOR_DETAIL[line]],palette[i],off[line]['values'])
             for i,line in enumerate(MAJOR_LINES)]
    def terms(mapping):
        return {m:strict_sum([off[line]['values'].get(m)*coefficient
                              if off[line]['values'].get(m) is not None else None
                              for line,coefficient in mapping.items()]) for m in calc_months}
    basic_terms = [{9:1},{27:1},{2:1,9:-1,11:-1},{13:1,27:-1,11:1}]
    basic = [make(g['id'],g['en'],g['zh'],g['color'],terms(t)) for g,t in zip(GROUPS,basic_terms)]
    six_defs = [('food','Food','食物','#4c92e8',{9:1}),
                ('energy_goods','Energy goods','能源商品','#ef8848',{11:1}),
                ('energy_services','Energy services','能源服務','#cf6046',{27:1,11:-1}),
                ('core_goods','Core goods','核心商品','#b68ada',{2:1,9:-1,11:-1}),
                ('housing','Housing','住宅','#e7c34a',{29:1}),
                ('other_core_services','Core services excluding housing','核心服務（不含住宅）','#8eb68b',{13:1,27:-1,11:1,29:-1})]
    six = [make(*d[:4],terms(d[4])) for d in six_defs]

    items = full_hierarchy(prices)
    leaves = [int(n['id']) for n in items if n['leaf']]
    series = {}
    for node in items:
        line = int(node['id'])
        weights, gm, gy = [], [], []
        for m in months:
            k = all_months.index(m)
            value, total = ex[line]['values'].get(m), ex[1]['values'].get(m)
            weights.append(None if value is None or not total else 100*node['sign']*value/total)
            gm.append(rate(pr[line]['values'].get(m), pr[line]['values'].get(all_months[k-1])))
            gy.append(rate(pr[line]['values'].get(m), pr[line]['values'].get(all_months[k-12])))
        series[node['id']] = dict(weight=weights, gm=gm, gy=gy,
            mom=[None if w is None or g is None else g*w/100 for w,g in zip(weights,gm)],
            yoy=[None if w is None or g is None else g*w/100 for w,g in zip(weights,gy)])
    chain,chain_diagnostics=build_chain(items,pr,ex,off,history,months,index)
    for id,values in chain.items():series[id].update(values)
    quarter_months=quarter_prices['months'][-2:]
    q_estimates,_=reconstruct(full_hierarchy(quarter_prices),quarter_prices['rows'],quarter_spending['rows'],quarter_months)
    q_ratio=quarter_prices['rows'][1]['values'][quarter_months[-1]]/quarter_prices['rows'][1]['values'][quarter_months[-2]]
    annualization_factor=sum(q_ratio**k for k in range(4))
    quarter_benchmark=[]
    for official_line,id in {3:3,4:4,8:23,13:38,19:62,25:72,36:113,48:151,111:342}.items():
        estimated=q_estimates[str(id)][-1]*annualization_factor
        official_value=quarter_official['rows'][official_line]['values'][quarter_months[-1]]
        quarter_benchmark.append(dict(id=str(id),official_line=official_line,estimated_pp=estimated,official_pp=official_value,difference_pp=estimated-official_value))
    chain_diagnostics['quarterly_table_248']=dict(period=quarter_months[-1],annualization_factor=annualization_factor,rows=quarter_benchmark,
        note='Fisher reconstruction before official quarterly annual-consistency adjustments; residuals are retained.')
    chain_inputs=dict(months=history,price={n['id']:[pr[int(n['id'])]['values'].get(m) for m in history] for n in items},
                      spending={n['id']:[n['sign']*ex[int(n['id'])]['values'][m] if ex[int(n['id'])]['values'].get(m) is not None else None for m in history] for n in items})
    # Retain legacy official downloads for compatibility; the interactive dashboard
    # exclusively uses the complete product tree and direct weighted rates.
    leaf_components = [dict(id=n['id'],en=n['en'],zh=n['zh'],color=palette[i%len(palette)],
        **{tf:[None]*12+series[n['id']][tf] for tf in ('mom','yoy')})
        for i,n in enumerate(items) if n['leaf']]
    breakdowns = {
        'basic4':dict(en='4 components',zh='四大類',method='official',components=basic),
        'detail6':dict(en='6 components',zh='六細項',method='official',components=six),
        'major16':dict(en='16 major products',zh='16 主要細項',method='official',components=major),
        'granular':dict(en='All BEA products',zh='完整 BEA 產品細項',method='bea_official_and_fisher',components=leaf_components),
    }
    for bk in breakdowns.values():
        bk['residual']={tf:[None if headline[tf][i] is None or (s:=strict_sum([c[tf][i] for c in bk['components']])) is None
                           else headline[tf][i]-s for i in range(len(calc_months))] for tf in ['mom','yoy']}
    # Trim twelve warm-up months consistently after chaining.
    headline={k:v[12:] for k,v in headline.items()}
    for bk in breakdowns.values():
        for c in bk['components']:
            c['mom']=c['mom'][12:]; c['yoy']=c['yoy'][12:]
        bk['residual']={tf:v[12:] for tf,v in bk['residual'].items()}
    gaps=[b for a,b in zip(all_months,all_months[1:]) if (int(b[:4])*12+int(b[5:]))-(int(a[:4])*12+int(a[5:]))!=1]
    if gaps: raise ValueError(f'Missing calendar months: {gaps}')
    diagnostics=dict(benchmark_observations=benchmark_count,
        price_spending_main_table_match=True, leaf_count=len(leaves), product_row_count=len(items),
        method='bea_official_and_fisher', weight_period='adjacent_months', chain=chain_diagnostics,
        top_level_ids=['3','72','151','342'],
        unavailable_price_rows_latest=[n['id'] for n in items if series[n['id']]['mom'][-1] is None])
    data=dict(meta=dict(latest=months[-1],months=months,published=prices['published'],
        generated_utc=datetime.now(timezone.utc).isoformat(),seasonal_adjustment='SA for both MoM and YoY',
        index_base='2017=100',expenditure_units='Millions of dollars, SAAR',max_level=None,
        method='bea_official_and_fisher',weight_period='adjacent_months',top_level_ids=['3','72','151','342'],
        groups=GROUPS,sources=[dict(kind=k,url=URLS[k],sha256=fingerprint(paths[k])) for k in URLS],
        diagnostics=diagnostics),headline=headline,breakdowns=breakdowns,items=items,series=series,chain_inputs=chain_inputs)
    return data

def write(data):
    output=ROOT/'web'/'data'; output.mkdir(parents=True,exist_ok=True)
    text=json.dumps(data,ensure_ascii=False,separators=(',',':'),allow_nan=False)
    (output/'pce_data.json').write_text(text,encoding='utf-8')
    (output/'pce_data.js').write_text('window.PCE_DATA='+text+';\n',encoding='utf-8')
    for name,bk in data['breakdowns'].items():
        for tf in ['mom','yoy']:
            with (output/f'pce_contrib_{name}_{tf}.csv').open('w',newline='',encoding='utf-8-sig') as f:
                writer=csv.writer(f); writer.writerow(['month','id','name','name_zh','contribution_pp','method'])
                for i,m in enumerate(data['meta']['months']):
                    for c in bk['components']: writer.writerow([m,c['id'],c['en'],c['zh'],c[tf][i],bk['method']])
                    writer.writerow([m,'residual','Residual','差額',bk['residual'][tf][i],bk['method']])
    for tf in ['mom','yoy']:
        with (output/f'pce_detail_{tf}.csv').open('w',newline='',encoding='utf-8-sig') as f:
            writer=csv.writer(f)
            writer.writerow(['month','id','name','name_zh','signed_expenditure_share_pct',
                             'own_price_change_pct','contribution_pp','method','leaf'])
            for i,m in enumerate(data['meta']['months']):
                for node in data['items']:
                    s=data['series'][node['id']]
                    writer.writerow([m,node['id'],node['en'],node['zh'],s['weight'][i],
                                     s['gm' if tf=='mom' else 'gy'][i],s[tf][i],
                                     ('official_monthly' if tf=='mom' else 'linked_official_monthly') if int(node['id']) in OFFICIAL_LINES.values() else ('fisher_reconstruction' if tf=='mom' else 'linked_fisher_reconstruction'),node['leaf']])
    (output/'validation.json').write_text(json.dumps(data['meta']['diagnostics'],indent=2),encoding='utf-8')
    html=(ROOT/'web'/'index.html')
    if html.exists():
        standalone=html.read_text(encoding='utf-8').replace('<script src="data/pce_data.js"></script>','<script>'+('window.PCE_ASSET_BASE="web/";window.PCE_DATA='+text+';').replace('</',r'<\/')+'</script>')
        standalone=standalone.replace('href="methodology.html"','href="web/methodology.html"').replace('href="data/','href="web/data/').replace('href="index.html"','href="pce_dashboard_standalone.html"')
        (ROOT/'pce_dashboard_standalone.html').write_text(standalone,encoding='utf-8')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--start',default='1990-01')
    parser.add_argument('--offline',action='store_true',help='Use the explicitly cached vintage')
    parser.add_argument('--max-level',type=int,default=4,help='Legacy option; full product hierarchy is always retained')
    args=parser.parse_args()
    data=build(args.start,args.offline,args.max_level)
    write(data)
    print(f"Updated {data['meta']['latest']}; {len(data['meta']['months'])} months, {data['meta']['diagnostics']['leaf_count']} leaves")
    print(json.dumps(data['meta']['diagnostics'],indent=2))

if __name__=='__main__': main()
