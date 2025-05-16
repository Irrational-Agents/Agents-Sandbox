import { tick } from '../controllers/server_controller';

/**
 * Constants for time and date handling
 */
const TIME_CONFIG = {
    HOURS_IN_DAY: 24,
    MINUTES_IN_HOUR: 60,
    DATE_FORMAT: { splitChar: 'T', part: 0 } // For ISO date formatting
};

/**
 * Sets up Socket.IO routes for handling game-related commands and updates.
 * 
 * @param {SocketIO.Socket} socket - The Socket.IO client instance
 * @param {Phaser.Scene} scene - The current game scene
 */
export const setupSocketRoutes = (socket, scene) => {
    /**
     * Handles the server tick event to update game state
     * @param {Object} updateData - Contains clock and NPC updates
     */
    socket.on("server.tick", async (updateData) => { 
        console.log(`Data : ${JSON.stringify(updateData)}`);

        try {
            if (!updateData || typeof updateData !== 'object') {
                throw new Error('Invalid update data received');
            }

            const updates = updateData.updates;

            // Increment the clock
            processTimeUpdate(scene);

            // Process NPC updates - now awaited
            await processNpcUpdates(scene, updates);

            // Update UI and enable next frame update
            updateClockDisplay(scene);
            if (scene.clock <= scene.total_steps){
                scene.update_frame = true;
            }

        } catch (error) {
            console.error('Error processing server tick:', error);
            // Optionally emit an error event back to server
            socket.emit('client.error', { 
                message: 'Failed to process tick', 
                error: error.message 
            });
        }
    });

    // Additional socket event handlers can be added here
    // socket.on("other.event", handlerFunction);
};

/**
 * Processes updates for all NPCs in the scene - now async
 * @param {Phaser.Scene} scene - The game scene
 * @param {Object} updates - NPC updates keyed by NPC name
 */
async function processNpcUpdates(scene, updates) {
    const updatePromises = [];
    
    for (const npcName in updates) {
        if (scene.npcs[npcName]) {
            try {
                // Collect all update promises
                updatePromises.push(
                    scene.npcs[npcName].doUpdates(updates[npcName])
                        .catch(error => {
                            console.error(`Error processing update for NPC ${npcName}:`, error);
                            return false;
                        })
                );
            } catch (error) {
                console.error(`Error queuing update for NPC ${npcName}:`, error);
            }
        } else {
            console.warn(`Received update for unknown NPC: ${npcName}`);
        }
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);
}

/**
 * Processes time and date updates for the game scene
 * @param {Phaser.Scene} scene - The game scene
 */
function processTimeUpdate(scene) {
    // Increment the scene's clock by 1
    scene.clock += 1;

    // Prevent clock overflow
    const maxClockValue = scene.steps_per_min * TIME_CONFIG.MINUTES_IN_HOUR * TIME_CONFIG.HOURS_IN_DAY * 6;
    if (scene.clock >= maxClockValue) {
        scene.clock %= maxClockValue; // Reset clock to avoid overflow
        updateGameDate(scene); // Increment the date when a new day starts
    }

    // Convert game time to total minutes
    const totalMinutes = Math.floor(scene.clock / (scene.steps_per_min));

    // Calculate new hours and minutes
    const newHours = Math.floor(totalMinutes / TIME_CONFIG.MINUTES_IN_HOUR) % TIME_CONFIG.HOURS_IN_DAY;
    const newMinutes = totalMinutes % TIME_CONFIG.MINUTES_IN_HOUR;

    // Update scene properties
    scene.game_time = formatTime(newHours, newMinutes);
}

/**
 * Updates the game date by one day
 * @param {Phaser.Scene} scene - The game scene
 */
function updateGameDate(scene) {
    const date = new Date(scene.game_date);
    date.setDate(date.getDate() + 1);
    scene.game_date = date.toISOString().split(TIME_CONFIG.DATE_FORMAT.splitChar)[TIME_CONFIG.DATE_FORMAT.part];
}

/**
 * Formats time components into HH:MM string
 * @param {number} hours - Hours component
 * @param {number} minutes - Minutes component
 * @returns {string} Formatted time string
 */
function formatTime(hours, minutes) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Updates the clock display in the game UI
 * @param {Phaser.Scene} scene - The game scene
 */
function updateClockDisplay(scene) {
    if (scene.ui_clock) {
        scene.ui_clock.setText(
            `Date: ${scene.game_date} | Clock: ${scene.game_time} | Step: ${scene.clock}`
        );
    }
}