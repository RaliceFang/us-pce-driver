"""Fisher price contributions; official monthly observations take precedence.

Fine detail uses the price/quantity dual of the BEA Handbook contribution
allocation, reconstructed from publicly rounded price and expenditure inputs.
"""
from math import sqrt
from pce.math import linked_yoy

OFFICIAL_LINES = {2:2,3:3,8:72,13:150,14:151,22:342,23:343,24:356,29:153,
                 4:4,5:23,6:38,7:62,9:73,10:104,11:113,12:120,
                 15:152,16:172,17:190,18:209,19:234,20:252,21:280}

def price_allocation(r, s0, s1):
    """Bilateral Fisher price allocation (price/quantity dual).

    Inputs are a complete signed partition, with shares normalized to one.
    Unlike other additive Fisher decompositions this uses dual-equation weights.
    """
    L=sum(a*x for a,x in zip(s0,r));invP=sum(b/x for b,x in zip(s1,r))
    if L<=0 or invP<=0:raise ValueError('Invalid Fisher partition')
    P=1/invP;F=sqrt(L*P)
    c=[100*(a+F*b/x)/(1+F/P)*(x-1) for a,b,x in zip(s0,s1,r)]
    return c,100*(F-1)

def reconstruct(items, prices, spending, months):
    nodes={n['id']:n for n in items}
    output={id:[] for id in nodes};partition_counts=[]
    for k,m in enumerate(months):
        if k==0:
            for values in output.values():values.append(None)
            continue
        prev=months[k-1]
        def usable(id):
            return all(prices[int(id)]['values'].get(t) is not None and prices[int(id)]['values'][t]>0 and spending[int(id)]['values'].get(t) is not None for t in (prev,m))
        def frontier(id):
            n=nodes[id]
            if n['children']:
                child_parts=[frontier(str(c)) for c in n['children']]
                if all(p is not None for p in child_parts):return sum(child_parts,[])
            return [id] if usable(id) else None
        partition=frontier('1')
        if partition is None or partition==['1']:raise ValueError('Incomplete Fisher frontier')
        partition_counts.append(len(partition))
        v0=[nodes[id]['sign']*spending[int(id)]['values'][prev] for id in partition]
        v1=[nodes[id]['sign']*spending[int(id)]['values'][m] for id in partition]
        total0,total1=sum(v0),sum(v1)
        if min(total0,total1)<=0:raise ValueError('Nonpositive PCE spending')
        # Reject actual coverage errors; permit only published million-dollar rounding.
        for values,total,t in [(v0,total0,prev),(v1,total1,m)]:
            if abs(total-spending[1]['values'][t])>2+.6*len(partition):raise ValueError('Fisher frontier spending coverage failed')
        r=[prices[int(id)]['values'][m]/prices[int(id)]['values'][prev] for id in partition]
        P=1/sum(b/x for b,x in zip([v/total1 for v in v1],r));F=sqrt(sum(a*x for a,x in zip([v/total0 for v in v0],r))*P)
        c,_=price_allocation(r,[v/total0 for v in v0],[v/total1 for v in v1])
        atomic=dict(zip(partition,c))
        def fallback(id):
            if not usable(id):return None
            x=prices[int(id)]['values'][m]/prices[int(id)]['values'][prev]
            a=nodes[id]['sign']*spending[int(id)]['values'][prev]/total0
            b=nodes[id]['sign']*spending[int(id)]['values'][m]/total1
            return 100*(a+F*b/x)/(1+F/P)*(x-1)
        def aggregate(id):
            if id in atomic:return atomic[id]
            children=nodes[id]['children']
            if not children:return fallback(id)
            vals=[aggregate(str(child)) for child in children]
            return fallback(id) if any(v is None for v in vals) else sum(vals)
        for id in nodes:output[id].append(aggregate(id))
    return output,partition_counts

def build_chain(items,pr,ex,off,history,months,index):
    reconstructed,counts=reconstruct(items,pr,ex,history)
    monthly={id:dict(zip(history,values)) for id,values in reconstructed.items()}
    errors=[]
    for line,id in OFFICIAL_LINES.items():
        key=str(id)
        for m in history:
            v=off[line]['values'].get(m)
            if v is not None:
                v*= -1 if line==24 else 1
                estimated=monthly[key][m]
                if estimated is not None:errors.append(abs(estimated-v))
                monthly[key][m]=v
    result={id:dict(mom=[monthly[id][m] for m in months],yoy=linked_yoy(history,monthly[id],index)[-len(months):]) for id in monthly}
    return result,dict(official_monthly_ids=[str(id) for id in OFFICIAL_LINES.values()],
        official_monthly_observations=sum(off[line]['values'].get(m) is not None for line in OFFICIAL_LINES for m in months),
        reconstructed_max_difference_pp=max(errors),frontier_min=min(counts),frontier_max=max(counts))
