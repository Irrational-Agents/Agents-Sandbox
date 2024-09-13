// It represnt the items
using UnityEngine;

[System.Serializable]
public class ItemTile: MapTile {

    public string tile;
    public Vector2 position;
    public Vector2 scale;

    public string Tile {
        get { return tile; }
        set { tile = value; }
    }

    public Vector2 Position {
        get { return position; }
        set { position = value; }
    }

    public Vector2 Scale {
        get { return scale; }
        set { scale = value; }
    }
}