import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardData } from './snapshot.server'
const colors:Record<string,string>={food:'#57c7d4',energy:'#f39c12',core_goods:'#926dde',core_services:'#199b7e',residual:'#a3afb7'}
export function ContributionChart({data,onMonth}:{data:DashboardData;onMonth:(m:string)=>void}) {
  const {t}=useTranslation()
  const [hover,setHover]=useState<number|null>(null)
  const components=[...data.components.map(c=>({...c,color:colors[c.id]??c.color})),{id:'residual',name:t('residual'),color:colors.residual,values:data.residualHistory}]
  const W=1280,H=390,L=56,R=18,T=24,B=40,width=W-L-R,height=H-T-B,n=data.chartMonths.length
  let lo=0,hi=0
  for(let i=0;i<n;i++) { let pos=0,neg=0;for(const c of components){const v=c.values[i]??0;if(v>=0)pos+=v;else neg+=v}hi=Math.max(hi,pos,data.headlineHistory[i]??0,data.coreHistory[i]??0);lo=Math.min(lo,neg,data.headlineHistory[i]??0,data.coreHistory[i]??0) }
  const margin=Math.max(.06,(hi-lo)*.12);hi+=margin;lo-=margin
  const y=(v:number)=>T+(hi-v)/(hi-lo)*height,x=(i:number)=>L+(i+.5)*width/n,bw=Math.max(.7,width/n*.68)
  const path=(values:(number|null)[])=>{let open=false;return values.map((v,i)=>{if(v===null){open=false;return ''}const s=`${open?'L':'M'}${x(i)},${y(v)}`;open=true;return s}).join(' ')}
  return <><div className="chart-legend">{components.map(c=><span key={c.id}><i style={{background:c.color}}/>{c.name}</span>)}<span><b style={{color:'#263238'}}>━</b>{t('headline')}</span><span><b style={{color:'#57c7d4'}}>━</b>{t('core')}</span></div><div className="chart-scroll"><svg className="pce-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('chartTitle')} onPointerLeave={()=>setHover(null)}>
    {Array.from({length:6},(_,i)=>{const v=lo+(hi-lo)*i/5;return <g key={i}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e4eaec" strokeDasharray="3 5"/><text x={L-12} y={y(v)+4} textAnchor="end" fill="#76838f" fontSize={12}>{v.toFixed(1)}</text></g>})}
    <line x1={L} x2={W-R} y1={y(0)} y2={y(0)} stroke="#a3afb7"/>
    {data.chartMonths.map((m,i)=>{let p=0,q=0;return <g key={m}>{components.map(c=>{const v=c.values[i];if(v===null)return null;const a=v>=0?p:q,b=a+v;if(v>=0)p=b;else q=b;return <rect key={c.id} x={x(i)-bw/2} y={y(Math.max(a,b))} width={bw} height={Math.max(.1,Math.abs(y(a)-y(b)))} fill={c.color} opacity={hover===null||hover===i?1:.65}/>})}{(i===0||i===n-1||i%Math.max(1,Math.ceil(n/9))===0)&&<text x={x(i)} y={H-12} fill="#76838f" textAnchor="middle" fontSize={12}>{m}</text>}</g>})}
    <path d={path(data.headlineHistory)} fill="none" stroke="#263238" strokeWidth={2.2}/><path d={path(data.coreHistory)} fill="none" stroke="#57c7d4" strokeWidth={2} strokeDasharray="6 3"/>
    {hover!==null&&<line x1={x(hover)} x2={x(hover)} y1={T} y2={H-B} stroke="#526069" strokeDasharray="3 3"/>}
    {data.chartMonths.map((m,i)=><rect key={`hit${m}`} x={L+i*width/n} y={T} width={width/n} height={height} fill="transparent" tabIndex={0} role="button" aria-label={`${m} ${t('headline')} ${(data.headlineHistory[i]??0).toFixed(3)}%`} onPointerEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onClick={()=>onMonth(m)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onMonth(m)}}}><title>{`${m} · ${t('headline')}: ${(data.headlineHistory[i]??0).toFixed(3)}%`}</title></rect>)}
    <text x={L} y={14} fill="#76838f" fontSize={11}>pp / %</text>
  </svg></div><div className="chart-readout" aria-live="polite">{hover===null?<span>{t('chartHint')}</span>:<><strong>{data.chartMonths[hover]}</strong>{components.map(c=><span key={c.id}><i style={{background:c.color}}/>{c.name} <b>{c.values[hover]?.toFixed(3)??'—'} pp</b></span>)}<span>{t('headline')} <b>{data.headlineHistory[hover]?.toFixed(2)}%</b></span></>}</div></>
}
