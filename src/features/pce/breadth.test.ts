import {describe,it,expect} from 'vitest'
import {annualizedChange,calculateBreadth} from './breadth'
describe('PCE inflation breadth',()=>{
 it('annualizes compound index changes over each horizon',()=>{
  for(const lag of [3,6,12])expect(annualizedChange(100*1.05**(lag/12),100,lag)).toBeCloseTo(5,10)
  expect(annualizedChange(99,100,3)).toBeLessThan(0)
 })
 it('excludes missing and invalid prices instead of treating them as zero inflation',()=>{
  for(const bad of [null,undefined,0,-1,NaN,Infinity]){
   expect(annualizedChange(bad,100,3)).toBeNull()
   expect(annualizedChange(100,bad,3)).toBeNull()
  }
 })
 it('counts only leaves; includes deductions equally but excludes them from positive-spending weights',()=>{
  const months=Array.from({length:13},(_,i)=>`m${i}`)
  const price={a:[100,...Array(11).fill(100),104],b:[100,...Array(11).fill(100),102],deduction:[100,...Array(11).fill(100),105],missing:Array(13).fill(null),parent:Array(13).fill(200)}
  const spending={a:Array(13).fill(10),b:Array(13).fill(30),deduction:Array(13).fill(-20),missing:Array(13).fill(5),parent:Array(13).fill(100)}
  const nodes=Object.keys(price).map(id=>({id,leaf:id!=='parent'}))
  const result=calculateBreadth(nodes,{months,price,spending},['m12'])
  const p=result.horizons[0].points[0]
  expect(result.total).toBe(4)
  expect(p).toMatchObject({valid:3,above:2,weightedValid:2,weightedAbove:1,weighted:25})
  expect(p.equal).toBeCloseTo(200/3)
 })
 it('uses a strict threshold and leaves unavailable periods empty',()=>{
  const months=Array.from({length:13},(_,i)=>`m${i}`)
  const result=calculateBreadth([{id:'a',leaf:true}],{months,price:{a:[100,...Array(11).fill(100),103]},spending:{a:Array(13).fill(1)}},['m0','m12'])
  expect(result.horizons[0].points[0]).toMatchObject({equal:null,weighted:null,valid:0})
  expect(result.horizons[0].points[1]).toMatchObject({above:0,equal:0,weighted:0})
 })
 it('uses the current month positive spending and excludes unavailable spending only from weighted breadth',()=>{
  const months=Array.from({length:13},(_,i)=>`m${i}`)
  const prices={a:[100,...Array(11).fill(100),104],b:Array(13).fill(100),c:[100,...Array(11).fill(100),105]}
  const result=calculateBreadth(Object.keys(prices).map(id=>({id,leaf:true})),{months,price:prices,spending:{a:[90,...Array(11).fill(90),20],b:[10,...Array(11).fill(10),80],c:Array(13).fill(null)}},['m12'])
  expect(result.horizons[0].points[0]).toMatchObject({valid:3,above:2,weightedValid:2,weighted:20})
 })
})
