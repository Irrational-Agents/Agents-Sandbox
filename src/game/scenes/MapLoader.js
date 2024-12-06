import { Scene } from 'phaser';

export class MapLoader extends Scene
{
    constructor () {
        super('MapLoader');
    }

    init () {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const barWidth = this.scale.width * 0.8

        // this.add.image(centerX, centerY, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(centerX, centerY, barWidth + 8, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(centerX-(barWidth/2), centerY, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {
            bar.width = 4 + (barWidth * progress);

        });
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');


        // Load map-related assets
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
        this.load.tilemapTiledJSON("map", 'the_ville/visuals/the_ville_jan7.json');

        // Load a generic atlas (if needed)
        this.load.atlas("atlas", 'characters/Yuriko_Yamamoto.png', 'characters/atlas.json');

        // Load dynamically generated persona assets
        const meta = this.cache.json.get('meta');
        const master_movement = this.cache.json.get('master_movement');
        
        let persona_names = [];
        let persona_names_set = new Set();
        
        for (const persona of Object.keys(master_movement["0"])) {
            const persona_info = {
                original: persona,
                underscore: persona.replace(/ /g, "_"), // Use regex for global space replacement
                initial: persona[0] + persona.split(" ").slice(-1)[0][0] // Handle initials
            };
            persona_names.push(persona_info);
            persona_names_set.add(persona);
        }
        
        for(const p of persona_names) {
            this.load.atlas(p.underscore, `characters/${p.underscore}.png`, 
                'characters/atlas.json');
        }

        this.registry.set('persona_names_set', Array.from(persona_names_set));
        this.registry.set('persona_names', Array.from(persona_names));

        this.load.image('speech_bubble', 'speech_bubble/v3.png');
    }

    create () {
      this.scene.start('Game');
    }
}
