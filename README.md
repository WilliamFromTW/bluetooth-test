# Bluetooth Web Interface

一個直觀的網頁控制面板，用於藍牙設備掃描、過濾、連線，並支援客製化的特徵值讀寫測試。

## 平台前置要求 (系統層級)

本專案使用 `bleak` 進行跨平台藍牙通訊，請確保您的作業系統符合以下條件：
- **Windows**: 請確保電腦配有藍牙適配器，且已在系統設定中開啟藍牙。
- **macOS**: 首次執行時，系統會彈出權限請求，請允許 Python / 終端機存取藍牙。
- **Linux**: 系統必須安裝並啟用 `BlueZ`（大多數 Linux 發行版已內建）。若遇到連線問題，請確保 `dbus` 與 `bluetooth` 服務正常運行：
  ```bash
  sudo systemctl start bluetooth
  ```

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
