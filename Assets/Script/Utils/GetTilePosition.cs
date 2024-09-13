using UnityEngine;
using UnityEngine.Tilemaps;

public class GetTilePosition : MonoBehaviour
{
    public Tilemap tilemap;

    void Start()
    {
        // Ensure the tilemap reference is assigned in the Inspector or through GetComponent
        if (tilemap == null)
        {
            tilemap = GetComponent<Tilemap>();
        }

        GetAllTilePositions();
    }

    void GetAllTilePositions()
    {
        // Get the cell bounds of the tilemap
        BoundsInt bounds = tilemap.cellBounds;

        // Iterate through all the positions in the tilemap's bounds
        foreach (Vector3Int position in bounds.allPositionsWithin)
        {
            // Check if there's a tile at this position
            TileBase tile = tilemap.GetTile(position);

            if (tile != null)
            {
                // Output or store the tile and its grid position
                Debug.Log("Tile at grid position: " + position);
            }
        }
    }
}
