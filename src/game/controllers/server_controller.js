/**
 * Saves the simulation fork configuration to the server.
 * 
 * @param {string} forkName - The name of the fork configuration to save.
 * @param {string} forkData - The data of the fork configuration to save.
 */
export const saveSimForkConfig = (forkName, forkData) => {
    localStorage.setItem(forkName, forkData);
};

/**
 * Retrieves the simulation fork configuration from the server or cache.
 * 
 * @param {string} forkName - The name of the fork configuration to retrieve.
 * @returns {Object|null} The retrieved fork configuration data, or `null` if not found.
 * @throws Will throw an error if the data cannot be parsed.
 */
export const getSimForkConfig = (forkName) => {
    try {
        // Retrieve the data from localStorage
        const forkData = localStorage.getItem(forkName);

        // If data is not found, return null
        if (!forkData) {
            console.warn(`No configuration found for fork: ${forkName}`);
            return null;
        }

        // Parse the JSON string into an object
        return JSON.parse(forkData);
    } catch (error) {
        console.error(`Failed to retrieve or parse configuration for fork: ${forkName}`, error);
        throw new Error('Failed to retrieve simulation fork configuration.');
    }
};


/**
 * Retrieves map-related information, including metadata, map data, and block data.
 *
 * @returns {Object} An object containing map metadata, map data, and block data.
 */
export const getMapInfo = (scene) => {
    // Helper to retrieve data from the cache
    const getCacheData = (type, keys) => {
        return keys.reduce((acc, key) => {
            acc[key] = scene.cache[type].get(key);
            return acc;
        }, {});
    };

    // Retrieve map metadata
    const mapMeta = scene.cache.json.get("map_meta");

    // Retrieve map and block data using helper function
    const mapData = getCacheData("text", [
        "arena_maze",
        "collision_maze",
        "game_object_maze",
        "sector_maze",
        "spawning_location_maze",
    ]);

    const blockData = getCacheData("json", [
        "arena_blocks",
        "game_object_blocks",
        "sector_blocks",
        "spawning_location_blocks",
    ]);

    return { mapMeta, mapData, blockData };
};

/**
 * Retrieves the positions of NPCs in the scene.
 *
 * @param {Phaser.Scene} scene - The current game scene.
 * @returns {Object} An object mapping NPC names to their positions.
 */
export const getNPCsPosition = (scene) => {
    return scene.npc_names.reduce((positions, npc) => {
        positions[npc] = scene.npcs[npc]?.getPosition();
        return positions;
    }, {});
};

/**
 * Retrieves the player's position in the scene.
 *
 * @param {Phaser.Scene} scene - The current game scene.
 * @returns {Object} An object mapping the player name to their position.
 */
export const getPlayerPosition = (scene) => {
    const playerName = scene.player_name;
    return {
        [playerName]: scene.npcs[playerName]?.getPosition()
    };
};


export const tick = (scene) => {

    const res = { 
        clock: scene.clock,
        npc_pos: null,
        player_pos: null
    };

    if(scene.clock == 0) {
        res['map_data'] = getMapInfo(scene)
    } else {
        res['npc_pos'] = getNPCsPosition(scene),
        res['player_pos'] = getPlayerPosition(scene)
    }

    return res
}