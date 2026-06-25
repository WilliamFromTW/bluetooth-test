# Core Bluetooth Operations

## ADDED Requirements

### Requirement: 連線時掃描資源互斥 (Scan Suspend/Resume)
為了支援 Linux/Raspberry Pi 環境下的穩定連線，系統必須（MUST）在執行主動連線 (Connect) 之前暫停任何背景的藍牙掃描任務。
- 在發起 `/api/connect` 時，系統必須主動停止 `BleakScanner`，並提供足夠的硬體釋放緩衝時間。
- 在連線建立失敗，或是設備斷線（收到 disconnect 事件或主動斷線）後，系統必須自動恢復 `BleakScanner` 的掃描任務，確保持續更新周邊設備列表。
