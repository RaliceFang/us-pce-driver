import { describe, it, expect } from 'vitest'
import { getSnapshotView } from './snapshot.server'
const settings = { tf:'yoy', bk:'basic4', range:'60', locale:'zh-tw' } as const
describe('PCE snapshot views',()=>{
 it('keeps contributions and residual consistent with headline',()=>{
  const data=getSnapshotView(settings)
  expect(data.chartMonths).toHaveLength(60)
  expect(data.leafCount).toBe(73)
  expect(data.componentRows.reduce((sum,row)=>sum+(row.value??0),0)+(data.residual??0)).toBeCloseTo(data.headline!,8)
  expect(data.items.filter(row=>row.leaf).reduce((sum,row)=>sum+(row.contribution??0),0)+(data.detailResidual??0)).toBeCloseTo(data.headline!,8)
 })
 it('ends historical views at the requested month',()=>{
  const data=getSnapshotView({...settings,month:'2020-06',range:'12'})
  expect(data.chartMonths).toHaveLength(12)
  expect(data.chartMonths.at(-1)).toBe('2020-06')
 })
 it('changes labels without changing values',()=>{
  const tw=getSnapshotView(settings),en=getSnapshotView({...settings,locale:'en'})
  expect(tw.components[0].name).not.toBe(en.components[0].name)
  expect(tw.headlineHistory).toEqual(en.headlineHistory)
 })
 it('rejects unpublished months',()=>expect(()=>getSnapshotView({...settings,month:'2099-01'})).toThrow())
})
