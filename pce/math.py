"""All rates in percent; contributions in percentage points, not annualized."""
import math

def rate(current, base):
    if current is None or base is None or base <= 0:
        return None
    return 100 * (current / base - 1)

def linked_yoy(months, monthly, index):
    """Exact telescoping of price-level changes, NOT a sum of monthly rates.

    c_y(t) = sum[c_m(j) * I(j-1)/I(t-12)], j=t-11,...,t.
    Calendar gaps invalidate the window. Rounded official c_m retains a residual.
    """
    result = []
    for i, month in enumerate(months):
        if i < 12 or index.get(months[i-12]) in (None, 0):
            result.append(None)
            continue
        window = months[i-12:i+1]
        ordinals = [int(m[:4])*12+int(m[5:]) for m in window]
        if any(b-a != 1 for a, b in zip(ordinals, ordinals[1:])):
            result.append(None)
            continue
        pieces = [monthly.get(months[j]) for j in range(i-11, i+1)]
        preceding = [index.get(months[j-1]) for j in range(i-11, i+1)]
        if any(v is None for v in pieces + preceding):
            result.append(None)
            continue
        base = index[months[i-12]]
        result.append(sum(c*p/base for c, p in zip(pieces, preceding)))
    return result

def fisher_contributions(prices0, prices1, spending0, spending1):
    """Exact additive decomposition of a reconstructed bilateral Fisher index.

    Signed expenditures permit explicit Less: branches. Normalize only rounding
    in complete, validated partitions; callers must validate total coverage.
    L=sum(s0*r); P=1/sum(s1/r); F=sqrt(L*P).
    c_i=100*P/(F+1)*(s0_i+s1_i/r_i)*(r_i-1).
    Sum(c_i)=100*(F-1). This does not assert equality to BEA's full index.
    """
    arrays = (prices0, prices1, spending0, spending1)
    if not prices0 or len({len(a) for a in arrays}) != 1:
        raise ValueError("Fisher inputs must have equal nonzero lengths")
    if any(v is None or not math.isfinite(v) for a in arrays for v in a):
        raise ValueError("Missing or nonfinite Fisher input")
    if any(v <= 0 for a in (prices0, prices1) for v in a):
        raise ValueError("Prices must be positive")
    total0, total1 = sum(spending0), sum(spending1)
    if min(total0, total1) <= 0:
        raise ValueError("Net expenditures must be positive")
    s0, s1 = [v/total0 for v in spending0], [v/total1 for v in spending1]
    r = [b/a for a, b in zip(prices0, prices1)]
    L = sum(s*x for s, x in zip(s0, r))
    denominator = sum(s/x for s, x in zip(s1, r))
    if L <= 0 or denominator <= 0:
        raise ValueError("Invalid signed Fisher aggregate")
    P = 1/denominator
    F = math.sqrt(L*P)
    c = [100*P/(F+1)*(a+b/x)*(x-1) for a, b, x in zip(s0, s1, r)]
    return c, 100*(F-1)
