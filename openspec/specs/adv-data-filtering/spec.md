# Capability: Adv-data-filtering

## Purpose
TBD

## Requirements

### Requirement: 前端支援廣播 Hex 字串輸入
系統 SHALL 在前端 UI 的設備過濾條件區域提供一個輸入欄位，允許使用者輸入 Hex 字串（如 `F0FF35`）作為藍牙廣播資料的過濾條件。

#### Scenario: 使用者設定廣播資料過濾條件
- **WHEN** 使用者在「廣播 Hex」輸入框中輸入字串並點擊更新或掃描時
- **THEN** 系統會將此過濾條件傳遞給後端，並與其他過濾條件（如名稱、MAC）合併生效（AND 邏輯）。

### Requirement: 後端藍牙廣播 Service Data (Type 0x16) 拼接與比對
系統 SHALL 在掃描藍牙設備時，針對 `advertisement_data.service_data` 中的每一筆資料，將標準 128-bit UUID 的 16-bit 區段以 Little-endian 格式擷取，並與 Payload 資料拼接成完整的 Hex 字串，然後進行不區分大小寫的 Substring 比對。

#### Scenario: 廣播資料比對成功
- **WHEN** 掃描到的設備其 `service_data` 包含 UUID `0000fff0-0000-1000-8000-00805f9b34fb` 且 Payload 為 `0x35`，且使用者過濾條件為 `F0FF35` 或 `f0ff35`
- **THEN** 系統將 UUID 轉換為 `f0ff`，拼接 Payload 成為 `f0ff35`，判定比對成功，將此設備加入可見清單。

#### Scenario: 廣播資料比對失敗
- **WHEN** 掃描到的設備 `service_data` 拼接後無法匹配使用者輸入的字串，或該設備根本沒有發送 Type 0x16 的廣播資料
- **THEN** 系統判定比對失敗，該設備不會顯示於掃描結果清單中。

#### Scenario: 非標準 128-bit Base UUID 處理
- **WHEN** 掃描到的設備 `service_data` 的 UUID 未以標準的 `-0000-1000-8000-00805f9b34fb` 結尾
- **THEN** 系統 SHALL 略過該筆資料的 16-bit 轉換邏輯，避免解析錯誤導致程式崩潰，該筆資料判定為不匹配。
