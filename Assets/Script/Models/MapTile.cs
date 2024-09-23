using UnityEngine;

public class MapTile {
    string Tile { get; set; }
    Vector2 Position { get; set; }
    Vector2 Scale { get; set; }

    // Constructor to initialize the MapTile
    public MapTile(string tile, Vector2 position, Vector2 scale)
    {
        Tile = tile;
        Position = position;
        Scale = scale;
    }
}