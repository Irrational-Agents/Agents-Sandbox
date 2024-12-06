import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    init() {
        this.centerX = this.scale.width / 2;
        this.centerY = this.scale.height / 2;


        this.selectedMap = 'the_ville';
        this.selectedNPC = ['isabella', 'maria', 'klaus'];
    }

    create() {
        // Add background
        this.add.image(this.centerX, this.centerY, 'background').setOrigin(0.5);

        // Title
        this.add.text(this.centerX, 100, 'Main Menu', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(this.centerX, this.centerY - 150, `selectedMap : ${this.selectedMap}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(this.centerX, this.centerY - 100, `selectedNPC : ${this.selectedNPC}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Play Button
        const playButton = this.add.text(this.centerX, this.centerY, 'Play', {
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
                this.scene.start('MapLoader', { map: this.selectedMap, npc: this.selectedNPC });
            });

        // Emit scene ready event
        EventBus.emit('current-scene-ready', this);
    }
}
