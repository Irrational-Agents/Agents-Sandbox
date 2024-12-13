const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server with CORS settings
const io = socketIo(server, {
    cors: {
        origin: "*",  // Allows all origins (you can replace "*" with specific domains like "http://localhost:3000")
        methods: ["GET", "POST"],  // Allowed methods
    }
});

// Serve static files (e.g., HTML, CSS, JS)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Emit a message to the connected client
    payload = {"npc_name": 'Maria Lopez',
         "speed": 2,
        "direction": "down"
    }
    socket.emit('command.map.GetMapTown', '');
  //  socket.emit('command.map.NPCNavigate', JSON.stringify(payload));

    
    // Listen for a 'chat message' event from the client
    socket.on('command.map.GetMapTown', (msg) => {
        console.log(msg);
    });
    
    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
