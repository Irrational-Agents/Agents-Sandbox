// ui/BottomUI.js
import { UI_CONFIG } from './UIConfig';

export class BottomUI {
    constructor(scene) {
        this.scene = scene;
        this.uiElements = {};
    }

    create() {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height * UI_CONFIG.BOTTOM_UI.Y_POSITION_RATIO;
        const config = UI_CONFIG.BOTTOM_UI;

        // Create border
        const border = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width * config.WIDTH_RATIO + config.BORDER_THICKNESS,
            config.HEIGHT + config.BORDER_THICKNESS,
            config.BORDER_COLOR
        );

        // Create panel
        const bPanel = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width * config.WIDTH_RATIO,
            config.HEIGHT,
            config.PANEL_COLOR,
            config.PANEL_ALPHA
        );

        // Determine character sprite
        const charSpriteKey = (this.scene.camara_id === 0 || this.scene.camara_id === -1) 
            ? this.scene.player_name 
            : this.scene.npc_names[this.scene.camara_id - 1];

        // Add character sprite
        this.uiElements.npcSprite = this.scene.add.sprite(
            this.scene.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.SPRITE_OFFSET,
            config.CHARACTER.Y_OFFSET,
            charSpriteKey,
            "down"
        )
        .setScale(config.CHARACTER.SCALE)
        .setOrigin(0.5, 0.5);

        // Add character name
        this.uiElements.charSpriteName = this.scene.add.text(
            this.scene.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.NAME_OFFSET,
            -30,
            charSpriteKey,
            {
                fontSize: config.CHARACTER.NAME_FONT,
                fill: config.CHARACTER.COLOR,
                fontStyle: config.CHARACTER.STYLE
            }
        ).setScrollFactor(0);

        // Add character status
        this.uiElements.charSpriteStatus = this.scene.add.text(
            this.scene.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.STATUS_OFFSET,
            10,
            `${this.scene.npcs[charSpriteKey].current_activity} ${this.scene.npcs[charSpriteKey].pronunciation}`,
            {
                fontSize: config.CHARACTER.STATUS_FONT,
                fill: config.CHARACTER.COLOR,
                fontStyle: config.CHARACTER.STYLE
            }
        ).setScrollFactor(0);

        // Group all bottom UI elements
        this.uiElements.container = this.scene.add.container(centerX, centerY, [
            border,
            bPanel,
            this.uiElements.npcSprite,
            this.uiElements.charSpriteName,
            this.uiElements.charSpriteStatus
        ])
        .setDepth(1000)
        .setScrollFactor(0);
    }

    updateCharacterInfo() {
        const charSpriteKey = this.scene.getCameraTexture();
        if (this.uiElements.npcSprite && charSpriteKey) {
            this.uiElements.npcSprite.setTexture(charSpriteKey, "down");
            this.uiElements.charSpriteName.setText(charSpriteKey);
            this.uiElements.charSpriteStatus.setText(
                `${this.scene.npcs[charSpriteKey].current_activity} ${this.scene.npcs[charSpriteKey].pronunciation}`
            );
        }
    }
}