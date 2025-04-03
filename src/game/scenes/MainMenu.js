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
        this.add.text(this.centerX, 80, 'Agent Simulator', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Status Text
        this.statusText = this.add.text(this.centerX, this.centerY, 'Waiting for Server on localhost:8080...', {
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
    
                this.statusText.setText("");
    
                // Clear previous UI elements if they exist
                if (this.configTitle) this.configTitle.destroy();
                if (this.configTextGroup) {
                    this.configTextGroup.forEach(text => text.destroy());
                }
                this.configTextGroup = [];
    
                // Add a semi-transparent background panel
                if (this.configPanel) this.configPanel.destroy();
                this.configPanel = this.add.rectangle(this.centerX, this.centerY+20, 500, 400, 0x000000, 0.5).setOrigin(0.5);

                // Add NPC title
                this.npcTitle = this.add.text(this.centerX, this.centerY - 150, 'Config', {
                    fontSize: '38px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                let config = {
                    sim_type: "play",
                    map_name: sim_config['map_name'],
                    sec_per_step: sim_config['sec_per_step'],
                    start_date: sim_config['start_date'],
                    start_time: sim_config['start_time'],
                    npcs: sim_config['npc_names'].length,
                }
    
                // Display Config
                Object.keys(config).forEach((key, index) => {
                    let configText = this.add.text(this.centerX, this.centerY - 90 + index * 40, `${key}: ${config[key]}`, {
                        fontSize: '28px',
                        color: '#ffffff',
                    }).setOrigin(0.5);
                    this.configTextGroup.push(configText);
                });
    
                this.createButton(simType, sim_config, socket);
            }
        } catch (error) {
            console.log(error);
        }
    }
    // Creates the play button and handles interactions
    createButton(simType, sim_config, socket) {
        // this.scene.start('Maploader', { 
        //     simType, 
        //     sim_config,
        //     socket
        // });
        const playButton = this.add.text(this.centerX, this.centerY + 190, 'Start', {
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
