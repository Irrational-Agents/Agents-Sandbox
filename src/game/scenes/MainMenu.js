import { setupSocketRoutes } from '../controllers/socket_controller';
import { getSimForkConfig } from '../controllers/server_controller';

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

import io from 'socket.io-client';


export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    init() {
        // Calculate center positions once
        this.centerX = this.scale.width / 2;
        this.centerY = this.scale.height / 2;

        this.sim_fork = "thissim"

        this.socket = io('http://127.0.0.1:8080');
        
        this.socket.on('connect', () => {
            console.log('Connected to the Socket.IO server!');
            this.connected = true;
            setupSocketRoutes(this.socket, this);
        });
  
        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('Disconnected from the server');
        });

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

        // Emit event that the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    update() {
        try {
            const sim_config = getSimForkConfig(this.sim_fork)

            if(sim_config != null) {
                const simType = "play"

                this.scene.start('Maploader', { 
                    simType, 
                    sim_config
                });
            }

        } catch(error) {
            console.log(error)
        }
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
        });
    }
}
