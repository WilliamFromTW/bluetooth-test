# 任務清單：歷史日誌功能

- [ ] **任務 1: 後端 API 與目錄建置**
  - 在 `main.py` 中實作 `logs/` 目錄的檢查與建立邏輯。
  - 實作 `POST /api/logs`，接收並將日誌附加寫入 `logs/YYYY-MM-DD.log`。
  - 實作 `GET /api/logs/dates`、`GET /api/logs/{date}` 與 `DELETE /api/logs/{date}`。

- [ ] **任務 2: 前端 UI 介面更新**
  - 於 `index.html` 的「設定與日誌」區塊新增「自動保存日誌」Checkbox 與「歷史日誌管理」按鈕。
  - 在 `index.html` 底部新增歷史日誌 Modal 的 HTML 結構。
  - 在 `style.css` 新增 Modal 的相關樣式。
  - 更新 `i18n.js`，加入新按鈕與 Modal 內文字的翻譯。

- [ ] **任務 3: 前端邏輯實作**
  - 在 `app.js` 中實作「自動保存日誌」的狀態維護 (可存於 localStorage 以記住使用者偏好)。
  - 修改 `addLog` 函數，當開啟自動保存時，發送 `POST /api/logs`。
  - 實作 Modal 的開啟/關閉邏輯。
  - 實作 Modal 內的日期切換、載入日誌內容、清空日誌，以及純前端將文字匯出下載成 `.txt` 檔案的功能。
