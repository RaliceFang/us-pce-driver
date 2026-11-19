// Diffusion across published leaves. Signed deductions remain in equal counts,
// but only positive current expenditure participates in weighted breadth.
export const breadthHorizons = [12, 3, 6] as const
export type BreadthInputs = {months:string[];price:Record<string,(number|null)[]>;spending:Record<string,(number|null)[]>}
export function annualizedChange(current:number|null|undefined,previous:number|null|undefined,lag:number):number|null {
  if(current==null||previous==null||!Number.isFinite(current)||!Number.isFinite(previous)||current<=0||previous<=0||lag<=0)return null
  const value=Math.expm1(Math.log(current/previous)*(12/lag))*100
  return Number.isFinite(value)?value:null
}
export function calculateBreadth(nodes:{id:string;leaf:boolean}[],inputs:BreadthInputs,months:string[]) {
  const leaves=nodes.filter(n=>n.leaf)
  const positions=new Map(inputs.months.map((m,i)=>[m,i]))
  return {total:leaves.length,threshold:3,months,horizons:breadthHorizons.map(lag=>({lag,points:months.map(month=>{
    const k=positions.get(month)
    let valid=0,above=0,weightedValid=0,weightedAbove=0,totalSpending=0,aboveSpending=0
    if(k!==undefined&&k>=lag)for(const n of leaves){
      const prices=inputs.price[n.id]
      const change=annualizedChange(prices?.[k],prices?.[k-lag],lag)
      if(change===null)continue
      // Compare price relatives directly: exactly 3% is not above 3%.
      const exceeds=prices[k]!/prices[k-lag]!>Math.pow(1.03,lag/12)
      valid++;if(exceeds)above++
      const spending=inputs.spending[n.id]?.[k]
      if(spending!=null&&Number.isFinite(spending)&&spending>0){
        weightedValid++;totalSpending+=spending
        if(exceeds){weightedAbove++;aboveSpending+=spending}
      }
    }
    return {month,valid,above,weightedValid,weightedAbove,equal:valid?above/valid*100:null,weighted:totalSpending>0?aboveSpending/totalSpending*100:null}
  })}))}
}
export type BreadthData=ReturnType<typeof calculateBreadth>
