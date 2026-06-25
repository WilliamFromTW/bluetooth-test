# Design: Resolve RPi Bluetooth Scan/Connect Resource Conflict

## Architecture Overview

原先的架構中，`BleakScanner` 在 `scan_devices()` 異步任務中啟動後便進入死迴圈，持續佔用 HCI 資源。我們將引入一個全域狀態標記 `scan_enabled` 與全域掃描器物件 `global_scanner`，透過狀態機的方式在異步任務中動態呼叫 `start()` 與 `stop()`。

### Component Modifications

1. **Global States (`main.py`)**
   - 新增 `global_scanner` 用來保存 `BleakScanner` 的實例。
   - 新增 `scan_enabled = True` 用來控制期望的掃描狀態。
   - 新增 `scanner_is_running = False` 用來追蹤掃描器的實際底層狀態。

2. **Scanner Background Task (`scan_devices`)**
   - 在迴圈內檢查狀態：
     - 若 `scan_enabled == True` 且 `scanner_is_running == False`：執行 `await global_scanner.start()`，並更新狀態。
     - 若 `scan_enabled == False` 且 `scanner_is_running == True`：執行 `await global_scanner.stop()`，並更新狀態。
   - 保留原有的過期裝置清理邏輯。
   - 加入例外處理，當啟動/停止失敗時能安全復原。

3. **Connection API (`/api/connect`)**
   - 接收請求後，設定 `scan_enabled = False`。
   - 為了安全，給予一小段 `asyncio.sleep(1)` 緩衝時間，讓背景的掃描迴圈有時間執行 `stop()` 並釋放硬體資源。
   - 接著執行 `BleakClient.connect()`。
   - 若連線拋出例外（失敗），則在例外捕捉區塊中將 `scan_enabled = True` 恢復，然後再拋出錯誤。

4. **Disconnection Logic**
   - **`disconnect_callback`**: 當實體設備斷線或連線遺失時觸發。此時若系統已無其他活躍連線，則設定 `scan_enabled = True` 恢復背景掃描。
   - **`/api/disconnect`**: 若使用者主動斷開連線，在結束後設定 `scan_enabled = True`。
