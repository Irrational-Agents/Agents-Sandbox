/**
 * Saves the simulation fork configuration to the server.
 * 
 * @param {string} forkName - The name of the fork configuration to save.
 * @param {Phaser.Scene} scene - The current Phaser scene instance.
 * @returns {Object} The saved fork configuration data.
 */
export const saveSimForkConfig = (forkName, scene) => {
    // TODO: Implement logic to save the data to the server
    console.log(`Saving simulation fork configuration: ${forkName}`);

    // Return the configuration after saving (mocked with local retrieval for now)
    return getSimForkConfig(forkName, scene);
};

/**
 * Retrieves the simulation fork configuration from the server or cache.
 * 
 * @param {string} forkName - The name of the fork configuration to retrieve.
 * @param {Phaser.Scene} scene - The current Phaser scene instance.
 * @returns {Object|null} The retrieved fork configuration data, or `null` if not found.
 * @throws Will throw an error if the data cannot be retrieved.
 */
export const getSimForkConfig = (forkName, scene) => {
    try {
        console.log(`Fetching simulation fork configuration: ${forkName}`);
        const data = scene.cache.json.get(forkName);

        if (!data) {
            console.warn(`Simulation fork configuration "${forkName}" not found in cache.`);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error fetching simulation fork configuration "${forkName}":`, error);
        throw error;
    }
};

/**
 * Retrieves details of the specified NPCs from the scene cache.
 * 
 * @param {string[]} npcNames - An array of NPC names to retrieve details for.
 * @param {Phaser.Scene} scene - The current Phaser scene instance.
 * @returns {Object} An object containing details of the requested NPCs.
 */
export const getNPCSDetails = (npcNames, scene) => {
    console.log(`Fetching details for NPCs: ${npcNames.join(', ')}`);
    const npcData = scene.cache.json.get("npc");

    if (!npcData) {
        console.warn("NPC data not found in cache.");
        return {};
    }

    // Filter NPC data by the provided names
    const filteredNPCs = npcNames.reduce((acc, npcName) => {
        if (npcData[npcName]) {
            acc[npcName] = npcData[npcName];
        } else {
            console.warn(`NPC "${npcName}" not found in the NPC data.`);
        }
        return acc;
    }, {});

    return filteredNPCs;
};
