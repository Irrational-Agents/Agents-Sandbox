using UnityEngine;

public interface MapTile {
    string Tile { get; set; }
    Vector2 Position { get; set; }
    Vector2 Scale { get; set; }
}