import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Persona } from '../model/Persona';
import { setupAssetPaths } from '../utils';
import { deleteSimForkConfig, tick } from '../controllers/server_controller';
import { setupSocketRoutes } from '../controllers/socket_controller';

// Constants for UI configuration
const UI_CONFIG = {
    OVERLAY: {
        PANEL: {
            WIDTH_RATIO: 1.0,
            HEIGHT: 120,
            ALPHA: 0.85,
            Y_POSITION: 40
        },
        TEXT: {
            OFFSET_X: 0.9,
            FONT_SIZE: '48px',
            COLOR: '#ffffff'
        },
        CLOCK: {
            OFFSET_X: 0.1,
            FONT_SIZE: '24px',
            COLOR: '#ffffff',
            STYLE: 'bold'
        },
        BUTTONS: {
            RESTART: {
                OFFSET_X: 0.8,
                FONT_SIZE: '20px',
                COLOR: '#ff0000',
                BG_COLOR: '#ffffff',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            CAMERA: {
                OFFSET_X: 0.6,
                FONT_SIZE: '20px',
                COLOR: '#ffffff',
                BG_COLOR: '#0000ff',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            NPC_STATUS: {
                OFFSET_X: 0.38,
                FONT_SIZE: '20px',
                COLOR: '#ff0000',
                BG_COLOR: '#ffcc00',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            LLM_LOGS: {
                OFFSET_X: 0.18,
                FONT_SIZE: '20px',
                COLOR: '#ffffff',
                BG_COLOR: '#ff0000',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        }
    },
    BOTTOM_UI: {
        Y_POSITION_RATIO: 0.925,
        WIDTH_RATIO: 0.9,
        HEIGHT: 100,
        BORDER_THICKNESS: 4,
        BORDER_COLOR: 0xffffff,
        PANEL_COLOR: 0x000000,
        PANEL_ALPHA: 0.85,
        CHARACTER: {
            X_OFFSET: -0.5,
            Y_OFFSET: 0,
            SCALE: 3,
            SPRITE_OFFSET: 50,
            NAME_OFFSET: 100,
            STATUS_OFFSET: 120,
            NAME_FONT: '24px',
            STATUS_FONT: '24px',
            COLOR: '#ffffff',
            STYLE: 'bold'
        }
    }
};

/**
 * Represents the main game scene where the player and NPCs interact.
 */
export class Game extends Scene {
    constructor() {
        super('Game');
        this.npc_names = null;
        this.player_name = null;
        this.npcs = {};
        this.cursors = null;
        this.collisionsLayer = null;
        this.game_time = null;
        this.game_date = null;
        this.sec_per_step = null;
        this.clock = 0;
        this.update_frame = true;
        this.spawn = null;
        this.camara_id = 2;
        this.map = null;
        this.ui_clock = null;
        this.npcSprite = null;
        this.bPanel = null;
        this.charSpriteName = null;
        this.charSpriteStatus = null;
        this.socket = null;
    }

    init() {
        const sim_config = this.scene.settings.data.sim_config;

        this.player_name = sim_config.player_name;
        this.npc_names = sim_config.npc_names;
        this.map_name = sim_config.map_name;
        this.game_time = sim_config.start_time;
        this.sec_per_step = sim_config.sec_per_step;
        this.game_date = sim_config.start_date;

        this.socket = this.scene.settings.data.socket;
        setupSocketRoutes(this.socket, this);
    }

    preload() {
        setupAssetPaths(this);

        const sim_config = this.scene.settings.data.sim_config;
        const npc_list = this.cache.json.get('npc_list');

        let texture = npc_list[sim_config.player.character];
        this.loadCharacterAtlas(this.player_name, texture);

        for (const npc of this.npc_names) {
            texture = npc_list[sim_config.npcs[npc].character];
            this.loadCharacterAtlas(npc, texture);
        }
    }

    create() {
        this.map = this.make.tilemap({ key: "map" });
        this.addTileSet(this.map);

        const sim_config = this.scene.settings.data.sim_config;
        const { player, npcs } = sim_config;
        const spawn_details = this.getSpawnDetails(player, npcs);

        this.initializeNPCs(spawn_details);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.setupInput();
        
        EventBus.emit('current-scene-ready', this);
        this.addOverlayUI();
        this.addBottomUI();
        this.setCameraView();
    }

    addOverlayUI() {
        const centerX = this.scale.width / 2;
        const config = UI_CONFIG.OVERLAY;

        // Create UI panel
        const uiPanel = this.add.rectangle(
            centerX,
            config.PANEL.Y_POSITION,
            this.scale.width * config.PANEL.WIDTH_RATIO,
            config.PANEL.HEIGHT,
            0x000000,
            config.PANEL.ALPHA
        ).setScrollFactor(0);

        // Add map name text
        const uiText = this.add.text(
            centerX - centerX * config.TEXT.OFFSET_X,
            25,
            this.map_name,
            {
                fontSize: config.TEXT.FONT_SIZE,
                fill: config.TEXT.COLOR
            }
        ).setScrollFactor(0);

        // Add clock
        this.ui_clock = this.add.text(
            centerX + centerX * config.CLOCK.OFFSET_X,
            10,
            `Date: ${this.game_date} | Clock: ${this.game_time} | Step: ${this.clock}`,
            {
                fontSize: config.CLOCK.FONT_SIZE,
                fill: config.CLOCK.COLOR,
                fontStyle: config.CLOCK.STYLE
            }
        ).setScrollFactor(0);

        // Add restart button
        const restartButton = this.add.text(
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
            this.socket.emit("server.restart");

            console.log("Restarting in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
        });

        // Add camera dropdown
        let cam = this.camara_id == -1 ? 0 : this.camara_id;
        const cameraDropdown = this.add.text(
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
            this.changeCameraView();
            cameraDropdown.setText(`Camera: ${this.camara_id}`);
        });

        // Add NPC status button
        const npcStatus = this.add.text(
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
        .setScrollFactor(0);

        // Add LLM logs button
        const llmStatus = this.add.text(
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
        this.add.container(0, 0, [
            uiPanel, 
            uiText, 
            this.ui_clock, 
            restartButton, 
            cameraDropdown, 
            npcStatus, 
            llmStatus
        ]).setDepth(1000);
    }

    addBottomUI() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height * UI_CONFIG.BOTTOM_UI.Y_POSITION_RATIO;
        const config = UI_CONFIG.BOTTOM_UI;

        // Create border
        const border = this.add.rectangle(
            0,
            0,
            this.scale.width * config.WIDTH_RATIO + config.BORDER_THICKNESS,
            config.HEIGHT + config.BORDER_THICKNESS,
            config.BORDER_COLOR
        );

        // Create panel
        this.bPanel = this.add.rectangle(
            0,
            0,
            this.scale.width * config.WIDTH_RATIO,
            config.HEIGHT,
            config.PANEL_COLOR,
            config.PANEL_ALPHA
        );

        // Determine character sprite
        const charSpriteKey = (this.camara_id === 0 || this.camara_id === -1) 
            ? this.player_name 
            : this.npc_names[this.camara_id - 1];

        // Add character sprite
        this.npcSprite = this.add.sprite(
            this.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.SPRITE_OFFSET,
            config.CHARACTER.Y_OFFSET,
            charSpriteKey,
            "down"
        )
        .setScale(config.CHARACTER.SCALE)
        .setOrigin(0.5, 0.5);

        // Add character name
        this.charSpriteName = this.add.text(
            this.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.NAME_OFFSET,
            -30,
            charSpriteKey,
            {
                fontSize: config.CHARACTER.NAME_FONT,
                fill: config.CHARACTER.COLOR,
                fontStyle: config.CHARACTER.STYLE
            }
        ).setScrollFactor(0);

        // Add character status
        this.charSpriteStatus = this.add.text(
            this.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.STATUS_OFFSET,
            10,
            `${this.npcs[charSpriteKey].current_activity} ${this.npcs[charSpriteKey].pronunciation}`,
            {
                fontSize: config.CHARACTER.STATUS_FONT,
                fill: config.CHARACTER.COLOR,
                fontStyle: config.CHARACTER.STYLE
            }
        ).setScrollFactor(0);

        // Group all bottom UI elements
        this.add.container(centerX, centerY, [
            border,
            this.bPanel,
            this.npcSprite,
            this.charSpriteName,
            this.charSpriteStatus
        ])
        .setDepth(1000)
        .setScrollFactor(0);
    }

    getCameraTexture() {
        let newTexture = null;

        if (this.camara_id === 0) {
            newTexture = this.player_name;
        } else {
            newTexture = this.npc_names[this.camara_id - 1];
        }
        return newTexture
    }

    setActivity(newTexture) {
        this.charSpriteStatus.setText(
            `${this.npcs[newTexture].current_activity} ${this.npcs[newTexture].pronunciation}`
        ); 
    }

    setCameraView() {
        const camera = this.cameras.main;
        let newTexture = this.getCameraTexture();

        if (newTexture) {
            this.npcSprite.setTexture(newTexture, "down");
            this.charSpriteName.setText(newTexture);
            this.setActivity(newTexture)
            const npc = this.npcs[newTexture];
            camera.startFollow(npc.character);
        } else {
            console.warn("Invalid texture detected:", newTexture);
        }
    }

    changeCameraView() {
        if (!this.npcSprite) {
            console.error("npcSprite is undefined!");
            return;
        }

        this.camara_id = (this.camara_id + 1) % (this.npc_names.length + 1);
        this.setCameraView()
    }

    update() {
        if (!this.update_frame) return;

        const res = tick(this);
        this.socket.emit("ui.tick", res);
        const texture = this.getCameraTexture();
        this.setActivity(texture)
        this.update_frame = false;

        const playerPersona = this.npcs[this.player_name];
        const player = playerPersona.character;
        const speed = playerPersona.move_speed;
        const cursors = this.cursors;
    
        player.setVelocity(0);
    
        if (cursors.left.isDown) {
            this.movePlayer(player, playerPersona, 'left', -speed, 0);
        } else if (cursors.right.isDown) {
            this.movePlayer(player, playerPersona, 'right', speed, 0);
        } else if (cursors.up.isDown) {
            this.movePlayer(player, playerPersona, 'up', 0, -speed);
        } else if (cursors.down.isDown) {
            this.movePlayer(player, playerPersona, 'down', 0, speed);
        } else {
            player.anims.stop();
            player.setFrame(`${playerPersona.direction}-walk.001`);
        }
    }

    movePlayer(player, persona, direction, velocityX, velocityY) {
        player.setVelocity(velocityX * 160, velocityY * 160);
        persona.direction = direction;
        player.anims.play(`${persona.name}-${direction}-walk`, true);
    }

    initializeNPCs(npcs_details) {
        const anims = this.anims;
    
        for (const [npc_name, details] of Object.entries(npcs_details)) {
            const { pronunciation, spawn_point } = details;
    
            this.npcs[npc_name] = new Persona(
                npc_name,
                pronunciation,
                spawn_point,
                anims,
                this
            );
        }

        this.npcs[this.player_name].disableSpeechBubble();
        this.npcs[this.player_name].pronunciation = "🎮";
        this.npcs[this.player_name].current_activity = "play";
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    addTileSet(map) {
        const tilesets = {
            blocks: map.addTilesetImage("blocks", "blocks_1"),
            walls: map.addTilesetImage("Room_Builder_32x32", "walls"),
            interiors: [
                map.addTilesetImage("interiors_pt1", "interiors_pt1"),
                map.addTilesetImage("interiors_pt2", "interiors_pt2"),
                map.addTilesetImage("interiors_pt3", "interiors_pt3"),
                map.addTilesetImage("interiors_pt4", "interiors_pt4"),
                map.addTilesetImage("interiors_pt5", "interiors_pt5")
            ],
            CuteRPG: [
                map.addTilesetImage("CuteRPG_Field_B", "CuteRPG_Field_B"),
                map.addTilesetImage("CuteRPG_Field_C", "CuteRPG_Field_C"),
                map.addTilesetImage("CuteRPG_Harbor_C", "CuteRPG_Harbor_C"),
                map.addTilesetImage("CuteRPG_Village_B", "CuteRPG_Village_B"),
                map.addTilesetImage("CuteRPG_Forest_B", "CuteRPG_Forest_B"),
                map.addTilesetImage("CuteRPG_Desert_C", "CuteRPG_Desert_C"),
                map.addTilesetImage("CuteRPG_Mountains_B", "CuteRPG_Mountains_B"),
                map.addTilesetImage("CuteRPG_Desert_B", "CuteRPG_Desert_B"),
                map.addTilesetImage("CuteRPG_Forest_C", "CuteRPG_Forest_C")
            ]
        };

        const tilesetGroup = [
            ...tilesets.CuteRPG,
            ...tilesets.interiors,
            tilesets.walls
        ];

        const layers = [
            "Bottom Ground",
            "Exterior Ground",
            "Exterior Decoration L1",
            "Exterior Decoration L2",
            "Interior Ground",
            "Wall",
            "Interior Furniture L1",
            "Interior Furniture L2 ",
            "Foreground L1",
            "Foreground L2"
        ];

        layers.forEach(layer => {
            const tileset = layer === "Wall" ? [tilesets.CuteRPG[1], tilesets.walls] : tilesetGroup;
            map.createLayer(layer, tileset, 0, 0);
        });

        this.collisionsLayer = map.createLayer("Collisions", tilesets.blocks, 0, 0);
        this.collisionsLayer.setDepth(-1);
        map.getLayer("Foreground L1").tilemapLayer.setDepth(2);
        map.getLayer("Foreground L2").tilemapLayer.setDepth(2);
    }

    loadCharacterAtlas(characterName, texturePath) {
        this.load.atlas(characterName, `characters/${texturePath}`, 'characters/atlas.json');
    }

    getSpawnDetails(player, npcs) {
        return {
            [this.player_name]: {
                pronunciation: player.current_status.emoji,
                spawn_point: { x: player.current_location[0], y: player.current_location[1] },
                character: player.character
            },
            ...Object.fromEntries(this.npc_names.map(npc => [
                npc,
                {
                    pronunciation: npcs[npc].current_status.emoji,
                    spawn_point: { x: npcs[npc].current_location[0], y: npcs[npc].current_location[1] },
                    character: npcs[npc].character
                }
            ]))
        };
    }
}