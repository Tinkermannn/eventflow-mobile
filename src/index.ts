
import { env } from './config/env';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import reportRoutes from './routes/reportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import virtualAreaRoutes from './routes/virtualAreaRoutes';
import locationRoutes from './routes/locationRoutes';
import userNotificationRoutes from './routes/userNotificationRoutes';
import deviceRoutes from './routes/deviceRoutes';
import { setSocketInstance } from './utils/socket';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: env.SOCKET_IO_ORIGIN,
    methods: ['GET', 'POST']
  }
});
setSocketInstance(io);

app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('EventFlow backend is running!');
});

app.use('/reports', reportRoutes);
app.use('/notifications', notificationRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/events', virtualAreaRoutes);
app.use('/', locationRoutes);

app.use('/', userNotificationRoutes);
app.use('/', deviceRoutes);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  // Client mengirim event 'joinEventRoom' dengan eventId
  socket.on('joinEventRoom', (eventId: string) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event room ${eventId}`);
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
