# Proposal: Resolve RPi Bluetooth Scan/Connect Resource Conflict

## Problem Statement

目前的 `BleakScanner` 在伺服器啟動後進入無限迴圈且從未停止 (`await scanner.start()` 之後無 `stop()`)。在 Raspberry Pi (Linux/BlueZ) 的底層架構下，當藍牙介面控制器 (HCI) 處於「主動掃描 (Active Scanning)」狀態時，若發起「建立連線 (Create Connection)」請求，會導致資源衝突，經常引發 Device or Resource Busy 或連線超時等嚴重問題，導致樹莓派無法穩定連接藍牙設備。

## Proposed Solution

實作「連線前暫停掃描」的狀態機制：
1. 建立全域的掃描器狀態控制，將原本死迴圈的掃描任務改為可被中斷與恢復。
2. 當接收到 `/api/connect` 請求時，先主動呼叫 `scanner.stop()` 暫停背景掃描，並等待一小段緩衝時間 (例如 1 秒) 讓硬體資源完全釋放。
3. 待藍牙連線成功、連線失敗、或是使用者主動斷開連線、設備異常斷線時，自動重新呼叫 `scanner.start()` 恢復背景掃描功能。

## Scope

- **In Scope:** 
  - 修改 `main.py` 的 `scan_devices` 背景任務，支援安全停止與重新啟動。
  - 修改 `/api/connect` 邏輯，加入停止掃描的控制與緩衝時間。
  - 修改斷線處理邏輯 (`disconnect_callback` 與 `/api/disconnect`) 以恢復掃描。
- **Out of Scope:** 
  - 變更前端 UI 或 WebSocket 的通訊協定（此為純後端的資源調度修復）。

## Impact

- **Reliability:** 徹底解決在 Raspberry Pi / Linux 系統上，因掃描與連線同時進行而導致的藍牙連線不穩或崩潰問題，達到產線級的穩定度。
