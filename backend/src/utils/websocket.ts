import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initWebSocket(server: HTTPServer, allowedOrigins: string[]) {
  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);
    
    // Allow client to join rooms (e.g. by department ID or machine alerts group)
    socket.on("join-room", (roomName: string) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit message to all connected clients
 */
export function broadcast(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Emit message to a specific room (e.g. specific department or machine ID)
 */
export function emitToRoom(room: string, event: string, data: any) {
  if (io) {
    io.to(room).emit(event, data);
  }
}
