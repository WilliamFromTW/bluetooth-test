## Why

在產線上，藍牙設備名稱可能會被修改或預設名稱雷同，導致人員難以精準辨識特定產品。透過過濾藍牙廣播封包中的 Service Data (Type 0x16) 結合廠家自定義的 Payload，是目前最精準且抗干擾的辨識方式。新增此功能可讓產線人員直接輸入手冊上的 Hex 字串，系統即自動在底層完成比對，大幅降低誤判機率。

## What Changes

- 在前端 UI 左側的「設備過濾條件」面板中，新增一個「廣播資料 (Hex)」輸入欄位。
- 在後端藍牙掃描邏輯中，針對解析出的 `Type 0x16` (Service Data)，將 16-bit UUID 與 Payload 重新拼接為 Hex 字串，並比對是否包含使用者輸入的字串。
- 此廣播資料過濾功能將與現有的過濾條件（如名稱、MAC 地址）同時運作（AND 交集關係）。

## Capabilities

### New Capabilities
- `adv-data-filtering`: 支援基於藍牙廣播 Service Data (Type 0x16) 的 Hex 字串解析與過濾機制。

### Modified Capabilities


## Impact

- 前端：修改 `index.html` 加入輸入框，並於 `app.js` 中將過濾條件於 WebSocket 連線或掃描請求中傳遞。
- 後端：修改 `ble_service.py` 中的 `BleakScanner` 回呼函數或過濾邏輯，新增針對 `advertisement_data.service_data` 的字串拼接與比對邏輯。
