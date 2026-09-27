"""
Poker Timer - FastAPI Backend
Сервер для синхронизации данных между устройствами в локальной сети.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import json
import os

app = FastAPI(title="Poker Timer API")

# CORS для доступа из локальной сети
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Состояние игры (общее для всех подключённых клиентов)
game_state: Dict[str, Any] = {
    "settings": {
        "blindDuration": 12,
        "levelsBeforeAddon": 10,
        "stackPrice": 300,
        "stackChips": 10000,
        "addonPrice": 300,
        "addonChips": 20000,
        "startingChips": 10000,
        "startingBuyIn": 500,
        "tablesCount": 1,
        "seatsPerTable": 9,
    },
    "blinds": [
        {"smallBlind": 100, "bigBlind": 100},
        {"smallBlind": 100, "bigBlind": 200},
        {"smallBlind": 100, "bigBlind": 300},
        {"smallBlind": 200, "bigBlind": 400},
        {"smallBlind": 300, "bigBlind": 600},
        {"smallBlind": 400, "bigBlind": 800},
        {"smallBlind": 500, "bigBlind": 1000},
        {"smallBlind": 600, "bigBlind": 1200},
        {"smallBlind": 800, "bigBlind": 1600},
        {"smallBlind": 1000, "bigBlind": 2000},
        {"smallBlind": 1200, "bigBlind": 2400},
        {"smallBlind": 1500, "bigBlind": 3000},
        {"smallBlind": 2000, "bigBlind": 4000},
        {"smallBlind": 2500, "bigBlind": 5000},
        {"smallBlind": 3000, "bigBlind": 6000},
        {"smallBlind": 4000, "bigBlind": 8000},
        {"smallBlind": 5000, "bigBlind": 10000},
        {"smallBlind": 6000, "bigBlind": 12000},
    ],
    "players": [],
    "tables": [{"id": "table-1", "name": "Стол 1", "maxSeats": 9}],
    "currentLevel": 0,
    "timeRemaining": 720,
    "isRunning": False,
    "isPaused": False,
    "gameStarted": False,
    "theme": "dark",
}


class ConnectionManager:
    """Менеджер WebSocket подключений"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Отправляем текущее состояние новому подключению
        await websocket.send_json({"type": "STATE", "data": game_state})
        print(f"✅ Клиент подключён. Всего подключений: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"❌ Клиент отключён. Всего подключений: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Отправить сообщение всем подключённым клиентам"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        # Удаляем отключённые соединения
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


@app.get("/api/state")
async def get_state():
    """Получить текущее состояние игры"""
    return game_state


@app.post("/api/state")
async def update_state(state: Dict[str, Any]):
    """Обновить состояние игры и разослать всем клиентам"""
    global game_state
    game_state.update(state)
    await manager.broadcast({"type": "STATE", "data": game_state})
    return {"status": "ok"}


@app.post("/api/action")
async def perform_action(action: Dict[str, Any]):
    """Выполнить игровое действие"""
    action_type = action.get("type")
    
    if action_type == "start":
        game_state["isRunning"] = True
        game_state["isPaused"] = False
        game_state["gameStarted"] = True
    elif action_type == "pause":
        game_state["isRunning"] = False
        game_state["isPaused"] = True
    elif action_type == "resume":
        game_state["isRunning"] = True
        game_state["isPaused"] = False
    elif action_type == "next_level":
        game_state["currentLevel"] += 1
        game_state["timeRemaining"] = game_state["settings"]["blindDuration"] * 60
    elif action_type == "reset":
        game_state["currentLevel"] = 0
        game_state["timeRemaining"] = game_state["settings"]["blindDuration"] * 60
        game_state["isRunning"] = False
        game_state["isPaused"] = False
        game_state["gameStarted"] = False
    
    await manager.broadcast({"type": "STATE", "data": game_state})
    return {"status": "ok", "state": game_state}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket для синхронизации в реальном времени"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "UPDATE":
                # Обновление состояния от клиента
                update_data = data.get("data", {})
                game_state.update(update_data)
                # Разослать обновлённое состояние всем
                await manager.broadcast({"type": "STATE", "data": game_state})
                
            elif data.get("type") == "ACTION":
                # Выполнить действие
                action_data = data.get("data", {})
                action_type = action_data.get("type")
                
                if action_type == "start":
                    game_state["isRunning"] = True
                    game_state["isPaused"] = False
                    game_state["gameStarted"] = True
                elif action_type == "pause":
                    game_state["isRunning"] = False
                    game_state["isPaused"] = True
                elif action_type == "resume":
                    game_state["isRunning"] = True
                    game_state["isPaused"] = False
                elif action_type == "next_level":
                    game_state["currentLevel"] += 1
                    game_state["timeRemaining"] = game_state["settings"]["blindDuration"] * 60
                
                await manager.broadcast({"type": "STATE", "data": game_state})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Ошибка WebSocket: {e}")
        manager.disconnect(websocket)


# Раздача статических файлов фронтенда (для production)
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")

if os.path.exists(DIST_DIR):
    # Раздача assets
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Раздача SPA для всех маршрутов"""
        # Если файл существует — отдать его
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Иначе отдать index.html (SPA routing)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))


if __name__ == "__main__":
    import uvicorn
    
    print("""
╔══════════════════════════════════════════════════╗
║  🃏 Poker Timer - Backend Server                 ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Сервер запущен!                                 ║
║                                                  ║
║  Откройте в браузере:                            ║
║  http://localhost:3000                           ║
║                                                  ║
║  С телефона (в той же сети):                     ║
║  http://[IP-ноутбука]:3000                       ║
║                                                  ║
║  Для остановки: Ctrl+C                           ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(app, host="0.0.0.0", port=3000, log_level="info")
