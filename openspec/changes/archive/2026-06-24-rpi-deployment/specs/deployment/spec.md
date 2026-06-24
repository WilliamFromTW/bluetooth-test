# Automated Deployment

## ADDED Requirements

### Requirement: Linux/Raspberry Pi 自動化安裝
系統必須提供一支 `install.sh` 腳本，用以簡化系統建置與部署。
- 腳本必須自動安裝系統依賴，包含 `python3-venv`, `python3-pip`, `bluez`, `libglib2.0-dev`。
- 腳本必須自動在專案內建立 `venv` 虛擬環境，並透過 `pip` 安裝 `requirements.txt` 中指定的依賴。

### Requirement: Systemd 常駐執行
系統必須提供一個適用於 Systemd 的 Service 配置檔 (`ble-tester.service`) 模板，支援無人值守執行。
- 配置必須包含自動重新啟動機制 (`Restart=always`) 以確保高可用性。
- 配置必須執行 `uvicorn main:app --host 0.0.0.0 --port 8000` 來接受區域網路連線。
- 安裝腳本必須能根據安裝路徑動態替換並部署這個設定檔，最後自動啟用並啟動該服務。
