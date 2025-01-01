const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json()); // For JSON request bodies

// Socket.IO Communication
let users = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handling messages
    socket.on('message', (data) => {
        io.emit('message', data); // Broadcast to all clients
    });

    // Handling media files
    socket.on('media', (data) => {
        io.emit('media', data); // Broadcast media info to all clients
    });

    // Handling typing events
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data); // Notify others when someone is typing
    });

    socket.on('logout', (data) => {
        console.log(data.user, 'has logged out');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Serve the app
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Route for uploading files
app.post('/upload', upload.single('media'), (req, res) => {
    res.json({ file: req.file });
});

