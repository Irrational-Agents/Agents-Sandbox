import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Persona } from '../model/Persona';
import { setupAssetPaths } from '../utils';
import {  tick } from '../controllers/server_controller';
import { setupSocketRoutes } from '../controllers/socket_controller';
import { OverlayUI } from './ui/OverlayUI';
import { BottomUI } from './ui/BottomUI';
import { NPCStatsUI } from './ui/NPCStatsUI';

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
        this.steps_per_min = null;
        this.clock = 0;
        this.update_frame = true;
        this.spawn = null;
        this.camara_id = 0;
        this.map = null;
        this.map_name = null;
        this.socket = null;
        this.player_enabled = false;
        
        // UI Components
        this.overlayUI = null;
        this.bottomUI = null;
        this.npcStatsUI = null;
    }

    init() {
        const sim_config = this.scene.settings.data.sim_config;

        this.player_name = sim_config.player_name;
        this.npc_names = sim_config.npc_names;
        this.map_name = sim_config.map_name;
        this.game_time = sim_config.start_time;
        this.steps_per_min = sim_config.steps_per_min;
        this.game_date = sim_config.start_date;
        this.total_steps = sim_config.total_steps;

        this.socket = this.scene.settings.data.socket;
        setupSocketRoutes(this.socket, this);
    }

    preload() {
        setupAssetPaths(this);

        const sim_config = this.scene.settings.data.sim_config;
        const npc_list = this.cache.json.get('npc_list');
        this.player_enabled = sim_config.player_enabled;

        if (this.player_enabled) {
            let texture = npc_list[sim_config.player.character];
            this.loadCharacterAtlas(this.player_name, texture);
        }

        for (const npc of this.npc_names) {
            console.log("Loading NPC:", npc);
            let texture = npc_list[sim_config.npcs[npc].character];
            this.loadCharacterAtlas(npc, texture);
        }
    }

    create() {
        this.map = this.make.tilemap({ key: "map" });
        this.addTileSet(this.map);

        const sim_config = this.scene.settings.data.sim_config;
        const { npcs, player } = sim_config;
        const spawn_details = this.getSpawnDetails(npcs);

        if (this.player_enabled) {
            const spawn_details = {
                [this.player_name]: {
                    pronunciation: player.current_status.emoji,
                    spawn_point: { x: player.current_location[0], y: player.current_location[1] },
                    character: player.character
                },
                ...spawn_details
            };
        }

        this.initializeNPCs(spawn_details);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.setupInput();
        
        // Initialize UI components
        this.overlayUI = new OverlayUI(this);
        this.bottomUI = new BottomUI(this);
        this.npcStatsUI = new NPCStatsUI(this);
        
        this.overlayUI.create();
        this.bottomUI.create();
        this.npcStatsUI.create();

        this.bottomUI.uiElements.container.add(this.npcStatsUI.uiElements.container)

        EventBus.emit('current-scene-ready', this);
        this.setCameraView();
    }

    update() {
        if (!this.update_frame) return;

        const res = tick(this);
        this.socket.emit("ui.tick", res);
        this.update_frame = false;

        // Update clock in overlay
        this.overlayUI.updateClock(this.game_date, this.game_time, this.clock);

        if (this.player_enabled) {
            this.handlePlayerInput();
        }
    }

    handlePlayerInput() {
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

    // ======================
    // Player/NPC Methods
    // ======================
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

        if (this.player_enabled) {
            this.npcs[this.player_name].disableSpeechBubble();
            this.npcs[this.player_name].pronunciation = "🎮";
            this.npcs[this.player_name].current_activity = "play";
        }
    }

    // ======================
    // Camera Methods
    // ======================
    getCameraTexture() {
        if (this.player_enabled) {
            if (this.camara_id === 0) {
                return this.player_name;
            } else {
                return this.npc_names[this.camara_id - 1];
            }
        } else {
            return this.npc_names[this.camara_id];
        }
    }

    setCameraView() {
        const camera = this.cameras.main;
        let newTexture = this.getCameraTexture();

        if (newTexture) {
            this.bottomUI.updateCharacterInfo();
            const npc = this.npcs[newTexture];
            camera.startFollow(npc.character);
        } else {
            console.warn("Invalid texture detected:", newTexture);
        }
    }

    changeCameraView() {
        if (!this.bottomUI) {
            console.error("BottomUI is not initialized!");
            return;
        }

        if (this.player_enabled) {
            this.camara_id = (this.camara_id + 1) % (this.npc_names.length + 1);
        }
        this.camara_id = (this.camara_id + 1) % (this.npc_names.length);
        this.setCameraView();
    }

    // ======================
    // UI Methods
    // ======================
    toggleNPCStats() {
        this.npcStatsUI.toggle();
    }

    // ======================
    // Input Methods
    // ======================
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // ======================
    // Map/Tile Methods
    // ======================
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

    // ======================
    // Utility Methods
    // ======================
    loadCharacterAtlas(characterName, texturePath) {
        this.load.atlas(characterName, `characters/${texturePath}`, 'characters/atlas.json');
    }

    getSpawnDetails(npcs) {
        return {
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