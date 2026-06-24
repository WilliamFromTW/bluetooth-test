## Context

目前的系統只支援透過設備名稱 (Name) 與 MAC 地址進行過濾。在產線環境中，設備名稱可能被修改，因此透過廣播封包的 Service Data (Type 0x16) 來驗證廠家特有資料是最穩定的做法。底層藍牙套件 `bleak` 會將此類廣播資料解析為 `advertisement_data.service_data`，其中 Key 為標準 128-bit UUID 字串 (由 16-bit 擴充而來)，Value 為 Payload (bytes 格式)。為了達成使用者友善的操作，我們必須將這些解析後的資料重新還原並拼接為產線手冊上常見的連續 Hex 字串，再與使用者的輸入進行比對。

## Goals / Non-Goals

**Goals:**
- 允許使用者在前端 UI 輸入 Hex 字串（例如 `F0FF35`）。
- 後端 `bleak` Scanner 在掃描時，擷取 `service_data` 中的 UUID 與 Payload。將 128-bit UUID 還原為 16-bit 的 Little-endian 格式字串，與 Payload 轉成的 Hex 字串拼接。
- 若拼接結果包含使用者輸入的字串，則視為過濾通過。
- 支援與現有的名稱、MAC 過濾條件共同運作（採用 AND 邏輯交集）。

**Non-Goals:**
- 不支援 Type 0xFF (Manufacturer Specific Data) 的過濾，本次範圍僅聚焦於 Type 0x16 (Service Data)。
- 不實作複雜的 Regular Expression 比對，僅作基礎的忽略大小寫之子字串 (Substring) 包含判斷。

## Decisions

1. **過濾邏輯的實作位置（前端 vs 後端）**
   - **決定**：實作於後端 (`ble_service.py`)。
   - **理由**：現有的過濾機制（包含名稱與 RSSI 過濾）已經實作於後端。為了減少 WebSocket 傳輸負擔（避免將無關的設備資料不斷推送給前端再拋棄），將前端的 Hex 過濾參數傳遞給後端，並在 `BleakScanner` 的 `detection_callback` 進行處理，是最有效率且能保持架構一致性的做法。

2. **UUID 轉換與拼接邏輯**
   - **決定**：解析 128-bit UUID 取出 16-bit 段，轉換為 Little-endian 後拼接 Payload。
   - **理由**：例如 `0000fff0-0000-1000-8000-00805f9b34fb`，擷取第 4 到 8 個字元 `fff0`。根據 Little-endian 規則反轉為 `f0ff`，然後將對應的 value bytes (如 `\x35`) 轉為 `35`，最後組合出 `f0ff35`。這樣可以與產線常用的 Raw Data 概念完美對應。

## Risks / Trade-offs

- **風險：非標準 Base UUID 導致解析錯誤** 
  - 若設備使用的 UUID 不是標準的 Bluetooth Base UUID，單純擷取字元可能不正確。
  - **緩解方案**：實作時先判斷 UUID 是否以 `-0000-1000-8000-00805f9b34fb` 結尾，若是則執行 Little-endian 擷取轉換；若不是，則跳過該 UUID 的比對，確保程式不會拋出例外。

- **風險：使用者輸入的大小寫不一致**
  - **緩解方案**：比對時，一律將拼接出來的 Hex 字串與使用者的輸入字串轉為全小寫 (toLowerCase) 或全大寫再進行 Substring 包含比對。
