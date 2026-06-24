# Design: Raspberry Pi Automated Deployment

## Architecture Overview

本變更旨在透過一組自動化腳本與配置，將目前的藍牙測試應用轉變為在 Linux/RPi 環境下可開機自啟、穩定運行的系統守護行程 (Systemd Daemon)。

### Components

1. **Systemd Service (`deploy/ble-tester.service`)**
   - 負責管理 FastAPI (uvicorn) 行程的生命週期。
   - 具備 `Restart=always` 屬性，當應用程式因例外崩潰時能自動恢復。
   - 定義執行環境的 `WorkingDirectory` 與 `ExecStart`。
   - 啟動時自動綁定 `--host 0.0.0.0` 以支援區域網路連線。

2. **Installer Script (`deploy/install.sh`)**
   - 作為一鍵部署的進入點。
   - 負責環境檢測、安裝相依套件、建立虛擬環境。
   - 動態解析當前專案目錄，並將絕對路徑寫入 service file 中。
   - 負責部署 Service file 並通知 Systemd 重新載入設定與啟動服務。

## Detailed Design

### 1. `deploy/ble-tester.service`
一個標準的 systemd unit file 模板，會包含佔位符供 `install.sh` 替換：
```ini
[Unit]
Description=Bluetooth Web Tester Service
After=network.target bluetooth.target

[Service]
User={{USER}}
Group={{GROUP}}
WorkingDirectory={{WORKDIR}}
ExecStart={{WORKDIR}}/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 2. `deploy/install.sh`
腳本流程如下：
1. **權限檢查**：確保以 root 權限 (`sudo`) 執行安裝流程中需要提權的部分，但環境安裝可能使用當前使用者權限。
2. **系統依賴**：執行 `sudo apt-get update` 與 `sudo apt-get install -y python3-venv python3-pip bluez libglib2.0-dev`。
3. **Python 依賴**：在專案根目錄下建立虛擬環境 (`venv`) 並執行 `pip install -r requirements.txt`。
4. **服務部署**：
   - 讀取 `deploy/ble-tester.service` 模板。
   - 使用 `sed` 將 `{{WORKDIR}}`, `{{USER}}`, `{{GROUP}}` 替換為實際的路徑與當前執行安裝的非 root 使用者（避免應用跑在 root 下，增加安全性）。
   - 將產生的設定檔複製到 `/etc/systemd/system/ble-tester.service`。
5. **啟動與啟用**：
   - `sudo systemctl daemon-reload`
   - `sudo systemctl enable ble-tester.service`
   - `sudo systemctl start ble-tester.service`
6. **狀態輸出**：印出 `systemctl status` 結果以及提示使用者開啟 `http://<IP>:8000`。
