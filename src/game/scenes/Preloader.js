import { Scene } from 'phaser';

import { createProgressBar } from '../utils';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Call the separate function to set up the progress bar
        createProgressBar(this);
    }

    preload() {
        // Set the base URL for all assets
        this.load.setBaseURL(window.location.origin);

        // Set the relative path for assets
        this.load.setPath('assets');

        // Load game assets
        this.load.image('background', 'bg2.jpg');
        this.load.image("the_ville", "the_ville/thumbnail.jpg");

        // Load additional data
        this.load.json("npc_list", "storage/npc_list.json");
        this.load.json("defaut_sim", "storage/defaut_sim.json")
    }

    create() {
        // After assets are loaded, start the 'MainMenu' scene
        this.scene.start('MainMenu');
    }
}