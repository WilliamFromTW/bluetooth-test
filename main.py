import asyncio
import time
import os
import datetime
from typing import Dict, Any, Optional

LOGS_DIR = "logs"
os.makedirs(LOGS_DIR, exist_ok=True)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from bleak import BleakScanner, BleakClient
from pydantic import BaseModel

app = FastAPI(title="Bluetooth Web Interface")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("static/index.html")

# Global states
discovered_devices: Dict[str, Dict[str, Any]] = {}
active_clients: Dict[str, BleakClient] = {}
active_websockets: list[WebSocket] = []

# Device scanning background task
async def scan_devices():
    def detection_callback(device, advertisement_data):
        # Update device info and last seen timestamp
        discovered_devices[device.address] = {
            "name": device.name or "Unknown",
            "address": device.address,
            "rssi": advertisement_data.rssi,
            "last_seen": time.time()
        }

    while True:
        try:
            scanner = BleakScanner(detection_callback)
            await scanner.start()
            print("Bluetooth scanner started successfully.")
            while True:
                await asyncio.sleep(1)
                current_time = time.time()
                # Remove devices not seen in the last 10 seconds
                stale_addresses = [
                    addr for addr, data in discovered_devices.items()
                    if current_time - data["last_seen"] > 10
                ]
                for addr in stale_addresses:
                    del discovered_devices[addr]
        except Exception as e:
            print(f"Scanner error: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(scan_devices())

@app.get("/api/devices")
async def get_devices():
    return {"devices": list(discovered_devices.values())}

class ConnectRequest(BaseModel):
    address: str
    service_uuid: Optional[str] = None
    read_uuid: Optional[str] = None
    auto_notify: bool = False

async def notify_callback(address: str, uuid: str, data: bytearray):
    hex_data = data.hex()
    message = {
        "type": "notify",
        "address": address,
        "uuid": uuid,
        "data": hex_data
    }
    for ws in active_websockets:
        await ws.send_json(message)

def disconnect_callback(client: BleakClient):
    # This callback is triggered when device physically disconnects
    address = client.address
    if address in active_clients:
        del active_clients[address]
    # Notify frontend about disconnection
    message = {
        "type": "disconnect",
        "address": address,
    }
    for ws in active_websockets:
        asyncio.create_task(ws.send_json(message))

@app.post("/api/connect")
async def connect_device(req: ConnectRequest):
    if req.address in active_clients and active_clients[req.address].is_connected:
        return {"status": "error", "message": "Already connected"}
    
    client = BleakClient(req.address, disconnected_callback=disconnect_callback)
    try:
        await client.connect()
        
        # Verify Service UUID if provided
        if req.service_uuid:
            service = client.services.get_service(req.service_uuid)
            if not service:
                await client.disconnect()
                return {"status": "error", "message": f"Service UUID {req.service_uuid} not found"}

        active_clients[req.address] = client

        # Auto enable notify if requested
        if req.auto_notify and req.read_uuid:
            def create_callback(addr, uid):
                return lambda sender, data: asyncio.create_task(notify_callback(addr, uid, data))
            
            await client.start_notify(req.read_uuid, create_callback(req.address, req.read_uuid))

        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/disconnect")
async def disconnect_device(req: ConnectRequest):
    if req.address in active_clients:
        await active_clients[req.address].disconnect()
        # Deletion from active_clients will happen in disconnect_callback
    return {"status": "success"}

class WriteRequest(BaseModel):
    address: str
    uuid: str
    data_hex: str 

@app.post("/api/write")
async def write_characteristic(req: WriteRequest):
    if req.address not in active_clients or not active_clients[req.address].is_connected:
        return {"status": "error", "message": "Device not connected"}
    
    try:
        data_bytes = bytes.fromhex(req.data_hex)
        await active_clients[req.address].write_gatt_char(req.uuid, data_bytes)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class NotifyRequest(BaseModel):
    address: str
    uuid: str
    enable: bool

@app.post("/api/notify")
async def toggle_notify(req: NotifyRequest):
    if req.address not in active_clients or not active_clients[req.address].is_connected:
        return {"status": "error", "message": "Device not connected"}
    
    try:
        client = active_clients[req.address]
        if req.enable:
            def create_callback(addr, uid):
                return lambda sender, data: asyncio.create_task(notify_callback(addr, uid, data))
            await client.start_notify(req.uuid, create_callback(req.address, req.uuid))
        else:
            await client.stop_notify(req.uuid)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_websockets.remove(websocket)

class LogRequest(BaseModel):
    log: str

@app.post("/api/logs")
async def save_log(req: LogRequest):
    today = datetime.date.today().isoformat()
    log_file = os.path.join(LOGS_DIR, f"{today}.log")
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(req.log + "\n")
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/logs/dates")
async def get_log_dates():
    try:
        files = [f.replace(".log", "") for f in os.listdir(LOGS_DIR) if f.endswith(".log")]
        files.sort(reverse=True)
        return {"dates": files}
    except Exception as e:
        return {"dates": []}

@app.get("/api/logs/{date}")
async def get_log_content(date: str):
    log_file = os.path.join(LOGS_DIR, f"{date}.log")
    if not os.path.exists(log_file):
        return {"status": "error", "message": "Log not found"}
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/api/logs/{date}")
async def delete_log(date: str):
    log_file = os.path.join(LOGS_DIR, f"{date}.log")
    if os.path.exists(log_file):
        try:
            os.remove(log_file)
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "error", "message": "Log not found"}
