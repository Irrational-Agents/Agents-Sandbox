import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Persona } from '../model/Persona';
import { setupAssetPaths } from '../utils';
import { getMapInfo, getNPCsPosition, getPlayerPosition } from '../controllers/server_controller';
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
        this.clock = 0;
        this.update_frame = true;
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

        let texture = npc_list[sim_config[this.player_name]['character']]
        this.loadCharacterAtlas(this.player_name, texture);

        for (const npc of this.npc_names) {
            texture = npc_list[sim_config[npc]['character']]
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
        const spawn_details ={}
        
        spawn_details[this.player_name] = sim_config[this.player_name]

        for (const npc of this.npc_names) {
            spawn_details[npc] = sim_config[npc]
        }

        this.initializeNPCs(spawn_details);
        this.setupCamera(this.map);
        this.setupInput();

        this.socket.emit('map.data' , getMapInfo(this))
        
        EventBus.emit('current-scene-ready', this);
    }

    /**
     * Updates player and NPC movements and handles animations based on input.
     * 
     * @returns {void}
     */
    update() {
        if (!this.update_frame) return;

        const res = {
            clock: this.clock,
            npc_pos: getNPCsPosition(this),
            player_pos: getPlayerPosition(this)
        }

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
    }

    /**
     * Configures the camera to follow the player character.
     * 
     * @param {Phaser.Tilemaps.Tilemap} map - The tilemap for the scene.
     * @returns {void}
     */
    setupCamera(map) {
        const camera = this.cameras.main;
        camera.startFollow(this.npcs[this.player_name].character);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
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
        this.collisionsLayer.setCollisionByProperty({ collide: true });

        this.collisionsLayer.setDepth(-1);
        map.getLayer("Foreground L1").tilemapLayer.setDepth(2);
        map.getLayer("Foreground L2").tilemapLayer.setDepth(2);
    }
}
