## ADDED Requirements

### Requirement: 藍牙掃描與連線功能
後端服務必須提供 API 允許掃描周邊的藍牙裝置，並能根據使用者指定的 Service UUID 連線至特定藍牙裝置。

#### Scenario: 掃描並成功連線
- **WHEN** 用戶端發送掃描請求並帶有特定的 Service UUID，且該裝置處於廣播狀態
- **THEN** 後端服務必須成功掃描到該裝置，建立 BLE 連線，並回傳連線成功狀態

### Requirement: 藍牙特徵值讀寫功能
後端服務必須提供 API 允許針對指定的 Write Character UUID 寫入命令，並針對指定的 Read Character UUID 讀取資料。

#### Scenario: 成功寫入命令並讀取資料
- **WHEN** 用戶端透過 API 傳送寫入指令至指定的 Write UUID，隨後發送讀取請求至指定的 Read UUID
- **THEN** 後端服務必須成功透過 bleak 寫入該特徵值，並從 Read UUID 取得藍牙裝置回傳的資料

### Requirement: 藍牙訂閱通知功能
後端服務必須提供 WebSocket 連線，允許訂閱特定的 Notify Character UUID，並在藍牙裝置主動發送資料時即時推送給前端。

#### Scenario: 接收即時通知推送
- **WHEN** 用戶端建立 WebSocket 連線並訂閱指定的 Notify UUID，且藍牙裝置發送通知資料
- **THEN** 後端服務必須藉由 bleak 的 notification callback 接收資料，並立即透過 WebSocket 將資料推送至用戶端
