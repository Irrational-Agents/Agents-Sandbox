import { getSimForkConfig,saveSimForkConfig } from '../controllers/server_controller';

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

            // Init Route
            this.socket.on("init", (data) => {
                saveSimForkConfig("thissim",data);
            });
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

        // Status Text
        this.statusText = this.add.text(this.centerX, this.centerY-200, 'Waiting for Server on localhost:8080...', {
            fontSize: '38px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Emit event that the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    update() {
        try {
            const sim_config = getSimForkConfig(this.sim_fork);
    
            if (sim_config) {
                const simType = "play";
                const socket = this.socket;
    
                // Update map name
                this.statusText.setText(`Map: ${sim_config['map_name']}`);
    
                // Clear previous UI elements if they exist
                if (this.npcTitle) this.npcTitle.destroy();
                if (this.npcTextGroup) {
                    this.npcTextGroup.forEach(text => text.destroy());
                }
                this.npcTextGroup = [];
    
                // Add a semi-transparent background panel for NPC list
                if (this.npcPanel) this.npcPanel.destroy();
                this.npcPanel = this.add.rectangle(this.centerX, this.centerY, 400, 300, 0x000000, 0.5).setOrigin(0.5);
    
                // Add NPC title
                this.npcTitle = this.add.text(this.centerX, this.centerY - 130, 'NPCs Config', {
                    fontSize: '38px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
    
                // Display NPC names with better spacing
                sim_config['npc_names'].forEach((npc, index) => {
                    let npcText = this.add.text(this.centerX, this.centerY - 70 + index * 40, npc, {
                        fontSize: '28px',
                        color: '#ffffff',
                    }).setOrigin(0.5);
                    this.npcTextGroup.push(npcText);
                });
    
                this.createPlayButton(simType, sim_config, socket);
            }
        } catch (error) {
            console.log(error);
        }
    }
    // Creates the play button and handles interactions
    createPlayButton(simType, sim_config, socket) {
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
            this.scene.start('Maploader', { 
                simType, 
                sim_config,
                socket
            });
        });
    }
}
