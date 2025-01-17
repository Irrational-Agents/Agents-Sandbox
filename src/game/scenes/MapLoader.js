import { Scene } from 'phaser';
import { createProgressBar, setupAssetPaths } from '../utils';

export class Maploader extends Scene
{
    constructor () {
        super('Maploader');
    }

    init () {
        // Call the separate function to set up the progress bar
        createProgressBar(this)
    }

    preload () {
        // Set up asset paths for organized loading
        setupAssetPaths(this);

        const maze_name = this.scene.settings.data.sim_config.maze_name;

       // Map-related assets
       this.load.image("blocks_1", "the_ville/visuals/map_assets/blocks/blocks_1.png");
       this.load.image("walls", 'the_ville/visuals/map_assets/v1/Room_Builder_32x32.png');
       this.load.image("interiors_pt1", 'the_ville/visuals/map_assets/v1/interiors_pt1.png');
       this.load.image("interiors_pt2", 'the_ville/visuals/map_assets/v1/interiors_pt2.png');
       this.load.image("interiors_pt3", 'the_ville/visuals/map_assets/v1/interiors_pt3.png');
       this.load.image("interiors_pt4", 'the_ville/visuals/map_assets/v1/interiors_pt4.png');
       this.load.image("interiors_pt5", 'the_ville/visuals/map_assets/v1/interiors_pt5.png');
       this.load.image("CuteRPG_Field_B", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Field_B.png');
       this.load.image("CuteRPG_Field_C", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Field_C.png');
       this.load.image("CuteRPG_Harbor_C", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Harbor_C.png');
       this.load.image("CuteRPG_Village_B", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Village_B.png');
       this.load.image("CuteRPG_Forest_B", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Forest_B.png');
       this.load.image("CuteRPG_Desert_C", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Desert_C.png');
       this.load.image("CuteRPG_Mountains_B", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Mountains_B.png');
       this.load.image("CuteRPG_Desert_B", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Desert_B.png');
       this.load.image("CuteRPG_Forest_C", 'the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Forest_C.png');

       // Load the tilemap JSON file
       this.load.tilemapTiledJSON("map", 'the_ville/visuals/the_ville.json');

       // Persona Assets
       this.load.json("npc_list", "storage/npc_list.json");
       this.load.image('speech_bubble', 'speech_bubble/v3.png');

       // Meta Data
       this.load.json("map_meta", "the_ville/matrix/maze_meta_info.json")
       this.load.text("arena_maze", "the_ville/matrix/maze/arena_maze.csv")
       this.load.text("collision_maze", "the_ville/matrix/maze/collision_maze.csv")
       this.load.text("game_object_maze", "the_ville/matrix/maze/game_object_maze.csv")
       this.load.text("sector_maze", "the_ville/matrix/maze/sector_maze.csv")
       this.load.text("spawning_location_maze", "the_ville/matrix/maze/spawning_location_maze.csv")
       this.load.text("game_object_blocks","the_ville/matrix/special_blocks/game_object_blocks.csv")

       this.load.json("arena_blocks","the_ville/matrix/special_blocks/arena_blocks.json")
       this.load.json("game_object_blocks","the_ville/matrix/special_blocks/game_object_blocks.json")
       this.load.json("sector_blocks","the_ville/matrix/special_blocks/sector_blocks.json")
       this.load.json("spawning_location_blocks","the_ville/matrix/special_blocks/spawning_location_blocks.json")        
    }

    create () {
        this.scene.start('Game', {
            ...this.scene.settings.data
        });
    }
}
