import { getNPCSDetails, getSimForkConfig } from '../controllers/server_controller';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Persona } from '../model/Persona';
import { setupWebSocketRoutes } from '../controllers/socket_controller';


export class Game extends Scene {
    constructor() {
        super('Game');
        this.npc_names = null;
        this.player_name = null;
        this.npcs = {};
        this.cursors = null;
    }

    init() {
        const simCode = this.scene.settings.data.simCode;
        const sim_config = getSimForkConfig(simCode, this);

        this.player_name = sim_config["player_name"];
        this.npc_names = sim_config["persona_names"];

        this.socket = new WebSocket('ws://127.0.0.1:8080/');
        
        this.socket.onopen = () => {
          console.log('Connected to the WebSocket server!');
          setupWebSocketRoutes(this.socket)
        };
    }

    preload() {
        this.setupAssetPaths();

        const npc_list = this.cache.json.get('npc_list');
        this.loadCharacterAtlas(this.player_name, npc_list[this.player_name]);

        for (const npc of this.npc_names) {
            this.loadCharacterAtlas(npc, npc_list[npc]);
        }
    }

    create() {
        const map = this.make.tilemap({ key: "map" });
        this.addTileSet(map);

        const npcs_details = getNPCSDetails(this.npc_names, this);

        // this.initializePlayer(player_details);
        this.initializeNPCs(npcs_details);
        this.setupCamera(map);
        this.setupInput();

        EventBus.emit('current-scene-ready', this);
    }

    update() {
        const player_persona = this.npcs[this.player_name]
        const player = player_persona.character;
        const speed = player_persona.move_speed;
        const cursors = this.cursors;
    
        // Reset velocity
        player.setVelocity(0);
    
        // Movement logic
        if (cursors.left.isDown) {
            player.setVelocityX(-160 * speed);
            player_persona.direction = "left";
            player.anims.play(`${player_persona.name}-left-walk`, true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160 * speed);
            player_persona.direction = "right";
            player.anims.play(`${player_persona.name}-right-walk`, true);
        } else if (cursors.up.isDown) {
            player.setVelocityY(-160 * speed);
            player_persona.direction = "up";
            player.anims.play(`${player_persona.name}-up-walk`, true);
        } else if (cursors.down.isDown) {
            player.setVelocityY(160 * speed);
            player_persona.direction = "down";
            player.anims.play(`${player_persona.name}-down-walk`, true);
        } else {
            // Stop animation and set idle frame
            player.anims.stop();
            player.setFrame(`${player_persona.direction}-walk.001`);
        }
    }
    
    
    // Set up base and relative paths for assets
    setupAssetPaths() {
        this.load.setBaseURL(window.location.origin);
        this.load.setPath('assets');
    }

    // Load a character's texture atlas
    loadCharacterAtlas(characterName, texturePath) {
        this.load.atlas(characterName, `characters/${texturePath}`, 'characters/atlas.json');
    }

    initializeNPCs(npcs_details) {
        const anims = this.anims;
    
        for (const [npc_name, details] of Object.entries(npcs_details)) {
            const { description, pronunciation, spawn_point } = details;
    
            // Create a Persona for each NPC and add it to the `npcs` object
            this.npcs[npc_name] = new Persona(
                npc_name,
                description,
                pronunciation,
                spawn_point,
                anims,
                this
            );
        }

        this.npcs[this.player_name].disableSpeechBubble();
    }
    

    // Configure the camera to follow the player
    setupCamera(map) {
        const camera = this.cameras.main;
        camera.startFollow(this.npcs[this.player_name].character);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }

    // Set up input controls
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Add tilesets and layers to the map
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

        const collisionsLayer = map.createLayer("Collisions", tilesets.blocks, 0, 0);
        collisionsLayer.setCollisionByProperty({ collide: true });

        // Adjust layer depths for proper rendering
        collisionsLayer.setDepth(-1);
        map.getLayer("Foreground L1").tilemapLayer.setDepth(2);
        map.getLayer("Foreground L2").tilemapLayer.setDepth(2);
    }
}
