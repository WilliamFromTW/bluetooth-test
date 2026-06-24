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

## 5. 自動化常駐部署 (Linux / Raspberry Pi)

針對產線或物聯網設備，若希望將此測試系統部署為「插電開機即用」的背景服務，我們提供了一鍵安裝腳本。此腳本將會自動安裝相依元件、建立環境，並將伺服器註冊為 `systemd` 服務。

在您的 Linux 或樹莓派設備上，開啟終端機並在專案根目錄下執行：

```bash
chmod +x deploy/install.sh
./deploy/install.sh
```

安裝完成後，伺服器會自動在背景啟動，且支援異常自動重啟與開機自啟。您可以透過以下指令檢查狀態或停止服務：
```bash
sudo systemctl status ble-tester.service
sudo systemctl stop ble-tester.service
```

## 6. 部署與遠端存取 (反向代理設定)

若希望在同一區域網路內（例如手機或其他電腦）也能開啟測試介面並順利使用藍牙功能，**必須確保前端網頁是透過 `https://` 載入的**（瀏覽器的 Web Bluetooth API 安全限制）。

首先，啟動伺服器時請允許外部連線（綁定 `0.0.0.0`）：
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

接著，您可以使用 Nginx 或 Apache HTTPD 作為反向代理伺服器，並設定 HTTPS。
**請特別注意：本系統依賴 WebSocket (`/ws`) 傳遞即時連線資料，反向代理必須支援 WebSocket Upgrade 才能正常運作。**

### Nginx 設定範例

在 Nginx 的站點設定（如 `/etc/nginx/sites-available/default`）中加入以下區塊：

```nginx
server {
    listen 443 ssl;
    server_name your_domain_or_ip;

    # SSL 憑證設定 (請替換為您的憑證路徑)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 一般 HTTP 請求轉發
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 請求轉發 (必須設定)
    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Apache HTTPD 設定範例

確保已啟用 `mod_proxy`, `mod_proxy_http`, `mod_proxy_wstunnel` 以及 `mod_ssl` 模組：
```bash
a2enmod proxy proxy_http proxy_wstunnel ssl
```

在您的 VirtualHost 設定中加入以下設定：

```apache
<VirtualHost *:443>
    ServerName your_domain_or_ip

    # SSL 憑證設定
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    # 保留 Host Header 給後端
    ProxyPreserveHost On

    # 優先處理 WebSocket 轉發 (必須設定)
    ProxyPass "/ws" "ws://127.0.0.1:8000/ws"
    ProxyPassReverse "/ws" "ws://127.0.0.1:8000/ws"

    # 處理一般 HTTP 轉發
    ProxyPass "/" "http://127.0.0.1:8000/"
    ProxyPassReverse "/" "http://127.0.0.1:8000/"
</VirtualHost>
```
