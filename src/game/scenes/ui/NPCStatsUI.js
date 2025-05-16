// ui/NPCStatsUI.js
import { UI_CONFIG } from './UIConfig';


export class NPCStatsUI {
    constructor(scene) {
        this.scene = scene;
        this.uiElements = {};
        this.isVisible = false;
    }

    create() {
        const config = UI_CONFIG.NPC_STATS;
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        // Create panel
        const panel = this.scene.add.rectangle(
            0, -centerY + 50,
            this.scene.scale.width * config.WIDTH_RATIO,
            this.scene.scale.height * config.HEIGHT_RATIO,
            config.PANEL_COLOR,
            config.PANEL_ALPHA
        ).setStrokeStyle(config.BORDER_THICKNESS, config.BORDER_COLOR);

        // Add title
        const title = this.scene.add.text(
            100, -centerY - 180,
            config.TITLE.TEXT,
            {
                fontSize: config.TITLE.FONT_SIZE,
                fill: config.TITLE.COLOR
            }
        ).setOrigin(1, 1);

        // Create scrollable content
        const scrollPanel = this.scene.add.container(0, 0);
        const mask = this.scene.add.rectangle(
            0, -centerY + 90,
            this.scene.scale.width * config.WIDTH_RATIO,
            this.scene.scale.height * (config.HEIGHT_RATIO - 0.1),
            0x000000, 0
        ).setOrigin(0.5, 0.5);

        // Add NPC stats
        this.addNPCStats(scrollPanel, config);

        // Create container for all elements
        this.uiElements.container = this.scene.add.container(0, 0, [
            panel,
            title,
            mask,
            scrollPanel
        ]).setDepth(2000);

        // Initially hide the panel
        this.hide();
    }

    addNPCStats(container, config) {
        const statConfig = config.STATS;

        let texture = this.scene.getCameraTexture()
        const npc = this.scene.npcs[texture]

        // Add NPC stats
        const stats = [
            `Activity: ${npc.current_activity}`,
            `Location: (${Math.round(npc.character.x)}, ${Math.round(npc.character.y)})`,
            `Status: ${npc.pronunciation}`,
            `Direction: ${npc.direction}`,
            `Speed: ${npc.move_speed}`,
            `Path: ${npc.current_path ? npc.current_path.length : 0} points`,
            `Thoughts: ${npc.engaging}`,
        ];

        this.statText = this.scene.add.text(
            statConfig.OFFSET_X - 150,
            statConfig.OFFSET_Y,
            stats,
            {
                fontSize: '32px',
                fill: statConfig.COLOR
            }
        );
        container.add(this.statText);

        // Make content scrollable
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.isVisible) {
                container.y += deltaY * 0.1;
                container.y = Phaser.Math.Clamp(container.y, -yOffset + 1000, 0);
            }
        });
    }

    show() {
        if (this.uiElements.container) {
            this.uiElements.container.setVisible(true);
            this.isVisible = true;
        }
    }

    updateStats() { 
        if (this.statText) {
            const npc = this.scene.npcs[this.scene.getCameraTexture()];

            // Update NPC stats
            const stats = [
                `Activity: ${npc.current_activity}`,
                `Location: (${Math.round(npc.character.x)}, ${Math.round(npc.character.y)})`,
                `Status: ${npc.pronunciation}`,
                `Direction: ${npc.direction}`,
                `Speed: ${npc.move_speed}`,
                `Path: ${npc.current_path ? npc.current_path.length : 0} points`,
                `Thoughts: ${npc.processing}`

            ];
            this.statText.setText(stats);

        }

    }


    hide() {
        if (this.uiElements.container) {
            this.uiElements.container.setVisible(false);
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}