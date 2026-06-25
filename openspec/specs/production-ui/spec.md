# Capability: production-ui

## Purpose
TBD: Production UI layout and components for streamlined interaction.

## Requirements

### Requirement: 整合式狀態按鈕
系統必須（MUST）提供一個大型狀態卡片，顯示連線狀態與目標設備的 MAC Address，並能在點擊時直接斷開連線。

#### Scenario: 點擊狀態按鈕斷開連線
- **WHEN** 系統處於「已連線」狀態，使用者點擊該狀態卡片
- **THEN** 系統必須中斷藍牙連線，並將狀態恢復為「未連線」

### Requirement: 微縮化系統狀態列
系統必須（MUST）將互動日誌區塊微縮至主畫面底部，僅顯示最新的一行系統訊息。

#### Scenario: 日誌更新顯示
- **WHEN** 系統產生新的日誌或訊息
- **THEN** 系統必須只在底部狀態列區域顯示該最新訊息，過往訊息需收納至歷史日誌檢視器中

### Requirement: 介面元素完整多語系支援
系統必須（MUST）支援多國語言（i18n），確保所有介面元素能完整呈現對應的語系文字。

#### Scenario: 切換語系顯示
- **WHEN** 使用者切換語言設定
- **THEN** 系統所有的介面元素必須更新為所選擇的語言

### Requirement: 產線操作介面微縮化佈局 (1024x600 最佳化)
- **Context**: 樹莓派工控觸控螢幕受限於垂直高度 (600px)，需最大化核心操作區塊的顯示面積。
- **Details**:
  - 「更新清單」控制項需整合至標題列以釋放左欄高度，確保藍牙列表能顯示更多項目。
  - 指令發送區塊需視覺微縮。
  - 測試結果檢視區(回應資料與OK/NG字樣)必須強制為 1:1 絕對等寬分割，避免巨型字型撐破彈性容器。
