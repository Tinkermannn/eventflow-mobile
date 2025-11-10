import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const setSocketInstance = (instance: SocketIOServer) => {
  io = instance;
};

export const getSocketInstance = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io instance not set');
  return io;
};

// Emit broadcast notification to all clients
export const emitNotification = (payload: any) => {
  if (!io) return;
  io.emit('notification', payload);
};
