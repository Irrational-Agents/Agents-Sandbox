import { Scene } from 'phaser';
import { deleteSimForkConfig } from '../controllers/server_controller';

/**
 * The Boot scene initializes the game environment and transitions to the Preloader scene.  
 * ˀˀˀ
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
     * Executes when the Boot scene is created.
     * @returns {void}
     */
    create() {
        const customConfig = this.game.registry.get('customConfig');
        console.log(customConfig);
        this.scene.start('Preloader');
    }
}