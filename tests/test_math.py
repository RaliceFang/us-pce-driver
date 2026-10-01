import unittest
from pce.math import fisher_contributions, linked_yoy, rate

class ContributionTests(unittest.TestCase):
    def test_uniform_price_change(self):
        c,g=fisher_contributions([100,100],[110,110],[75,25],[82.5,27.5])
        self.assertAlmostEqual(g,10)
        self.assertAlmostEqual(c[0],7.5)
        self.assertAlmostEqual(c[1],2.5)

    def test_variable_basket_independent_cross_valuation(self):
        p0,p1=[100,40],[130,32]
        q0,q1=[3,2],[2,4]
        v0=[p*q for p,q in zip(p0,q0)];v1=[p*q for p,q in zip(p1,q1)]
        c,g=fisher_contributions(p0,p1,v0,v1)
        L=sum(p*q for p,q in zip(p1,q0))/sum(v0)
        P=sum(v1)/sum(p*q for p,q in zip(p0,q1))
        self.assertAlmostEqual(g,100*((L*P)**.5-1))
        self.assertAlmostEqual(sum(c),g)
        self.assertGreater(c[0],0);self.assertLess(c[1],0)

    def test_signed_deduction(self):
        c,g=fisher_contributions([100,100],[110,110],[120,-20],[132,-22])
        self.assertAlmostEqual(c[0],12)
        self.assertAlmostEqual(c[1],-2)
        self.assertAlmostEqual(sum(c),10)

    def test_no_change_and_deflation(self):
        for price,expected in [(100,0),(90,-10)]:
            c,g=fisher_contributions([100],[price],[100],[price])
            self.assertAlmostEqual(g,expected);self.assertAlmostEqual(c[0],expected)

    def test_missing_prices_not_zero(self):
        self.assertIsNone(rate(None,100))
        with self.assertRaises(ValueError):
            fisher_contributions([None],[110],[100],[110])

    def test_yoy_telescoping_order(self):
        months=[f'2025-{i:02d}' for i in range(1,13)]+['2026-01']
        index={months[0]:100,months[1]:110,**{m:132 for m in months[2:]}}
        contributions={m:0 for m in months};contributions[months[1]]=5;contributions[months[2]]=10
        # 5 + 10*110/100 = 16, half the official cumulative 32%.
        self.assertAlmostEqual(linked_yoy(months,contributions,index)[-1],16)

    def test_yoy_gap_and_missing(self):
        months=[f'2025-{i:02d}' for i in range(1,13)]+['2026-02']
        self.assertIsNone(linked_yoy(months,{m:0 for m in months},{m:100 for m in months})[-1])
        months[-1]='2026-01'
        self.assertIsNone(linked_yoy(months,{m:None for m in months},{m:100 for m in months})[-1])

if __name__=='__main__':unittest.main()
