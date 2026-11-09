import { useTranslation } from 'react-i18next'
import { Download, ChevronRight, ArrowUp, ArrowDown, CalendarDays, BarChart3, Activity } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { NativeSelect,NativeSelectOption } from '../../components/ui/native-select'
import { transforms,ranges,contributionBases,type Settings } from './catalog'
import type { DashboardData } from './snapshot.server'
import type { Locale } from '../../i18n'
import { ContributionChart } from './contribution-chart'
import { ContributionHeatmap } from './contribution-heatmap'
export function Dashboard({data,settings,locale,onChange}:{data:DashboardData;settings:Settings;locale:Locale;onChange:(s:Partial<Settings>)=>void}) {
  const {t}=useTranslation()
  const drill=(id:string)=>onChange({node:id})
  const top=[...data.componentRows].filter(c=>c.value!==null&&c.value>0).sort((a,b)=>(b.value??0)-(a.value??0))[0]
  const bottom=[...data.componentRows].filter(c=>c.value!==null&&c.value<0).sort((a,b)=>(a.value??0)-(b.value??0))[0]
  const fmt=(v:number|null,d=3)=>v===null?'—':v.toFixed(d)
  return <main className="page-shell"><div className="intro-row"><div><p className="eyebrow"><span/> {t('eyebrow')}</p><h1>{t('title')}</h1><p className="intro-subtitle">{t('subtitle')}</p></div><div className="release-panel"><CalendarDays size={17}/><div><span>{t('latest')}</span><strong>{data.latest}</strong><small>{t('published')} · {data.published}</small></div></div></div>
    <div className="metrics-grid">{[{label:'headline',value:fmt(data.headline,2)+'%',note:`${data.month} · ${t(settings.tf)} · ${t('sa')}`,icon:<Activity size={18}/>},{label:'core',value:fmt(data.core,2)+'%',note:`${data.month} · ${t(settings.tf)} · ${t('sa')}`,icon:<BarChart3 size={18}/>},{label:'top',value:top?fmt(top.value)+' pp':'—',note:top?.name??t('unavailable'),icon:<ArrowUp size={18}/>},{label:'bottom',value:bottom?fmt(bottom.value)+' pp':'—',note:bottom?.name??t('unavailable'),icon:<ArrowDown size={18}/>}].map(c=><Card key={c.label} className="metric"><CardContent><div className="metric-label">{t(c.label)}{c.icon}</div><strong>{c.value}</strong><p>{c.note}</p></CardContent></Card>)}</div>
    <Card className="chart-card"><CardContent><div className="panel-heading"><div><h2>{t('chartTitle')}</h2><p>{t('chartSubtitle')}</p></div><Button variant="outline" asChild><a href={`/data/pce_detail_${settings.tf}.csv`} download><Download size={15}/>{t('download')}</a></Button></div><div className="control-bar"><div className="control-group"><label>{t('rate')}</label><div className="transform-group">{transforms.map(tf=><Button key={tf} variant={settings.tf===tf?'default':'ghost'} size="sm" onClick={()=>onChange({tf})}>{t(tf)}</Button>)}</div></div><div className="control-group"><label>{t('basisLabel')}</label><div className="transform-group" role="tablist" aria-label={t('basisLabel')}>{contributionBases.map(basis=><Button key={basis} role="tab" aria-selected={(settings.basis??'parent')===basis} variant={(settings.basis??'parent')===basis?'default':'ghost'} size="sm" onClick={()=>onChange({basis})}>{t(`basis_${basis}`)}</Button>)}</div></div><div className="control-group"><label htmlFor="history">{t('period')}</label><NativeSelect id="history" value={settings.range} onChange={e=>onChange({range:e.target.value as Settings['range']})}>{ranges.map(r=><NativeSelectOption key={r} value={r}>{t(`range${r}`)}</NativeSelectOption>)}</NativeSelect></div></div>
      <p className="basis-note">{t(data.basis==='parent'?'parentBasisNote':'headlineBasisNote',{name:data.breadcrumbs.at(-1)?.name??t('headline'),rate:t(settings.tf)})}</p><nav aria-label={t('drillPath')} className="drill-path"><Button variant="ghost" size="sm" onClick={()=>onChange({node:undefined})}>{t('allProducts')}</Button>{data.breadcrumbs.map(n=><span key={n.id}><ChevronRight size={14}/><Button variant="ghost" size="sm" onClick={()=>drill(n.id)} aria-current={n.id===data.focus?'page':undefined}>{n.name}</Button></span>)}</nav>
      <ContributionChart key={`${data.basis}-${data.focus??"root"}-${settings.tf}-${settings.range}-${data.chartMonths.join()}`} data={data} onDrill={drill}/><div className="method-note"><Badge variant="secondary">{t('estimate')}</Badge><span>{t(data.basis==='parent'?'parentWeightedMethod':'weightedMethod')}</span><Link to="/$locale/methodology" params={{locale}}>{t('methodology')} →</Link></div></CardContent></Card>
    <Card className="detail-card"><CardContent><ContributionHeatmap key={data.focus??'root'} data={data} transform={settings.tf} onDrill={drill}/></CardContent></Card><footer className="page-footer"><div>{t('source')}<small>{t('footer')}</small></div><div><a href="/data/pce_data.json" download>{t('json')}</a><a href="/data/validation.json">{t('validation')}</a></div></footer></main>
}
