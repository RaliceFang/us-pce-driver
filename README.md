# US PCE Driver — 美國 PCE 通膨貢獻拆解

使用 TanStack Start SSR、TanStack Router、shadcn/ui 與 i18next。應用資料透過 `createServerFn` 讀取本機公開快照，不使用應用資料 API。公開語言路徑為 `/zh-tw`、`/zh-cn` 與 `/en`，根路徑導向 `/zh-tw`。本次產品階層介面與方法說明先更新繁體中文，表格保留各項英文名稱。

## 完整 BEA 產品階層

- 價格來源：BEA Table 2.4.4U；權重來源：Table 2.4.5U 當月名目支出。
- 保留產品第 1–368 列；附加項從第 369 列起，因分類重疊而不納入。
- 月增率 = `(當月指數 / 上月指數 − 1) × 100`；年增率使用去年同月指數。
- 權重（%）= `該項當月名目支出 / 整體當月名目支出 × 100`，扣減項及其後代使用負號。
- 月度 Table 2.8.8 已公布的 24 個產品列直接採用官方貢獻（含公布精度）；其餘細項使用相鄰兩期價格與支出、以 BEA 手冊數量貢獻式的價格對偶重建 Fisher。
- 年增貢獻由月貢獻按整體價格指數逐月鏈接，不再以直接年增率乘當月支出比。這是鏈接歸因，非 BEA 直接公布的月度 YoY 序列。
- 所選母項模式獨立重建母項下的局部 Fisher，年增按母項價格指數鏈接；不以整體貢獻除當期支出比轉換。
- 公開資料精度、底層與季年度調整限制會留下差額。圖表灰柱及表格底部保留基準與子項合計的差額；不強制配平。表格逐列標明官方、Fisher 重建或年增鏈接來源。
- 當期支出比僅供參考，不是完整 Fisher 計算權重。無資料不補零，完整底層無法使用時回退至可用的上層計算，原始細項仍保留。
- `web/data/validation.json` 含 官方月度精確比對統計，及最新季度 2.4.8 的 Fisher 重建對照與殘差。

## 開發與驗證

```sh
pnpm install
pnpm run dev
pnpm exec tsc --noEmit
pnpm test
pnpm run build
pnpm run preview
```

本機預覽：<http://127.0.0.1:3000/zh-tw>。

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python pce_contrib.py --offline
.venv/bin/python checks.py
.venv/bin/python -m unittest discover -s tests -v
```

移除 `--offline` 才會下載 BEA 新版檔案。`--max-level` 僅保留命令相容性，不再裁切產品階層。驗證逐項核對原始價格、名目支出、當期支出比、官方月貢獻、年增鏈接與 Fisher 對偶公式。

`web/data/pce_detail_mom.csv` 與 `pce_detail_yoy.csv` 含所有產品列及階層葉節點標記。舊官方四類、六類與十六類 CSV 保留供歷史使用，不是新版互動圖表的資料來源。建置時同步公開 JSON/CSV 至 `public/data/`。`web/index.html` 為舊版靜態介面，新版應從 `src/` 建置執行。

## 部署

目標為 Cloudflare Workers，配置在 `wrangler.jsonc`。`vite.config.ts` 中 Cloudflare plugin 位於 `tanstackStart()` 之前。Cloudflare Workers Builds 從 GitHub `main` 建置並部署。正式發布前必須將完整程式、計算模組、測試及產製資料一起提交並推送；僅本機部署會在下一次自動更新時被 GitHub 舊程式覆蓋。

`.github/workflows/update.yml` 下載 BEA 來源、執行 Python 驗證，並通過 TypeScript、前端測試及正式建置後，才提交新資料。`validate.yml` 對推送與 PR 執行應用驗證。`pages.yml` 另維護歷史靜態站；正式互動網站由 Cloudflare 建置 `src/`。
