using UnityEngine;
using WebSocketSharp;

public class WebSocketService
{
    // WebSocket client instance
    private WebSocket ws;

    // Boolean to check connection status
    private bool isConnected = false;

    // Event delegates for external subscription
    public delegate void OnMessageReceivedHandler(string message);
    public event OnMessageReceivedHandler OnMessageReceived;

    public delegate void OnConnectionHandler();
    public event OnConnectionHandler OnConnected;
    
    public delegate void OnDisconnectionHandler();
    public event OnDisconnectionHandler OnDisconnected;

    // Constructor to initialize WebSocket with a URL
    public WebSocketService(string url)
    {
        // Initialize the WebSocket with the specified URL
        ws = new WebSocket(url);

        // Set up event handlers
        ws.OnOpen += OnOpen;
        ws.OnMessage += OnMessage;
        ws.OnError += OnError;
        ws.OnClose += OnClose;
    }

    // Method to connect to the WebSocket server
    public void Connect()
    {
        ws.ConnectAsync();
    }

    // Method to send a message to the WebSocket server
    public void SendMessage(string message)
    {
        if (isConnected)
        {
            ws.Send(message);
            Debug.Log("Message sent: " + message);
        }
        else
        {
            Debug.LogWarning("Cannot send message, not connected to the WebSocket server.");
        }
    }

    // Method to close the WebSocket connection
    public void Close()
    {
        if (ws != null && ws.IsAlive)
        {
            ws.CloseAsync();
        }
    }

    // Called when the WebSocket connection is opened
    private void OnOpen(object sender, System.EventArgs e)
    {
        isConnected = true;
        Debug.Log("WebSocket connected.");

        // Notify listeners that the connection was successful
        OnConnected?.Invoke();
    }

    // Called when a message is received from the WebSocket server
    private void OnMessage(object sender, MessageEventArgs e)
    {
        Debug.Log("WebSocket message received: " + e.Data);

        // Notify listeners that a message was received
        OnMessageReceived?.Invoke(e.Data);
    }

    // Called when an error occurs in the WebSocket connection
    private void OnError(object sender, ErrorEventArgs e)
    {
        Debug.LogError("WebSocket error: " + e.Message);
    }

    // Called when the WebSocket connection is closed
    private void OnClose(object sender, CloseEventArgs e)
    {
        isConnected = false;
        Debug.Log("WebSocket closed: " + e.Reason);

        // Notify listeners that the connection was closed
        OnDisconnected?.Invoke();
    }
}
