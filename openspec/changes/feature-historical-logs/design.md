# 設計：歷史日誌儲存架構

## 1. 資料儲存設計
- 日誌將儲存於專案根目錄的 `logs/` 資料夾中。
- 檔案命名規則：`YYYY-MM-DD.log`（例如 `2026-06-23.log`），以伺服器本地時間為準。
- 後端只需進行簡單的 append 寫入，以確保效能。

## 2. API 介面定義
- `POST /api/logs`: 
  - Request Body: `{ "log": "日誌字串內容" }`
  - 動作：將字串附加到當天的日誌檔中。
- `GET /api/logs/dates`: 
  - Response: `{ "dates": ["2026-06-23", "2026-06-22"] }`
  - 動作：回傳 `logs/` 目錄下所有可用的日期清單。
- `GET /api/logs/{date}`: 
  - Response: `{ "content": "..." }`
  - 動作：回傳指定日期的檔案內容。
- `DELETE /api/logs/{date}`: 
  - Response: `{ "status": "success" }`
  - 動作：刪除指定日期的日誌檔案。

## 3. 前端架構
- **日誌攔截**：修改現有的 `addLog(message, type)` 函數。當自動儲存開關為 `true` 時，除了將訊息顯示在畫面上，同時非同步發送 `POST /api/logs`。
- **Modal 元件**：在 `index.html` 新增一個隱藏的 `<div id="historyLogModal">`，包含日期選擇下拉選單、日誌顯示區塊，以及匯出/刪除按鈕。

## 4. 多語系支援 (i18n)
- 確保所有新增的 UI 元素（開關、按鈕、Modal）與前端動態提示訊息（Alert、Confirm、狀態文字）皆支援多國語系。
- 於 `i18n.js` 新增相關翻譯鍵值，包含：
  - UI 標籤：`label_auto_save_log`, `btn_history_log`, `header_history_modal`, `label_select_date`, `btn_refresh`, `btn_export_txt`, `btn_delete_history`, `btn_clear_screen`
  - 動態訊息：`msg_loading_history`, `msg_no_records`, `msg_error_load_dates`, `msg_no_content`, `msg_error_load_content`, `confirm_delete_history`, `alert_delete_failed`
- 支援語系涵蓋繁體中文、簡體中文、英文與越南文。
