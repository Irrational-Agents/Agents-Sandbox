using UnityEngine;
using System.Collections.Generic;
using System.IO;

public class SaveController : MonoBehaviour
{
//     // Dependencies
//     private SaveService _saveService;

//     // Game data
//     private WorldMap _worldMap;

//     // Initialization
//     void Start()
//     {
//         // Initialize repositories
//         IDataRepository<WorldMap> worldRepo = new JsonDataRepository<WorldMap>();

//         // Inject dependencies into the service
//         _saveService = new SaveService(WorldMap);

//         // Load the game state at the start
//         SaveGame();
//     }

//     // Save game data
//     public void SaveGame()
//     {
//         // Prepare game data
//         _worldData = CollectWorldData();

//         // Save game state
//         _saveService.SaveGame( _worldData);
//         Debug.Log("Game saved.");
//     }

//     // Load game data
//     public void LoadGame()
//     {
//         // Load game state
//         _worldData = _saveService.LoadGame();

//         if ( _worldData != null)
//         {
//             Debug.Log("Game loaded.");
//             RestoreWorldData(_worldData);
//         }
//         else
//         {
//             Debug.LogWarning("Failed to load game data.");
//         }
//     }
//     // Collect world data from the game
// private WorldData CollectWorldData()
// {
//     WorldData worldData = new WorldData();
//     worldData.objects = new List<ObjectData2D>();

//     // Start collecting data from the root objects
//     CollectDataFromHierarchy(transform, worldData);

//     return worldData;
// }

// // Recursive method to collect data from all objects in the hierarchy
// private void CollectDataFromHierarchy(Transform parentTransform, WorldData worldData)
// {
//     foreach (Transform childTransform in parentTransform)
//     {
//         GameObject obj = childTransform.gameObject;

//         ObjectData2D objData = new ObjectData2D
//         {
//             objectName = obj.name,
//             prefabName = GetPrefabName(obj), // Determine the prefab name
//             position = obj.transform.position,
//             rotation = obj.transform.eulerAngles.z, // For 2D games, only the z-axis rotation matters
//             customData = CollectCustomData(obj) // Collect custom data if needed
//         };

//         worldData.objects.Add(objData);

//         // Recursively collect data from child objects
//         CollectDataFromHierarchy(childTransform, worldData);
//     }
// }

// // Helper method to determine the prefab name from an object
// private string GetPrefabName(GameObject obj)
// {
//     // Placeholder logic to get prefab name
//     // This could be replaced with a more robust system to determine prefab names
//     return obj.tag; // Assuming the tag represents the prefab name
// }

// // Helper method to collect custom data from an object
// private string CollectCustomData(GameObject obj)
// {

//     return ""; // Return an empty string if no custom data is needed
// }

//     // Restore world data in the game
//     private void RestoreWorldData(WorldData worldData)
//     {
//         foreach (ObjectData2D objData in worldData.objects)
//         {
//             GameObject prefab = Resources.Load<GameObject>(objData.prefabName);
//             if (prefab != null)
//             {
//                 GameObject obj = Instantiate(prefab, objData.position, Quaternion.Euler(0, 0, objData.rotation));
//                 obj.name = objData.objectName;

//             }
//         }
//     }
}
