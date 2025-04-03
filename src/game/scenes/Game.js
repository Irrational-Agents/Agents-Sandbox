import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Persona } from '../model/Persona';
import { setupAssetPaths } from '../utils';
import { deleteSimForkConfig, tick } from '../controllers/server_controller';
import { setupSocketRoutes } from '../controllers/socket_controller';


/**
 * Represents the main game scene where the player and NPCs interact. Handles asset loading, NPC initialization,
 * movement, and interactions with the server and game map.
 * 
 * @extends Phaser.Scene
 */
export class Game extends Scene {
    /**
     * Creates an instance of the Game scene.
     * 
     * @constructor
     */
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
        this.camara_id = -1;
    }

    /**
     * Initializes the scene with simulation configuration and sets up the socket connection.
     * 
     * @returns {void}
     */
    init() {
        const sim_config = this.scene.settings.data.sim_config;

        this.player_name = sim_config["player_name"];
        this.npc_names = sim_config["npc_names"];
        this.map_name = sim_config["map_name"];
        this.game_time = sim_config["start_time"]; // 00:00
        this.sec_per_step = sim_config["sec_per_step"]; // 10
        this.game_date = sim_config["start_date"] // 2024-04-01


        this.socket =  this.scene.settings.data.socket;
        setupSocketRoutes(this.socket, this);

    }

    /**
     * Preloads the assets for the game, including textures and animations for the player and NPCs.
     * 
     * @returns {void}
     */
    preload() {
        setupAssetPaths(this);

        const sim_config = this.scene.settings.data.sim_config;
        const npc_list = this.cache.json.get('npc_list')

        let texture = npc_list[sim_config["player"]['character']]
        this.loadCharacterAtlas(this.player_name, texture);

        for (const npc of this.npc_names) {
            texture = npc_list[sim_config["npcs"][npc]['character']]
            this.loadCharacterAtlas(npc, texture);
        }
    }

    /**
     * Sets up the game world, including the tilemap, NPCs, camera, and input handling.
     * 
     * @returns {void}
     */
    create() {
        this.map = this.make.tilemap({ key: "map" });
        this.addTileSet(this.map);

        const sim_config = this.scene.settings.data.sim_config;
        const { player, npcs } = this.scene.settings.data.sim_config;
        const spawn_details = this.getSpawnDetails(player, npcs);

        this.initializeNPCs(spawn_details);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.setupInput();
        
        EventBus.emit('current-scene-ready', this);
        this.addOverlayUI();
        this.addBottomUI();
        this.changeCameraView();
    }

    addOverlayUI() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        // Define the width of the loading bar (80% of the screen width)
        const barWidth =  this.scale.width;
        
        // Create a semi-transparent background panel
        const uiPanel = this.add.rectangle(centerX, 40, barWidth, 120, 0x000000, 0.85).setScrollFactor(0);
        
        // Add text label on top of the panel
        const uiText = this.add.text(centerX - 0.9*centerX, 25, this.map_name, {
            fontSize: "48px",
            fill: "#ffffff"
        }).setScrollFactor(0);

        // Add clock
        this.ui_clock = this.add.text(centerX + 0.1 * centerX, 10, `Date: ${this.game_date} | Clock: ${this.game_time} | Step: ${this.clock}`, {
            fontSize: "24px",
            fill: "#ffffff",
            fontStyle: 'bold',
        }).setScrollFactor(0);
    
        // Add restart button
        const restartButton = this.add.text(centerX + 0.8 * centerX, 50, "Restart", {
            fontSize: "20px",
            fill: "#ff0000",
            backgroundColor: "#ffffff",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .on("pointerdown", async () => {
            deleteSimForkConfig("thissim");
            this.socket.emit("server.restart");

            console.log("Restarting in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Sleep for 1 seconds

            window.location.reload();
        });

        
        // Create a dropdown for selecting the camera
        let cam = this.camara_id == -1 ? 0 : this.camara_id
        const cameraDropdown = this.add.text(centerX + 0.6*centerX, 50, `Camera: ${cam}`, {
            fontSize: "20px",
            fill: "#ffffff",
            backgroundColor: "#0000ff",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setInteractive({ useHandCursor: true }).setScrollFactor(0);
        
        // Create a simple function to change camera
        cameraDropdown.on('pointerdown', () => {
            this.changeCameraView();
            cameraDropdown.setText(`Camera: ${this.camara_id}`);
        });

        // NPC Status
        const npc_status = this.add.text(centerX + 0.38 * centerX, 50, "NPC Status", {
            fontSize: "20px",
            fill: "#ff0000",
            backgroundColor: '#ffcc00',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);
        
        // LLM Logs
        const llm_status = this.add.text(centerX + 0.18 * centerX, 50, "LLM Logs", {
            fontSize: "20px",
            fill: '#ffffff',
            backgroundColor: "#ff0000",
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);
    
        // Group UI elements into a container
        const uiContainer = this.add.container(0, 0, [uiPanel, uiText, this.ui_clock, restartButton, cameraDropdown, npc_status, llm_status]);
        uiContainer.setDepth(1000); // Ensure it renders above everything else
    }

    addBottomUI() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height * 0.925; // UI panel position
    
        // Define panel dimensions
        const barWidth = this.scale.width * 0.9;
        const barHeight = 100;
        const borderThickness = 4;
    
        // Create border rectangle
        const border = this.add.rectangle(0, 0, barWidth + borderThickness, barHeight + borderThickness, 0xffffff);
    
        // Create semi-transparent background panel
        this.bPanel = this.add.rectangle(0, 0, barWidth, barHeight, 0x000000, 0.85);
    
        // Determine character sprite
        const charSpriteKey = (this.camara_id === 0 || this.camara_id === -1) 
            ? this.player_name 
            : this.npc_names[this.camara_id - 1];
    
        // Create and position the character sprite inside the panel (relative positioning)
        this.npcSprite = this.add.sprite(
            -barWidth / 2 + 50, // Positioned inside the panel (left side)
            0, // Centered vertically in the UI panel
            charSpriteKey,
            "down"
        ).setScale(3).setOrigin(0.5, 0.5);

        this.charSpriteName  = this.add.text(-barWidth / 2 + 100, -30, `${charSpriteKey}`, {
            fontSize: "24px",
            fill: "#ffffff",
            fontStyle: 'bold',
        }).setScrollFactor(0);

        this.charSpriteStatus  = this.add.text(-barWidth / 2 + 120, 10, `${this.npcs[charSpriteKey].current_activity} ${this.npcs[charSpriteKey].pronunciation}`, {
            fontSize: "24px",
            fill: "#ffffff",
            fontStyle: 'bold',
        }).setScrollFactor(0);
    
        // Group UI elements into a container
        const uiContainer = this.add.container(centerX, centerY, [border, this.bPanel, this.npcSprite, this.charSpriteName, this.charSpriteStatus]);
        uiContainer.setDepth(1000); // Ensure it renders above other elements
    
        // Make sure the UI stays fixed
        uiContainer.setScrollFactor(0);
    }
    
    /**
     * Change the camera view to either the player or an NPC.
     *
     * @returns {void}
     */
    changeCameraView() {
        const camera = this.cameras.main;

        // Ensure npcSprite exists before proceeding
        if (!this.npcSprite) {
            console.error("npcSprite is undefined! Make sure addBottomUI() is called before changing the camera view.");
            return;
        }

        // Cycle through player and NPCs
        this.camara_id = (this.camara_id + 1) % (this.npc_names.length + 1);

        let newTexture = null;

        if (this.camara_id === 0) {
            // Set camera to follow the player
            const player = this.npcs[this.player_name];
            if (player) {
                camera.startFollow(player.character);
                newTexture = this.player_name;
            }
        } else {
            // Set camera to follow the NPC
            const npc_name = this.npc_names[this.camara_id - 1];
            const npc = this.npcs[npc_name];

            if (npc) {
                camera.startFollow(npc.character);
                newTexture = npc_name;
            }
        }

        // Safely update npcSprite texture
        if (newTexture) {
            this.npcSprite.setTexture(newTexture,"down");
            this.charSpriteName.setText(newTexture)
            this.charSpriteStatus.setText(`${this.npcs[newTexture].current_activity} ${this.npcs[newTexture].pronunciation}`)
        } else {
            console.warn("Invalid texture detected:", newTexture);
        }
    }


    /**
     * Updates player and NPC movements and handles animations based on input.
     * 
     * @returns {void}
     */
    update() {
        if (!this.update_frame) return;

        const res = tick(this)

        this.socket.emit("ui.tick", res);
        this.update_frame = false;

        const playerPersona = this.npcs[this.player_name];
        const player = playerPersona.character;
        const speed = playerPersona.move_speed;
        const cursors = this.cursors;
    
        player.setVelocity(0); // Reset velocity
    
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
    
    /**
     * Moves the player in the specified direction and plays the appropriate animation.
     * 
     * @param {Phaser.GameObjects.Sprite} player - The player object.
     * @param {Persona} persona - The persona instance for the player.
     * @param {string} direction - The direction to move ("left", "right", etc.).
     * @param {number} velocityX - Velocity along the X-axis.
     * @param {number} velocityY - Velocity along the Y-axis.
     * @returns {void}
     */
    movePlayer(player, persona, direction, velocityX, velocityY) {
        player.setVelocity(velocityX * 160, velocityY * 160);
        persona.direction = direction;
        player.anims.play(`${persona.name}-${direction}-walk`, true);
    }

    /**
     * Creates and initializes NPCs, adding them to the scene with their associated animations and data.
     * 
     * @param {Object} npcs_details - A mapping of NPC names to their details.
     * @returns {void}
     */
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
        this.npcs[this.player_name].current_activity = "Playing";
    }

    /**
     * Sets up keyboard input controls.
     * 
     * @returns {void}
     */
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    /**
     * Adds tilesets and layers to the map and configures collision handling.
     * 
     * @param {Phaser.Tilemaps.Tilemap} map - The tilemap for the scene.
     * @returns {void}
     */
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
        //this.collisionsLayer.setCollisionByProperty({ collide: true });

        this.collisionsLayer.setDepth(-1);
        map.getLayer("Foreground L1").tilemapLayer.setDepth(2);
        map.getLayer("Foreground L2").tilemapLayer.setDepth(2);
    }

    /**
     * Loads a texture atlas for a character.
     * 
     * @param {string} characterName - The name of the character.
     * @param {string} texturePath - The relative path to the texture file.
     * @returns {void}
     */
    loadCharacterAtlas(characterName, texturePath) {
        this.load.atlas(characterName, `characters/${texturePath}`, 'characters/atlas.json');
    }

    /**
     * Generates spawn details for the player and NPCs.
     *
     * @param {Object} player - The player object containing status and location.
     * @param {Object} npcs - An object mapping NPC names to their respective data.
     * @returns {Object} An object containing spawn details for the player and NPCs.
     */
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
