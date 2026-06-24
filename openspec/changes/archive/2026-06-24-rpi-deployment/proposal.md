# Proposal: Raspberry Pi Automated Deployment

## Problem Statement

目前的藍牙測試工具雖然可以透過 `uvicorn main:app` 手動啟動，並且已支援透過反向代理或區網遠端連線，但對於希望將此系統部署為「產線常駐設備 (Headless IoT Device)」的使用者來說，缺乏一套標準化的開機自啟與自動安裝機制。在樹莓派上每次重新開機都需要手動開啟終端機、啟用環境並輸入指令，不符合產線自動化的需求。

## Proposed Solution

我們將為專案新增一套專為 Linux / Raspberry Pi OS 設計的自動化部署機制。主要包含以下兩個元件：
1. **一鍵安裝腳本 (`deploy/install.sh`)**：負責自動化安裝系統相依套件 (如 `bluez`, `libglib2.0-dev`)，建立 Python 虛擬環境，安裝專案依賴，並自動將服務註冊到 systemd。
2. **Systemd Service 模板 (`deploy/ble-tester.service`)**：提供背景執行 (Daemonize)、開機自動啟動、異常自動重啟 (Restart) 以及網路綁定等完整配置。

## Scope

- **In Scope:** 
  - 新增 `deploy/install.sh` 自動化安裝腳本。
  - 新增 `deploy/ble-tester.service` 的 systemd 設定範例。
  - 更新 `README.md` 的自動安裝與常駐執行說明。
- **Out of Scope:** 
  - Windows 或 macOS 上的開機自啟設定 (僅聚焦 Linux/RPi)。
  - Docker 化部署 (直接透過 host 網路與系統藍牙通訊最為穩定，暫不考慮 Docker 隔離藍牙介面的複雜性)。

## Impact

- **Operational:** 大幅降低在樹莓派或產線 Linux 設備上的部署門檻，插電開機即可直接服務。
- **Reliability:** 透過 Systemd 守護行程，即使伺服器意外崩潰也能自動重啟，提高產線測試穩定度。
