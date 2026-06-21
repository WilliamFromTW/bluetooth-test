const translations = {
    'zh-TW': {
        'title': 'Bluetooth Tester',
        'status_disconnected': '未連線',
        'status_connected': '已連線',
        'tab_main': '主要控制',
        'tab_settings': '設定與日誌',
        'header_send_cmd': '發送指令',
        'mode_binary': 'Binary (Hex)',
        'mode_text': 'Text',
        'placeholder_cmd': '請刷入條碼或輸入指令 (例如: FF 0A 或是 hello)',
        'btn_send': '送出指令',
        'header_scan': '過濾與掃描',
        'label_filter': '過濾條件 (Name 或 Address/UUID)',
        'placeholder_filter': '例如: MyDevice 或 38A8D5F6...',
        'label_hide_unknown': '隱藏無名稱 (Unknown) 的設備',
        'btn_scan': '更新設備列表',
        'label_auto_scan': '自動掃描',
        'header_connect': '連線控制',
        'label_target': '目標 Address/UUID',
        'placeholder_target': '請從上方列表選擇設備 (點擊兩下自動連線)',
        'btn_connect': '連線',
        'btn_disconnect': '斷開連線',
        'header_result': '測試結果',
        'text_waiting': '等待測試',
        'header_uuid': 'UUID 設定',
        'label_service': 'Service UUID',
        'placeholder_service': '例如: 0000180d-0000-1000-8000-00805f9b34fb',
        'label_read': 'Read/Notify UUID',
        'placeholder_read': '要接收通知的 UUID',
        'label_write': 'Write UUID',
        'placeholder_write': '要寫入資料的 UUID',
        'label_auto_notify': '連線後自動啟用 Notify',
        'header_log': '互動日誌',
        'btn_clear_log': '清除日誌',
        'log_scanning': '掃描中...',
        'log_scan_fail': '掃描失敗',
        'log_connecting': '嘗試連線至',
        'log_connect_success': '連線成功！',
        'log_auto_notify_enabled': '已自動啟用 Notify',
        'log_connect_fail': '連線失敗',
        'log_disconnecting': '中斷連線中...',
        'log_disconnect_fail': '斷開失敗',
        'log_device_disconnected': '設備已斷開連線',
        'log_send_err_noconn': '請確認已連線且填寫 Write UUID (請至設定分頁確認)',
        'log_send_err_invalid': '指令無效或為空',
        'log_sent': '已發送',
        'log_send_fail': '發送失敗',
        'no_device': '無符合設備'
    },
    'zh-CN': {
        'title': 'Bluetooth Tester',
        'status_disconnected': '未连接',
        'status_connected': '已连接',
        'tab_main': '主要控制',
        'tab_settings': '设置与日志',
        'header_send_cmd': '发送指令',
        'mode_binary': 'Binary (Hex)',
        'mode_text': 'Text',
        'placeholder_cmd': '请刷入条码或输入指令 (例如: FF 0A 或是 hello)',
        'btn_send': '发送指令',
        'header_scan': '过滤与扫描',
        'label_filter': '过滤条件 (Name 或 Address/UUID)',
        'placeholder_filter': '例如: MyDevice 或 38A8D5F6...',
        'label_hide_unknown': '隐藏无名称 (Unknown) 的设备',
        'btn_scan': '更新设备列表',
        'label_auto_scan': '自动扫描',
        'header_connect': '连接控制',
        'label_target': '目标 Address/UUID',
        'placeholder_target': '请从上方列表选择设备 (双击自动连接)',
        'btn_connect': '连接',
        'btn_disconnect': '断开连接',
        'header_result': '测试结果',
        'text_waiting': '等待测试',
        'header_uuid': 'UUID 设置',
        'label_service': 'Service UUID',
        'placeholder_service': '例如: 0000180d-0000-1000-8000-00805f9b34fb',
        'label_read': 'Read/Notify UUID',
        'placeholder_read': '要接收通知的 UUID',
        'label_write': 'Write UUID',
        'placeholder_write': '要写入数据的 UUID',
        'label_auto_notify': '连接后自动启用 Notify',
        'header_log': '互动日志',
        'btn_clear_log': '清除日志',
        'log_scanning': '扫描中...',
        'log_scan_fail': '扫描失败',
        'log_connecting': '尝试连接至',
        'log_connect_success': '连接成功！',
        'log_auto_notify_enabled': '已自动启用 Notify',
        'log_connect_fail': '连接失败',
        'log_disconnecting': '中断连接中...',
        'log_disconnect_fail': '断开失败',
        'log_device_disconnected': '设备已断开连接',
        'log_send_err_noconn': '请确认已连接且填写 Write UUID (请至设置分页确认)',
        'log_send_err_invalid': '指令无效或为空',
        'log_sent': '已发送',
        'log_send_fail': '发送失败',
        'no_device': '无符合设备'
    },
    'en': {
        'title': 'Bluetooth Tester',
        'status_disconnected': 'Disconnected',
        'status_connected': 'Connected',
        'tab_main': 'Main Control',
        'tab_settings': 'Settings & Logs',
        'header_send_cmd': 'Send Command',
        'mode_binary': 'Binary (Hex)',
        'mode_text': 'Text',
        'placeholder_cmd': 'Scan barcode or input command (e.g. FF 0A or hello)',
        'btn_send': 'Send',
        'header_scan': 'Filter & Scan',
        'label_filter': 'Filter (Name or Address/UUID)',
        'placeholder_filter': 'e.g. MyDevice or 38A8D5F6...',
        'label_hide_unknown': 'Hide Unknown Devices',
        'btn_scan': 'Scan Devices',
        'label_auto_scan': 'Auto Scan',
        'header_connect': 'Connection Control',
        'label_target': 'Target Address/UUID',
        'placeholder_target': 'Select from list (Double click to connect)',
        'btn_connect': 'Connect',
        'btn_disconnect': 'Disconnect',
        'header_result': 'Test Result',
        'text_waiting': 'Waiting for test',
        'header_uuid': 'UUID Settings',
        'label_service': 'Service UUID',
        'placeholder_service': 'e.g. 0000180d-0000-1000-8000-00805f9b34fb',
        'label_read': 'Read/Notify UUID',
        'placeholder_read': 'UUID for notifications',
        'label_write': 'Write UUID',
        'placeholder_write': 'UUID to write data',
        'label_auto_notify': 'Auto enable Notify',
        'header_log': 'Interactive Log',
        'btn_clear_log': 'Clear Log',
        'log_scanning': 'Scanning...',
        'log_scan_fail': 'Scan failed',
        'log_connecting': 'Connecting to',
        'log_connect_success': 'Connected successfully!',
        'log_auto_notify_enabled': 'Notify auto-enabled',
        'log_connect_fail': 'Connection failed',
        'log_disconnecting': 'Disconnecting...',
        'log_disconnect_fail': 'Disconnect failed',
        'log_device_disconnected': 'Device disconnected',
        'log_send_err_noconn': 'Ensure connected and Write UUID is set',
        'log_send_err_invalid': 'Invalid or empty command',
        'log_sent': 'Sent',
        'log_send_fail': 'Send failed',
        'no_device': 'No matching devices'
    },
    'vi': {
        'title': 'Bluetooth Tester',
        'status_disconnected': 'Chưa kết nối',
        'status_connected': 'Đã kết nối',
        'tab_main': 'Điều khiển chính',
        'tab_settings': 'Cài đặt & Nhật ký',
        'header_send_cmd': 'Gửi lệnh',
        'mode_binary': 'Binary (Hex)',
        'mode_text': 'Text',
        'placeholder_cmd': 'Quét mã vạch hoặc nhập lệnh (VD: FF 0A hoặc hello)',
        'btn_send': 'Gửi lệnh',
        'header_scan': 'Lọc & Quét',
        'label_filter': 'Bộ lọc (Tên hoặc Address/UUID)',
        'placeholder_filter': 'VD: MyDevice hoặc 38A8D5F6...',
        'label_hide_unknown': 'Ẩn thiết bị không tên (Unknown)',
        'btn_scan': 'Cập nhật danh sách',
        'label_auto_scan': 'Tự động quét',
        'header_connect': 'Điều khiển kết nối',
        'label_target': 'Địa chỉ/UUID đích',
        'placeholder_target': 'Chọn từ danh sách (Nhấn đúp để kết nối)',
        'btn_connect': 'Kết nối',
        'btn_disconnect': 'Ngắt kết nối',
        'header_result': 'Kết quả',
        'text_waiting': 'Chờ kiểm tra',
        'header_uuid': 'Cài đặt UUID',
        'label_service': 'Service UUID',
        'placeholder_service': 'VD: 0000180d-0000-1000-8000-00805f9b34fb',
        'label_read': 'Read/Notify UUID',
        'placeholder_read': 'UUID để nhận thông báo',
        'label_write': 'Write UUID',
        'placeholder_write': 'UUID để ghi dữ liệu',
        'label_auto_notify': 'Tự động bật Notify',
        'header_log': 'Nhật ký tương tác',
        'btn_clear_log': 'Xóa nhật ký',
        'log_scanning': 'Đang quét...',
        'log_scan_fail': 'Quét thất bại',
        'log_connecting': 'Đang kết nối tới',
        'log_connect_success': 'Kết nối thành công!',
        'log_auto_notify_enabled': 'Đã tự động bật Notify',
        'log_connect_fail': 'Kết nối thất bại',
        'log_disconnecting': 'Đang ngắt kết nối...',
        'log_disconnect_fail': 'Ngắt kết nối thất bại',
        'log_device_disconnected': 'Thiết bị đã ngắt kết nối',
        'log_send_err_noconn': 'Đảm bảo đã kết nối và nhập Write UUID',
        'log_send_err_invalid': 'Lệnh không hợp lệ hoặc trống',
        'log_sent': 'Đã gửi',
        'log_send_fail': 'Gửi lệnh thất bại',
        'no_device': 'Không có thiết bị phù hợp'
    }
};

let currentLang = localStorage.getItem('ble_lang') || 'zh-TW';

function t(key) {
    return translations[currentLang][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    document.title = t('title');
    
    window.dispatchEvent(new Event('languageChanged'));
}

window.changeLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('ble_lang', lang);
    applyTranslations();
};

window.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    applyTranslations();
});
