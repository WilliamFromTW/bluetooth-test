// Configuration
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const API_BASE = `${protocol}//${window.location.host}/api`;
const WS_URL = `${wsProtocol}//${window.location.host}/ws`;

// DOM Elements
const filterInput = document.getElementById('filterInput');
const filterAdvHex = document.getElementById('filterAdvHex');
const hideUnknownCheck = document.getElementById('hideUnknownCheck');
const scanBtn = document.getElementById('scanBtn');
const autoScanCheck = document.getElementById('autoScanCheck');
const deviceList = document.getElementById('deviceList');
const targetAddress = document.getElementById('targetAddress');
const connectedTargetName = document.getElementById('connectedTargetName');

const serviceUuid = document.getElementById('serviceUuid');
const readUuid = document.getElementById('readUuid');
const writeUuid = document.getElementById('writeUuid');
const autoNotifyCheck = document.getElementById('autoNotifyCheck');

const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const commandInput = document.getElementById('commandInput');
const sendBtn = document.getElementById('sendBtn');
const modeBinary = document.getElementById('modeBinary');
const modeText = document.getElementById('modeText');

const logArea = document.getElementById('logArea');
const clearLogBtn = document.getElementById('clearLogBtn');
// Modal settings
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsModal = document.getElementById('closeSettingsModal');

const connectionStatusCard = document.getElementById('connectionStatusCard');
const connectionStatusDot = document.getElementById('connectionStatusDot');
const connectionStatusText = document.getElementById('connectionStatusText');
const resultDisplay = document.getElementById('resultDisplay');
const responseDisplay = document.getElementById('responseDisplay');
const btnClearLog = document.getElementById('btnClearLog');
const btnClearResult = document.getElementById('btnClearResult');
const tickerLogText = document.getElementById('tickerLogText');

// Theme Toggle
const themeToggleBtn = document.getElementById('themeToggleBtn');
let currentTheme = localStorage.getItem('ble_theme') || 'dark';

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = typeof t === 'function' ? t('theme_dark') : '🌙 暗色';
            themeToggleBtn.title = typeof t === 'function' ? t('theme_toggle_title') : '切換深/淺色';
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = typeof t === 'function' ? t('theme_light') : '🌞 亮色';
            themeToggleBtn.title = typeof t === 'function' ? t('theme_toggle_title') : '切換深/淺色';
        }
    }
    localStorage.setItem('ble_theme', theme);
    currentTheme = theme;
}

applyTheme(currentTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// State
let isConnected = false;
let currentAddress = null;
let ws = null;
let autoScanInterval = null;
let processedHexCommand = "";
let globalDevices = []; // 儲存所有掃描到的設備資料

// Language updates dynamic elements
window.addEventListener('languageChanged', () => {
    if (isConnected) {
        connectionStatusText.textContent = t('status_connected');
    } else {
        connectionStatusText.textContent = t('status_disconnected');
        if (connectedTargetName) connectedTargetName.textContent = t('msg_select_to_connect');
    }
    if (deviceList.innerHTML.includes('無符合設備') || deviceList.innerHTML.includes('No matching devices') || deviceList.innerHTML.includes('Không có thiết bị phù hợp') || deviceList.innerHTML.includes('无符合设备')) {
        deviceList.innerHTML = `<li class="device-item"><span class="device-address">${t('no_device')}</span></li>`;
    }
    if (!resultDisplay.classList.contains('ok') && !resultDisplay.classList.contains('ng')) {
        resultDisplay.textContent = '';
    }
    
    // Update waiting response if it is in waiting state
    if (responseDisplay && (responseDisplay.textContent.includes('等待回應...') || responseDisplay.textContent.includes('等待响应...') || responseDisplay.textContent.includes('Waiting for response...') || responseDisplay.textContent.includes('Đang chờ phản hồi...'))) {
        responseDisplay.textContent = t('text_waiting_response');
    }

    // Update ticker log if it is in ready state
    if (tickerLogText && (tickerLogText.textContent === '系統就緒' || tickerLogText.textContent === '系统就绪' || tickerLogText.textContent === 'System Ready' || tickerLogText.textContent === 'Hệ thống sẵn sàng')) {
        tickerLogText.textContent = t('text_system_ready');
    }

    applyTheme(currentTheme);
});

// Global Helper to set huge OK/NG status
window.setTestResult = function(status) {
    if (status === 'OK') {
        resultDisplay.textContent = 'OK';
        resultDisplay.className = 'result-display ok';
    } else if (status === 'NG') {
        resultDisplay.textContent = 'NG';
        resultDisplay.className = 'result-display ng';
    } else {
        resultDisplay.textContent = '';
        resultDisplay.className = 'result-display';
    }
};

// Settings Modal Logic
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
});
closeSettingsModal.addEventListener('click', () => {
    settingsModal.classList.remove('show');
});

// Load settings from LocalStorage
function loadSettings() {
    filterInput.value = localStorage.getItem('ble_filter') || '';
    if (filterAdvHex) filterAdvHex.value = localStorage.getItem('ble_filterAdvHex') || '';
    hideUnknownCheck.checked = localStorage.getItem('ble_hideUnknown') === 'true';
    autoScanCheck.checked = localStorage.getItem('ble_autoScan') === 'true';
    
    serviceUuid.value = localStorage.getItem('ble_serviceUuid') || '';
    readUuid.value = localStorage.getItem('ble_readUuid') || '';
    writeUuid.value = localStorage.getItem('ble_writeUuid') || '';
    autoNotifyCheck.checked = localStorage.getItem('ble_autoNotify') !== 'false';
    
    if (autoSaveLogCheck) {
        autoSaveLogCheck.checked = localStorage.getItem('ble_autoSaveLog') !== 'false';
    }
    
    const savedMode = localStorage.getItem('ble_writeMode');
    if (savedMode === 'text') modeText.checked = true;
    else modeBinary.checked = true;
    
    commandInput.value = localStorage.getItem('ble_lastCommand') || '';
    
    if (autoScanCheck.checked) {
        autoScanCheck.dispatchEvent(new Event('change'));
    }
}

// Save settings to LocalStorage
function saveSettings() {
    localStorage.setItem('ble_filter', filterInput.value);
    if (filterAdvHex) localStorage.setItem('ble_filterAdvHex', filterAdvHex.value);
    localStorage.setItem('ble_hideUnknown', hideUnknownCheck.checked);
    localStorage.setItem('ble_autoScan', autoScanCheck.checked);
    localStorage.setItem('ble_serviceUuid', serviceUuid.value);
    localStorage.setItem('ble_readUuid', readUuid.value);
    localStorage.setItem('ble_writeUuid', writeUuid.value);
    localStorage.setItem('ble_autoNotify', autoNotifyCheck.checked);
    if (autoSaveLogCheck) {
        localStorage.setItem('ble_autoSaveLog', autoSaveLogCheck.checked);
    }
    localStorage.setItem('ble_writeMode', modeText.checked ? 'text' : 'binary');
    localStorage.setItem('ble_lastCommand', commandInput.value);
}

let elsToSave = [filterInput, filterAdvHex, hideUnknownCheck, autoScanCheck, serviceUuid, readUuid, writeUuid, autoNotifyCheck, modeBinary, modeText, commandInput];
if (autoSaveLogCheck) elsToSave.push(autoSaveLogCheck);

elsToSave.forEach(el => {
    el.addEventListener('change', saveSettings);
    if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'radio')) {
        el.addEventListener('input', saveSettings);
    }
});

// Logging
function logMessage(msg, type = '') {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    const logStr = `[${time}] ${msg}`;
    div.textContent = logStr;
    logArea.appendChild(div);
    logArea.scrollTop = logArea.scrollHeight;
    
    // Ticker Log
    if (tickerLogText) {
        tickerLogText.textContent = logStr;
    }
    
    // Auto-save to backend
    if (autoSaveLogCheck && autoSaveLogCheck.checked) {
        fetch(`${API_BASE}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ log: logStr })
        }).catch(e => console.error("Auto-save log failed", e));
    }
}

// Write to Response Data Panel
function logResponse(msg) {
    if (!responseDisplay) return;
    if (responseDisplay.textContent.includes('等待回應...') || responseDisplay.textContent.includes('等待响应...') || responseDisplay.textContent.includes('Waiting for response...') || responseDisplay.textContent.includes('Đang chờ phản hồi...')) {
        responseDisplay.textContent = '';
    }
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    div.textContent = `[${time}] ${msg}`;
    
    // Add alternating colors or distinct styling for Tx/Rx if needed
    if (msg.startsWith('Tx')) div.style.color = 'var(--primary-color)';
    if (msg.startsWith('Rx')) div.style.color = 'var(--success-color)';
    
    responseDisplay.appendChild(div);
    responseDisplay.scrollTop = responseDisplay.scrollHeight;
}

clearLogBtn.addEventListener('click', () => {
    logArea.innerHTML = '';
});

// History Log Modal Logic
async function fetchHistoryDates() {
    try {
        const res = await fetch(`${API_BASE}/logs/dates`);
        const data = await res.json();
        historyDateSelect.innerHTML = '';
        if (data.dates && data.dates.length > 0) {
            data.dates.forEach(date => {
                const opt = document.createElement('option');
                opt.value = date;
                opt.textContent = date;
                historyDateSelect.appendChild(opt);
            });
            fetchHistoryContent(data.dates[0]);
        } else {
            historyLogArea.textContent = t('msg_no_records');
        }
    } catch (e) {
        historyLogArea.textContent = t('msg_error_load_dates');
    }
}

async function fetchHistoryContent(date) {
    if (!date) return;
    historyLogArea.textContent = t('msg_loading_history');
    try {
        const res = await fetch(`${API_BASE}/logs/${date}`);
        const data = await res.json();
        if (data.content) {
            historyLogArea.textContent = data.content;
        } else {
            historyLogArea.textContent = data.message || t('msg_no_content');
        }
    } catch (e) {
        historyLogArea.textContent = t('msg_error_load_content');
    }
}

if (historyLogBtn) {
    historyLogBtn.addEventListener('click', () => {
        historyModal.classList.add('show');
        fetchHistoryDates();
    });
}

if (closeHistoryModal) {
    closeHistoryModal.addEventListener('click', () => {
        historyModal.classList.remove('show');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.classList.remove('show');
    }
    if (e.target === settingsModal) {
        settingsModal.classList.remove('show');
    }
});

if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => {
        fetchHistoryDates();
    });
}

if (historyDateSelect) {
    historyDateSelect.addEventListener('change', (e) => {
        fetchHistoryContent(e.target.value);
    });
}

if (deleteHistoryBtn) {
    deleteHistoryBtn.addEventListener('click', async () => {
        const date = historyDateSelect.value;
        if (!date) return;
        if (confirm(t('confirm_delete_history').replace('{date}', date))) {
            try {
                await fetch(`${API_BASE}/logs/${date}`, { method: 'DELETE' });
                fetchHistoryDates();
            } catch (e) {
                alert(t('alert_delete_failed'));
            }
        }
    });
}

if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', () => {
        const content = historyLogArea.textContent;
        const date = historyDateSelect.value;
        if (!content || !date) return;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ble_log_${date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// WebSocket setup
function setupWebSocket() {
    ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notify') {
            logMessage(`Notify [${data.uuid}]: ${data.data}`);
            logResponse(`Rx (Notify): ${data.data}`);
        } else if (data.type === 'disconnect') {
            logMessage(t('log_device_disconnected'), 'error');
            setConnectionState(false);
        }
    };
    ws.onclose = () => {
        setTimeout(setupWebSocket, 3000);
    };
}

// Set UI Connection State
function setConnectionState(connected, deviceName = '') {
    isConnected = connected;
    if (connected) {
        connectionStatusDot.className = 'dot connected';
        connectionStatusText.textContent = t('status_connected');
        connectedTargetName.textContent = `[${deviceName}] 📍 MAC: ${currentAddress}`;
        connectionStatusCard.classList.remove('disconnected');
        connectionStatusCard.classList.add('connected');
        connectionStatusCard.disabled = false;
        connectBtn.disabled = true;
        sendBtn.disabled = false;
        window.setTestResult('');
        if (responseDisplay) responseDisplay.textContent = t('text_waiting_response');
    } else {
        connectionStatusDot.className = 'dot disconnected';
        connectionStatusText.textContent = t('status_disconnected');
        connectedTargetName.textContent = '請從左側選擇設備，並雙擊連線';
        connectionStatusCard.classList.remove('connected');
        connectionStatusCard.classList.add('disconnected');
        connectionStatusCard.disabled = true;
        connectBtn.disabled = false;
        sendBtn.disabled = true;
        currentAddress = null;
    }
}

// Scan Devices
async function fetchDevices(silent = false) {
    if (!silent) logMessage(t('log_scanning'), 'info');
    try {
        const url = new URL(`${API_BASE}/devices`);
        if (filterAdvHex && filterAdvHex.value) {
            url.searchParams.append('adv_hex', filterAdvHex.value);
        }
        const res = await fetch(url);
        const data = await res.json();
        globalDevices = data.devices; // 更新全域設備清單
        renderDevices(globalDevices);
    } catch (err) {
        if (!silent) logMessage(`${t('log_scan_fail')}: ${err.message}`, 'error');
    }
}

scanBtn.addEventListener('click', () => fetchDevices(false));

autoScanCheck.addEventListener('change', (e) => {
    saveSettings();
    if (e.target.checked) {
        scanBtn.disabled = true;
        fetchDevices(true);
        autoScanInterval = setInterval(() => fetchDevices(true), 2000);
    } else {
        scanBtn.disabled = false;
        clearInterval(autoScanInterval);
    }
});

function renderDevices(devices) {
    deviceList.innerHTML = '';
    const filterTerm = filterInput.value.toLowerCase();
    const currentTarget = targetAddress.value;
    const hideUnknown = hideUnknownCheck.checked;
    
    const filtered = devices.filter(d => {
        if (hideUnknown && d.name === 'Unknown') return false;
        if (!filterTerm) return true;
        return d.name.toLowerCase().includes(filterTerm) || 
               d.address.toLowerCase().includes(filterTerm);
    });

    if (filtered.length === 0) {
        deviceList.innerHTML = `<li class="device-item"><span class="device-address">${t('no_device')}</span></li>`;
        return;
    }

    filtered.forEach(d => {
        const li = document.createElement('li');
        li.className = 'device-item';
        let advHexHtml = '';
        if (d.adv_hex_strings && d.adv_hex_strings.length > 0) {
            advHexHtml = ` <span class="device-adv" style="font-size: 0.8em; opacity: 0.7;">[0x16: ${d.adv_hex_strings.join(', ').toUpperCase()}]</span>`;
        }

        li.innerHTML = `
            <span class="device-name">${d.name}</span>
            <span class="device-address">${d.address}${advHexHtml}</span>
        `;
        
        if (d.address === currentTarget) {
            li.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        }

        li.addEventListener('click', () => {
            // 防連點機制：如果正在連線中 (按鈕被鎖定) 或已連線，就忽略這次點擊
            if (isConnected || connectBtn.disabled) return;

            targetAddress.value = d.address;
            targetAddress.dataset.name = d.name; 
            
            document.querySelectorAll('.device-item').forEach(el => el.style.backgroundColor = '');
            li.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            
            connectBtn.click(); // 一鍵觸發連線
        });

        deviceList.appendChild(li);
    });
}

// Connect
connectBtn.addEventListener('click', async () => {
    const address = targetAddress.value;
    if (!address) return;
    
    logMessage(`${t('log_connecting')} ${address}...`, 'info');
    connectBtn.disabled = true;
    
    try {
        const payload = {
            address: address,
            service_uuid: serviceUuid.value || null,
            read_uuid: readUuid.value || null,
            auto_notify: autoNotifyCheck.checked
        };
        
        const res = await fetch(`${API_BASE}/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.status === 'success') {
            logMessage(t('log_connect_success'), 'info');
            if (autoNotifyCheck.checked && readUuid.value) {
                logMessage(t('log_auto_notify_enabled'), 'info');
            }
            currentAddress = address;
            setConnectionState(true, targetAddress.dataset.name || 'Unknown');
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        logMessage(`${t('log_connect_fail')}: ${err.message}`, 'error');
        setConnectionState(false);
    }
});

// Disconnect (via Card Click)
connectionStatusCard.addEventListener('click', async () => {
    if (!currentAddress || !isConnected) return;
    logMessage(t('log_disconnecting'), 'info');
    try {
        await fetch(`${API_BASE}/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: currentAddress })
        });
        setConnectionState(false);
    } catch (err) {
        logMessage(`${t('log_disconnect_fail')}: ${err.message}`, 'error');
    }
});

// =========================================================================
// 🌟 產線客製化指令處理 Hook 🌟
// 讓不懂 Python 的同事也可以在這裡修改邏輯
// 當使用者在「發送指令」輸入框每打一個字，就會觸發這個函數
// 參數:
//   - inputStr: 使用者在畫面上輸入的字串
//   - mode: 目前選擇的寫入模式 ('text' 或 'binary')
//   - advHexStrings: 該連線設備的 Type 0x16 廣播資料陣列 (例如 ['f0ff35'])
// =========================================================================
function processCommandHook(inputStr, mode, advHexStrings = []) {
    // 您可以在這裡加入客製化邏輯，例如根據 advHexStrings 的值自動改變指令
    // console.log("目前連線設備的 Type 0x16 資料為:", advHexStrings);

    let resultHex = "";
    if (mode === 'text') {
        for (let i = 0; i < inputStr.length; i++) {
            resultHex += inputStr.charCodeAt(i).toString(16).padStart(2, '0');
        }
    } else {
        resultHex = inputStr.replace(/\s+/g, '').toLowerCase();
        if (!/^[0-9a-f]*$/.test(resultHex)) return { valid: false };
    }
    return { valid: resultHex.length % 2 === 0 && resultHex.length > 0, hex: resultHex };
}

commandInput.addEventListener('input', (e) => {
    const mode = document.querySelector('input[name="writeMode"]:checked').value;
    
    // 找出目前連線設備的 adv_hex_strings
    let currentAdvHexStrings = [];
    if (currentAddress) {
        const dev = globalDevices.find(d => d.address === currentAddress);
        if (dev && dev.adv_hex_strings) {
            currentAdvHexStrings = dev.adv_hex_strings;
        }
    }

    const result = processCommandHook(e.target.value, mode, currentAdvHexStrings);
    
    if (result.valid) {
        processedHexCommand = result.hex;
        sendBtn.disabled = !isConnected;
    } else {
        processedHexCommand = "";
        sendBtn.disabled = true;
    }
});

if (btnClearLog) {
    btnClearLog.addEventListener('click', () => {
        if (responseDisplay) responseDisplay.textContent = t('text_waiting_response');
    });
}

if (btnClearResult) {
    btnClearResult.addEventListener('click', () => {
        if (window.setTestResult) window.setTestResult('');
    });
}

document.querySelectorAll('input[name="writeMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
        saveSettings();
        commandInput.dispatchEvent(new Event('input'));
    });
});

// Send Command
sendBtn.addEventListener('click', async () => {
    if (!currentAddress || !writeUuid.value) {
        logMessage(t('log_send_err_noconn'), "error");
        return;
    }
    if (!processedHexCommand) {
        logMessage(t('log_send_err_invalid'), "error");
        return;
    }

    try {
        const payload = {
            address: currentAddress,
            uuid: writeUuid.value,
            data_hex: processedHexCommand
        };
        const res = await fetch(`${API_BASE}/write`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
            logMessage(`${t('log_sent')}: ${processedHexCommand}`);
            logResponse(`Tx (Write): ${processedHexCommand}`);
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        logMessage(`${t('log_send_fail')}: ${err.message}`, 'error');
    }
});

// Initialization
loadSettings();
setupWebSocket();
commandInput.dispatchEvent(new Event('input'));
