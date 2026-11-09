import sys,json,csv,re,statistics,hashlib
from pathlib import Path
import openpyxl
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root))
from pce.source import read_table
w=openpyxl.load_workbook(root/'cache/nipa.xlsx',read_only=True,data_only=True)
def table(sheet):
 rows=list(w[sheet].values);h=next(r for r in rows if r[0]=='Line'); periods=[(i,str(v)) for i,v in enumerate(h) if re.fullmatch(r'\d{4}(Q[1-4])?',str(v))]
 return {int(r[0]):{'name':r[1], 'values':{p:r[i] if isinstance(r[i],(int,float)) else None for i,p in periods}} for r in rows if str(r[0]).isdigit()},[p for _,p in periods]
allrows=[]
for freq,period in [('Q','2026Q2'),('A','2025')]:
 off,periods=table('T20408-'+freq);pr,_=table('T20404-'+freq);ex,_=table('T20405-'+freq)
 previous=periods[periods.index(period)-1]
 total_ratio=pr[1]['values'][period]/pr[1]['values'][previous]
 factor=(total_ratio**4-1)/(total_ratio-1) if freq=='Q' else 1
 for line,o in off.items():
  if line==1:continue
  p,p0=pr[line]['values'][period],pr[line]['values'][previous];v=ex[line]['values'][period];total=ex[1]['values'][period];official=o['values'][period]
  if None in (p,p0,v,total,official):continue
  sign=-1 if 'Less:' in o['name'] else 1
  growth=(p/p0-1)*100;weight=sign*v/total*100;est=growth*weight/100*factor;bea=official*(-1 if line==113 else 1) # NPISH receipts are displayed before subtraction; nonresident spending is already signed.
  allrows.append(dict(frequency=freq,period=period,line=line,name=o['name'].strip(),own_change_pct=growth,weight_pct=weight,annualization_factor=factor,estimate_pp=est,bea_pp=bea,difference_pp=est-bea))
 print(freq,period,'headline official',off[1]['values'][period],'precise from published indexes',100*(total_ratio**(4 if freq=='Q' else 1)-1),'factor',factor)
 subset=[r for r in allrows if r['frequency']==freq]
 print('count',len(subset),'rounding matches',sum(round(r['estimate_pp'],2)==round(r['bea_pp'],2) for r in subset),'MAE',statistics.mean(abs(r['difference_pp']) for r in subset),'max',max(subset,key=lambda r:abs(r['difference_pp'])))
 for line in [3,4,8,13,19,25,48,111]:
  print(next(r for r in subset if r['line']==line))
# Monthly exact same vintage and stored web series.
j=json.load(open(root/'web/data/pce_data.json'));u=openpyxl.load_workbook(root/'cache/underlying.xlsx',read_only=True,data_only=True);prices=read_table(u,'U20404-M');off=read_table(w,'T20808-M')
norm=lambda s:re.sub(r'\\\d+\\','',s).strip()
name_map={norm(v['name']):str(k) for k,v in prices['rows'].items()}
mrows=[]
for line,o in off['rows'].items():
 if line==1 or norm(o['name']) not in name_map:continue
 id=name_map[norm(o['name'])]
 if id not in j['series']:continue
 for month in j['meta']['months']:
  if month<'2025-09':continue
  idx=j['meta']['months'].index(month);est=j['series'][id]['mom'][idx];bea=o['values'].get(month)
  if est is None or bea is None:continue
  if 'Less:' in o['name']:bea=-bea
  mrows.append(dict(month=month,line=line,item_id=id,name=norm(o['name']),estimate_pp=est,bea_pp=bea,difference_pp=est-bea))
print('monthly total',len(mrows),'rounding matches',sum(round(r['estimate_pp'],2)==round(r['bea_pp'],2) for r in mrows),'MAE',statistics.mean(abs(r['difference_pp']) for r in mrows),'max',max(mrows,key=lambda r:abs(r['difference_pp'])))
for r in mrows:
 if r['month']=='2026-08' and r['line'] in [3,4,5,6,7,8,14,22]:print('MONTH',r)
for file,rows in [('bea-248-comparison.csv',allrows),('bea-288-monthly-comparison.csv',mrows)]:
 with open(root/'research'/file,'w',newline='',encoding='utf-8-sig') as f:
  wr=csv.DictWriter(f,fieldnames=list(rows[0]));wr.writeheader();wr.writerows(rows)
print('source fingerprints match',[s['sha256']==hashlib.sha256((root/'cache'/(s['kind']+'.xlsx')).read_bytes()).hexdigest() for s in j['meta']['sources']])
