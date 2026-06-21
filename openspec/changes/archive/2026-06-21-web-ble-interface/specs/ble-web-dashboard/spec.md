## ADDED Requirements

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
