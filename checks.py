#!/usr/bin/env python3
"""Release gate: schema, additivity, source coverage, BEA benchmarks."""
import json
import math
import csv
from pce.source import ROOT

def close(a,b,tolerance=1e-9):
    assert a is not None and b is not None and abs(a-b)<=tolerance,(a,b,tolerance)

def main():
    d=json.loads((ROOT/'web/data/pce_data.json').read_text(encoding='utf-8'))
    months=d['meta']['months'];n=len(months)
    assert months==sorted(set(months)) and months[-1]==d['meta']['latest']
    assert all((int(b[:4])*12+int(b[5:]))-(int(a[:4])*12+int(a[5:]))==1 for a,b in zip(months,months[1:]))
    assert all(len(v)==n for v in d['headline'].values())
    for bk in d['breakdowns'].values():
        for tf in ['mom','yoy']:
            assert len(bk['residual'][tf])==n
            for c in bk['components']:assert len(c[tf])==n and all(v is not None and math.isfinite(v) for v in c[tf])
            for i in range(n):
                close(sum(c[tf][i] for c in bk['components'])+bk['residual'][tf][i],d['headline'][tf][i])
        assert max(abs(v) for v in bk['residual']['mom'])<.1
        assert max(abs(v) for v in bk['residual']['yoy'])<.5
    items={i['id']:i for i in d['items']};leaves=[i for i in d['items'] if i['leaf']]
    assert len(items)==len(d['items']) and len(leaves)==d['meta']['diagnostics']['leaf_count']
    for node in d['items']:
        s=d['series'][node['id']]
        assert all(len(v)==n for v in s.values())
        assert node['parent'] is None or node['parent'] in items
        if not node['leaf']:
            children=[x for x in d['items'] if x['parent']==node['id']]
            assert children
            for key in ['mom','yoy','weight']:
                for i in range(n):close(s[key][i],sum(d['series'][c['id']][key][i] for c in children))
    for i in range(n):
        close(sum(d['series'][l['id']]['weight'][i] for l in leaves),100,.0003)
        for tf in ['mom','yoy']:
            close(sum(d['series'][l['id']][tf][i] for l in leaves),sum(c[tf][i] for c in d['breakdowns']['granular']['components']))
    assert any(d['series'][l['id']]['weight'][-1]<0 for l in leaves),'Deduction rows lost'
    diag=d['meta']['diagnostics'];assert diag['price_spending_main_table_match'] and diag['group_spending_match']
    assert diag['max_leaf_vs_official_major_mom_pp']<.03
    assert len(d['meta']['sources'])==2 and all(len(s['sha256'])==64 for s in d['meta']['sources'])
    for tf in ['mom','yoy']:
        with (ROOT/f'web/data/pce_detail_{tf}.csv').open(encoding='utf-8-sig',newline='') as f:
            rows=list(csv.DictReader(f))
        assert len(rows)==n*len(leaves)
        assert len({(r['month'],r['id']) for r in rows})==len(rows)
        for r in rows:
            i=months.index(r['month'])
            close(float(r['contribution_pp']),d['series'][r['id']][tf][i],0)
            close(float(r['signed_expenditure_share_pct']),d['series'][r['id']]['weight'][i],0)
    # Cross-check generated official rows against raw BEA values when available.
    if (ROOT/'cache/nipa.xlsx').exists():
        import openpyxl
        from pce.source import read_table
        w=openpyxl.load_workbook(ROOT/'cache/nipa.xlsx',read_only=True,data_only=True)
        off=read_table(w,'T20808-M');prices=read_table(w,'T20804-M');w.close()
        assert off['published']==d['meta']['published'],'Cached vintage differs; rebuild data'
        for c in d['breakdowns']['major16']['components']:
            line=int(c['id'][1:])
            for i,m in enumerate(months):close(c['mom'][i],off['rows'][line]['values'][m],0)
        # Independent direct telescoping of the complete headline series.
        p=prices['rows'][1]['values'];full=prices['months']
        for i,m in enumerate(months):
            k=full.index(m);base=full[k-12]
            close(d['headline']['yoy'][i],100*(p[m]/p[base]-1))
            c=d['breakdowns']['major16']['components'][0];line=int(c['id'][1:])
            independently_linked=sum(off['rows'][line]['values'][full[j]]*p[full[j-1]]/p[base] for j in range(k-11,k+1))
            close(c['yoy'][i],independently_linked)
        print('Raw BEA benchmarks: official contributions, price changes and chain linking passed.')
    else:print('Raw cache absent; checked delivered data and recorded source diagnostics.')
    print(f'PASS: {n} months, {len(leaves)} leaves, all 4 breakdowns; no double counting or hidden residual.')

if __name__=='__main__':main()
