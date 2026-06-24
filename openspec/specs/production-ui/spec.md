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
