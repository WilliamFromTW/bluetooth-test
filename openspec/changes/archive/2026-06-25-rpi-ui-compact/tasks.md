## 1. 左欄介面重構 (`index.html`, `style.css`)

- [x] 1.1 將 `scanBtn` (更新清單按鈕) 移動至 `<h2>過濾與掃描</h2>` 的同一行。可使用 flexbox 讓標題與按鈕並排。按鈕樣式改為小型按鈕。
- [x] 1.2 移除或將原本的 `.action-buttons` 區塊隱藏，以釋放垂直空間給 `#deviceList`。

## 2. 右欄介面微縮與防擠壓 (`index.html`, `style.css`)

- [x] 2.1 修改發送命令區塊 (`#commandInput` 與 `#sendBtn`) 的樣式，減少 padding 與字體大小，降低其佔用的垂直高度。
- [x] 2.2 針對 `#responseDisplay` 與 `#resultDisplay`，在 `style.css` (或 inline style) 中強制加入 `flex: 1 1 50%; max-width: 50%; box-sizing: border-box;` 以確保左右絕對等寬，不受字體撐開影響。
