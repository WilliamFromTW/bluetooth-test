## Context

系統的多語系支援是由 `i18n.js` 所維護的靜態字典。過去幾次更新新增了許多控制按鈕、Modal 與提示文字，這些在當時並未加上 `data-i18n` 標籤，導致這部分功能失去多語系支援。

## Goals / Non-Goals

**Goals:**
- 盤點並補齊目前所有漏掉的 `data-i18n` 與 JavaScript 中的字串替換。
- 確保所有四個語系（zh-TW, zh-CN, en, vi）都有對應的翻譯。

**Non-Goals:**
- 不改變原有多語系的底層架構（不引入第三方函式庫，繼續使用原本的 `t()` 方法）。

## Decisions

- **動態字串更新策略**：對於會在執行期動態被改變的文字（如「等待回應...」、「系統就緒」），除了在 HTML 初始時加上 `data-i18n` 外，在 `app.js` 裡改變該 DOM 內容時，也必須使用 `t('鍵值')` 進行替換。另外，若文字隨切換語言改變，需考量原有的 `languageChanged` Event Listener 中是否需要同步更新。

## Risks / Trade-offs

- [Risk] 無重大風險，純屬前端字串替換與補齊作業。
