using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public class TileMapExtractor
{
    List<MapTile> GetAllTilePositions(Tilemap tilemap) {
        BoundsInt bounds = tilemap.cellBounds;
        List<MapTile> tiles = new List<MapTile>();

        foreach (Vector3Int position in bounds.allPositionsWithin) {
            // Check if there's a tile at this position
            TileBase tile = tilemap.GetTile(position);

            if (tile != null) {
                MapTile mapTile = new MapTile(
                                    tile.name,
                                    tilemap.CellToWorld(position),
                                    new Vector2(1, 1)
                                );
                                
                tiles.Add(mapTile);
            }
        }
        return tiles;
    }
}
