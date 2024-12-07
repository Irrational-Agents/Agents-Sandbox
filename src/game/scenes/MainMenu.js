import { saveSimForkConfig } from '../controllers/server_controller';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    init() {
        // Calculate center positions once
        this.centerX = this.scale.width / 2;
        this.centerY = this.scale.height / 2;
        this.sim_fork = "defaut_sim"
    }

    create() {
        // Add background image with centered origin
        this.add.image(this.centerX, this.centerY, 'background').setOrigin(0.5);

        // Title Text
        this.add.text(this.centerX, 80, 'Main Menu', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Display maze data (for debugging purposes)
        this.displayJsonData('defaut_sim', this.centerX, this.centerY - 50);

        // Play Button
        this.createPlayButton();

        // Emit event that the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    // Utility function to display JSON data in text format
    displayJsonData(key, x, y) {
        const jsonData = this.cache.json.get(key);
        this.add.text(x, y, `${key}.json: ${JSON.stringify(jsonData, null, 2)}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: 500, useAdvancedWrap: true },
        }).setOrigin(0.5);
    }

    // Creates the play button and handles interactions
    createPlayButton() {
        const playButton = this.add.text(this.centerX, this.centerY + 150, 'Play', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => playButton.setStyle({ backgroundColor: '#0056b3' }))
        .on('pointerout', () => playButton.setStyle({ backgroundColor: '#007bff' }))
        .on('pointerdown', () => {
            // Start 'MapLoader' scene with map and NPC data
            try {
                const sim_config = saveSimForkConfig(this.sim_fork, this)

                const simType = "play"
                const simCode = sim_config["sim_code"]
                const step = 1
                const speed = 1

                window.location.href = `${window.location.origin}/${simType}/${simCode}/${step}/${speed}`;

            } catch(error) {
                console.log(error)
            }
        });
    }
}
