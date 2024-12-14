import { Scene } from 'phaser';

/**
 * The Boot scene initializes the game environment by parsing URL parameters
 * and transitioning to the appropriate next scene (e.g., Maploader or Preloader).
 * 
 * @extends Phaser.Scene
 */
export class Boot extends Scene {
    /**
     * Creates an instance of the Boot scene.
     */
    constructor() {
        super('Boot');
    }

    /**
     * Executes when the Boot scene is created. Parses the URL to extract parameters
     * and determines the next scene to transition to based on the provided data.
     * 
     * @returns {void}
     */
    create() {
        // Get the current path from the URL
        const path = window.location.pathname;

        // Regular expression to match the URL structure for "Maploader"
        const maploaderRegex = /^\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/;
        const match = path.match(maploaderRegex);

        if (match) {
            // Extract parameters from the URL
            const [_, simType, simCode, startTimeStr, speedStr] = match;

            // Validate and parse parameters
            const startTime = parseInt(startTimeStr, 10);
            const speed = parseInt(speedStr, 10);

            if (
                (simType === 'play' || simType === 'demo') && // Validate simType
                simCode && typeof simCode === 'string' && simCode.trim() !== '' && // Validate simCode
                Number.isInteger(startTime) && startTime > 0 && // Validate startTime
                Number.isInteger(speed) && speed > 0 // Validate speed
            ) {
                // Valid parameters: Transition to the Maploader scene
                this.scene.start('Maploader', { 
                    simType, 
                    simCode, 
                    startTime, 
                    speed 
                });
                return;
            }
        }

        // If validation fails or path doesn't match, transition to Preloader
        // Uncomment the line below to transition to Preloader
        // this.scene.start('Preloader');

        // Temporary hardcoded values for testing purposes
        const simType = "play";
        const simCode = "the_ville_test";
        const startTime = 1;
        const speed = 1;

        this.scene.start('Maploader', { 
            simType, 
            simCode, 
            startTime, 
            speed 
        });
    }
}
