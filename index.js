const express = require("express");
const http = require('http');
const { Server } = require("socket.io");
require("dotenv").config();

const cors = require('cors');
const helmet = require('helmet');
// const xss = require('xss-clean');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://your-frontend-app.com'], // Ganti dengan URL frontend Anda
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// --- Middleware Bawaan ---
app.use(cors());
app.use(helmet());
// app.use(xss());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Middleware untuk meneruskan instance `io` ke controllers ---
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- Socket.io Logic ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listener saat organizer join ke room event
    socket.on('subscribeToEvent', (eventId) => {
        socket.join(eventId);
        console.log(`Socket ${socket.id} joined room for event ${eventId}`);
    });

    // Listener saat organizer leave room event
    socket.on('unsubscribeFromEvent', (eventId) => {
        socket.leave(eventId);
        console.log(`Socket ${socket.id} left room for event ${eventId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


const authRouter = require('./src/routes/auth.route');
const userRouter = require('./src/routes/user.route'); // BARU
const eventRouter = require('./src/routes/event.route');
const locationRouter = require('./src/routes/location.route');
const reportRouter = require('./src/routes/report.route'); // BARU

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter); // BARU
app.use('/api/events', eventRouter);
app.use('/api/events', locationRouter); // Sudah ada sebelumnya
app.use('/api/events', reportRouter); // BARU


// --- Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        payload: null
    });
});

server.listen(PORT, () => {
    console.log(`Server is running with Socket.io on ${PORT}`);
});