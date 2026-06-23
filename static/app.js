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

// History Log Elements
const autoSaveLogCheck = document.getElementById('autoSaveLogCheck');
const historyLogBtn = document.getElementById('historyLogBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyDateSelect = document.getElementById('historyDateSelect');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const historyLogArea = document.getElementById('historyLogArea');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const deleteHistoryBtn = document.getElementById('deleteHistoryBtn');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// State
let isConnected = false;
let currentAddress = null;
let ws = null;
let autoScanInterval = null;
let processedHexCommand = "";

// Language updates dynamic elements
window.addEventListener('languageChanged', () => {
    if (isConnected) {
        connectionStatusText.textContent = t('status_connected');
    } else {
        connectionStatusText.textContent = t('status_disconnected');
    }
    if (deviceList.innerHTML.includes('無符合設備') || deviceList.innerHTML.includes('No matching devices') || deviceList.innerHTML.includes('Không có thiết bị phù hợp') || deviceList.innerHTML.includes('无符合设备')) {
        deviceList.innerHTML = `<li class="device-item"><span class="device-address">${t('no_device')}</span></li>`;
    }
    if (!resultDisplay.classList.contains('ok') && !resultDisplay.classList.contains('ng')) {
        resultDisplay.textContent = t('text_waiting');
    }
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
        resultDisplay.textContent = t('text_waiting');
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

let elsToSave = [filterInput, hideUnknownCheck, autoScanCheck, serviceUuid, readUuid, writeUuid, autoNotifyCheck, modeBinary, modeText, commandInput];
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
    
    // Auto-save to backend
    if (autoSaveLogCheck && autoSaveLogCheck.checked) {
        fetch(`${API_BASE}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ log: logStr })
        }).catch(e => console.error("Auto-save log failed", e));
    }
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
        connectedTargetName.textContent = `(${deviceName})`;
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        sendBtn.disabled = false;
        window.setTestResult('');
    } else {
        connectionStatusDot.className = 'dot disconnected';
        connectionStatusText.textContent = t('status_disconnected');
        connectedTargetName.textContent = '';
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;
        currentAddress = null;
    }
}

// Scan Devices
async function fetchDevices(silent = false) {
    if (!silent) logMessage(t('log_scanning'), 'info');
    try {
        const res = await fetch(`${API_BASE}/devices`);
        const data = await res.json();
        renderDevices(data.devices);
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

// Disconnect
disconnectBtn.addEventListener('click', async () => {
    if (!currentAddress) return;
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

// Character hook logic
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
