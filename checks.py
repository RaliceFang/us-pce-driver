#!/usr/bin/env python3
"""Release gate for complete BEA rows, official observations and linked contributions."""
import csv
import json
from pce.source import ROOT, read_table
from pce.math import rate, linked_yoy
from pce.chain import OFFICIAL_LINES

def close(a,b,tolerance=1e-9):
    if a is None or b is None:
        assert a is None and b is None,(a,b)
    else:
        assert abs(a-b)<=tolerance,(a,b,tolerance)

def main():
    d=json.loads((ROOT/'web/data/pce_data.json').read_text(encoding='utf-8'))
    months=d['meta']['months'];n=len(months)
    assert months==sorted(set(months)) and months[-1]==d['meta']['latest']
    assert all((int(b[:4])*12+int(b[5:]))-(int(a[:4])*12+int(a[5:]))==1 for a,b in zip(months,months[1:]))
    assert all(len(v)==n for v in d['headline'].values())
    items={i['id']:i for i in d['items']}
    assert set(items)=={str(i) for i in range(1,369)}
    assert d['meta']['top_level_ids']==['3','72','151','342']
    assert items['151']['zh']=='家庭服務' and items['342']['zh']=='非營利機構服務'
    assert all(i['zh']!=i['en'] for i in items.values()),'Missing Traditional Chinese product labels'
    assert items['3']['children']==[4,23,38,62]
    assert items['4']['children']==[5,12,20]
    for node in items.values():
        s=d['series'][node['id']]
        assert all(len(v)==n for v in s.values())
        assert node['parent'] is None or node['parent'] in items
        assert node['leaf']==(not node['children'])
        for child in node['children']:assert items[str(child)]['parent']==node['id']
    assert d['series']['356']['weight'][-1]<0 and d['series']['359']['weight'][-1]<0
    for tf in ['mom','yoy']:
        with (ROOT/f'web/data/pce_detail_{tf}.csv').open(encoding='utf-8-sig',newline='') as f:
            rows=list(csv.DictReader(f))
        assert len(rows)==n*len(items)
        assert len({(r['month'],r['id']) for r in rows})==len(rows)
        for r in rows:
            i=months.index(r['month'])
            close(float(r['contribution_pp']) if r['contribution_pp'] else None,d['series'][r['id']][tf][i],0)
            close(float(r['signed_expenditure_share_pct']) if r['signed_expenditure_share_pct'] else None,d['series'][r['id']]['weight'][i],0)
            assert r['method'] in ['official_monthly','linked_official_monthly','fisher_reconstruction','linked_fisher_reconstruction']
    # Independently validate all products against the source workbook, without treating current expenditure shares as Fisher weights.
    if (ROOT/'cache/underlying.xlsx').exists():
        import openpyxl
        w=openpyxl.load_workbook(ROOT/'cache/underlying.xlsx',read_only=True,data_only=True)
        prices=read_table(w,'U20404-M');spending=read_table(w,'U20405-M');w.close()
        assert prices['published']==d['meta']['published']
        for node in items.values():
            line=int(node['id']);s=d['series'][node['id']]
            for i,m in enumerate(months):
                k=prices['months'].index(m)
                value=spending['rows'][line]['values'].get(m)
                expected=None if value is None else 100*node['sign']*value/spending['rows'][1]['values'][m]
                close(s['weight'][i],expected)
                for tf,growth,lag in [('mom','gm',1),('yoy','gy',12)]:
                    g=rate(prices['rows'][line]['values'].get(m),prices['rows'][line]['values'].get(prices['months'][k-lag]))
                    close(s[growth][i],g)

        print('Raw BEA price and signed spending-share benchmarks passed.')
        w=openpyxl.load_workbook(ROOT/'cache/nipa.xlsx',read_only=True,data_only=True)
        off=read_table(w,'T20808-M');w.close()
        for line,id in OFFICIAL_LINES.items():
            for i,m in enumerate(months):
                v=off['rows'][line]['values'][m]
                close(d['series'][str(id)]['mom'][i],None if v is None else v*(-1 if line==24 else 1),0)
            expected=linked_yoy(off['months'],{m:(v*(-1 if line==24 else 1) if v is not None else None) for m,v in off['rows'][line]['values'].items()},prices['rows'][1]['values'])
            lookup=dict(zip(off['months'],expected))
            for i,m in enumerate(months):close(d['series'][str(id)]['yoy'][i],lookup[m])
        print(f'All {len(OFFICIAL_LINES)*n:,} official monthly observations and their linked YoY values match.')
    print(f'PASS: {n} months, {len(items)} published product rows; unavailable prices retained.')

if __name__=='__main__':main()
