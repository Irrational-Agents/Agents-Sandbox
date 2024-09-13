using System.Collections.Generic;
using System.IO;
using UnityEngine;

public class ObjectTree : MonoBehaviour
{
    // Root class for object hierarchy
    [System.Serializable]
    public class GameObjectData
    {
        public string name;
        public Vector3 position;
        public List<GameObjectData> children = new List<GameObjectData>();
    }

    void Start()
    {
        // Create a list to store root objects
        List<GameObjectData> allObjectData = new List<GameObjectData>();

        // Get all GameObjects in the scene
        GameObject[] allObjects = UnityEngine.Object.FindObjectsOfType<GameObject>();

        // Find all root objects (objects with no parent)
        foreach (GameObject obj in allObjects)
        {
            if (obj.transform.parent == null)
            {
                // Add the root objects and their children to the list
                allObjectData.Add(CollectObjectData(obj.transform));
            }
        }

        // Convert to JSON and write to a file
        string json = JsonUtility.ToJson(new { objects = allObjectData }, true);
        Debug.Log(json);
        File.WriteAllText(Application.dataPath + "/objectTree.json", json);

        Debug.Log("Object hierarchy has been written to: " + Application.dataPath + "/objectTree.json");
    }

    // Recursive method to collect data for each GameObject and its children
    GameObjectData CollectObjectData(Transform obj)
    {
        GameObjectData data = new GameObjectData
        {
            name = obj.name,
            position = obj.position
        };

        // Recurse through the children
        foreach (Transform child in obj)
        {
            data.children.Add(CollectObjectData(child));
        }

        return data;
    }
}
