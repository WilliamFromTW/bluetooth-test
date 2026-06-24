## Context
目前的 UI 架構基於頁籤（Tabs）設計，在日常除錯上足夠使用，但不符合生產線人員的高頻、防呆與免捲動需求。作業員需要一眼看出連線狀態，並能快速進行操作而不會被過多選項干擾。

## Goals / Non-Goals

**Goals:**
- 將介面整合為單頁無捲軸佈局（高度鎖定 100vh）。
- 移除多餘的工程設定按鈕（收入進階設定 Modal）。
- 將狀態顯示與斷開連線按鈕結合為單一巨型卡片。
- 日誌區塊微縮化為單行跑馬燈。

**Non-Goals:**
- 不改變後端 API 的邏輯。
- 不修改底層藍牙連線通訊機制。

## Decisions
- **採用 Flexbox 單頁配置**：放棄目前的 Flow layout，利用外層 `height: 100vh; overflow: hidden;` 來限制高度，並只讓設備清單局部設定 `overflow-y: auto`。
- **整合狀態卡片**：將原先的狀態指示燈、目標名稱和斷開按鈕合併。利用 JavaScript 監聽卡片點擊事件，當處於已連線狀態時，點擊直接呼叫 `/api/disconnect`。
- **設定區塊 Modal 化**：在 UI 右上角新增一個「⚙️ 進階設定」按鈕，點擊後打開覆蓋式的 Modal，裝載 UUID 設定、Hex/Text 模式等，以降低主畫面雜訊。

## Risks / Trade-offs
- **風險**：如果設備名稱或 MAC 位址過長，可能會破壞狀態卡片排版。
  - **緩解**：針對卡片內的文字區塊加上 `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`，確保文字不會換行撐破版面。
