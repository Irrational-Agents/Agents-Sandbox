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
 * Deletes the simulation fork configuration from the server.
 * 
 * @param {string} forkName - The name of the fork configuration to delete.
 */
export const deleteSimForkConfig = (forkName) => {
    localStorage.removeItem(forkName);
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

export const tick = (scene) => {
    if (scene.clock === 0) {
        return { 
            clock: scene.clock,
            npc_status: null,
            player_status: null,
            map_data: getMapInfo(scene)
        };
    }

    const npc_status = scene.npc_names.reduce((acc, npc_name) => {
        const npc = scene.npcs[npc_name];
        acc[npc_name] = {
            position: npc?.getPosition() || null,
            state: npc?.getActivity() || null
        };
        return acc;
    }, {});

    return {
        clock: scene.clock,
        npc_status,
        player_status: {
            position: scene.npcs[scene.player_name]?.getPosition() || null,
            state: null
        }
    };
};
