import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Download } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import type { DashboardData } from './snapshot.server'
import { getHeatmapRows } from './heatmap-rows'

export function ContributionHeatmap({data,transform,onDrill}:{data:DashboardData;transform:'mom'|'yoy';onDrill:(id:string)=>void}) {
  const {t}=useTranslation()
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(data.focus?[data.focus]:[]))
  const [query,setQuery]=useState('')
  const scrollRef=useRef<HTMLDivElement>(null)
  useLayoutEffect(()=>{const el=scrollRef.current;if(el)el.scrollLeft=el.scrollWidth},[data.month,data.heatmapMonths.length])
  const rows=getHeatmapRows(data.items,data.focus,expanded,query)
  // One symmetric scale across the displayed rows and months, never per cell/row.
  const scale=Math.max(.001,...rows.flatMap(n=>n.history.map(v=>Math.abs(v??0))))
  const cellStyle=(v:number|null)=>{
    if(v===null)return {background:'#f3f7f9',color:'#76838f'}
    const intensity=Math.sqrt(Math.min(1,Math.abs(v)/scale))
    return {background:v===0?'#ffffff':`color-mix(in srgb, ${v>0?'#f39c12':'#677ae4'} ${Math.round(intensity*85)}%, white)`,color:'#263238'}
  }
  const fmt=(v:number|null,d=3)=>v===null?'—':v.toFixed(d)
  const toggle=(id:string)=>setExpanded(prev=>{const next=new Set(prev);if(next.has(id))next.delete(id);else next.add(id);return next})
  const selected=data.items.find(n=>n.id===data.focus)
  return <><div className="panel-heading"><div><h2>{t('detailTitle')} <span className="count-badge">{rows.length}</span></h2><p>{t('detailSubtitle')}</p></div><Button variant="outline" asChild><a href={`/data/pce_detail_${transform}.csv`} download><Download size={15}/>{t('detailDownload')}</a></Button></div>
    <div className="detail-controls"><Input aria-label={t('search')} placeholder={t('search')} value={query} onChange={e=>setQuery(e.target.value)}/><Badge variant="outline">{data.month}</Badge><span className="heatmap-window">{t('heatmapWindow',{count:data.heatmapMonths.length})}</span></div>
    <div className="heatmap-legend"><span>{t('heatmapNegative')}</span><i/><span>{t('heatmapPositive')}</span><small>{t('contribution')} · pp</small></div>
    <div className="heatmap-scroll" ref={scrollRef}><Table className="heatmap-table"><TableHeader><TableRow><TableHead className="heatmap-name">{t('item')}</TableHead>{data.heatmapMonths.map(month=><TableHead key={month} className={month===data.month?'heatmap-selected':''}>{month}</TableHead>)}<TableHead>{t(data.basis==='parent'?'relativeWeight':'weight')} %<small>{data.month}</small></TableHead><TableHead>{t('growth')} %<small>{data.month}</small></TableHead></TableRow></TableHeader>
    <TableBody>{rows.map(n=><TableRow key={n.id} data-item-id={n.id} className={n.id===data.focus?'heatmap-parent':''}><TableCell className="heatmap-name"><div className="tree-item" style={{paddingLeft:n.depth*18}}>{!n.leaf?<Button variant="ghost" size="icon" className="tree-toggle" aria-expanded={query.trim()?true:expanded.has(n.id)} aria-label={`${t(expanded.has(n.id)?'collapse':'expand')} ${n.name}`} onClick={()=>toggle(n.id)}>{expanded.has(n.id)||query.trim()?<ChevronDown size={14}/>:<ChevronRight size={14}/>}</Button>:<span className="tree-spacer"/>}<div>{!n.leaf?<button className="item-drill" aria-current={n.id===data.focus?'true':undefined} onClick={()=>onDrill(n.id)}>{n.name}</button>:<span>{n.name}</span>}<small className="english-name">{n.en}</small><small className="contribution-source">{t(n.source)}</small></div></div></TableCell>{n.history.map((v,i)=><TableCell key={data.heatmapMonths[i]} className={`heatmap-value ${data.heatmapMonths[i]===data.month?'heatmap-selected':''}`} style={cellStyle(v)} title={`${n.name} · ${data.heatmapMonths[i]} · ${fmt(v)} pp`}>{fmt(v)}</TableCell>)}<TableCell className="heatmap-stat">{fmt(n.weight,2)}</TableCell><TableCell className="heatmap-stat">{fmt(n.growth,2)}</TableCell></TableRow>)}{!rows.length&&<TableRow><TableCell colSpan={data.heatmapMonths.length+3}>{t('noResults')}</TableCell></TableRow>}</TableBody></Table></div>
    <p className="table-note">{t(data.basis==='parent'?'parentTableNote':'tableNote')}</p><div className="table-total">{selected?<span>{selected.name} · {t('contribution')} <b>{fmt(selected.contribution)} pp</b> · {t('residual')} <b>{fmt(data.residualHistory.at(-1)??null)} pp</b></span>:<><span>{t('sum')} <b>{fmt(data.items.filter(n=>n.parent===null).reduce((sum,n)=>sum+(n.contribution??0),0))} pp</b></span><span>{t('residual')} <b>{fmt(data.residual)} pp</b></span></>}</div></>
}
