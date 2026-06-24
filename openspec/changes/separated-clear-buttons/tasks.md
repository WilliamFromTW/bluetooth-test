## 1. UI 按鈕新增

- [x] 1.1 在 `static/index.html` 中的測試結果標題區域 (`<h3>測試結果</h3>` 或類似元素) 右側，新增兩個小巧的按鈕：`<button id="btnClearLog">清除紀錄</button>` 與 `<button id="btnClearResult">清除結果</button>`。
- [x] 1.2 調整 `static/style.css` 確保這兩個按鈕靠右對齊，且不會干擾下方的極簡大字報測試結果顯示區塊。

## 2. 功能邏輯綁定

- [x] 2.1 在 `static/app.js` 中新增並綁定 `btnClearLog` 的 `click` 事件，當觸發時，僅將左側回應資料顯示區 (`id="logContent"` 或相關 ID) 的內容清空。
- [x] 2.2 在 `static/app.js` 中新增並綁定 `btnClearResult` 的 `click` 事件，當觸發時，僅將右側判定結果顯示區 (`id="testResult"` 或相關 ID) 的內容清空，或恢復為預設的空白狀態。
