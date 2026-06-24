## 1. 部署配置實作 (deploy 資料夾)

- [x] 1.1 建立 `deploy` 資料夾。
- [x] 1.2 在 `deploy` 資料夾內建立 `ble-tester.service` 檔案，包含 `{{WORKDIR}}`, `{{USER}}`, `{{GROUP}}` 的佔位符，並設定 `uvicorn` 開機綁定 `0.0.0.0` 與 `Restart=always` 機制。
- [x] 1.3 在 `deploy` 資料夾內建立 `install.sh` 腳本，加入系統依賴檢查、venv 建立、pip 安裝，以及替換與部署 `ble-tester.service` 至 `/etc/systemd/system/` 的邏輯。請務必給予執行權限 (`chmod +x`) 並在腳本中設定為可安全退出 (`set -e`)。

## 2. 文件更新 (README.md)

- [x] 2.1 修改根目錄的 `README.md`，新增或更新「自動化部署 (Linux/Raspberry Pi)」的區塊，提供指令：`chmod +x deploy/install.sh && ./deploy/install.sh` 的操作引導。
