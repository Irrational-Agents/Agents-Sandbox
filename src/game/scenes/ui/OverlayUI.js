// ui/OverlayUI.js
import { UI_CONFIG } from './UIConfig';
import { deleteSimForkConfig} from '../../controllers/server_controller';


export class OverlayUI {
    constructor(scene) {
        this.scene = scene;
        this.uiElements = {};
    }

    create() {
        const centerX = this.scene.scale.width / 2;
        const config = UI_CONFIG.OVERLAY;

        // Create UI panel
        const uiPanel = this.scene.add.rectangle(
            centerX,
            config.PANEL.Y_POSITION,
            this.scene.scale.width * config.PANEL.WIDTH_RATIO,
            config.PANEL.HEIGHT,
            0x000000,
            config.PANEL.ALPHA
        ).setScrollFactor(0);

        // Add map name text
        const uiText = this.scene.add.text(
            centerX - centerX * config.TEXT.OFFSET_X,
            25,
            this.scene.map_name,
            {
                fontSize: config.TEXT.FONT_SIZE,
                fill: config.TEXT.COLOR
            }
        ).setScrollFactor(0);

        // Add clock
        this.uiElements.clock = this.scene.add.text(
            centerX + centerX * config.CLOCK.OFFSET_X,
            10,
            `Date: ${this.scene.game_date} | Clock: ${this.scene.game_time} | Step: ${this.scene.clock}`,
            {
                fontSize: config.CLOCK.FONT_SIZE,
                fill: config.CLOCK.COLOR,
                fontStyle: config.CLOCK.STYLE
            }
        ).setScrollFactor(0);

        // Add restart button
        const restartButton = this.scene.add.text(
            centerX + centerX * config.BUTTONS.RESTART.OFFSET_X,
            50,
            "Restart",
            {
                fontSize: config.BUTTONS.RESTART.FONT_SIZE,
                fill: config.BUTTONS.RESTART.COLOR,
                backgroundColor: config.BUTTONS.RESTART.BG_COLOR,
                padding: config.BUTTONS.RESTART.PADDING
            }
        )
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .on("pointerdown", async () => {
            deleteSimForkConfig("thissim");
            this.scene.socket.emit("server.restart");

            console.log("Restarting in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
        });

        // Add camera dropdown
        let cam = this.scene.camara_id == -1 ? 0 : this.scene.camara_id;
        this.uiElements.cameraDropdown = this.scene.add.text(
            centerX + centerX * config.BUTTONS.CAMERA.OFFSET_X,
            50,
            `Camera: ${cam}`,
            {
                fontSize: config.BUTTONS.CAMERA.FONT_SIZE,
                fill: config.BUTTONS.CAMERA.COLOR,
                backgroundColor: config.BUTTONS.CAMERA.BG_COLOR,
                padding: config.BUTTONS.CAMERA.PADDING
            }
        )
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .on('pointerdown', () => {
            this.scene.changeCameraView();
            this.uiElements.cameraDropdown.setText(`Camera: ${this.scene.camara_id}`);
        });

        // Add NPC status button
        const npcStatus = this.scene.add.text(
            centerX + centerX * config.BUTTONS.NPC_STATUS.OFFSET_X,
            50,
            "NPC Status",
            {
                fontSize: config.BUTTONS.NPC_STATUS.FONT_SIZE,
                fill: config.BUTTONS.NPC_STATUS.COLOR,
                backgroundColor: config.BUTTONS.NPC_STATUS.BG_COLOR,
                padding: config.BUTTONS.NPC_STATUS.PADDING
            }
        )
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .on('pointerdown', () => this.scene.toggleNPCStats());

        // Add LLM logs button
        const llmStatus = this.scene.add.text(
            centerX + centerX * config.BUTTONS.LLM_LOGS.OFFSET_X,
            50,
            "LLM Logs",
            {
                fontSize: config.BUTTONS.LLM_LOGS.FONT_SIZE,
                fill: config.BUTTONS.LLM_LOGS.COLOR,
                backgroundColor: config.BUTTONS.LLM_LOGS.BG_COLOR,
                padding: config.BUTTONS.LLM_LOGS.PADDING
            }
        )
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

        // Group all UI elements
        this.uiElements.container = this.scene.add.container(0, 0, [
            uiPanel, 
            uiText, 
            this.uiElements.clock, 
            restartButton, 
            this.uiElements.cameraDropdown, 
            npcStatus, 
            llmStatus
        ]).setDepth(1000);
    }

    updateClock(game_date, game_time, clock) {
        if (this.uiElements.clock) {
            this.uiElements.clock.setText(`Date: ${game_date} | Clock: ${game_time} | Step: ${clock}`);
        }
    }
}