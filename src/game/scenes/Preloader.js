import { Scene } from 'phaser';
import { createProgressBar, setupAssetPaths } from '../utils';

/**
 * The Preloader scene handles the loading of essential game assets and data.
 * It also displays a progress bar to provide visual feedback during the loading process.
 * 
 * @extends Phaser.Scene
 */
export class Preloader extends Scene {
    /**
     * Creates an instance of the Preloader scene.
     */
    constructor() {
        super('Preloader');
    }

    /**
     * Initializes the Preloader scene by setting up the progress bar.
     * 
     * @returns {void}
     */
    init() {
        createProgressBar(this); // Set up a visual progress bar for the loading process
    }

    /**
     * Loads the necessary game assets and configuration files.
     * 
     * @returns {void}
     */
    preload() {
        // Set up asset paths for organized loading
        setupAssetPaths(this);

        // Load visual assets
        this.load.image('background', 'bg2.jpg');
        this.load.image('the_ville', 'the_ville/thumbnail.jpg');

        // Load game configuration and data
        this.load.json('npc_list', 'storage/npc_list.json');
        this.load.json('default_sim', 'storage/default_sim.json');
    }

    /**
     * Transitions to the MainMenu scene after all assets are loaded.
     * 
     * @returns {void}
     */
    create() {
        this.scene.start('MainMenu'); // Transition to the MainMenu scene
    }
}
