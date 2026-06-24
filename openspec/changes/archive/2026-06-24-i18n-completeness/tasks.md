## 1. 字典擴充 (i18n.js)

- [x] 1.1 在 `static/i18n.js` 中的四個語系 (`zh-TW`, `zh-CN`, `en`, `vi`) 補齊「系統就緒」、「等待回應...」的鍵值對。
- [x] 1.2 在 `static/i18n.js` 補齊右上角主選單的「進階設定」、「亮色」、「暗色」及標題「切換深/淺色」的鍵值對。
- [x] 1.3 在 `static/i18n.js` 補齊 Modal 中標題「掃描設定」、「讀寫模式設定」、「日誌設定」等鍵值對。
- [x] 1.4 在 `static/i18n.js` 補齊過濾區塊「廣播資料 (Type 0x16 Hex)」及「連線」等鍵值對，以及狀態卡片提示語。

## 2. 靜態標籤綁定 (index.html)

- [x] 2.1 在 `static/index.html` 尋找 `<span id="tickerLogText">系統就緒</span>` 與 `<div id="responseDisplay">等待回應...</div>`，加上對應的 `data-i18n` 屬性。
- [x] 2.2 在 `static/index.html` 尋找右上角的「進階設定」按鈕與「亮色」按鈕，加上 `data-i18n` 屬性。
- [x] 2.3 在 `static/index.html` 的 Settings Modal 中，為「進階設定」、「掃描設定」、「讀寫模式設定」、「日誌設定」標題加上 `data-i18n` 屬性。
- [x] 2.4 在 `static/index.html` 的左側面板中，為廣播資料過濾的 `<label>`、`<input>` 及 `<button id="connectBtn">` 加上 `data-i18n` 與 `data-i18n-placeholder` 屬性。
- [x] 2.5 在 `static/index.html` 狀態卡片下方的提示語 `<div id="connectedTargetName">` 加上 `data-i18n` 屬性。

## 3. 動態字串綁定 (app.js)

- [x] 3.1 修改 `static/app.js`，將多處賦值 `responseDisplay.textContent = '等待回應...';` 改為使用 `t('鍵值')`。
- [x] 3.2 修改 `static/app.js` 的 `applyTheme()` 函式，將切換亮色/暗色的 `textContent` 賦值改為使用 `t('鍵值')`。
- [x] 3.3 修改 `static/app.js`，確保在 `languageChanged` 事件中，重新執行 `applyTheme(currentTheme)` 或是對其他需要即時重繪的字串進行更新，確保即時切換。
