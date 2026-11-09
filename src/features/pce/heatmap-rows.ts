import type { DashboardData } from './snapshot.server'
type Item = DashboardData['items'][number]
export function getHeatmapRows(items: Item[], focus: string|null, expanded: ReadonlySet<string>, query = '') {
  const scope: (Item & {depth:number})[] = []
  const walk = (node:Item,depth:number) => {
    scope.push({...node,depth})
    for(const child of items.filter(n=>n.parent===node.id)) walk(child,depth+1)
  }
  for(const root of items.filter(n=>focus?n.id===focus:n.parent===null)) walk(root,0)
  const scopedIds = new Set(scope.map(n=>n.id))
  const matches = new Set<string>()
  const search = query.trim().toLowerCase()
  if(search) for(const n of scope) if(`${n.name} ${n.en}`.toLowerCase().includes(search)) {
    let cursor:Item|undefined=n
    while(cursor && scopedIds.has(cursor.id)) {matches.add(cursor.id);cursor=items.find(p=>p.id===cursor!.parent)}
  }
  return scope.filter(n=>{
    if(search)return matches.has(n.id)
    let parent=n.parent
    while(parent && scopedIds.has(parent)) {
      if(!expanded.has(parent))return false
      parent=items.find(p=>p.id===parent)?.parent??null
    }
    return true
  })
}
