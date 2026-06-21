// Configuration
const API_BASE = `http://${window.location.host}/api`;
const WS_URL = `ws://${window.location.host}/ws`;

// DOM Elements
const filterInput = document.getElementById('filterInput');
const scanBtn = document.getElementById('scanBtn');
const deviceList = document.getElementById('deviceList');
const targetAddress = document.getElementById('targetAddress');
const serviceUuid = document.getElementById('serviceUuid');
const readUuid = document.getElementById('readUuid');
const writeUuid = document.getElementById('writeUuid');
const autoNotifyCheck = document.getElementById('autoNotifyCheck');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const commandInput = document.getElementById('commandInput');
const processedCommandDisplay = document.getElementById('processedCommandDisplay');
const sendBtn = document.getElementById('sendBtn');
const logArea = document.getElementById('logArea');
const clearLogBtn = document.getElementById('clearLogBtn');
const connectionStatusDot = document.querySelector('.status-indicator .dot');
const connectionStatusText = document.querySelector('.status-indicator .text');

// State
let isConnected = false;
let currentAddress = null;
let ws = null;
let processedHexCommand = ""; // Store the final hex to send

// Load settings from LocalStorage
function loadSettings() {
    filterInput.value = localStorage.getItem('ble_filter') || '';
    serviceUuid.value = localStorage.getItem('ble_serviceUuid') || '';
    readUuid.value = localStorage.getItem('ble_readUuid') || '';
    writeUuid.value = localStorage.getItem('ble_writeUuid') || '';
}

// Save settings to LocalStorage
function saveSettings() {
    localStorage.setItem('ble_filter', filterInput.value);
    localStorage.setItem('ble_serviceUuid', serviceUuid.value);
    localStorage.setItem('ble_readUuid', readUuid.value);
    localStorage.setItem('ble_writeUuid', writeUuid.value);
}

// Event Listeners for saving settings
[filterInput, serviceUuid, readUuid, writeUuid].forEach(el => {
    el.addEventListener('change', saveSettings);
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
        } else if (data.type === 'disconnect') {
            logMessage('設備已斷開連線', 'error');
            setConnectionState(false);
        }
    };
    ws.onclose = () => {
        setTimeout(setupWebSocket, 3000); // Reconnect WS
    };
}

// Set UI Connection State
function setConnectionState(connected) {
    isConnected = connected;
    if (connected) {
        connectionStatusDot.className = 'dot connected';
        connectionStatusText.textContent = '已連線';
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        sendBtn.disabled = false;
    } else {
        connectionStatusDot.className = 'dot disconnected';
        connectionStatusText.textContent = '未連線';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;
        currentAddress = null;
    }
}

// Scan Devices
let autoScanInterval = null;
const autoScanCheck = document.getElementById('autoScanCheck');

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
    
    const filtered = devices.filter(d => {
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
        
        // 保留選取高亮狀態
        if (d.address === currentTarget) {
            li.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        }

        li.addEventListener('click', () => {
            targetAddress.value = d.address;
            connectBtn.disabled = false;
            // Highlight selection
            document.querySelectorAll('.device-item').forEach(el => el.style.backgroundColor = '');
            li.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
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
            setConnectionState(true);
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

// Character hook logic (User request: each character input triggers a function)
function processCommandHook(inputStr, mode) {
    // 您可以在這裡客製化您的邏輯！
    // 例如：自動計算 Checksum，或將 Text 轉成 Hex
    let resultHex = "";
    
    if (mode === 'text') {
        // Text to Hex
        for (let i = 0; i < inputStr.length; i++) {
            resultHex += inputStr.charCodeAt(i).toString(16).padStart(2, '0');
        }
    } else {
        // Assume input is already hex (with optional spaces)
        resultHex = inputStr.replace(/\s+/g, '').toLowerCase();
        // Check if valid hex
        if (!/^[0-9a-f]*$/.test(resultHex)) {
            return { valid: false, display: "無效的十六進位格式" };
        }
    }
    
    return { 
        valid: resultHex.length % 2 === 0 && resultHex.length > 0, 
        display: resultHex || "等待輸入...",
        hex: resultHex
    };
}

// Listen to key events per user request
commandInput.addEventListener('input', (e) => {
    const mode = document.querySelector('input[name="writeMode"]:checked').value;
    const result = processCommandHook(e.target.value, mode);
    
    processedCommandDisplay.textContent = result.display;
    processedCommandDisplay.style.color = result.valid ? "#a7f3d0" : "#fca5a5";
    
    if (result.valid) {
        processedHexCommand = result.hex;
    } else {
        processedHexCommand = "";
    }
});

// Trigger reprocessing if mode changes
document.querySelectorAll('input[name="writeMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
        commandInput.dispatchEvent(new Event('input'));
    });
});

// Send Command
sendBtn.addEventListener('click', async () => {
    if (!currentAddress || !writeUuid.value) {
        logMessage("請確認已連線且填寫 Write UUID", "error");
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
