import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardData } from './snapshot.server'
const colors:Record<string,string>={food:'#57c7d4',energy:'#f39c12',core_goods:'#926dde',core_services:'#199b7e',residual:'#a3afb7'}
export function ContributionChart({data,onDrill}:{data:DashboardData;onDrill:(id:string)=>void}) {
  const {t}=useTranslation()
  const clipId=useId()
  const [zoom,setZoom]=useState<{start:number;end:number;lo:number;hi:number}|null>(null)
  const [drag,setDrag]=useState<{x:number;y:number;endX:number;endY:number}|null>(null)
  const suppressClick=useRef(false)
  const [hover,setHover]=useState<number|null>(null)
  const start=zoom?.start??0,end=zoom?.end??data.chartMonths.length-1
  const months=data.chartMonths.slice(start,end+1)
  const lines=data.lines.map(line=>({...line,name:line.id==='headline'?t('headline'):line.id==='core'?t('core'):line.name,values:line.values.slice(start,end+1)}))
  const components=[...data.components,...[{id:'residual',name:t('residual'),color:colors.residual,values:data.residualHistory,drillable:false}]]
  const series=components.map(c=>({...c,values:c.values.slice(start,end+1)}))
  const W=1280,H=390,L=56,R=18,T=24,B=40,width=W-L-R,height=H-T-B,n=months.length
  let lo=0,hi=0
  for(let i=0;i<n;i++) { let pos=0,neg=0;for(const c of series){const v=c.values[i]??0;if(v>=0)pos+=v;else neg+=v}hi=Math.max(hi,pos,...lines.map(line=>line.values[i]??0));lo=Math.min(lo,neg,...lines.map(line=>line.values[i]??0)) }
  const margin=Math.max(.06,(hi-lo)*.12);hi+=margin;lo-=margin
  if(zoom){lo=zoom.lo;hi=zoom.hi}
  const y=(v:number)=>T+(hi-v)/(hi-lo)*height,x=(i:number)=>L+(i+.5)*width/n,bw=Math.max(.7,width/n*.68)
  const yLine=y
  const point=(e:React.PointerEvent<SVGSVGElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:Math.max(L,Math.min(W-R,(e.clientX-r.left)*W/r.width)),y:Math.max(T,Math.min(H-B,(e.clientY-r.top)*H/r.height))}}
  const click=(action:()=>void)=>{if(!suppressClick.current)action()}
  const path=(values:(number|null)[])=>{let open=false;return values.map((v,i)=>{if(v===null){open=false;return ''}const s=`${open?'L':'M'}${x(i)},${yLine(v)}`;open=true;return s}).join(' ')}
  return <><div className="chart-zoom-toolbar"><button className="zoom-reset" onClick={()=>{setZoom(null);setHover(null)}} disabled={!zoom}>Reset Zoom</button></div><div className="chart-legend">{components.map(c=><span key={c.id}><i style={{background:c.color}}/>{c.name}</span>)}{lines.map(line=><span key={line.id}><b style={{color:line.color}}>{line.dashed?'┄':'━'}</b>{line.name} ({data.lineUnit})</span>)}</div><div className="chart-scroll"><svg className="pce-chart" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={t('chartTitle')} style={{touchAction:'pan-y',userSelect:'none'}} onPointerLeave={()=>setHover(null)} onPointerDown={e=>{if(e.button!==0||e.pointerType==='touch')return;const p=point(e);suppressClick.current=false;setDrag({...p,endX:p.x,endY:p.y})}} onPointerMove={e=>{if(!drag)return;const p=point(e);if(Math.abs(p.x-drag.x)>5||Math.abs(p.y-drag.y)>5){suppressClick.current=true;e.currentTarget.setPointerCapture(e.pointerId)}setDrag({...drag,endX:p.x,endY:p.y})}} onPointerUp={e=>{if(!drag)return;const p=point(e);if(suppressClick.current&&Math.abs(p.x-drag.x)>8){const first=Math.max(0,Math.floor((Math.min(drag.x,p.x)-L)/width*n)),last=Math.min(n-1,Math.floor((Math.max(drag.x,p.x)-L)/width*n));const vertical=Math.abs(p.y-drag.y)>8;setZoom({start:start+first,end:start+last,lo:vertical?hi-(Math.max(drag.y,p.y)-T)/height*(hi-lo):lo,hi:vertical?hi-(Math.min(drag.y,p.y)-T)/height*(hi-lo):hi});setHover(null)}setDrag(null)}} onPointerCancel={()=>setDrag(null)} onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false}}}>
    <defs><clipPath id={clipId}><rect x={L} y={T} width={width} height={height}/></clipPath></defs>
    {Array.from({length:6},(_,i)=>{const v=lo+(hi-lo)*i/5;return <g key={i}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e4eaec" strokeDasharray="3 5"/><text x={L-12} y={y(v)+4} textAnchor="end" fill="#76838f" fontSize={12}>{v.toFixed(1)}</text></g>})}
    <line x1={L} x2={W-R} y1={y(0)} y2={y(0)} stroke="#a3afb7"/>
    {months.map((m,i)=><rect key={`hit${m}`} x={L+i*width/n} y={T} width={width/n} height={height} fill="transparent" tabIndex={0} role="img" aria-label={m} onPointerEnter={()=>setHover(i)} onFocus={()=>setHover(i)}><title>{`${m} · ${lines.map(line=>`${line.name}: ${line.values[i]?.toFixed(3)??'—'} ${data.lineUnit}`).join(' · ')}`}</title></rect>)}
    {months.map((m,i)=>{let p=0,q=0;return <g key={m}>{series.map(c=>{const v=c.values[i];if(v===null)return null;const a=v>=0?p:q,b=a+v;if(v>=0)p=b;else q=b;return <rect key={c.id} clipPath={`url(#${clipId})`} x={x(i)-bw/2} y={y(Math.max(a,b))} width={bw} height={Math.max(.1,Math.abs(y(a)-y(b)))} fill={c.color} opacity={hover===null||hover===i?1:.65} style={{cursor:c.drillable?'pointer':'default'}} tabIndex={0} role={c.drillable?"button":"img"} aria-label={`${m} ${c.name} ${v.toFixed(3)} pp`} onPointerEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onClick={c.drillable?()=>click(()=>onDrill(c.id)):undefined} onKeyDown={e=>{if(c.drillable&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onDrill(c.id)}}}><title>{`${m} · ${c.name}: ${v.toFixed(3)} pp`}</title></rect>})}{(i===0||i===n-1||i%Math.max(1,Math.ceil(n/9))===0)&&<text x={x(i)} y={H-12} fill="#76838f" textAnchor="middle" fontSize={12}>{m}</text>}</g>})}
    {lines.map(line=><path key={line.id} data-line-id={line.id} clipPath={`url(#${clipId})`} pointerEvents="none" d={path(line.values)} fill="none" stroke={line.color} strokeWidth={2.2} strokeDasharray={line.dashed?'6 3':undefined}/>)}
    {hover!==null&&<line x1={x(hover)} x2={x(hover)} y1={T} y2={H-B} stroke="#526069" strokeDasharray="3 3" pointerEvents="none"/>}

    <text x={L} y={14} fill="#76838f" fontSize={11}>{data.lineUnit==='pp'?'pp':'pp / %'}</text>{drag&&<rect x={Math.min(drag.x,drag.endX)} y={Math.min(drag.y,drag.endY)} width={Math.abs(drag.endX-drag.x)} height={Math.abs(drag.endY-drag.y)} fill="#199b7e22" stroke="#199b7e" pointerEvents="none"/>}
  </svg></div><div className="chart-readout" aria-live="polite">{hover===null?<span>{t('chartHint')}</span>:<><strong>{months[hover]}</strong>{series.map(c=><span key={c.id}><i style={{background:c.color}}/>{c.name} <b>{c.values[hover]?.toFixed(3)??'—'} pp</b></span>)}{lines.map(line=><span key={line.id}>{line.name} <b>{line.values[hover]?.toFixed(3)??'—'} {data.lineUnit}</b></span>)}</>}</div></>
}
