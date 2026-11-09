# PCE 權重：大型機構公開方法核對

查核日期：2026-10-19。僅記錄已直接讀取的第一手來源；本檔不修改網站。

## 結論與證據界線

「價格變動率 × 支出權重」確實能在大型銀行研究中找到接近的使用方式，但目前無充分公開證據證明各大投行／Bloomberg 統一使用本網站的「當月名目支出占整體 PCE 比重 × 直接月增率／年增率」完整公式。資料來源相同不代表期間、分母、聚合與連鎖方式相同。

## Scotiabank Economics：有明確乘權重的公開實例，未交代權重參照月份

- 第一手報告：Derek Holt，2026-09-11，*Warm Core CPI, Tame Core PCE—What’s the Fed to Do?*
- [報告原文](https://www.scotiabank.com/ca/en/about/economics/economics-publications/post.other-publications.economic-indicators.scotia-flash.-september-11--2026-.html)
- [Chart 3 原圖](https://www.scotiabank.com/content/dam/scotiabank/global-economics/images/scotia-flash-charts/2026-09-11/Picture3.png/_jcr_content/renditions/cq5dam.web.1280.1280.png)
- 原文："Chart 3 shows the math in converting from core CPI to core PCE that takes account of differing weights on key components."
- 圖名為 "US Core CPI & Core PCE Weights Comparison"，欄位依序為 Core CPI、CPI m/m % change、Core PCE、Diff in weight、Diff in m/m % change。
- 例：Motor Vehicles & Parts 的核心 CPI 權重 8.68，核心 PCE 權重 3.88，權重差 -4.80 個百分點；CPI 月增率 0.3%；圖中轉換影響 -0.01 個百分點，與 `-4.80 / 100 × 0.3 ≈ -0.0144` 四捨五入吻合。
- 能證明：銀行使用價格變動與權重進行通膨預估／轉換的實務。
- 不能證明：權重參照月份、全部最底層 PCE 貢獻算法、直接年增率的加權方式。此處核心 PCE 的分母也與網站的整體 PCE 分母不同。
- 報告發布於當月 PCE 正式公布前，因此其預測流程更不能直接當作「使用已公布當月名目 PCE 支出比重」的證據。

## ING THINK：確認 CPI／PCE 權重與方法有差異，未揭露本題完整公式

- James Knightley，2024-01-11，*Sticky US inflation reduces chances of an early Fed rate cut*
- [第一手原文](https://think.ing.com/articles/sticky-us-inflation-reduces-chances-of-an-early-fed-rate-cut/)
- 原文："The reasons for the divergence are slight methodological differences in the calculations, with weights for key components such as housing and cars, being very different."
- 此報告只支持 CPI 與 PCE 有不同權重，未說明當月／前月／平均權重，不能拿來認證本網站完整算法。

## Dallas Fed：公開可重現的研究算法確實採不同權重

此機構是中央銀行研究機構，並非投行；其用途是補足可查證的技術比較，不能把它標示為大型投行統一慣例。

- [Trimmed Mean PCE 說明](https://www.dallasfed.org/research/pce/descr.aspx)
- [公開 MATLAB 原始碼](https://www.dallasfed.org/~/media/documents/research/pce/tmrates.txt)
- 原始碼自述："using the same methods as used to produce the Federal Reserve Bank of Dallas's trimmed mean PCE inflation rate."
- 原始碼資料註解：價格取 BEA 2.4.4U；實質數量取 2.4.6U，也可使用 `N./P`，N 為 2.4.5U 名目數量。
- 可直接讀到的權重程式：

```matlab
dP(t-1,:) = (P(t,:)-P(t-1,:))./P(t-1,:);
wts1(t-1,:) = (Q(t,:).*P(t-1,:))/(Q(t,:)*P(t-1,:)');
wts2(t-1,:) = (Q(t-1,:).*P(t-1,:))/(Q(t-1,:)*P(t-1,:)');
wts(t-1,:) = .5*wts1(t-1,:) + .5*wts2(t-1,:);
```

亦即權重平均「當期數量按前期價格評價之占比」與「前期名目支出占比」，不是單純當月名目支出占比；之後排序、修剪尾部、重新加權。此方法是 trimmed mean 的特定研究方法，不等同 BEA 整體 PCE 官方貢獻度精確算法。

其 12 個月通膨先逐月累乘 `ptrim(t+1) = (1+dptrim(t))*ptrim(t)` 建立指數，再算 `ptrim(t)/ptrim(t-12)-1`，而非把各品項直接年增率乘上最新單月權重。

## Chicago Fed：預測使用落後權重，與事後完整資料的 Fisher 計算分開

- [Chicago Fed Letter 529，2026](https://www.chicagofed.org/publications/chicago-fed-letter/2026/529)，正文已直接讀取。
- 原文："For the Flash PCE nowcast, we rely on lagged expenditure shares"。
- 其理由為預測時當月支出尚未取得，前月占比可作當月占比的合理代理；文中提醒能源或食品價格劇變可能引發占比變動與預測誤差。
- 對 BEA 正式指數，原文："The BEA uses the Fisher ideal price index"，並解釋結合 Laspeyres（base-period expenditure weights）與 Paasche（current-period expenditure weights）資訊。
- 這不能推成「所有歷史貢獻度都應單純採前月權重」；用途與可得資訊必須分清楚。

## 尚未證實事項

本次沒有取得 Bloomberg、Goldman Sachs、J.P. Morgan 或其他付費研調報告的完整權重期間及貢獻計算規格，不能宣稱一致，也不能由「找不到公開文件」反推其算法與網站必定不同。若要標示某機構同口徑，需有該產品／圖表的方法文件或能逐項對數值的可重現資料。

## BEA 官方與本專案實作的直接比較

- [BEA NIPA Handbook 第 4 章](https://www.bea.gov/resources/methodologies/nipa-handbook/pdf/chapter-04.pdf)，4-18–4-19：Fisher 價格指數結合 Laspeyres 與 Paasche；月度鏈式指數使用相同公式。4-27–4-28 另介紹精確成長貢獻與加總方式（該處展示數量貢獻公式，不能直接當作價格貢獻公式）。
- [Chicago Fed Letter 529 技術附錄](https://www.chicagofed.org/-/media/publications/chicago-fed-letter/2026/cfl529-appendix.pdf?sc_lang=en&hash=2103D22FB3F9B6DE18B41A899D25C3D9)，第 1 頁公式 (1)–(3) 明確用月度價格相對數與當期、前期名目支出占比說明 Fisher PCE。以 `r_i = P_i(t)/P_i(t-1)`、`s_i` 為小數支出占比表示：`L = Σ s_i(t−1) r_i`、`P = 1 / Σ[s_i(t)/r_i]`、`F = √(L P)`。預測時另令估計當期占比等於前月占比。
- 網站目前 `pce_contrib.py` 採 `weight = 100 × sign × nominal_i(t) / nominal_total(t)`，並分別用一個月與十二個月的自身指數漲幅乘該當月權重。這不是上述 Fisher 公式，也不是 Dallas Fed 的調整後兩期平均權重。
- `當月占比 × 自身漲幅` 亦不能直接稱為精確 Paasche 指數貢獻：Paasche 的聚合涉及價格相對數的調和形式，不是以當月名目比重作簡單算術平均。

## 對本網站的建議

1. 保留目前公式時，應標示「當月支出權重加權估算」，不能標示「Bloomberg／投行同口徑」或「BEA 官方貢獻度」。採 BEA 名目支出作權重基礎有第一手依據，但權重期間和完整公式仍需分開說明。
2. 若目標是更接近官方 PCE 的貢獻分析，優先以可取得的 BEA 官方貢獻作基準；完整細項另設兩期價格／名目支出 Fisher 重建或有明確文件的近似法，持續揭露與官方差額。不能保證用公開四捨五入產品表即可完全重現官方底層結果。
3. 年增貢獻的十二個月連結／分配規則應另外定義與驗證。不能把「本月年增率 × 本月占比」直接宣稱等於官方年度鏈式貢獻。
4. 不應單憑預測機構使用落後權重，就把歷史資料的權重一律改為上月；當期資料是否已公布是關鍵。

本次只完成查核與建議，沒有改動應用程式或計算結果。
