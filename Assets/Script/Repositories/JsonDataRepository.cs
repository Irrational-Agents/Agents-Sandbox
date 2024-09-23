using System.IO;
using UnityEngine;

public class JsonDataRepository<T> : IDataRepository<T> {
    public void Save(T data, string filePath) {
        string json = JsonUtility.ToJson(data, true);
        File.WriteAllText(filePath, json);
    }

    public T Load(string filePath) {
        if (File.Exists(filePath)) {
            string json = File.ReadAllText(filePath);
            return JsonUtility.FromJson<T>(json);
        }
        else {
            Debug.LogWarning($"File not found: {filePath}");
            return default;
        }
    }
}
