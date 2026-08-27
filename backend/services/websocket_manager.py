"""
TBS II - Authenticated WebSocket Connection Manager
Quản lý kết nối WebSocket có xác thực JWT.
"""
import json
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Lưu trữ connection kèm thông tin user
        self.active_connections: Dict[WebSocket, str] = {}  # websocket -> emp_code

    async def connect(self, websocket: WebSocket, emp_code: str):
        """Chấp nhận kết nối WebSocket đã xác thực."""
        await websocket.accept()
        self.active_connections[websocket] = emp_code

    def disconnect(self, websocket: WebSocket):
        """Ngắt kết nối WebSocket."""
        self.active_connections.pop(websocket, None)

    async def broadcast(self, message: dict):
        """
        Gửi message đến tất cả client đang kết nối.
        Tự động dọn dẹp connection lỗi.
        """
        json_msg = json.dumps(message, default=str)
        disconnected = []
        for connection in list(self.active_connections.keys()):
            try:
                await connection.send_text(json_msg)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def send_to_user(self, emp_code: str, message: dict):
        """Gửi message đến một user cụ thể."""
        json_msg = json.dumps(message, default=str)
        for connection, user_code in list(self.active_connections.items()):
            if user_code == emp_code:
                try:
                    await connection.send_text(json_msg)
                except Exception:
                    self.disconnect(connection)

    @property
    def connected_users(self) -> List[str]:
        """Danh sách emp_code đang online."""
        return list(set(self.active_connections.values()))

    @property
    def connection_count(self) -> int:
        """Số lượng kết nối hiện tại."""
        return len(self.active_connections)


ws_manager = ConnectionManager()
