## 1. 藍牙掃描狀態控制實作 (`main.py`)

- [x] 1.1 在 `main.py` 中新增全域變數 `global_scanner` (用來保存實例)、`scan_enabled = True` 與 `scanner_is_running = False`。
- [x] 1.2 修改 `scan_devices()` 背景任務，實作狀態機邏輯。若 `scan_enabled` 為 True 且未執行則 `global_scanner.start()`；若為 False 且正在執行則 `global_scanner.stop()`。記得加上防呆的 try-except 例外處理。

## 2. 連線防衝突邏輯實作 (`main.py`)

- [x] 2.1 修改 `/api/connect` 端點。在執行 `BleakClient.connect()` 前，設定 `scan_enabled = False`，並加入 `await asyncio.sleep(1.5)` 給予掃描器足夠的時間停止與釋放底層 HCI 資源。
- [x] 2.2 在 `/api/connect` 的例外處理區塊 (except) 中，若連線失敗，需將 `scan_enabled = True` 恢復，避免永遠失去掃描功能。

## 3. 斷線恢復掃描邏輯實作 (`main.py`)

- [x] 3.1 修改 `disconnect_callback()` 回呼函式。當設備斷線時（確認 active_clients 為空後），設定 `scan_enabled = True` 以自動恢復背景掃描。
- [x] 3.2 確保 `/api/disconnect` 端點在斷開連線後，同樣觸發或確保 `scan_enabled = True`。
