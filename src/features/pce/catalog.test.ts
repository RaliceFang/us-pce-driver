import {it,expect} from 'vitest'
import {searchSchema} from './catalog'
it('defaults missing and unsupported settings to monthly parent contributions',()=>{
 for(const input of [{},{tf:'invalid',basis:'invalid'}]){
  expect(searchSchema.parse(input)).toMatchObject({tf:'mom',basis:'parent'})
 }
})
it('preserves explicit shared year-over-year and headline choices',()=>{
 expect(searchSchema.parse({tf:'yoy',basis:'headline'})).toMatchObject({tf:'yoy',basis:'headline'})
})
