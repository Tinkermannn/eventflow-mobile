import { Server as SocketIOServer } from 'socket.io';

// Emit update lokasi peserta ke semua client di event tertentu
export const emitLocationUpdate = (eventId: string, location: any) => {
  const io = require('./socket').getSocketInstance();
  io.to(eventId).emit('locationUpdate', location);
};
