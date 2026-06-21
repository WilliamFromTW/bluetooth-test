# Capability: ble-web-dashboard

## Purpose
TBD: Web dashboard interface for interacting with BLE devices, allowing users to configure UUIDs, connect to devices, send commands, and view logs and responses.

## Requirements

### Requirement: 藍牙連線設定與控制面板
Web 介面必須提供輸入欄位讓使用者設定 Service UUID、Write/Read/Notify Character UUID，以及點擊連線或中斷連線的按鈕。

#### Scenario: 使用者輸入設定並連線
- **WHEN** 使用者輸入正確的 UUID 格式並點擊「連線」按鈕
- **THEN** Web 介面必須顯示連線中狀態，並在連線成功後顯示「已連線」狀態及啟用操作控制項

### Requirement: 命令發送與回應顯示區
Web 介面必須提供命令輸入框與「送出」按鈕以向 Write UUID 發送命令，並提供一個專用的日誌（Log）區域來顯示從 Read/Notify UUID 取得的裝置回應。

#### Scenario: 發送命令並查閱日誌
- **WHEN** 使用者在輸入框輸入命令並點擊「送出」，且後端成功執行
- **THEN** Web 介面必須將送出的命令紀錄至日誌區，並在收到回應後，以時間戳記排序即時更新並顯示於日誌區

### Requirement: 雙分頁與戰情室級別 UI (Barcode-Friendly)
Web 介面必須分離設定與主要操作區，提供專為產線環境與條碼機設計的巨大化指令輸入框與全景佈局。

#### Scenario: 掃描條碼並查看測試結果
- **WHEN** 產線作業員切換至主要控制頁面，並透過實體條碼機輸入長字串指令
- **THEN** 介面頂部的巨大化指令框必須能完整容納字串，並能讓作業員透過右下方大型的 OK/NG 狀態燈 (`setTestResult`) 遠距離確認測試結果

### Requirement: 全狀態持久化與多語系支援 (i18n)
Web 介面必須完全在前端層級記憶使用者的偏好設定，並支援即時動態切換多國語言，無需重啟伺服器。

#### Scenario: 切換語系並重整網頁
- **WHEN** 使用者在 Header 選擇越南文 (vi) 或繁體中文，並設定特定 UUID，隨後重新整理網頁
- **THEN** 系統必須依賴 `localStorage` 恢復最後的語系設定與 UUID 參數，並立即套用相對應的翻譯文字

### Requirement: 快速雙擊連線與指令過濾
Web 介面必須提供高度易用的操作邏輯，包含隱藏未知設備、清單雙擊自動連線、以及 Hex/Text 模式的字元過濾。

#### Scenario: 設備雙擊連線
- **WHEN** 使用者在掃描清單中尋找到目標設備並點擊兩下 (Double Click)
- **THEN** 系統必須自動將該設備填寫至目標欄位，並立即觸發連線流程
