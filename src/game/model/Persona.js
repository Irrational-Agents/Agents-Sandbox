/**
 * Represents a character (Persona) in the game world with animations, movement, and interactions.
 */
export class Persona {
    // Animation configuration constants
    static ANIM_CONFIG = {
        FRAME_RATE: 4,
        FRAME_PREFIX: '-walk.',
        FRAME_START: 0,
        FRAME_END: 3,
        FRAME_PAD: 3,
        DIRECTIONS: ['left', 'right', 'down', 'up']
    };

    // Movement configuration constants
    static MOVEMENT_CONFIG = {
        BASE_SPEED: 160,
        TILE_CHECK_INTERVAL: 200, // ms
        COLLIDER_SIZE: { width: 20, height: 20 },
        SPRITE_SIZE: { width: 30, height: 40 },
        SPRITE_OFFSET: { x: 0, y: 0 },
        DISPLAY_WIDTH: 40
    };

    constructor(
        name, 
        pronunciation, 
        spawn_point = { x: 0, y: 0 }, 
        anims, 
        scene, 
        speech_bubble = true, 
        tile_width = 32, 
        move_speed = 3
    ) {
        // Core properties
        this.name = name;
        this.pronunciation = pronunciation;
        this.spawn_point = spawn_point;
        this.tile_width = tile_width;
        this.move_speed = move_speed;
        this.current_activity = "sleep";
        
        // Game objects
        this.character = null;
        this.speech_bubble = null;
        this.pronunciation_text = null;
        
        // State tracking
        this.direction = "down";
        this.movement_history = [spawn_point];
        this.movementInterval = null;
        
        // References
        this.anims = anims;
        this.scene = scene;

        // Initial setup
        this.initial = this.generateInitials(name);
        this.createSprite();
        this.createWalkAnimations();

        if (speech_bubble) {
            this.createSpeechBubble();
        }
    }

    /**
     * Generates initials from the persona's name (e.g., "John Doe" -> "JD")
     */
    generateInitials(name) {
        return name.split(" ")
            .filter(part => part.length > 0)
            .map(part => part[0])
            .join("");
    }

    /**
     * Creates and configures the character sprite
     */
    createSprite() {
        const { x, y } = this.calculateSpritePosition();
        const config = Persona.MOVEMENT_CONFIG;

        this.character = this.scene.physics.add.sprite(
            x, y, 
            this.name, 
            this.direction
        );

        // Configure sprite physics and display
        this.character
            .setSize(config.SPRITE_SIZE.width, config.SPRITE_SIZE.height)
            .setOffset(config.SPRITE_OFFSET.x, config.SPRITE_OFFSET.y)
            .setDisplaySize(config.DISPLAY_WIDTH, 
                          config.DISPLAY_WIDTH * (config.SPRITE_SIZE.height / config.SPRITE_SIZE.width));

        // Add collisions
        this.scene.physics.add.collider(
            this.character, 
            this.scene.collisionsLayer
        );
        this.character.body.setSize(
            config.COLLIDER_SIZE.width, 
            config.COLLIDER_SIZE.height
        );
    }

    /**
     * Calculates the sprite's initial position on the map
     */
    calculateSpritePosition() {
        return {
            x: this.spawn_point.x * this.tile_width + this.tile_width / 2,
            y: this.spawn_point.y * this.tile_width + this.tile_width
        };
    }

    /**
     * Creates and configures the speech bubble
     */
    createSpeechBubble() {
        const bubbleYOffset = -30;
        const textYOffset = -42;
        
        this.speech_bubble = this.scene.add.image(
            this.character.x, 
            this.character.y + bubbleYOffset, 
            'speech_bubble'
        )
        .setDepth(3)
        .setDisplaySize(130, 58);

        this.pronunciation_text = this.scene.add.text(
            this.character.x, 
            this.character.y + textYOffset, 
            this.pronunciation, 
            {
                font: "24px monospace",
                fill: "#000000",
                align: "center"
            }
        )
        .setOrigin(0.5)
        .setDepth(3);

        // Update position each frame
        this.scene.events.on('update', this.updateSpeechBubblePosition.bind(this));
    }

    /**
     * Updates speech bubble position to follow the character
     */
    updateSpeechBubblePosition() {
        if (!this.character) return;
        
        const bubbleYOffset = -30;
        const textYOffset = -42;
        
        this.speech_bubble?.setPosition(
            this.character.x, 
            this.character.y + bubbleYOffset
        );
        this.pronunciation_text?.setPosition(
            this.character.x, 
            this.character.y + textYOffset
        );
    }

    /**
     * Toggles speech bubble visibility
     */
    setSpeechBubbleVisibility(visible) {
        this.speech_bubble?.setVisible(visible);
        this.pronunciation_text?.setVisible(visible);
    }

    disableSpeechBubble() {
        this.setSpeechBubbleVisibility(false);
    }

    enableSpeechBubble() {
        this.setSpeechBubbleVisibility(true);
    }

    /**
     * Creates walk animations for all directions
     */
    createWalkAnimations() {
        Persona.ANIM_CONFIG.DIRECTIONS.forEach(direction => {
            this.anims.create({
                key: `${this.name}-${direction}-walk`,
                frames: this.anims.generateFrameNames(this.name, {
                    prefix: `${direction}${Persona.ANIM_CONFIG.FRAME_PREFIX}`,
                    start: Persona.ANIM_CONFIG.FRAME_START,
                    end: Persona.ANIM_CONFIG.FRAME_END,
                    zeroPad: Persona.ANIM_CONFIG.FRAME_PAD
                }),
                frameRate: Persona.ANIM_CONFIG.FRAME_RATE,
                repeat: -1
            });
        });
    }

    /**
     * Gets current tile position and direction
     */
    getPosition() {
        const x = Math.round((this.character.x - this.tile_width / 2) / this.tile_width);
        const y = Math.round((this.character.y - this.tile_width) / this.tile_width);
        return { x, y, direction: this.direction };
    }

    /**
     * Handles updates from the server/game logic
     */
    async doUpdates(update) {
        if (!update || typeof update !== 'object') {
            console.warn('Invalid update received:', update);
            return false;
        }

        try {
            switch (update.activity) {
                case "move":
                    return await this.handleMoveUpdate(update);
                    
                case "think":
                    return this.handleThinkUpdate(update);
                    
                case "emote":
                    return this.handleEmotionUpdate(update);
                    
                default:
                    console.warn('Unknown activity type:', update.activity);
                    return false;
            }
        } catch (error) {
            console.error('Error processing update:', error);
            this.stopMovement();
            return false;
        }
    }

    /**
     * Handles movement updates
     */
    async handleMoveUpdate(update) {
        this.current_activity = update.activity;
        this.pronunciation = "👟";
        this.pronunciation_text?.setText(this.pronunciation);

        if (update.path == null) {
            update.move_extra.path = this.path
        } else {
            this.path = update.path
        }

        if(this.path.length == 0) {
            return true;
        }

        // Process first movement step in sequence
        let direction = this.path.shift()
            
        try {
            await this.executeMovement(direction);
        } catch (error) {
            console.error('Movement failed:', error);
            this.stopMovement();
            return false;
        }
        
        return true;
    }

    /**
     * Executes a single movement step
     */
    async executeMovement(direction) {
        return new Promise((resolve) => {
            // Setup movement completion callback
            this.movementResolve = () => {
                this.movementResolve = null;
                resolve();
            };

            // Start the movement
            this.startMovement(direction);
        });
    }

    /**
     * Starts movement in a specific direction
     */
    startMovement(direction) {
        this.stopMovement(); // Clean up any existing movement

        this.direction = direction;
        this.isMoving = true;

        // Set velocity and animation
        const velocity = this.calculateVelocity(direction);
        this.character.setVelocity(velocity.x, velocity.y);
        
        if (this.character.anims) {
            this.character.anims.play(`${this.name}-${direction}-walk`, true);
        }

        // Start position checking
        this.startPositionCheck();
    }

    /**
     * Calculates velocity vector based on direction
     */
    calculateVelocity(direction) {
        const speed = Persona.MOVEMENT_CONFIG.BASE_SPEED;
        switch (direction) {
            case "up": return { x: 0, y: -speed };
            case "down": return { x: 0, y: speed };
            case "left": return { x: -speed, y: 0 };
            case "right": return { x: speed, y: 0 };
            default: return { x: 0, y: 0 };
        }
    }

    /**
     * Starts checking position periodically
     */
    startPositionCheck() {
        this.lastTile = this.getCurrentTile();
        this.movementInterval = setInterval(
            () => this.checkPositionChange(),
            Persona.MOVEMENT_CONFIG.TILE_CHECK_INTERVAL
        );
    }

    /**
     * Checks if character has changed tiles
     */
    checkPositionChange() {
        if (!this.isMoving) return;

        const currentTile = this.getCurrentTile();
        
        if (currentTile.x !== this.lastTile.x || currentTile.y !== this.lastTile.y) {
            this.handleMovementComplete();
        }
    }

    /**
     * Gets the current tile position
     */
    getCurrentTile() {
        return {
            x: Math.round((this.character.x - this.tile_width / 2) / this.tile_width),
            y: Math.round(this.character.y / this.tile_width)
        };
    }

    /**
     * Handles completion of movement to new tile
     */
    handleMovementComplete() {
        this.stopMovement();
        
        if (this.movementResolve) {
            this.movementResolve();
        }
    }

    /**
     * Stops all movement and cleans up
     */
    stopMovement() {
        this.isMoving = false;
        
        if (this.character) {
            this.character.setVelocity(0, 0);
        }
        
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
            this.movementInterval = null;
        }
    }

    /**
     * Handles speech updates
     */
    handleThinkUpdate(update) {
        if (!update.description) return false;

        this.current_activity = update.activity;
        this.pronunciation = "🤔";
        this.pronunciation_text?.setText(this.pronunciation);
        
        this.pronunciation = update.message;
        this.pronunciation_text?.setText(update.message);
        this.current_activity = "Thinking";
        return true;
    }

    /**
     * Handles emotion updates
     */
    handleEmotionUpdate(update) {
        if (!update.emotion) return false;
        
        this.pronunciation = update.emotion;
        this.pronunciation_text?.setText(update.emotion);
        this.current_activity = "Emoting";
        return true;
    }

    getActivity() {
        switch (this.current_activity) {
            case "move":
                return {
                    "activity": this.current_activity,
                    "steps_remaining": this.path?.length
                };
                
            case "speak":
                return {
                    "activity": this.current_activity,
                };
                
            case "emote":
                return {
                    "activity": this.current_activity,
                };
                
            default:
                return {
                    "activity": "free",
                };
        }
    }

    /**
     * Serializes persona data
     */
    toJSON() {
        return {
            name: this.name,
            initial: this.initial,
            pronunciation: this.pronunciation,
            spawn_point: this.spawn_point,
            movement_history: this.movement_history,
            direction: this.direction,
            chat: this.chat
        };
    }
}