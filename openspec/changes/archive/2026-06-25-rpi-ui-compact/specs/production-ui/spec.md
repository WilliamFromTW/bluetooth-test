# Delta Spec: Production UI Dashboard

## ADDED Requirements
- **Requirement**: 產線操作介面微縮化佈局 (1024x600 最佳化)
  - **Context**: 樹莓派工控觸控螢幕受限於垂直高度 (600px)，需最大化核心操作區塊的顯示面積。
  - **Details**:
    - 「更新清單」控制項需整合至標題列以釋放左欄高度，確保藍牙列表能顯示更多項目。
    - 指令發送區塊需視覺微縮。
    - 測試結果檢視區(回應資料與OK/NG字樣)必須強制為 1:1 絕對等寬分割，避免巨型字型撐破彈性容器。
