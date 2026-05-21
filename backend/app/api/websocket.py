import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        data = json.dumps(message)
        for conn in self.active_connections:
            try:
                await conn.send_text(data)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 简单echo或处理订阅
            try:
                payload = json.loads(data)
                await websocket.send_text(json.dumps({"echo": payload}))
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def push_price_update(planet_id: int, prices: list[dict]):
    await manager.broadcast({
        "type": "price_update",
        "data": {"planetId": planet_id, "prices": prices},
    })

async def push_event(event: dict):
    await manager.broadcast({
        "type": "event",
        "data": event,
    })

async def push_wanted_update(player_id: int, level: int):
    await manager.broadcast({
        "type": "wanted_update",
        "data": {"playerId": player_id, "wantedLevel": level},
    })
