using System.Collections.Generic;
using System.IO;
using UnityEngine;


[System.Serializable]
public class ObjectData2D
{
    public string objectName;
    public string prefabName; // To recreate the object from a prefab
    public Vector2 position;
    public float rotation; // 2D rotation (in degrees)
    public string customData; // JSON for custom data (e.g., NPC health, items, etc.)
}