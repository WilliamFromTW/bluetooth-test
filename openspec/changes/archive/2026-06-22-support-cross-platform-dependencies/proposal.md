# 提案：支援跨平台依賴安裝 (macOS, Linux, Windows)

## 背景與問題描述
目前系統的 `requirements.txt` 中硬編碼了 macOS 專屬的 PyObjC 套件 (`pyobjc-core`, `pyobjc-framework-*`)。這些套件依賴 macOS SDK，導致在 Windows 與 Linux 平台執行 `pip install` 時會編譯失敗，無法順利建立開發環境。

經調查，專案中的藍牙邏輯完全依賴 `bleak` 套件，並未直接使用 `pyobjc`。而 `bleak` 本身具有跨平台支援，會在不同平台自動安裝其所需的底層依賴。

## 解決方案
我們將修改 `requirements.txt` 以移除對 macOS 專用套件的全域硬性依賴。
我們採用方案一：直接在 `requirements.txt` 中移除 `pyobjc` 相關套件，完全交由 `bleak` 自動處理平台專屬依賴。

## 影響範圍
- [requirements.txt](file:///W:/developer/project/github/bluetooth-test/requirements.txt)
- 各平台的部署與開發環境安裝流程。
