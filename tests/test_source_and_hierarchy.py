import unittest
from pce.catalog import hierarchy
from pce.source import numeric, read_table

class FakeSheet:
    def __init__(self,rows):self.values=iter(rows)

class SourceTests(unittest.TestCase):
    def test_dots_and_zero_are_distinct(self):
        self.assertIsNone(numeric('.....'));self.assertIsNone(numeric(None))
        self.assertEqual(numeric(0),0)

    def test_month_headers_and_duplicate_series_codes(self):
        rows=[('Table',),('Units',),('Range',),('BEA',),('Published',),
              ('Line',None,None,'2025M12','2026M01','2026Q1'),
              ('1','Root','REPEATED',100,101,999),('2','Goods','REPEATED',100,'.....',999)]
        d=read_table({'S':FakeSheet(rows)},'S')
        self.assertEqual(d['months'],['2025-12','2026-01'])
        self.assertEqual(len(d['rows']),2)
        self.assertIsNone(d['rows'][2]['values']['2026-01'])

    def test_duplicate_line_rejected(self):
        rows=[('Table',),('Units',),('Range',),('BEA',),('Published',),
              ('Line',None,None,'2026M01'),('1','Root','R',100),('1','Again','R',100)]
        with self.assertRaises(ValueError):read_table({'S':FakeSheet(rows)},'S')

class HierarchyTests(unittest.TestCase):
    def fixture(self):
        # Net NPISH = gross output 55 less receipts 35 = 20, not 90.
        definitions=[(1,'Root',6,100),(2,'Goods',0,80),(150,'Services',0,20),
                     (151,'Household services',2,0),(342,'Net NPISH',2,20),
                     (343,'Gross output',4,55),(356,'Less: Sales receipts',4,35)]
        prices={'rows':{i:dict(name=name,indent=indent,code='SAME',values={'2026-01':100})
                        for i,name,indent,value in definitions}}
        spending={'rows':{i:dict(values={'2026-01':value}) for i,name,indent,value in definitions}}
        return prices,spending

    def test_signed_receipts_and_nonoverlapping_frontier(self):
        prices,spending=self.fixture();items,leaves=hierarchy(prices,spending,['2026-01'],4)
        nodes={n['line']:n for n in items}
        self.assertEqual(nodes[356]['sign'],-1)
        self.assertNotIn(342,leaves)
        self.assertEqual(sum(nodes[i]['sign']*spending['rows'][i]['values']['2026-01'] for i in leaves),100)

    def test_bad_children_hold_valid_parent(self):
        prices,spending=self.fixture();spending['rows'][343]['values']['2026-01']=99
        items,leaves=hierarchy(prices,spending,['2026-01'],4)
        self.assertIn(342,leaves)
        self.assertNotIn(343,leaves)

    def test_unpriced_nonadditive_parent_rejected(self):
        prices,spending=self.fixture();prices['rows'][342]['values']['2026-01']=None
        prices['rows'][150]['values']['2026-01']=None
        prices['rows'][1]['values']['2026-01']=None
        spending['rows'][343]['values']['2026-01']=99
        with self.assertRaises(ValueError):hierarchy(prices,spending,['2026-01'],4)

if __name__=='__main__':unittest.main()
