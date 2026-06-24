## 1. 前端 UI 修改與邏輯整合

- [x] 1.1 在 `static/index.html` 的「設備過濾條件」區域新增「廣播 Hex」輸入欄位 (ID: `filterAdvHex`)。
- [x] 1.2 在 `static/app.js` 增加變數取得 `filterAdvHex` 的值，並在觸發掃描與重整時，將此參數附帶於後端 API 請求中（如 `start_scan` 的過濾參數）。

## 2. 後端掃描邏輯與廣播資料解析

- [x] 2.1 在 `ble_service.py` (實為 `main.py`) 中接收新的 `adv_hex_filter` 參數，並將其轉為統一格式（例如全大寫或小寫）以便比對。
- [x] 2.2 在 `BleakScanner` 的 `detection_callback` (或類似的處理函數) 內，實作 `advertisement_data.service_data` 的解析邏輯。
- [x] 2.3 針對每一個 `service_data` 的 Key (UUID 字串)，判斷是否以標準 Base UUID (`-0000-1000-8000-00805f9b34fb`) 結尾。若符合，擷取第 4 到 8 個字元並做 Little-endian 反轉。
- [x] 2.4 將反轉後的 16-bit Hex 與對應的 Value Payload (轉為 Hex) 拼接為字串。
- [x] 2.5 進行包含判定 (Substring matching)：若拼接字串包含使用者傳入的 `adv_hex_filter`，則視為過濾通過；否則，若有傳入參數但不匹配，則將該設備排除在結果之外。
