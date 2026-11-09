import { meta, items as productItems, series as productSeries, headline, chain_inputs } from '../../../web/data/pce_data.json'
import { reconstructScope } from './fisher-scope'
import cnNames from '../../i18n/locales/item-names-zh-cn.json'
import type { Settings } from './catalog'
import type { Locale } from '../../i18n'
const snapshot = { meta, items: productItems, series: productSeries, headline }
const palette = ['#199b7e','#926dde','#f39c12','#57c7d4','#677ae4','#f96868','#9ece67','#f96197']
export function getSnapshotView(settings: Settings & { locale: Locale }) {
  const { tf, range, locale } = settings
  const months = snapshot.meta.months
  const month = settings.month ?? snapshot.meta.latest
  const i = months.indexOf(month)
  if (i < 0) throw new Error('Requested month is outside the published snapshot')
  const start = range === 'all' ? 0 : Math.max(0, i + 1 - Number(range))
  const heatmapStart = Math.max(start, i - 15)
  const name = (c: { en: string; zh: string; id: string }) => locale === 'en' ? c.en : locale === 'zh-cn' ? (cnNames as Record<string,string>)[c.id] ?? c.zh : c.zh
  const series = snapshot.series as Record<string, {mom: (number|null)[];yoy:(number|null)[];weight:(number|null)[];gm:(number|null)[];gy:(number|null)[]}>
  const roots: readonly string[] = snapshot.meta.top_level_ids
  // Goods and Services are redundant wrappers above the four requested roots.
  const focus = snapshot.items.find(n=>n.id===settings.node && n.children.length>0 && !['1','2','150'].includes(n.id))?.id ?? null
  const basis = settings.basis ?? 'parent'
  const relative = basis==='parent' && focus!==null
  const scoped=relative?reconstructScope(snapshot.items,chain_inputs,focus!,months):null
  const weighted=(id:string,k:number)=>{if(!relative)return series[id][tf][k];if(id===focus)return series[id][tf==='mom'?'gm':'gy'][k];return scoped?.[id]?.[tf][k]??null}
  const relativeWeight=(id:string)=>{const w=series[id].weight[i],base=relative?series[focus!].weight[i]:100;return !relative?w:w===null||base===null||base===0?null:w/base*100}
  const items = snapshot.items.filter(n => !['1','2','150'].includes(n.id)).map(n => {
    const s = series[n.id]
    return { source:relative?'sourceLocal':snapshot.meta.diagnostics.chain.official_monthly_ids.includes(n.id)?(tf==='mom'?'sourceOfficial':'sourceLinkedOfficial'):(tf==='mom'?'sourceFisher':'sourceLinkedFisher'), id:n.id, name:name(n), en:n.en, level:n.level, leaf:n.leaf, parent:roots.includes(n.id)?null:n.parent, children:n.children.map(String), history:months.slice(heatmapStart,i+1).map((_,k)=>weighted(n.id,heatmapStart+k)), weight:relativeWeight(n.id), growth:s[tf === 'mom'?'gm':'gy'][i], contribution:relative&&n.id===focus?s[tf==='mom'?'gm':'gy'][i]:weighted(n.id,i) }
  })
  const selected = items.filter(n=>n.parent===focus)
  const components = selected.map((n,k)=>({id:n.id,name:n.name,color:palette[k%palette.length],values:months.slice(start,i+1).map((_,k)=>weighted(n.id,start+k)),drillable:n.children.length>0}))
  const focusItem = items.find(n=>n.id===focus)
  const lines = focusItem
    ? [{id:focusItem.id,name:focusItem.name,color:'#263238',dashed:false,values:series[focusItem.id][relative?(tf==='mom'?'gm':'gy'):tf].slice(start,i+1)}]
    : [{id:'headline',name:'',color:'#263238',dashed:false,values:snapshot.headline[tf].slice(start,i+1)},
       {id:'core',name:'',color:'#57c7d4',dashed:true,values:snapshot.headline[tf==='mom'?'core_mom':'core_yoy'].slice(start,i+1)}]
  const residualAt = (k:number) => {
    const values = roots.map(id=>series[id][tf][k])
    return values.some(v=>v===null) || snapshot.headline[tf][k]===null ? null : snapshot.headline[tf][k]! - values.reduce<number>((a,v)=>a+v!,0)
  }
  const breadcrumbs: {id:string;name:string}[] = []
  let cursor = items.find(n=>n.id===focus)
  while(cursor) { breadcrumbs.unshift({id:cursor.id,name:cursor.name}); cursor=items.find(n=>n.id===cursor!.parent) }
  return { basis, lineUnit:focus&&!relative?'pp':'%', latest:snapshot.meta.latest, published:snapshot.meta.published.replace('Data published ',''), month, months, method:'bea_official_and_fisher', headline:snapshot.headline[tf][i], core:snapshot.headline[tf==='mom'?'core_mom':'core_yoy'][i], residual:residualAt(i), detailResidual:residualAt(i), componentRows:components.map(c=>({id:c.id,name:c.name,color:c.color,value:weighted(c.id,i)})), components, chartMonths:months.slice(start,i+1), headlineHistory:snapshot.headline[tf].slice(start,i+1), coreHistory:snapshot.headline[tf==='mom'?'core_mom':'core_yoy'].slice(start,i+1), residualHistory:focus?months.slice(start,i+1).map((_,k)=>{const j=start+k;const parent=weighted(focus,j),values=selected.map(n=>weighted(n.id,j));return parent===null||values.some(v=>v===null)?null:parent-values.reduce<number>((a,v)=>a+v!,0)}):months.slice(start,i+1).map((_,k)=>residualAt(start+k)), items, lines, heatmapMonths:months.slice(heatmapStart,i+1), leafCount:items.filter(n=>n.leaf).length,focus,breadcrumbs }
}
export type DashboardData = ReturnType<typeof getSnapshotView>
