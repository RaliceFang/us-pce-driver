import { describe, it, expect } from 'vitest'
import { getSnapshotView } from './snapshot.server'
import source from '../../../web/data/pce_data.json'
const settings = { basis:'headline', tf:'yoy', bk:'granular', range:'60', locale:'zh-tw' } as const
describe('Complete BEA product hierarchy',()=>{
 it('always starts with the four requested roots, including old granular links',()=>{
  for(const bk of ['basic4','detail6','major16','granular'] as const){
   const data=getSnapshotView({...settings,bk})
   expect(data.components.map(c=>c.id)).toEqual(['3','72','151','342'])
   expect(data.components.map(c=>c.name)).toEqual(['耐久財','非耐久財','家庭服務','非營利機構服務'])
   expect(data.items).toHaveLength(365)
   expect(data.leafCount).toBe(245)
   expect(data.componentRows.reduce((sum,row)=>sum+(row.value??0),0)+data.residual!).toBeCloseTo(data.headline!,8)
  }
 })
 it('drills one level at a time using published BEA children',()=>{
  const durable=getSnapshotView({...settings,node:'3'})
  expect(durable.components.map(c=>c.id)).toEqual(['4','23','38','62'])
  const vehicles=getSnapshotView({...settings,node:'4'})
  expect(vehicles.components.map(c=>c.id)).toEqual(['5','12','20'])
  expect(vehicles.breadcrumbs.map(n=>n.id)).toEqual(['3','4'])
  expect(vehicles.residualHistory).toHaveLength(60)
 })
 it('uses published BEA monthly contributions and preserves signed deductions',()=>{
  const data=getSnapshotView({...settings,tf:'mom',month:'2026-03'})
  expect(data.items.find(n=>n.id==='113')!.contribution).toBe(source.series['113'].mom[source.meta.months.indexOf('2026-03')])
  const august=getSnapshotView({...settings,tf:'mom',month:'2026-08'})
  expect(august.items.find(n=>n.id==='3')!.contribution).toBe(source.series['3'].mom[source.meta.months.indexOf('2026-08')])
  expect(august.items.find(n=>n.id==='342')!.contribution).toBe(source.series['342'].mom[source.meta.months.indexOf('2026-08')])
  expect(august.items.find(n=>n.id==='356')!.weight).toBeLessThan(0)
  expect(august.items.find(n=>n.id==='145')!.contribution).not.toBeNull()
  expect(august.items.find(n=>n.id==='157')!.contribution).toBeNull()
 })
 it('ends histories at the selected month and retains complete hierarchy',()=>{
  const data=getSnapshotView({...settings,month:'2020-06',range:'12',node:'4'})
  expect(data.chartMonths).toHaveLength(12)
  expect(data.chartMonths.at(-1)).toBe('2020-06')
  expect(data.items).toHaveLength(365)
 })
 it('ignores invalid, wrapper and leaf scopes',()=>{
  for(const node of ['999','2','150','21'])expect(getSnapshotView({...settings,node}).focus).toBeNull()
 })
 it('keeps English labels and rejects unpublished months',()=>{
  expect(getSnapshotView(settings).items.find(n=>n.id==='342')!.en).toContain('(NPISHs)')
  expect(()=>getSnapshotView({...settings,month:'2099-01'})).toThrow()
 })
})

describe('Scoped chart and heatmap histories',()=>{
 it('shows global inflation lines only at the root',()=>{
  const root=getSnapshotView(settings)
  expect(root.lines.map(l=>l.id)).toEqual(['headline','core'])
  expect(root.lines[0].values).toEqual(root.headlineHistory)
 })
 it('uses the selected product contribution to headline PCE for the drill line',()=>{
  for(const tf of ['mom','yoy'] as const){
   for(const node of ['3','4','342']){
    const data=getSnapshotView({...settings,tf,node})
    expect(data.lines.map(l=>l.id)).toEqual([node])
    expect(data.lines[0].values.at(-1)).toEqual(data.items.find(n=>n.id===node)!.contribution)
   }
  }
 })
 it('aligns all heatmap columns to the selected month and rate with missing data retained',()=>{
  const data=getSnapshotView({...settings,tf:'mom',month:'2020-06'})
  expect(data.heatmapMonths).toHaveLength(16)
  expect(data.heatmapMonths.at(-1)).toBe('2020-06')
  for(const row of data.items){expect(row.history).toHaveLength(16);expect(row.history.at(-1)).toEqual(row.contribution)}
  expect(data.items.find(n=>n.id==='157')!.history.at(-1)).toBeNull()
  expect(getSnapshotView({...settings,range:'12'}).heatmapMonths).toHaveLength(12)
 })
})

 it('reconstructs parent Fisher contributions independently for both transforms',()=>{
  for(const tf of ['mom','yoy'] as const){
   const original=getSnapshotView({...settings,tf,node:'3'})
   const relative=getSnapshotView({...settings,tf,node:'3',basis:'parent'})
   const parent=original.items.find(n=>n.id==='3')!
   expect(relative.lines[0].values.at(-1)).toEqual(parent.growth)
   expect(relative.items.find(n=>n.id==='3')!.weight).toBe(100)
   for(const child of relative.components){
    const base=original.components.find(n=>n.id===child.id)!
    expect(Number.isFinite(child.values.at(-1))).toBe(true)
    expect(child.values.at(-1)).not.toBeCloseTo(base.values.at(-1)!/parent.weight!*100,6)
    expect(relative.items.find(n=>n.id===child.id)!.history.at(-1)).toEqual(child.values.at(-1))
   }
   const root=getSnapshotView({...settings,tf,basis:'parent'})
   expect(root.components).toEqual(getSnapshotView({...settings,tf}).components)
  }
 })
