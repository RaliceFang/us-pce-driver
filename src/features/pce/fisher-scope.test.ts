import {it,expect} from 'vitest'
import {reconstructScope} from './fisher-scope'
it('uses the price/quantity dual Fisher allocation and sums to the independently computed index',()=>{
 const nodes=[{id:'1',children:[2,3]},{id:'2',children:[]},{id:'3',children:[]}]
 const inputs={months:['2026-01','2026-02'],price:{'1':[100,100],'2':[100,130],'3':[40,32]},spending:{'1':[380,388],'2':[300,260],'3':[80,128]}}
 const out=reconstructScope(nodes,inputs,'1',['2026-02'])
 const L=(130*3+32*2)/380,P=388/(100*2+40*4),F=Math.sqrt(L*P),Q=388/380/F
 const expected=100*(3+2/Q)*(130-100)/(380+(100*2+40*4)/Q)
 expect(out['2'].mom[0]).toBeCloseTo(expected,12)
 expect(out['2'].mom[0]!+out['3'].mom[0]!).toBeCloseTo(100*(F-1),12)
})
it('does not replace missing source prices with zero or assign to an unusable partition',()=>{
 const result=reconstructScope([{id:'1',children:[2]},{id:'2',children:[]}],{months:['2026-01','2026-02'],price:{'1':[100,101],'2':[null,null]},spending:{'1':[100,101],'2':[100,101]}},'1',['2026-02'])
 expect(result['2'].mom).toEqual([null])
})
