/**
 * Sets up Socket.IO routes for handling game-related commands and updates.
 * 
 * @param {SocketIOClient.Socket} socket - The Socket.IO client instance.
 * @param {Phaser.Scene} scene - The current game scene.
 */
export const setupSocketRoutes = (socket, scene) => {
    /**
     * Handles the server tick event to update the game clock and refresh the frame.
     */
    socket.on("server.tick", () => {
        console.log("Server tick received. Updating clock and frame.");
        scene.clock += 1;
        scene.update_frame = true;
    });

    /**
     * Fetches the player's information and sends it to the server.
     */
    socket.on("player.getInfo", () => {
        const playerName = scene.player_name;
        const playerPersona = scene.npcs?.[playerName];

        console.log(`Fetching player info for: ${playerName}`);

        if (playerPersona) {
            socket.emit("player.getInfo.response", JSON.stringify(playerPersona.toJSON()));
        } else {
            console.error(`Player persona for "${playerName}" not found.`);
        }
    });

    /**
     * Fetches the information of all NPCs excluding the player and sends it to the server.
     */
    socket.on("npc.getList", () => {
        console.log("Fetching NPCs information (excluding player).");
        const playerName = scene.player_name;
        const npcInfo = {};

        for (const [npcName, npc] of Object.entries(scene.npcs)) {
            if (npcName !== playerName) {
                npcInfo[npcName] = npc.toJSON();
            }
        }

        socket.emit("npc.getList.response", JSON.stringify(npcInfo));
    });

    /**
     * Fetches detailed information for a specific NPC and sends it to the server.
     * 
     * @param {string} npcName - The name of the NPC to fetch information for.
     */
    socket.on("npc.getInfo", (npcName) => {
        console.log(`Fetching information for NPC: ${npcName}`);
        const npcInfo = scene.npcs?.[npcName]?.toJSON();

        if (npcInfo) {
            socket.emit("npc.getInfo.response", JSON.stringify(npcInfo));
        } else {
            console.error(`NPC "${npcName}" not found.`);
        }
    });

    /**
     * Processes navigation commands for an NPC, updating its position and animation based on direction and speed.
     * 
     * @param {string} payload - A JSON string containing NPC navigation details.
     * @property {string} npc_name - The name of the NPC to navigate.
     * @property {number} speed - The speed of the NPC.
     * @property {string} direction - The direction for NPC movement ("left", "right", "up", "down").
     */
    socket.on("npc.navigate", (payload) => {
        try {
            const { npc_name, speed, direction } = JSON.parse(payload);

            console.log(`Navigating NPC "${npc_name}" | Speed: ${speed} | Direction: ${direction}`);

            const npcPersona = scene.npcs?.[npc_name];
            if (!npcPersona || !npcPersona.character) {
                throw new Error(`NPC "${npc_name}" not found or has no character.`);
            }

            const player = npcPersona.character;
            player.setVelocity(0);

            switch (direction) {
                case "left":
                    player.setVelocityX(-160 * speed);
                    npcPersona.direction = "left";
                    player.anims.play(`${npcPersona.name}-left-walk`, true);
                    break;
                case "right":
                    player.setVelocityX(160 * speed);
                    npcPersona.direction = "right";
                    player.anims.play(`${npcPersona.name}-right-walk`, true);
                    break;
                case "up":
                    player.setVelocityY(-160 * speed);
                    npcPersona.direction = "up";
                    player.anims.play(`${npcPersona.name}-up-walk`, true);
                    break;
                case "down":
                    player.setVelocityY(160 * speed);
                    npcPersona.direction = "down";
                    player.anims.play(`${npcPersona.name}-down-walk`, true);
                    break;
                default:
                    console.warn(`Invalid direction: ${direction}`);
                    player.anims.stop();
                    player.setFrame(`${npcPersona.name}-${npcPersona.direction}-idle`);
            }
        } catch (error) {
            console.error("Error processing NPC navigate command:", error.message);
        }
    });

    /**
     * Fetches data for the town map, including arenas, collisions, and sectors, and sends it to the server.
     */
    socket.on("map.getTownData", () => {
        console.log("Fetching town map data.");
        const mapData = {
            arena_maze: scene.cache.text.get("arena_maze"),
            collision_maze: scene.cache.text.get("collision_maze"),
            game_object_maze: scene.cache.text.get("game_object_maze"),
            sector_maze: scene.cache.text.get("sector_maze"),
            spawning_location_maze: scene.cache.text.get("spawning_location_maze"),
        };

        socket.emit("map.getTownData.response", JSON.stringify(mapData));
    });

    /**
     * Fetches metadata for the current map scene and sends it to the server.
     */
    socket.on("map.getSceneMetadata", () => {
        console.log("Fetching map scene metadata.");
        const mapMeta = scene.cache.json.get("map_meta");

        if (mapMeta) {
            socket.emit("map.getSceneMetadata.response", JSON.stringify(mapMeta));
        } else {
            console.error("Map metadata not found.");
        }
    });

    /**
     * Fetches equipment configuration data and sends it to the server.
     */
    socket.on("config.getEquipments", () => {
        console.log("Fetching equipment configuration.");
        const equipmentConfig = scene.cache.text.get("game_object_blocks");

        if (equipmentConfig) {
            socket.emit("config.getEquipments.response", equipmentConfig);
        } else {
            console.error("Equipment configuration not found.");
        }
    });

    /**
     * Fetches building configuration data and sends it to the server.
     */
    socket.on("config.getBuildings", () => {
        console.log("Fetching building configuration.");
        const blockData = {
            arena_blocks: scene.cache.json.get("arena_blocks"),
            game_object_blocks: scene.cache.json.get("game_object_blocks"),
            sector_blocks: scene.cache.json.get("sector_blocks"),
            spawning_location_blocks: scene.cache.json.get("spawning_location_blocks"),
        };

        socket.emit("config.getBuildings.response", JSON.stringify(blockData));
    });

    /**
     * Updates the chat state of an NPC with new emoji text.
     * 
     * @param {string} payload - A JSON string containing NPC chat update details.
     * @property {string} npc_name - The name of the NPC.
     * @property {string} emoji_text - The new emoji text for the NPC.
     */
    socket.on("chat.updateNPC", (payload) => {
        try {
            const { npc_name, emoji_text } = JSON.parse(payload);

            console.log(`Updating chat for NPC "${npc_name}" | Emoji Text: ${emoji_text}`);

            if (!npc_name || !emoji_text) {
                throw new Error("Invalid payload: Missing npc_name or emoji_text.");
            }

            const npcPersona = scene.npcs?.[npc_name];

            if (!npcPersona) {
                throw new Error(`NPC "${npc_name}" not found.`);
            }

            npcPersona.pronunciation = emoji_text;
        } catch (error) {
            console.error("Error processing NPC chat update:", error.message);
        }
    });
};
