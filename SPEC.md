# 美國 PCE 通膨貢獻度：AGENTS.md 調整規格

本文件針對既有 `us-pce-driver` 專案，依上層工作區的 [AGENTS.md](../AGENTS.md) 訂定新版應用規格。這次調整的是規格，並非已完成框架遷移。既有 GitHub Pages 網站及原始 Python 計算維持現狀。

使用者已確認公開介面需要繁體中文、簡體中文及英文。

## 1. 保留的功能及計算

保留 BEA 公開資料來源、原始價格與支出比對、Fisher 計算、逐月鏈接年貢獻及發布前檢查，不因更換網站框架改變財務統計口徑。

| 功能 | 新版要求 |
|---|---|
| 變動率 | MoM / YoY；兩者均使用季調指數，MoM 未年率化 |
| 四大類 | 食物、能源、核心商品、核心服務 |
| 六細項 | 食物、能源商品、能源服務、核心商品、住宅、不含住宅核心服務 |
| 官方主要產品 | 16 個 BEA 官方主要細項 |
| 詳細產品 | 現有發布版本為 73 個 Fisher 重建產品細項，數量隨資料與階層設定衍生，介面不能硬寫 73 |
| 圖表 | 正負堆疊柱、整體及核心漲幅折線、加總差額、讀值提示 |
| 期間 | 1 / 3 / 5 / 10 年及全部歷史，選項從具型別設定衍生 |
| 月份 | 選取月份同步更新摘要卡與細項表 |
| 細項表 | 中英文搜尋、葉節點排序、完整父子階層、名目占比與自身漲幅 |
| 匯出 | 圖表 CSV、完整互斥葉節點歷史 CSV、公開 JSON 及驗證報告 |

核心折線是核心指數漲幅，不是核心對整體的貢獻。月官方貢獻使用 BEA 2.8.8；年貢獻是本專案採用的逐月鏈接分配。詳細產品使用 2.4.4U 價格與 2.4.5U 名目支出重建 Fisher，須標示估算並保留差額，不得強制分攤。

缺值保留 `null`，不填零；負支出扣減保留負號。母項與子項不可同時加總。公用事業須拆分供水／衛生與電力／天然氣，維持能源與核心服務的分類核對。詳細產品圖可按四大類彙總，但表格及匯出須保留個別产品。

PCE 指數漲幅、貢獻百分點及支出占比均不需要貨幣換算，因此初版不加入幣別選單。若日後加入金額及幣別選擇，其資料轉換必須透過 TanStack Start server function。

## 2. 應用框架及路由

- 前端重建為 TypeScript、React、`@tanstack/react-start` 與 TanStack Router。
- 使用 `src/routes` 的檔案式路由；入口、route tree、loader 與資料載入相容 TanStack Start SSR。
- `vite.config.ts` 使用官方 `tanstackStart()` plugin。
- 不延用現有單檔 HTML 作為新版應用，不使用 hash 作為獨立路由，也不引入 Next.js、Remix、React Router framework mode、自訂 Express / Hono server。
- `/` 導向 `/zh-tw`。語言路由是 `/zh-tw`、`/zh-cn`、`/en`。
- 方法論為對應語言下的頁面，例如 `/zh-tw/methodology`，使用檔案式路由。
- 不支援的 locale 導向 `/zh-tw` 或明確顯示找不到頁面，不能渲染未支援語言。
- 語言切換更新 URL 路徑；圖表變動率、拆解、範圍及月份可用 Router 驗證過的 search parameters 保存，不沿用 `#lang=...`。
- 直接開啟語言網址、重新整理及返回上一頁均須正常。

## 3. 資料存取與更新

保留 `pce_contrib.py`、`pce/`、`checks.py` 與既有原始資料更新流程。它們是離線資料建置工具，不是應用程式 API server。新版應用讀取其驗證通過的公開資料版本。

### 公開資料快照

- 現有 `web/data/pce_data.json` 可作為公開、靜態且不含秘密的來源快照。
- 以 server-only 模組直接匯入／讀取建置時資料，或按需要直接匯入公開本機 JSON；不得把完整歷史無條件塞入每個頁面的初始回應。
- 若透過伺服器整理資料，提供 colocated `createServerFn`，例如 `getPceDashboard` 與 `getPceDetail`。
- Server function 驗證變動率、拆解、範圍、月份等輸入。月份須存在於快照；拆解及選項須來自共用具型別設定。
- Route loader 或 `useServerFn` 直接呼叫函式，回傳所需範圍的圖表資料及當月細項。
- 不建立 `/api/*`、REST、GraphQL、tRPC 或回傳 JSON 的自訂 route handler，也不由瀏覽器 fetch 本應用的資料 API。
- 完整 JSON、CSV 與驗證報告可作為公開靜態下載檔案；下載連結不是自訂 API。
- 現有 `pce_data.js` 全域變數載入方式在新版移除，不透過 `window.PCE_DATA` 管理應用資料。

### 資料維護

- 保留 BEA 兩份工作簿的發布日期、最新月份與 SHA-256 來源紀錄。
- 保留下載格式驗證、同發布版本檢查、名目支出覆蓋、分類核對、父子加總與差額檢查。
- 來源下載失敗或版本不一致時停止更新，不以舊快取冒充新發布版本。
- 網站展示目前快照資料月份及取得／產生時間；資料落後的提示不等同資料已被更新。
- 初版不新增瀏覽器端直接抓 BEA 的功能。若加入即時第三方存取，須放在 server function 及 server-only 模組，私密設定只在伺服器使用。
- 既有排程可繼續更新資料，但框架遷移後不得自動將 Workers 發布到 Cloudflare。資料更新與正式應用部署分開處理。

## 4. 三語、品牌及 UI

- 使用 `i18next` 字典管理公開 UI，放在 `src/i18n/locales/zh-tw.json`、`zh-cn.json`、`en.json`。
- 標題、摘要、控制項、圖表圖例、tooltip、表頭、空值與錯誤、方法論、下載文字均納入三語。
- 官方英文細項名稱保留，中文名稱由既有翻譯建立繁中及簡中對照，不改變資料 ID 或使用文字推斷會計分類。
- 每個 SSR 請求有自己的 locale / 翻譯狀態，避免跨請求全域變更語言。
- 語言、拆解、範圍與顯示選項來自具型別來源，避免在前後端各自硬編碼。
- 控制項、卡片、選單、輸入、表格、提示使用 shadcn/ui；透過官方 pnpm 工作流程加入元件。
- 使用 Tailwind、shadcn design tokens 及 AGENTS.md 的 MacroMicro 色盤；保留每一類固定且易辨識的圖表顏色。
- Favicon 及三語 Logo 使用 AGENTS.md 指定 URL，根據 locale 切換。
- 控制項提供 labels、鍵盤操作及可見焦點。圖表數值亦由語意化資料表提供；手機不得把日期及刻度縮到無法閱讀。
- 圖表可使用專用繪圖函式庫或 React SVG，SSR 與 hydration 必須相容；若圖表需要 browser API，只延後該元件的瀏覽器專屬部分。

## 5. 建議結構與套件管理

```text
us-pce-driver/
  SPEC.md
  package.json
  pnpm-lock.yaml
  vite.config.ts
  src/
    router.tsx
    routes/
      __root.tsx
      index.tsx
      $locale.tsx
      $locale.index.tsx
      $locale.methodology.tsx
    features/pce/
      catalog.ts
      types.ts
      dashboard.functions.ts
      snapshot.server.ts
      dashboard.tsx
      contribution-chart.tsx
      detail-table.tsx
    components/ui/
    i18n/locales/
  public/data/                 建置時同步的公開靜態匯出
  pce_contrib.py              保留 Python 資料產生器
  pce/                       保留來源、分類與數學計算
  checks.py                  保留資料驗證
  tests/                     保留 Python 測試
  web/data/                  現有資料產生器輸出，遷移時核對輸出位置
```

具體路由及入口檔名依實作時的官方 TanStack Start 設定調整。舊 `web/index.html`、`web/methodology.html` 與單檔預覽屬原版網站，不再作為新版應用入口。遷移前不刪除舊版，以保留現有網站與比較基準。

只使用 pnpm 管理應用套件及 scripts，先確認已安裝。Python 是資料工具；可由 pnpm scripts 呼叫 Python 更新與檢查，不以其他 JavaScript 套件管理器建立第二套 lockfile。

## 6. 遷移驗收

1. 相同資料版本下，新舊網站所有 MoM / YoY、占比、核心漲幅、各組貢獻與差額相符；不得因顯示語言或前端重構改變數值。
2. 保留既有 Python 數學及資料解析測試、BEA 原始資料比對；透過 `pnpm test` 統一執行既有與新增測試。
3. 驗證 server function 的合法選項及無效輸入、月份切換、缺值與負值、完整階層不可重複加總。
4. 型別／依賴修改後執行 `pnpm exec tsc --noEmit`；另驗證正式 build。
5. 檢查三語路由、直接載入／重新整理、SSR hydration、返回操作、圖表及 CSV 下載、手機／桌面版面。
6. 檢查瀏覽器沒有自製資料 API 呼叫、秘密、伺服器專屬依賴或無條件載入整份資料的問題。
7. 既有數據驗證結果以來源版本為基準，不能把舊發布版本的 440 個月、73 葉節點等統計硬寫為未來固定數量。

## 7. Cloudflare Workers 配置與發布界線

若進行部署配置，依 AGENTS.md 使用 Cloudflare Workers：

- `wrangler.jsonc` 採 `@tanstack/react-start/server-entry`，啟用 `nodejs_compat`、observability，compatibility date 設為配置當日。
- `vite.config.ts` 的 `cloudflare({ viteEnvironment: { name: 'ssr' } })` plugin 放在 `tanstackStart()` 前。
- 多個 Cloudflare 帳號時，確認目的帳號後將 `account_id` 寫入配置，不猜測帳號。
- bindings 只在伺服器端使用；變更配置後以 `pnpm run cf-typegen` 產生型別。
- 完成 typecheck、tests、build、`pnpm run preview`，必要時只做 Wrangler dry run。
- AGENTS.md 明確要求「do not deploy yourself」：不得執行實際 `wrangler deploy`、`pnpm run deploy` 或建立自動發布 Workers 的流程。正式部署由使用者手動完成。

目前公開的 GitHub Pages 網站不因本文件而改變。實作與驗證完成後，另整理新的手動部署方式及舊網址處理方案；不直接把未遷移完成的版本推上 `main` 触發既有 Pages 發布。

## 8. 建議執行順序

1. 在 PCE 專案建立遷移分支並保存現有基準。
2. 建立 TanStack Start、三語 Router、i18next 與 shadcn/ui。
3. 接入既有公開資料快照與驗證輸入的 server functions。
4. 遷移摘要、圖表、細項表、下載及方法論。
5. 完成新舊數據對帳、型別檢查、測試及版面驗證。
6. 完成 Cloudflare 配置、typegen 與本機預覽；交付手動部署說明，不自行部署。
