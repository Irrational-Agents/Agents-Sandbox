using UnityEngine;

public class GameManager : MonoBehaviour
{
    private WebSocketService webSocketService;

    // WebSocket URL
    [SerializeField] private string webSocketUrl = "ws://agents-sim-dev-lo5zb4dpiq-ts.a.run.app:8000";

    // Start is called before the first frame update
    void Start()
    {
        // Create a new WebSocketService instance with the specified URL
        webSocketService = new WebSocketService(webSocketUrl);

        // Subscribe to WebSocketService events
        webSocketService.OnMessageReceived += HandleMessageReceived;
        webSocketService.OnConnected += HandleConnected;
        webSocketService.OnDisconnected += HandleDisconnected;

        // Connect to the WebSocket server
        webSocketService.Connect();
    }

    // Event handler for receiving WebSocket messages
    private void HandleMessageReceived(string message)
    {
        Debug.Log("Received message from WebSocket: " + message);
        // Process the message as needed
    }

    // Event handler for WebSocket connection established
    private void HandleConnected()
    {
        Debug.Log("WebSocket connection established.");

        // Example: Send a message to the WebSocket server
        webSocketService.SendMessage("Hello, WebSocket server!");
    }

    // Event handler for WebSocket connection closed
    private void HandleDisconnected()
    {
        Debug.Log("WebSocket connection closed.");
    }

    // OnDestroy is called when the GameObject is destroyed
    private void OnDestroy()
    {
        // Close the WebSocket connection when the GameObject is destroyed
        if (webSocketService != null)
        {
            webSocketService.Close();
        }
    }
}
