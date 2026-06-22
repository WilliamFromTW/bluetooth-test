# 任務清單：支援跨平台依賴安裝

- [ ] **任務 1: 修改 requirements.txt 檔案**
  - 從 [requirements.txt](file:///W:/developer/project/github/bluetooth-test/requirements.txt) 中移除 `pyobjc-core`、`pyobjc-framework-Cocoa`、`pyobjc-framework-CoreBluetooth` 與 `pyobjc-framework-libdispatch`。
  
- [ ] **任務 2: 驗證不同平台的依賴安裝與執行**
  - **Windows**: 執行 `pip install -r requirements.txt` 並運行 `main.py`，確認 `bleak` 可成功掃描。
  - **Linux**: 執行 `pip install -r requirements.txt` 並運行 `main.py`，確認是否能透過 D-Bus 正常運作。
  - **macOS**: 執行 `pip install -r requirements.txt`，確認自動補回 `pyobjc-framework-CoreBluetooth` 且正常執行。

- [ ] **任務 3: 更新開發與部署說明文件**
  - 於 [README.md](file:///W:/developer/project/github/bluetooth-test/README.md) 中補充跨平台運行的系統環境前置需求（例如 Linux 需要安裝 `bluez` 與 `glib` 等開發套件）。
