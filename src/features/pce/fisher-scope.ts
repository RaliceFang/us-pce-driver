// Local price/quantity-dual Fisher reconstruction; never current-share rebasing.
// Publicly rounded inputs can leave a gap to the published parent price index.
type Node={id:string;children:number[]}
type Inputs={months:string[];price:Record<string,(number|null)[]>;spending:Record<string,(number|null)[]>}
export function reconstructScope(nodes:Node[],inputs:Inputs,focus:string,outputMonths:string[]) {
 const tree=new Map(nodes.map(n=>[n.id,n]))
 const descendants:string[]=[]
 const visit=(id:string)=>{descendants.push(id);tree.get(id)!.children.forEach(c=>visit(String(c)))}
 visit(focus)
 const monthly:Record<string,(number|null)[]> = Object.fromEntries(descendants.map(id=>[id,[]]))
 for(let k=0;k<inputs.months.length;k++){
  const valid=(id:string)=>k>0&&[inputs.price[id][k-1],inputs.price[id][k]].every(v=>v!==null&&v>0)&&[inputs.spending[id][k-1],inputs.spending[id][k]].every(v=>v!==null)
  const frontier=(id:string):string[]|null=>{const children=tree.get(id)!.children;if(children.length){const parts=children.map(c=>frontier(String(c)));if(parts.every(p=>p!==null))return parts.flat() as string[]}return valid(id)?[id]:null}
  const partition=k>0?frontier(focus):null
  if(!partition||partition.length===1&&partition[0]===focus){descendants.forEach(id=>monthly[id].push(null));continue}
  const total0=partition.reduce((s,id)=>s+inputs.spending[id][k-1]!,0),total1=partition.reduce((s,id)=>s+inputs.spending[id][k]!,0)
  if(!total0||!total1){descendants.forEach(id=>monthly[id].push(null));continue}
  const terms=partition.map(id=>({id,r:inputs.price[id][k]!/inputs.price[id][k-1]!,a:inputs.spending[id][k-1]!/total0,b:inputs.spending[id][k]!/total1}))
  const L=terms.reduce((s,v)=>s+v.a*v.r,0),invP=terms.reduce((s,v)=>s+v.b/v.r,0)
  if(L<=0||invP<=0){descendants.forEach(id=>monthly[id].push(null));continue}
  const P=1/invP,F=Math.sqrt(L*P)
  const atomic=new Map(terms.map(v=>[v.id,100*(v.a+F*v.b/v.r)/(1+F/P)*(v.r-1)]))
  const fallback=(id:string):number|null=>{if(!valid(id))return null;const r=inputs.price[id][k]!/inputs.price[id][k-1]!,a=inputs.spending[id][k-1]!/total0,b=inputs.spending[id][k]!/total1;return 100*(a+F*b/r)/(1+F/P)*(r-1)}
  const sum=(id:string):number|null=>{if(atomic.has(id))return atomic.get(id)!;const children=tree.get(id)!.children;if(!children.length)return fallback(id);const values=children.map(c=>sum(String(c)));return values.some(v=>v===null)?fallback(id):values.reduce<number>((a,v)=>a+v!,0)}
  descendants.forEach(id=>monthly[id].push(sum(id)))
 }
 const price=inputs.price[focus]
 return Object.fromEntries(descendants.map(id=>[id,{
  mom:outputMonths.map(m=>monthly[id][inputs.months.indexOf(m)]),
  yoy:outputMonths.map(m=>{const k=inputs.months.indexOf(m);if(k<12||price[k-12]===null||price[k-12]===0)return null;let sum=0;for(let j=k-11;j<=k;j++){const c=monthly[id][j],p=price[j-1];if(c===null||p===null)return null;sum+=c*p/price[k-12]!}return sum})
 }]))
}
