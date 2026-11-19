import {useId,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Card,CardContent} from '../../components/ui/card'
import {Badge} from '../../components/ui/badge'
import type {BreadthData} from './breadth'
const colors=['#199b7e','#926dde','#f39c12']
const keys=['breadthYoy','breadth3m','breadth6m']
const fmt=(value:number|null)=>value===null?'—':`${value.toFixed(1)}%`
function BreadthTrend({data,basis}:{data:BreadthData;basis:'equal'|'weighted'}){
 const {t}=useTranslation()
 const id=useId()
 const [hover,setHover]=useState<number|null>(null)
 const W=900,H=280,L=45,R=18,T=14,B=35,width=W-L-R,height=H-T-B,n=data.months.length
 const x=(i:number)=>L+(n===1?.5:i/(n-1))*width,y=(v:number)=>T+(100-v)/100*height
 const path=(points:BreadthData['horizons'][number]['points'])=>{let open=false;return points.map((p,i)=>{const v=p[basis];if(v===null){open=false;return ''}const s=`${open?'L':'M'}${x(i)},${y(v)}`;open=true;return s}).join(' ')}
 const selected=hover??n-1
 return <div className="breadth-trend"><h3 id={id}>{t(basis==='equal'?'breadthEqual':'breadthWeighted')}</h3><div className="breadth-legend">{keys.map((key,i)=><span key={key}><i style={{background:colors[i]}}/>{t(key)}</span>)}</div><svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={id} onPointerLeave={()=>setHover(null)}>
 {[0,25,50,75,100].map(v=><g key={v}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e4eaec" strokeDasharray="3 4"/><text x={L-8} y={y(v)+4} textAnchor="end" fill="#76838f" fontSize={12}>{v}%</text></g>)}
 {data.horizons.map((h,i)=><path key={h.lag} d={path(h.points)} fill="none" stroke={colors[i]} strokeWidth={2.2} pointerEvents="none"/>)}
 {data.months.map((m,i)=><g key={m}><rect x={n===1?L:Math.max(L,x(i)-width/Math.max(1,n-1)/2)} y={T} width={n===1?width:Math.min(width/Math.max(1,n-1),W-R-Math.max(L,x(i)-width/Math.max(1,n-1)/2))} height={height} fill="transparent" tabIndex={0} role="img" aria-label={`${m} · ${data.horizons.map((h,k)=>`${t(keys[k])} ${fmt(h.points[i][basis])}`).join(' · ')}`} onPointerEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)}><title>{`${m} · ${data.horizons.map((h,k)=>`${t(keys[k])}: ${fmt(h.points[i][basis])}`).join(' · ')}`}</title></rect>{(i===0||i===n-1||i%Math.max(1,Math.ceil(n/5))===0)&&<text x={x(i)} y={H-10} textAnchor={i===0?'start':i===n-1?'end':'middle'} fill="#76838f" fontSize={12}>{m}</text>}</g>)}
 {hover!==null&&<line x1={x(hover)} x2={x(hover)} y1={T} y2={H-B} stroke="#76838f" strokeDasharray="3 3" pointerEvents="none"/>}
 </svg><div className="breadth-readout"><strong>{data.months[selected]}</strong>{data.horizons.map((h,i)=><span key={h.lag} style={{color:colors[i]}}>{t(keys[i])} <b>{fmt(h.points[selected]?.[basis]??null)}</b></span>)}</div></div>
}
export function BreadthPanel({data}:{data:BreadthData}){
 const {t}=useTranslation()
 return <Card className="breadth-card"><CardContent><section id="pce-breadth" aria-labelledby="breadth-heading"><div className="panel-heading"><div><h2 id="breadth-heading">{t('breadthTitle')}</h2><p>{t('breadthSubtitle')}</p></div><Badge variant="outline">{data.months.at(-1)}</Badge></div><div className="breadth-metrics">{data.horizons.map((h,i)=>{const p=h.points.at(-1)!;return <div className="breadth-metric" key={h.lag}><h3><i style={{background:colors[i]}}/>{t(keys[i])}</h3><div><span>{t('breadthEqual')}</span><strong>{fmt(p.equal)}</strong></div><p>{t('breadthCount',{above:p.above,valid:p.valid,total:data.total})}</p><div><span>{t('breadthWeighted')}</span><strong>{fmt(p.weighted)}</strong></div><p>{t('breadthWeightedCount',{above:p.weightedAbove,valid:p.weightedValid})}</p></div>})}</div><div className="breadth-trends"><BreadthTrend data={data} basis="equal"/><BreadthTrend data={data} basis="weighted"/></div><div className="breadth-method"><p>{t('breadthFormula')}</p><p>{t('breadthEqualNote')}</p><p>{t('breadthWeightedNote')}</p><p>{t('breadthScope')}</p></div></section></CardContent></Card>
}
