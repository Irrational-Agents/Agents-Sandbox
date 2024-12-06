import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor () {
        super('Game');
        this.player = null; // Declare player as a class-level property
        this.cursors = null;
    }

    init() {
    }

    create () {
        const map = this.make.tilemap({ key: "map" });

        // Persona related variables. This should have the name of the persona as its 
        // keys, and the instances of the Persona class as the values.
        var spawn_tile_loc = {};
        var personas = {};
        var pronunciatios = {};
        let anims_direction;
        let pre_anims_direction;
    
        let curr_maze = "the_ville";
    
        // <tile_width> is the width of one individual tile (tiles are square)
        let tile_width = 32;
        // Important: tile_width % movement_speed has to be 0. 
        // <movement_speed> determines how fast we move at each upate cylce. 
        let movement_speed = 32; 
    
        // <timer_max> determines how frequently our update function will query the 
        // frontend server. If it's higher, we wait longer cycles. 
        let timer_max = 0;
        let timer = timer_max;
    
        // <phase> -- there are three phases: "process," "update," and "execute."
        let phase = "update"; // or "update" or "execute"
    
        // Variables for storing movements that are sent from the backend server.
        let execute_movement;
        let execute_count_max = tile_width/movement_speed;
        let execute_count = execute_count_max;
        let movement_target = {};
    
        // <step> -- one full loop around all three phases determined by <phase> is 
        // a step. We use this to link the steps in the backend. 
        let step = 20
        // let sim_code = document.getElementById('sim_code').innerHTML;
        // Joon: Logging map is really helpful for debugging here: 
        // console.log(map);
  
        // The first parameter is the name you gave to the tileset in Tiled and then
        // the key of the tileset image in Phaser's cache (i.e. the name you used in
        // preload)
        // Joon: for the first parameter here, really take a look at the 
        //       console.log(map) output. You need to make sure that the name 
        //       matches.

        let init_pos = {}

        const master_movement = this.cache.json.get('master_movement');
        const persona_names_set = new Set(this.registry.get('persona_names_set'));
        const persona_names = this.registry.get('persona_names');

        for(let int_key=0; int_key<=step; int_key++) {
            for (let p of persona_names_set){
                if(p in master_movement[int_key]) {
                    init_pos[p] = master_movement[int_key][p]
                }
            }
        }
        const persona_init_pos = {}
        // Iterate through each persona in the persona names set
        for (const persona of persona_names_set) {
            persona_init_pos[persona.replace(/ /g, "_")] = init_pos[persona].movement;
        }

        var spawn_tile_loc = {};
        for (var key of persona_names){
            spawn_tile_loc[key.underscore] = persona_init_pos[key.underscore] ;
        }
        //console.log(persona_names_set)


        const collisions = map.addTilesetImage("blocks", "blocks_1");
        const walls = map.addTilesetImage("Room_Builder_32x32", "walls");
        const interiors_pt1 = map.addTilesetImage("interiors_pt1", "interiors_pt1");
        const interiors_pt2 = map.addTilesetImage("interiors_pt2", "interiors_pt2");
        const interiors_pt3 = map.addTilesetImage("interiors_pt3", "interiors_pt3");
        const interiors_pt4 = map.addTilesetImage("interiors_pt4", "interiors_pt4");
        const interiors_pt5 = map.addTilesetImage("interiors_pt5", "interiors_pt5");
        const CuteRPG_Field_B = map.addTilesetImage("CuteRPG_Field_B", "CuteRPG_Field_B");
        const CuteRPG_Field_C = map.addTilesetImage("CuteRPG_Field_C", "CuteRPG_Field_C");
        const CuteRPG_Harbor_C = map.addTilesetImage("CuteRPG_Harbor_C", "CuteRPG_Harbor_C");
        const CuteRPG_Village_B = map.addTilesetImage("CuteRPG_Village_B", "CuteRPG_Village_B");
        const CuteRPG_Forest_B = map.addTilesetImage("CuteRPG_Forest_B", "CuteRPG_Forest_B");
        const CuteRPG_Desert_C = map.addTilesetImage("CuteRPG_Desert_C", "CuteRPG_Desert_C");
        const CuteRPG_Mountains_B = map.addTilesetImage("CuteRPG_Mountains_B", "CuteRPG_Mountains_B");
        const CuteRPG_Desert_B = map.addTilesetImage("CuteRPG_Desert_B", "CuteRPG_Desert_B");
        const CuteRPG_Forest_C = map.addTilesetImage("CuteRPG_Forest_C", "CuteRPG_Forest_C");
  
        // The first parameter is the layer name (or index) taken from Tiled, the 
        // second parameter is the tileset you set above, and the final two 
        // parameters are the x, y coordinate. 
        // Joon: The "layer name" that comes as the first parameter value  
        //       literally is taken from our Tiled layer name. So to find out what
        //       they are; you actually need to open up tiled and see how you 
        //       named things there. 
        let tileset_group_1 = [CuteRPG_Field_B, CuteRPG_Field_C, CuteRPG_Harbor_C, CuteRPG_Village_B, 
                                                     CuteRPG_Forest_B, CuteRPG_Desert_C, CuteRPG_Mountains_B, CuteRPG_Desert_B, CuteRPG_Forest_C,
                                                     interiors_pt1, interiors_pt2, interiors_pt3, interiors_pt4, interiors_pt5, walls];
        const bottomGroundLayer = map.createLayer("Bottom Ground", tileset_group_1, 0, 0);
        const exteriorGroundLayer = map.createLayer("Exterior Ground", tileset_group_1, 0, 0);
        const exteriorDecorationL1Layer = map.createLayer("Exterior Decoration L1", tileset_group_1, 0, 0);
        const exteriorDecorationL2Layer = map.createLayer("Exterior Decoration L2", tileset_group_1, 0, 0);
        const interiorGroundLayer = map.createLayer("Interior Ground", tileset_group_1, 0, 0);
        const wallLayer = map.createLayer("Wall", [CuteRPG_Field_C, walls], 0, 0);
        const interiorFurnitureL1Layer = map.createLayer("Interior Furniture L1", tileset_group_1, 0, 0);
        const interiorFurnitureL2Layer = map.createLayer("Interior Furniture L2 ", tileset_group_1, 0, 0);
        const foregroundL1Layer = map.createLayer("Foreground L1", tileset_group_1, 0, 0);
        const foregroundL2Layer = map.createLayer("Foreground L2", tileset_group_1, 0, 0);
  
        const collisionsLayer = map.createLayer("Collisions", collisions, 0, 0);
        // const groundLayer = map.createLayer("Ground", walls, 0, 0);
        // const indoorGroundLayer = map.createLayer("Indoor Ground", walls, 0, 0);
        // const wallsLayer = map.createLayer("Walls", walls, 0, 0);
        // const interiorsLayer = map.createLayer("Furnitures", interiors, 0, 0);
        // const builtInLayer = map.createLayer("Built-ins", interiors, 0, 0);
        // const appliancesLayer = map.createLayer("Appliances", interiors, 0, 0);
        // const foregroundLayer = map.createLayer("Foreground", interiors, 0, 0);
  
        // Joon : This is where you want to create a custom field for the tileset
        //        in Tiled. Take a look at this guy's tutorial: 
        //        https://www.youtube.com/watch?v=MR2CvWxOEsw&ab_channel=MattWilber
        collisionsLayer.setCollisionByProperty({ collide: true });
        // By default, everything gets depth sorted on the screen in the order we 
        // created things. Here, we want the "Above Player" layer to sit on top of 
        // the player, so we explicitly give it a depth. Higher depths will sit on 
        // top of lower depth objects.
        // Collisions layer should get a negative depth since we do not want to see
        // it. 
        collisionsLayer.setDepth(-1);
        foregroundL1Layer.setDepth(2);
        foregroundL2Layer.setDepth(2);

	  // *** SET UP CAMERA *** 
	  // "player" is to be set as the center of mass for our "camera." We 
	  // basically create a game character sprite as we would for our personas 
	  // but we move it to depth -1 and let it pass through the collision map;  
	  // that is, do not have the following line: 
	  // this.physics.add.collider(this.player, collisionsLayer);
	  // OLD NOTE: Create a sprite with physics enabled via the physics system. 
	  // The image  used for the sprite has a bit of whitespace, so I'm using 
	  // setSize & setOffset to control the size of the player's body.

        this.player = this.physics.add.sprite(2400, 1000, "atlas", "down").setSize(30, 40).setOffset(0, 0);
        //player.setDepth(1);
        this.player.displayWidth = 40;
        this.player.scaleY = this.player.scaleX
        // Setting up the camera. 
        const camera = this.cameras.main;
        camera.startFollow( this.player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cursors = this.input.keyboard.createCursorKeys();

        const anims = this.anims;
        let persona_name = "atlas";
        let left_walk_name = persona_name + "-left-walk";
        let right_walk_name = persona_name + "-right-walk";
        let down_walk_name = persona_name + "-down-walk";
        let up_walk_name = persona_name + "-up-walk";

        anims.create({
		    key: left_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "left-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });

		  anims.create({
		    key: right_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "right-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });

		  anims.create({
		    key: down_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "down-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });

		  anims.create({
		    key: up_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "up-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });



	  // *** SET UP PERSONAS *** 
	  // We start by creating the game sprite objects. 
      var speech_bubbles = {};
	  for (let i=0; i<Object.keys(spawn_tile_loc).length; i++) { 
	    let persona_name = Object.keys(spawn_tile_loc)[i];
	    let start_pos = [spawn_tile_loc[persona_name][0] * tile_width + tile_width / 2, 
	                     spawn_tile_loc[persona_name][1] * tile_width + tile_width];
        //console.log(start_pos)
	    let new_sprite = this.physics.add
	                         .sprite(start_pos[0], start_pos[1], persona_name, "down")
	                         .setSize(30, 40)
	                         .setOffset(0, 0);
	    // Scale up the sprite
        new_sprite.displayWidth = 40;
        new_sprite.scaleY = new_sprite.scaleX;

	    // Here, we are creating the persona and its pronunciatio sprites.
	    personas[persona_name] = new_sprite;
	    speech_bubbles[persona_name] = this.add.image(new_sprite.body.x - 0, 
	    											  new_sprite.body.y - 30,
	    											'speech_bubble').setDepth(3);
        speech_bubbles[persona_name].displayWidth = 130;
        speech_bubbles[persona_name].displayHeight = 58;

	    pronunciatios[persona_name] = this.add.text(
	                                   new_sprite.body.x - 6, 
	                                   new_sprite.body.y - 42, 
	                                   "🦁", {
	                                   font: "24px monospace", 
	                                   fill: "#000000", 
	                                   padding: { x: 8, y: 8}, 
	                                   border:"solid",
	                                   borderRadius:"10px"}).setDepth(3);
	  }

	  // Create the player's walking animations from the texture atlas. These are
	  // stored in the global animation manager so any sprite can access them.
	  for (let i=0; i<Object.keys(spawn_tile_loc).length; i++) { 
			let persona_name = Object.keys(spawn_tile_loc)[i];
			let left_walk_name = persona_name + "-left-walk";
			let right_walk_name = persona_name + "-right-walk";
			let down_walk_name = persona_name + "-down-walk";
			let up_walk_name = persona_name + "-up-walk";

			//console.log(persona_name, left_walk_name, "DEUBG")
		  anims.create({
		    key: left_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "left-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });

		  anims.create({
		    key: right_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "right-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });

		  anims.create({
		    key: down_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "down-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });

		  anims.create({
		    key: up_walk_name,
		    frames: anims.generateFrameNames(persona_name, { prefix: "up-walk.", start: 0, end: 3, zeroPad: 3 }),
		    frameRate: 4,
		    repeat: -1 });
	  }
      
        EventBus.emit('current-scene-ready', this);
    }

    update() {
        // Reset player velocity
        let speed = 3
        this.player.setVelocity(0);

        // Movement logic
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160*speed);
            this.player.anims.play("atlas-left-walk", true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160*speed);
            this.player.anims.play("atlas-right-walk", true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160*speed);
            this.player.anims.play("atlas-up-walk", true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160*speed);
            this.player.anims.play("atlas-down-walk", true);
        } else {
            // Stop animation when no key is pressed
            this.player.anims.stop();
        }
    }
}
