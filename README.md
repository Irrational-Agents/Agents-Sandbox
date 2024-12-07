# **API Documentation for Socket Routes**

## **Command List**
1. **command.player.GetPlayerInfo**
2. **command.npc.GetNPCs**
3. **command.npc.GetNPCInfo**
4. **command.map.NPCNavigate**
5. **command.map.GetMapTown**
6. **command.map.GetMapScene**
7. **command.config.GetEquipmentsConfig**
8. **command.config.GetBuildingsConfig**
9. **command.chat.NPCChatUpdate**

---

### **1. command.player.GetPlayerInfo**
Fetches information about the player.

- **Request**: None
- **Response**: Player persona in JSON format.
  ```json
  {
      "name": "PlayerName",
      "attributes": {...}
  }
  ```

---

### **2. command.npc.GetNPCs**
Fetches information about all NPCs in the scene except the player.

- **Request**: None
- **Response**: Dictionary of NPCs with their information.
  ```json
  {
      "NPC1": { "name": "NPC1", "attributes": {...} },
      "NPC2": { "name": "NPC2", "attributes": {...} }
  }
  ```

---

### **3. command.npc.GetNPCInfo**
Fetches information about a specific NPC.

- **Request**: NPC name (as a string).
- **Response**: NPC information in JSON format.
  ```json
  {
      "name": "NPCName",
      "attributes": {...}
  }
  ```

---

### **4. command.map.NPCNavigate**
Moves an NPC/Player based on the given direction and speed.

- **Request**:
  ```json
  {
      "npc_name": "NPCName",
      "direction": "left|right|up|down",
      "speed": 1.0
  }
  ```
- **Response**: None

---

### **5. command.map.GetMapTown**
Fetches various map-related data for the town.

- **Request**: None
- **Response**:
  ```json
  {
      "arena_maze": "...",
      "collision_maze": "...",
      "game_object_maze": "...",
      "sector_maze": "...",
      "spawning_location_maze": "..."
  }
  ```

---

### **6. command.map.GetMapScene**
Fetches metadata for the map scene.

- **Request**: None
- **Response**: Map metadata in JSON format.
  ```json
  {
      "mapName": "...",
      "mapDimensions": {...},
      "layers": [...]
  }
  ```

---

### **7. command.config.GetEquipmentsConfig**
Fetches configuration data for equipment.

- **Request**: None
- **Response**: Equipment configuration as plain text.

---

### **8. command.config.GetBuildingsConfig**
Fetches configuration data for buildings.

- **Request**: None
- **Response**:
  ```json
  {
      "arena_blocks": {...},
      "game_object_blocks": {...},
      "sector_blocks": {...},
      "spawning_location_blocks": {...},
      "world_blocks": {...}
  }
  ```

---

### **9. command.chat.NPCChatUpdate**
Updates the chat or speech text of a specific NPC.

- **Request**:
  ```json
  {
      "npc_name": "NPCName",
      "emoji_text": "..."
  }
  ```
- **Response**: None