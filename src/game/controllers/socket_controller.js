// let commands = [
// "command.building.GetBuildings"
// "command.chat.NPCChatUpdate"
// "command.config.GetBuildingsConfig"
// "command.config.GetEquipmentsConfig"
// "command.config.GetNPCsConfig"
// "command.map.GetMapScene"
// "command.map.GetMapTown"
// "command.map.UserNavigate"
// "command.map.NPCNavigate"
// "command.npc.GetNPCInfo"
// "command.npc.GetNPCs"
// "command.player.GetPlayerInfo"
// ]

export const setupSocketRoutes = (socket, scene) => {
    socket.on("command.player.GetPlayerInfo", () => {
        let player_name = scene["player_name"]
        let player_persona = scene.npcs[player_name]
        socket.emit("command.player.GetPlayerInfo", JSON.stringify(player_persona.toJSON()))
    });

    socket.on("command.npc.GetNPCs", () => {
        let player_name = scene["player_name"]
        let npc_info = {}
        for(let npc of Object.keys(scene.npcs)) {
            if(npc != player_name) {
                npc_info[npc] = scene.npcs[npc].toJSON()
            }
        }

        socket.emit("command.npc.GetNPCs", JSON.stringify(npc_info))
    });

    socket.on("command.npc.GetNPCInfo", (npc_name) => {
        let npc_info = scene.npcs[npc_name].toJSON()
        socket.emit("command.npc.GetNPCInfo", JSON.stringify(npc_info))
    });

    socket.on("command.map.NPCNavigate", (payload) => {
        try {
            // Parse the payload safely
            payload = JSON.parse(payload);
            
            const { npc_name, speed, direction } = payload;
            
            // Ensure npc_persona exists and has a character
            const npc_persona = scene.npcs[npc_name];
            if (!npc_persona || !npc_persona.character) {
                console.error(`NPC ${npc_name} not found or has no character.`);
                return;
            }
            
            const player = npc_persona.character;
    
            // Reset velocity
            player.setVelocity(0);
    
            // Movement logic based on the direction and speed from the payload
            switch (direction) {
                case "left":
                    player.setVelocityX(-160 * speed);
                    npc_persona.direction = "left";
                    player.anims.play(`${npc_persona.name}-left-walk`, true);
                    break;
    
                case "right":
                    player.setVelocityX(160 * speed);
                    npc_persona.direction = "right";
                    player.anims.play(`${npc_persona.name}-right-walk`, true);
                    break;
    
                case "up":
                    player.setVelocityY(-160 * speed);
                    npc_persona.direction = "up";
                    player.anims.play(`${npc_persona.name}-up-walk`, true);
                    break;
    
                case "down":
                    player.setVelocityY(160 * speed);
                    npc_persona.direction = "down";
                    player.anims.play(`${npc_persona.name}-down-walk`, true);
                    break;
    
                default:
                    // If no valid direction, stop animation and set idle frame
                    player.anims.stop();
                    player.setFrame(`${npc_persona.name}-${npc_persona.direction}-idle`);
                    break;
            }
        } catch (error) {
            console.error("Error processing NPC navigate command:", error);
        }
    });

    socket.on("command.map.GetMapTown", () => {
        let map_meta = scene.cache.json.get('map_meta')
        let arena_maze = scene.cache.text.get("arena_maze");
        let collision_maze = scene.cache.text.get("collision_maze");
        let game_object_maze = scene.cache.text.get("game_object_maze");
        let sector_maze = scene.cache.text.get("sector_maze")
        let spawning_location_maze = scene.cache.text.get("spawning_location_maze")

        let map_data = {
            "arena_maze": arena_maze,
            "collision_maze": collision_maze,
            "game_object_maze": game_object_maze,
            "sector_maze": sector_maze,
            "spawning_location_maze": spawning_location_maze
        }

        socket.emit("command.map.GetMapTown",JSON.stringify(map_data))
    })

    socket.on("command.map.GetMapScene", () => {
        let map_meta = scene.cache.json.get('map_meta')
        socket.emit("command.map.GetMapScene",JSON.stringify(map_data))
    })
    
}