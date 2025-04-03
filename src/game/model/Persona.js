/**
 * Represents a character (Persona) in the game world with name, description, animations, and other properties.
 * The character can be spawned at a given location and have walk animations, speech bubbles, and other actions.
 */
export class Persona {
    /**
     * Creates an instance of a Persona.
     * 
     * @constructor
     * @param {string} name - The name of the persona.
     * @param {string} pronunciation - The pronunciation text to display in the speech bubble.
     * @param {Object} [spawn_point={x: 0, y: 0}] - The coordinates where the persona will spawn on the map (in tiles).
     * @param {Phaser.Animations.AnimationManager} anims - The Phaser animations manager to create walk animations.
     * @param {Phaser.Scene} scene - The Phaser scene where the persona will be placed.
     * @param {boolean} [speech_bubble=true] - Whether the persona will have a speech bubble above them.
     * @param {number} [tile_width=32] - The width of the tiles, used to calculate the position on the map.
     * @param {number} [move_speed=3] - The movement speed of the persona.
     */
    constructor(name, pronunciation, spawn_point = { x: 0, y: 0 }, anims, scene, speech_bubble = true, tile_width = 32, move_speed = 3) {
        this.name = name;
        this.character = null;
        this.initial = this.generateInitials(name);
        this.pronunciation = pronunciation;
        this.pronunciation_text = null;
        this.spawn_point = spawn_point;
        this.x = spawn_point.x;
        this.y = spawn_point.y;
        this.movement_history = [spawn_point];
        this.direction = "down";
        this.chat = null;
        this.anims = anims;
        this.move_speed = move_speed;
        this.speech_bubble = null;
        this.tile_width = tile_width;
        this.current_activity = "Sleeping"
        this.speed = 32

        this.createSprite(scene, tile_width);
        this.createWalkAnimations();

        if (speech_bubble) {
            this.createSpeechBubble(scene);
        }
    }

    /**
     * Generates the initials of the persona's name (e.g., "John Doe" -> "JD").
     * 
     * @param {string} name - The full name of the persona.
     * @returns {string} The initials of the persona's name.
     */
    generateInitials(name) {
        const parts = name.split(" ");
        return parts[0][0] + (parts[parts.length - 1]?.[0] || "");
    }

    /**
     * Creates the sprite for the persona and positions it on the map.
     * 
     * @param {Phaser.Scene} scene - The Phaser scene where the sprite will be added.
     * @param {number} tile_width - The width of the tiles used to position the persona correctly.
     * @returns {void}
     */
    createSprite(scene, tile_width) {
        const x_map = this.x * tile_width + tile_width / 2;
        const y_map = this.y * tile_width + tile_width;

        console.log(`${this.name} coordinates:`, x_map, y_map);

        this.character = scene.physics.add.sprite(
            x_map,
            y_map,
            this.name,
            this.direction
        ).setSize(30, 40).setOffset(0, 0);

        // Set the display width and maintain the aspect ratio
        this.character.displayWidth = 40;
        this.character.scaleY = this.character.scaleX;
        scene.physics.add.collider(this.character, scene.collisionsLayer);
        this.character.body.setSize(20, 20);
    }

    /**
     * Creates the speech bubble and associated text for the persona.
     * 
     * @param {Phaser.Scene} scene - The Phaser scene where the speech bubble will be added.
     * @returns {void}
     */
    createSpeechBubble(scene) {
        // Create the speech bubble
        this.speech_bubble = scene.add.image(
            this.character.x, 
            this.character.y - 30, 
            'speech_bubble'
        )
        .setDepth(3)
        .setDisplaySize(130, 58); // Set width and height
    
        // Create the text inside the speech bubble
        this.pronunciation_text = scene.add.text(
            this.character.x, 
            this.character.y - 42, 
            this.pronunciation, 
            {
                font: "24px monospace",
                fill: "#000000",
                align: "center"
            }
        ).setOrigin(0.5) // Center the text
         .setDepth(3);
    
        // Attach the speech bubble and text to follow the character
        scene.events.on('update', () => {
            if (this.character) {
                this.speech_bubble.setPosition(this.character.x, this.character.y - 30);
                this.pronunciation_text.setPosition(this.character.x, this.character.y - 42);
            }
        });
    }

    /**
     * Disables the speech bubble and hides the associated text.
     * 
     * @returns {void}
     */
    disableSpeechBubble() {
        if (this.speech_bubble) {
            this.speech_bubble.setVisible(false); // Hide the speech bubble
        }
        if (this.pronunciation_text) {
            this.pronunciation_text.setVisible(false); // Hide the text
        }
    }

    /**
     * Enables the speech bubble and shows the associated text.
     * 
     * @returns {void}
     */
    enableSpeechBubble() {
        if (this.speech_bubble) {
            this.speech_bubble.setVisible(true); // Show the speech bubble
        }
        if (this.pronunciation_text) {
            this.pronunciation_text.setVisible(true); // Show the text
        }
    }

    /**
     * Creates walk animations for each direction (left, right, down, up) for the persona.
     * 
     * @returns {void}
     */
    createWalkAnimations() {
        const directions = ["left", "right", "down", "up"];
        directions.forEach(direction => {
            const walkAnimationKey = `${this.name}-${direction}-walk`;
            this.anims.create({
                key: walkAnimationKey,
                frames: this.anims.generateFrameNames(this.name, {
                    prefix: `${direction}-walk.`,
                    start: 0,
                    end: 3,
                    zeroPad: 3
                }),
                frameRate: 4,
                repeat: -1
            });
        });
    }

    /**
     * Converts the persona's data to a JSON object for serialization.
     * 
     * @returns {Object} The persona data in JSON format.
     */
    toJSON() {
        return {
            name: this.name,
            initial: this.initial,
            pronunciation: this.pronunciation,
            spawn_point: this.spawn_point,
            movement_history: this.movement_history,
            direction: this.direction,
            chat: this.chat,
        };
    }

    getPosition() {
        let tile_width = this.tile_width 
        let x_map = this.character.x
        let y_map = this.character.y

        const x =  Math.round((x_map - tile_width/2)/ tile_width);
        const y = Math.round((y_map - tile_width)/ tile_width);
        const direction = this.direction
       return  {x,y, direction}
    }

    doUpdates(update) {
        if (update["activity"] === "move") {
            this.pronunciation = "👣";
            this.pronunciation_text.setText(this.pronunciation)
            this.current_activity = "Moving";
    
            let path = update["path"]; // Array of movement directions
            if (path && path.length > 0) {
                let direction = path[0]; // Get the first movement direction
                let velocityX = 0;
                let velocityY = 0;
                let tileSize = this.tile_width;
    
                switch (direction) {
                    case "up":
                        velocityY = -1;
                        break;
                    case "down":
                        velocityY = 1;
                        break;
                    case "left":
                        velocityX = -1;
                        break;
                    case "right":
                        velocityX = 1;
                        break;
                }
    
                // Set velocity
                this.character.setVelocity(velocityX * 160, velocityY * 160);
                this.direction = direction;
    
                if (this.character.anims) {
                    this.character.anims.play(`${this.name}-${direction}-walk`, true);
                }
    
                // Stop movement once out of the current tile
                let checkTileExit = setInterval(() => {
                    console.log("check")
                    let { x, y } = this.getPosition();
                    let newX = Math.round((this.character.x - tileSize / 2) / tileSize);
                    let newY = Math.round(this.character.y / tileSize);
    
                    if (newX !== x || newY !== y) {
                        this.character.setVelocity(0, 0); // Stop movement

                        clearInterval(checkTileExit); // Stop checking
                    }
                }, 50); // Check every 50ms
            }
        }
    }   
}
