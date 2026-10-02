import snapshot from '../../../web/data/pce_data.json'
import cnNames from '../../i18n/locales/item-names-zh-cn.json'
import type { Settings } from './catalog'
import type { Locale } from '../../i18n'
export function getSnapshotView(settings: Settings & { locale: Locale }) {
  const { tf, bk, range, locale } = settings
  const months = snapshot.meta.months
  const month = settings.month ?? snapshot.meta.latest
  const i = months.indexOf(month)
  if (i < 0) throw new Error('Requested month is outside the published snapshot')
  const breakdown = snapshot.breakdowns[bk]
  const start = range === 'all' ? 0 : Math.max(0, i + 1 - Number(range))
  const name = (c: { en: string; zh: string; id: string }) => locale === 'en' ? c.en : locale === 'zh-cn' ? (cnNames as Record<string,string>)[c.id] ?? c.zh : c.zh
  const componentRows = breakdown.components.map(c => ({ id: c.id, name: name(c), color: c.color, value: c[tf][i] }))
  const items = snapshot.items.filter(n => n.id !== '1').map(n => {
    const s = (snapshot.series as Record<string, {mom: (number|null)[];yoy:(number|null)[];weight:number[];gm:(number|null)[];gy:(number|null)[]}>)[n.id]
    return { id:n.id, name:name(n), en:n.en, level:n.level, leaf:n.leaf, parent:n.parent, group:n.group, weight:s.weight[i], growth:s[tf === 'mom'?'gm':'gy'][i], contribution:s[tf][i] }
  })
  const components = bk === 'granular' ? snapshot.meta.groups.map(g => ({...g, name:name(g), values:months.slice(start,i+1).map((_,k) => snapshot.items.filter(n=>n.leaf&&n.group===g.id).reduce((a,n)=>a+((snapshot.series as Record<string,{mom:number[];yoy:number[]}>)[n.id][tf][start+k]??0),0))})) : breakdown.components.map(c=>({...c, name:name(c), values:c[tf].slice(start,i+1)}))
  return { latest:snapshot.meta.latest, published:snapshot.meta.published.replace('Data published ',''), month, months, method:breakdown.method, headline:snapshot.headline[tf][i], core:snapshot.headline[tf==='mom'?'core_mom':'core_yoy'][i], residual:breakdown.residual[tf][i], detailResidual:snapshot.breakdowns.granular.residual[tf][i], componentRows, components:components.map(c=>({id:c.id,name:c.name,color:c.color,values:c.values})), chartMonths:months.slice(start,i+1), headlineHistory:snapshot.headline[tf].slice(start,i+1), coreHistory:snapshot.headline[tf==='mom'?'core_mom':'core_yoy'].slice(start,i+1), residualHistory:breakdown.residual[tf].slice(start,i+1), items, leafCount:items.filter(n=>n.leaf).length }
}
export type DashboardData = ReturnType<typeof getSnapshotView>
