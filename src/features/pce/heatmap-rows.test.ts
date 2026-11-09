import { describe,it,expect } from 'vitest'
import { getSnapshotView } from './snapshot.server'
import { getHeatmapRows } from './heatmap-rows'
const settings={basis:'headline',tf:'mom',bk:'granular',range:'60',locale:'zh-tw'} as const
const data=getSnapshotView(settings)
describe('Heatmap scope and expansion',()=>{
 it('starts with exactly four roots',()=>expect(getHeatmapRows(data.items,null,new Set()).map(n=>n.id)).toEqual(['3','72','151','342']))
 it('shows the selected parent and its direct children, without other branches',()=>{
  expect(getHeatmapRows(data.items,'3',new Set(['3'])).map(n=>n.id)).toEqual(['3','4','23','38','62'])
  expect(getHeatmapRows(data.items,'4',new Set(['4'])).map(n=>n.id)).toEqual(['4','5','12','20'])
 })
 it('expands descendants independently of the selected chart scope',()=>{
  expect(getHeatmapRows(data.items,'3',new Set(['3','4'])).map(n=>n.id)).toEqual(['3','4','5','12','20','23','38','62'])
  expect(getHeatmapRows(data.items,'3',new Set()).map(n=>n.id)).toEqual(['3'])
 })
 it('searches within the selected branch while retaining its ancestor path',()=>{
  expect(getHeatmapRows(data.items,'3',new Set(),'Tires').map(n=>n.id)).toEqual(['3','4','20','21'])
  expect(getHeatmapRows(data.items,'3',new Set(),'Hospitals')).toEqual([])
 })
})
