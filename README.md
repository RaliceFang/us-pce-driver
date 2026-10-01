# US PCE Driver — 美國 PCE 物價細項貢獻度

參考 [US CPI Driver](https://github.com/JasonShin1996/us-cpi-driver) 的 Python 資料流程、静態儀表板及發布檢查架構，重新建立適用於 BEA PCE 的計算。主圖使用 **BEA 官方價格貢獻度**，細項表提供 **73 個產品的 Fisher 重建估算**。本專案是獨立新專案，未修改原 CPI 專案。

## 使用

```bash
cd us-pce-driver
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python pce_contrib.py
python checks.py
python -m unittest discover -s tests -v
python -m http.server 8000 --directory web
```

開啟 <http://localhost:8000>。已附 1990-01 至 2026-08 的真實資料，不重抓也可直接預覽。
本機另外產生 `pce_dashboard_standalone.html`，可以直接開啟觀看內嵌圖表及細項表；獨立檔的 CSV 與方法論連結需要旁邊的 `web/` 資料夾。

不需 BEA / FRED API 金鑰，執行目錄不影響輸出位置。本次用於驗證的兩份原始 Excel 存在 `cache/`，不提交版本控制。

```bash
python pce_contrib.py --offline             # 明確使用本機原始資料版本
python pce_contrib.py --start 2000-01       # 自訂起點，仍會取得鏈接所需前期資料
python pce_contrib.py --max-level 5         # 更深的階層，沒有完整歷史者保留母項
```

## 網頁功能

- 繁體中文 / English，記住語言與網址設定。
- MoM / YoY；四大類、六細項、16 官方主要產品、73 重建產品。
- 正負堆疊柱、整體與核心價格漲幅折線、明列差額、滑鼠讀值。
- 1 / 3 / 5 / 10 年及全部歷史；點圖中的月份同步更新數值與細項表。
- 細項中英文搜尋、月份選擇、最底層排序及完整階層。
- 圖表長表 CSV、完整細項歷史 CSV、完整 JSON、資料檢查報告。

73 產品圖中的柱按四大類聚合，避免 73 段與重複顏色難以辨識。各產品貢獻在下方表格與下載中完整保留。完整階層中的母項與子項不能一起加總。

## 資料及計算

| BEA 表 | 使用方式 |
|---|---|
| 2.8.8（月） | 官方價格月增率貢獻（不是實質消費成長貢獻 2.8.2） |
| 2.8.4 / 2.8.5（月） | 官方主要細項價格 / 名目支出；交叉驗證 |
| 2.4.4U / 2.4.5U（月） | 詳細產品價格 / 名目支出；Fisher 重建 |

來源：[BEA 主表 Excel](https://apps.bea.gov/national/Release/XLS/Survey/Section2All_xls.xlsx)、[BEA 細項 Excel](https://apps.bea.gov/national/Release/XLS/Underlying/Section2All_xls.xlsx)。發布日期及檔案 SHA-256 存在 JSON 的 `meta.sources`。

PCE 使用鏈式 Fisher 指數，不可套用 CPI 的固定籃子或 BLS 年度 relative importance。
MoM 未年率化；**MoM 和 YoY 均使用季調 PCE 價格指數**。年貢獻由官方月貢獻鏈接，屬本專案的年度分配方法。它不是 BEA 發布的年度貢獻序列。

```
c_y(i,t) = sum[c_m(i,j) × I_headline(j−1) / I_headline(t−12)]
           j = t−11,...,t
```

Fisher 細項用兩個相鄰月份的名目占比與價格相對值計算。逐月細項能加總到重建的 Fisher 漲幅；與官方指數的差額分列，未強制分配。減項以負支出處理，境外淨支出無價格時拆成有價格的支出與扣減。細項母項貢獻是所選葉節點加總，並非重複計算母項。

食物僅指供居家消費的食物與飲料，含酒精飲料；**餐飲服務屬核心服務**。核心折線是核心指數漲幅，與核心對整體 PCE 的貢獻不同。詳見 [方法論頁](web/methodology.html)（中英文）及 [資料陷阱](PITFALLS.md)。

公用事業跨越能源與核心服務的分類界線，因此即使到達指定深度，也會繼續拆成供水／衛生與電力／天然氣。每月四大類細項的名目支出都與 BEA 官方分類總額核對。

## 驗證結果（2026-09-30 BEA 發布版本）

覆蓋 1990-01 至 2026-08，共 440 個月。價格與名目支出在主表及細項表逐列逐月完全相同，共 **15,840 筆**比對。

| 驗證 | 結果 |
|---|---|
| 73 葉節點的名目支出覆蓋 | 99.9998%–100.0001%（整數百萬美元四捨五入） |
| 73 葉節點彙總 vs 16 官方主要细項月貢獻 | 最大差 0.0133 pp |
| Fisher 重建 vs 官方總體月漲幅 | 最大差額 0.0409 pp |
| 官方 16 細項 vs 官方總體月漲幅 | 最大差額 0.0347 pp |
| 官方 16 細項鏈接 vs 官方總體年漲幅 | 最大差額 0.1189 pp |

2026-08 整體 MoM **0.3103%**、YoY **3.4190%**；核心 MoM **0.2474%**、YoY **3.0076%**。以上由 BEA 三位小數指數計算，與新聞稿取一位小數的發布值精度不同。

這是同一 BEA 發布版本不同表格的交叉驗證，沒有宣稱已與 Bloomberg 或獨立供應商對帳。
最新執行檢查見 `web/data/validation.json`。測試涵蓋獨立價格×數量的 Fisher 重建、年鏈接方向、負支出、通縮、缺值及日曆斷點。

## 結構

```
pce_contrib.py             抓資料 → 官方貢獻與 Fisher 細項 → JSON / JS / CSV
pce/source.py              Excel 下載、格式與發布版本检查、列號 / 月份解析
pce/catalog.py             BEA 階層、中文名稱、負支出、互斥葉節點
pce/math.py                Fisher 加法分解、價格漲幅、年鏈接
checks.py                  發布前資料檢查與原始 BEA 值比對
tests/test_math.py         數學與缺值測試（標準函式庫 unittest）
web/index.html             雙語互動儀表板（不需外部圖表 CDN）
web/methodology.html       雙語方法論
web/data/                 可直接預覽的真實資料、CSV 與驗證記錄
.github/workflows/        更新資料及 GitHub Pages 發布
```

前端 JSON 的 `meta.months` 是所有序列共用的月份索引。`headline` 包含整體／核心 MoM、YoY；`breakdowns` 包含每組細項及差額；`items` 描述所選產品階層，`series[id]` 包含月／年貢獻、當月支出占比及自身價格漲幅。缺值以 `null` 表示。所有價格漲幅以百分比表示、貢獻以百分點表示。完整細項 CSV 僅匯出互斥最底層，避免下游把母項及子項重複加總。

## 自動更新與發布

本機專案已備妥工作流程，尚未建立遠端 GitHub repository 或發布網站。將此資料夾放入以 `main` 為主分支的 repository，GitHub → Settings → Pages → Source 選 **GitHub Actions**，即可發布 `web/`。

平日 15:30 UTC（台灣 23:30）下載最新兩份 BEA 檔，完整重算歷史。通過測試與檢查後才提交有變更的資料，再直接呼叫發布流程；避免 `GITHUB_TOKEN` 的 push 不會觸發另一個流程的問題。來源指紋未變時不因執行時間產生每日空更新。手動更新：Actions → Update PCE data → Run workflow。

兩份工作簿發布日期或最新月份不一致時停止，下一個平日再試。網路失敗也停止，不會把舊快取宣稱為最新。BEA 歷史修訂會重算反映在圖表中，Git 保留每個已提交的發布版本。
