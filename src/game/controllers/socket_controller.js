import { data } from 'react-router';
import { getMapInfo, getNPCsPosition, getPlayerPosition } from '../controllers/server_controller';

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
    socket.on("play", (data) => {
        console.log(data)
    })

    /**
     * Handles the server tick event to update the game clock and refresh the frame.
     */
    socket.on("server.tick", (data) => {
        data = Number(data)

        const res = {
            clock: scene.clock,
            npc_pos: getNPCsPosition(scene),
            player_pos: getPlayerPosition(scene)
        }

        if (data == 0) {
            socket.emit("ui.tick", res);
        } else {
            scene.clock += data
            scene.update_frame = true;
        }
        console.log("Server tick received. Updating clock and frame.", scene.update_frame);
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
    socket.on("map.data", () => {
        console.log("Fetching town map data.");

        const mapData = getMapInfo(scene)

        socket.emit("map.data", mapData);
    });


    /**
     * Updates the chat state of an NPC with new emoji text.
     * 
     * @param {string} payload - A JSON string containing NPC chat update details.
     * @property {string} npc_name - The name of the NPC.
     * @property {string} emoji_text - The new emoji text for the NPC.
     */
    socket.on("npc.emoji", (payload) => {
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
