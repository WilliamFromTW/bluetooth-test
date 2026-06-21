# Bluetooth Web Interface

一個直觀的網頁控制面板，用於藍牙設備掃描、過濾、連線，並支援客製化的特徵值讀寫測試。

## 環境建置步驟

為了在您的電腦上重新建立相同的執行環境，請遵循以下步驟：

### 1. 建立虛擬環境

在專案根目錄下，開啟終端機並執行：

```bash
python3 -m venv venv
```

### 2. 啟動虛擬環境 (視您的作業系統而定)

- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```

### 3. 安裝依賴套件

啟動虛擬環境後，使用 `requirements.txt` 安裝專案所需的所有套件：

```bash
pip install -r requirements.txt
```

### 4. 啟動後端伺服器

執行以下指令啟動 FastAPI 服務：

```bash
uvicorn main:app --reload
```
