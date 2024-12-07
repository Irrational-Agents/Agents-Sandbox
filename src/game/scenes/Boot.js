import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create() {
        // Get the current path from the URL
        const path = window.location.pathname;

        // Check if the path matches the structure for "Maploader"
        const maploaderRegex = /^\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/;
        const match = path.match(maploaderRegex);

        if (match) {
            // Extract parameters
            const [_, simType, simCode, startTimeStr, speedStr] = match;

            // Validate parameters
            const startTime = parseInt(startTimeStr, 10);
            const speed = parseInt(speedStr, 10);

            if (
                (simType === 'play' || simType === 'demo') && // simType validation
                simCode && typeof simCode === 'string' && simCode.trim() !== '' && // simCode validation
                Number.isInteger(startTime) && startTime > 0 && // startTime validation
                Number.isInteger(speed) && speed > 0 // speed validation
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
        // this.scene.start('Preloader');
        const simType = "play"
        const simCode = "the_ville_test"
        const startTime = 1
        const speed = 1

        this.scene.start('Maploader', { 
            simType, 
            simCode, 
            startTime, 
            speed 
        });
    }
}
