// Configuration
const API_BASE = `http://${window.location.host}/api`;
const WS_URL = `ws://${window.location.host}/ws`;

// DOM Elements
const filterInput = document.getElementById('filterInput');
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
const connectionStatusDot = document.querySelector('.status-indicator .dot');
const connectionStatusText = document.querySelector('.status-indicator .text');
const resultDisplay = document.getElementById('resultDisplay');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// State
let isConnected = false;
let currentAddress = null;
let ws = null;
let autoScanInterval = null;
let processedHexCommand = "";

// Global Helper to set huge OK/NG status
window.setTestResult = function(status) {
    if (status === 'OK') {
        resultDisplay.textContent = 'OK';
        resultDisplay.className = 'result-display ok';
    } else if (status === 'NG') {
        resultDisplay.textContent = 'NG';
        resultDisplay.className = 'result-display ng';
    } else {
        resultDisplay.textContent = '等待測試';
        resultDisplay.className = 'result-display';
    }
};

// Tabs Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Load settings from LocalStorage
function loadSettings() {
    filterInput.value = localStorage.getItem('ble_filter') || '';
    hideUnknownCheck.checked = localStorage.getItem('ble_hideUnknown') === 'true';
    autoScanCheck.checked = localStorage.getItem('ble_autoScan') === 'true';
    
    serviceUuid.value = localStorage.getItem('ble_serviceUuid') || '';
    readUuid.value = localStorage.getItem('ble_readUuid') || '';
    writeUuid.value = localStorage.getItem('ble_writeUuid') || '';
    autoNotifyCheck.checked = localStorage.getItem('ble_autoNotify') !== 'false';
    
    const savedMode = localStorage.getItem('ble_writeMode');
    if (savedMode === 'text') modeText.checked = true;
    else modeBinary.checked = true;
    
    commandInput.value = localStorage.getItem('ble_lastCommand') || '';
    
    // Resume auto scan if it was checked
    if (autoScanCheck.checked) {
        autoScanCheck.dispatchEvent(new Event('change'));
    }
}

// Save settings to LocalStorage
function saveSettings() {
    localStorage.setItem('ble_filter', filterInput.value);
    localStorage.setItem('ble_hideUnknown', hideUnknownCheck.checked);
    localStorage.setItem('ble_autoScan', autoScanCheck.checked);
    localStorage.setItem('ble_serviceUuid', serviceUuid.value);
    localStorage.setItem('ble_readUuid', readUuid.value);
    localStorage.setItem('ble_writeUuid', writeUuid.value);
    localStorage.setItem('ble_autoNotify', autoNotifyCheck.checked);
    localStorage.setItem('ble_writeMode', modeText.checked ? 'text' : 'binary');
    localStorage.setItem('ble_lastCommand', commandInput.value);
}

// Event Listeners for saving settings
[filterInput, hideUnknownCheck, autoScanCheck, serviceUuid, readUuid, writeUuid, autoNotifyCheck, modeBinary, modeText, commandInput].forEach(el => {
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
    div.textContent = `[${time}] ${msg}`;
    logArea.appendChild(div);
    logArea.scrollTop = logArea.scrollHeight;
}

clearLogBtn.addEventListener('click', () => {
    logArea.innerHTML = '';
});

// WebSocket setup
function setupWebSocket() {
    ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notify') {
            logMessage(`Notify [${data.uuid}]: ${data.data}`);
            
            // ============== 客製化測試邏輯區 ==============
            // 您可以在這裡實作判斷 OK 或 NG 的邏輯
            // 例如：
            // if (data.data === '01') window.setTestResult('OK');
            // else window.setTestResult('NG');
            // ============================================

        } else if (data.type === 'disconnect') {
            logMessage('設備已斷開連線', 'error');
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
        connectionStatusText.textContent = '已連線';
        connectedTargetName.textContent = `(${deviceName})`;
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        sendBtn.disabled = false;
        window.setTestResult(''); // Reset testing state
    } else {
        connectionStatusDot.className = 'dot disconnected';
        connectionStatusText.textContent = '未連線';
        connectedTargetName.textContent = '';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;
        currentAddress = null;
    }
}

// Scan Devices
async function fetchDevices(silent = false) {
    if (!silent) logMessage('掃描中...', 'info');
    try {
        const res = await fetch(`${API_BASE}/devices`);
        const data = await res.json();
        renderDevices(data.devices);
    } catch (err) {
        if (!silent) logMessage(`掃描失敗: ${err.message}`, 'error');
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
        deviceList.innerHTML = '<li class="device-item"><span class="device-address">無符合設備</span></li>';
        return;
    }

    filtered.forEach(d => {
        const li = document.createElement('li');
        li.className = 'device-item';
        li.innerHTML = `
            <span class="device-name">${d.name}</span>
            <span class="device-address">${d.address}</span>
        `;
        
        if (d.address === currentTarget) {
            li.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        }

        li.addEventListener('click', () => {
            targetAddress.value = d.address;
            targetAddress.dataset.name = d.name; 
            if (!isConnected) connectBtn.disabled = false;
            document.querySelectorAll('.device-item').forEach(el => el.style.backgroundColor = '');
            li.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        });

        // 點兩下自動連線
        li.addEventListener('dblclick', () => {
            targetAddress.value = d.address;
            targetAddress.dataset.name = d.name;
            if (!isConnected) connectBtn.click();
        });

        deviceList.appendChild(li);
    });
}

// Connect
connectBtn.addEventListener('click', async () => {
    const address = targetAddress.value;
    if (!address) return;
    
    logMessage(`嘗試連線至 ${address}...`, 'info');
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
            logMessage('連線成功！', 'info');
            if (autoNotifyCheck.checked && readUuid.value) {
                logMessage('已自動啟用 Notify', 'info');
            }
            currentAddress = address;
            setConnectionState(true, targetAddress.dataset.name || 'Unknown');
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        logMessage(`連線失敗: ${err.message}`, 'error');
        setConnectionState(false);
    }
});

// Disconnect
disconnectBtn.addEventListener('click', async () => {
    if (!currentAddress) return;
    logMessage('中斷連線中...', 'info');
    try {
        await fetch(`${API_BASE}/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: currentAddress })
        });
        setConnectionState(false);
    } catch (err) {
        logMessage(`斷開失敗: ${err.message}`, 'error');
    }
});

// Character hook logic (Silent processing without preview)
function processCommandHook(inputStr, mode) {
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

// Process input on the fly
commandInput.addEventListener('input', (e) => {
    const mode = document.querySelector('input[name="writeMode"]:checked').value;
    const result = processCommandHook(e.target.value, mode);
    
    if (result.valid) {
        processedHexCommand = result.hex;
        sendBtn.disabled = !isConnected;
    } else {
        processedHexCommand = "";
        sendBtn.disabled = true;
    }
});

document.querySelectorAll('input[name="writeMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
        saveSettings();
        commandInput.dispatchEvent(new Event('input'));
    });
});

// Send Command
sendBtn.addEventListener('click', async () => {
    if (!currentAddress || !writeUuid.value) {
        logMessage("請確認已連線且填寫 Write UUID (請至設定分頁確認)", "error");
        return;
    }
    if (!processedHexCommand) {
        logMessage("指令無效或為空", "error");
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
            logMessage(`已發送: ${processedHexCommand}`);
            
            // 您可以在送出指令後，使用 window.setTestResult()
            
        } else {
            throw new Error(data.message);
        }
    } catch (err) {
        logMessage(`發送失敗: ${err.message}`, 'error');
    }
});

// Initialization
loadSettings();
setupWebSocket();
commandInput.dispatchEvent(new Event('input'));
