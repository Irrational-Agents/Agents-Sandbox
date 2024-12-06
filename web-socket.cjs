const WebSocket = require('ws');
const readline = require('readline');

// Create a WebSocket server that listens on port 8080
const wss = new WebSocket.Server({ port: 8080, perMessageDeflate: false });

// Set up a readline interface to take input from the terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('WebSocket server started on ws://localhost:8080');

// When a client connects to the WebSocket server
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for messages from the client
  ws.on('message', (message) => {
    try {
      console.log('Received from client:', message);
      const parsedMessage = JSON.parse(message);
      console.log('Parsed message:', parsedMessage);
    } catch (error) {
      console.error('Error parsing client message:', message, error);
    }
  });

  // Handle WebSocket close event
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// When the server receives a message from the terminal, broadcast it to all connected clients
rl.on('line', (input) => {
  console.log(`Sending message to clients: ${input}`);
  
  // Broadcast the message to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ command: input }));
    }
  });
});
