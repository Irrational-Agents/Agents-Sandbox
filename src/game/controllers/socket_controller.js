
/**
 * @param {WebSocket} socket
 */

export const setupWebSocketRoutes = (socket) => {
    socket.send(JSON.stringify({ type: "test", message: "This is a test message." }));
}