import { data } from "react-router";

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