import {useId,useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Card,CardContent} from '../../components/ui/card'
import {Badge} from '../../components/ui/badge'
import {Button} from '../../components/ui/button'
import {NativeSelect,NativeSelectOption} from '../../components/ui/native-select'
import {ranges,type Settings} from './catalog'
import type {BreadthData} from './breadth'
const colors=['#199b7e','#926dde','#f39c12']
const keys=['breadthYoy','breadth3m','breadth6m']
const fmt=(value:number|null)=>value===null?'—':`${value.toFixed(1)}%`
type Zoom={start:number;end:number;lo:number;hi:number}
type Point={x:number;y:number}
function BreadthTrend({data,basis,visible,onToggle}:{data:BreadthData;basis:'equal'|'weighted';visible:boolean[];onToggle:(i:number)=>void}){
 const {t}=useTranslation()
 const id=useId(),clipId=useId()
 const [hover,setHover]=useState<number|null>(null)
 const [zoom,setZoom]=useState<Zoom|null>(null)
 const [drag,setDrag]=useState<{from:Point;to:Point}|null>(null)
 const first=zoom?.start??0,last=zoom?.end??data.months.length-1
 const months=data.months.slice(first,last+1)
 const horizons=data.horizons.map(h=>({...h,points:h.points.slice(first,last+1)}))
 const W=900,H=280,L=45,R=18,T=14,B=35,width=W-L-R,height=H-T-B,n=months.length
 const lo=zoom?.lo??0,hi=zoom?.hi??100
 const x=(i:number)=>L+(n===1?.5:i/(n-1))*width,y=(v:number)=>T+(hi-v)/(hi-lo)*height
 const point=(e:React.PointerEvent<SVGSVGElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:Math.max(L,Math.min(W-R,(e.clientX-r.left)*W/r.width)),y:Math.max(T,Math.min(H-B,(e.clientY-r.top)*H/r.height))}}
 const path=(points:BreadthData['horizons'][number]['points'])=>{let open=false;return points.map((p,i)=>{const v=p[basis];if(v===null){open=false;return ''}const s=`${open?'L':'M'}${x(i)},${y(v)}`;open=true;return s}).join(' ')}
 const selected=hover??n-1
 return <div className="breadth-trend"><div className="breadth-trend-heading"><h3 id={id}>{t(basis==='equal'?'breadthEqual':'breadthWeighted')}</h3><Button variant="outline" size="sm" disabled={!zoom} onClick={()=>{setZoom(null);setHover(null)}}>Reset Zoom</Button></div><div className="breadth-legend">{keys.map((key,i)=><button type="button" key={key} aria-pressed={visible[i]} onClick={()=>onToggle(i)} className={visible[i]?'':'breadth-hidden'}><i style={{background:colors[i]}}/>{t(key)}</button>)}</div><svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={id} style={{touchAction:'pan-y',userSelect:'none'}} onPointerLeave={()=>{if(!drag)setHover(null)}} onPointerDown={e=>{if(e.button!==0||e.pointerType==='touch')return;const p=point(e);setDrag({from:p,to:p})}} onPointerMove={e=>{if(!drag)return;const p=point(e);if(Math.abs(p.x-drag.from.x)>5||Math.abs(p.y-drag.from.y)>5)e.currentTarget.setPointerCapture(e.pointerId);setDrag({...drag,to:p})}} onPointerUp={e=>{if(!drag)return;const p=point(e);if(Math.abs(p.x-drag.from.x)>8){const a=(Math.min(p.x,drag.from.x)-L)/width,b=(Math.max(p.x,drag.from.x)-L)/width;const start=Math.max(0,Math.min(n-1,Math.floor(a*(n-1)))),end=Math.max(start,Math.min(n-1,Math.ceil(b*(n-1))));const vertical=Math.abs(p.y-drag.from.y)>8;setZoom({start:first+start,end:first+end,lo:vertical?hi-(Math.max(p.y,drag.from.y)-T)/height*(hi-lo):lo,hi:vertical?hi-(Math.min(p.y,drag.from.y)-T)/height*(hi-lo):hi});setHover(null)}setDrag(null)}} onPointerCancel={()=>setDrag(null)}>
 <defs><clipPath id={clipId}><rect x={L} y={T} width={width} height={height}/></clipPath></defs>
 {Array.from({length:5},(_,i)=>lo+(hi-lo)*i/4).map(v=><g key={v}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e4eaec" strokeDasharray="3 4"/><text x={L-8} y={y(v)+4} textAnchor="end" fill="#76838f" fontSize={12}>{Number(v.toFixed(1))}%</text></g>)}
 {horizons.map((h,i)=>visible[i]&&<path key={h.lag} data-breadth-line={h.lag} clipPath={`url(#${clipId})`} d={path(h.points)} fill="none" stroke={colors[i]} strokeWidth={2.2} pointerEvents="none"/>)}
 {months.map((m,i)=><g key={m}><rect x={n===1?L:Math.max(L,x(i)-width/Math.max(1,n-1)/2)} y={T} width={n===1?width:Math.min(width/Math.max(1,n-1),W-R-Math.max(L,x(i)-width/Math.max(1,n-1)/2))} height={height} fill="transparent" tabIndex={0} role="img" aria-label={`${m} · ${horizons.filter((_,k)=>visible[k]).map(h=>`${t(keys[data.horizons.findIndex(v=>v.lag===h.lag)])} ${fmt(h.points[i][basis])}`).join(' · ')}`} onPointerEnter={()=>{if(!drag)setHover(i)}} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)}><title>{`${m} · ${horizons.map((h,k)=>visible[k]?`${t(keys[k])}: ${fmt(h.points[i][basis])}`:'').filter(Boolean).join(' · ')}`}</title></rect>{(i===0||i===n-1||i%Math.max(1,Math.ceil(n/5))===0)&&<text x={x(i)} y={H-10} textAnchor={i===0?'start':i===n-1?'end':'middle'} fill="#76838f" fontSize={12}>{m}</text>}</g>)}
 {hover!==null&&<line x1={x(hover)} x2={x(hover)} y1={T} y2={H-B} stroke="#76838f" strokeDasharray="3 3" pointerEvents="none"/>}
 {drag&&<rect x={Math.min(drag.from.x,drag.to.x)} y={Math.min(drag.from.y,drag.to.y)} width={Math.abs(drag.to.x-drag.from.x)} height={Math.abs(drag.to.y-drag.from.y)} fill="#199b7e22" stroke="#199b7e" pointerEvents="none"/>}
 </svg><div className="breadth-readout"><strong>{months[selected]}</strong>{horizons.map((h,i)=>visible[i]&&<span key={h.lag} style={{color:colors[i]}}>{t(keys[i])} <b>{fmt(h.points[selected]?.[basis]??null)}</b></span>)}{!visible.some(Boolean)&&<span>{t('breadthNoSeries')}</span>}</div></div>
}
export function BreadthPanel({data}:{data:BreadthData}){
 const {t}=useTranslation()
 const [range,setRange]=useState<Settings['range']>('60')
 const [visible,setVisible]=useState([true,true,true])
 const start=range==='all'?0:Math.max(0,data.months.length-Number(range))
 const history={...data,months:data.months.slice(start),horizons:data.horizons.map(h=>({...h,points:h.points.slice(start)}))}
 const toggle=(i:number)=>setVisible(prev=>prev.map((value,k)=>k===i?!value:value))
 return <Card className="breadth-card"><CardContent><section id="pce-breadth" aria-labelledby="breadth-heading"><div className="panel-heading"><div><h2 id="breadth-heading">{t('breadthTitle')}</h2><p>{t('breadthSubtitle')}</p></div><Badge variant="outline">{data.months.at(-1)}</Badge></div><div className="breadth-metrics">{data.horizons.map((h,i)=>{const p=h.points.at(-1)!;return <div className="breadth-metric" key={h.lag}><h3><i style={{background:colors[i]}}/>{t(keys[i])}</h3><div><span>{t('breadthEqual')}</span><strong>{fmt(p.equal)}</strong></div><p>{t('breadthCount',{above:p.above,valid:p.valid,total:data.total})}</p><div><span>{t('breadthWeighted')}</span><strong>{fmt(p.weighted)}</strong></div><p>{t('breadthWeightedCount',{above:p.weightedAbove,valid:p.weightedValid})}</p></div>})}</div><div className="breadth-controls"><label htmlFor="breadth-history">{t('period')}</label><NativeSelect id="breadth-history" value={range} onChange={e=>setRange(e.target.value as Settings['range'])}>{ranges.map(r=><NativeSelectOption key={r} value={r}>{t(`range${r}`)}</NativeSelectOption>)}</NativeSelect><span>{history.months[0]} — {history.months.at(-1)}</span></div><p className="basis-note">{t('breadthInteraction')}</p><div className="breadth-trends"><BreadthTrend key={`equal-${range}-${data.months.at(-1)}`} data={history} basis="equal" visible={visible} onToggle={toggle}/><BreadthTrend key={`weighted-${range}-${data.months.at(-1)}`} data={history} basis="weighted" visible={visible} onToggle={toggle}/></div><div className="breadth-method"><p>{t('breadthFormula')}</p><p>{t('breadthEqualNote')}</p><p>{t('breadthWeightedNote')}</p><p>{t('breadthScope')}</p></div></section></CardContent></Card>
}
