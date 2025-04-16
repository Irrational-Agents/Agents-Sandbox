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
        this.processing = "..."
        this.engaging = '...'
        this.directing = '...'
        
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
        console.log(update)
        if (!update || typeof update !== 'object') {
            console.warn('Invalid update received:', update);
            return false;
        }

        try {
            switch (update.state.activity) {
                case "move":
                    return await this.handleMoveUpdate(update.state);
                    
                case "think":
                    return await this.handleThinkUpdate(update.state);

                case "chat":
                    return await this.handleChatUpdate(update.state);

                case "interact":
                    return await this.handleInteractUpdate(update.state);

                case "emote":
                    return this.handleEmotionUpdate(update.state);
                    
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

    stopMovement() {
        this.isMoving = false;
        
        // Clear all intervals
        if (this.thinkIdleInterval) clearInterval(this.thinkIdleInterval);
        if (this.chatIdleInterval) clearInterval(this.chatIdleInterval);
        if (this.interactIdleInterval) clearInterval(this.interactIdleInterval);
        
        // Stop all tweens
        this.scene.tweens.killTweensOf(this.character);
        
        if (this.character) {
            this.character.setVelocity(0, 0);
            // Play idle animation when stopping
            if (this.character.anims && this.direction) {
                this.character.anims.play(`${this.name}-${this.direction}-idle`, true);
            }
        }
        
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
            this.movementInterval = null;
        }
    }

    /**
     * Handles thinking updates with movement animation
     */
    async handleThinkUpdate(update) {
        if (!update.description) return false;

        // Clear any previous think state
        if (this.thinkTimeout) clearTimeout(this.thinkTimeout);
        this.stopMovement();

        this.current_activity = update.activity;
        this.pronunciation = "🤔";
        this.pronunciation_text?.setText(this.pronunciation);
        
        this.processing = update.description;
        this.scene.bottomUI.updateCharacterInfo();
        
        // Play thinking animation
        await this.playThinkMovement();
        
        // Set timeout to clear thinking after delay
        this.thinkTimeout = setTimeout(() => {
        }, 5000); // Clear after 5 seconds
        
        return true;
    }

    /**
     * Plays thinking movement animation
     */
    async playThinkMovement() {
        const originalX = this.character.x;
        const originalY = this.character.y;
        
        // Thinking animation - subtle swaying
        const movements = [
            { x: originalX, y: originalY - 3, duration: 1000 },
            { x: originalX + 2, y: originalY - 1, duration: 800 },
            { x: originalX - 2, y: originalY - 1, duration: 800 },
            { x: originalX, y: originalY, duration: 1000 }
        ];
        
        // Play animation sequence
        for (const move of movements) {
            if (this.current_activity !== "think") break; // Stop if state changed
            await this.tweenMovement(move);
        }
        
        // Continuous idle thinking animation
        if (this.current_activity === "think") {
            this.thinkIdleInterval = setInterval(() => {
                if (this.current_activity !== "think") {
                    clearInterval(this.thinkIdleInterval);
                    return;
                }
                // Random subtle movements
                this.scene.tweens.add({
                    targets: this.character,
                    x: originalX + (Math.random() * 4 - 2),
                    y: originalY + (Math.random() * 2 - 1),
                    duration: 2000,
                    ease: 'Sine.easeInOut'
                });
            }, 2000);
        }
    }

    /**
     * Handles chat updates with movement timeout
     */
    async handleChatUpdate(update) {
        if (!update.description) return false;

        this.current_activity = update.activity;
        this.pronunciation = "💬";
        this.pronunciation_text?.setText(this.pronunciation);
        
        const message = `To ${update.description[1]} - ${update.description[2]}`;
        this.engaging = message;
        this.scene.bottomUI.updateCharacterInfo();
        
        // Add subtle movement during chat
        await this.playChatMovement();
        
        return true;
    }

    /**
     * Plays subtle movement animation during chat
     */
    async playChatMovement() {
        const originalX = this.character.x;
        const originalY = this.character.y;
        const duration = 3000; // 3 seconds of chat animation
        
        // Small back-and-forth movement
        const moveDistance = 5;
        const movements = [
            { x: originalX + moveDistance, y: originalY, duration: 500 },
            { x: originalX - moveDistance, y: originalY, duration: 500 },
            { x: originalX, y: originalY, duration: 500 }
        ];
        
        // Play animation sequence
        for (const move of movements) {
            await this.tweenMovement(move);
        }
        
        // Random idle movements during remaining time
        const remainingTime = duration - 1500;
        if (remainingTime > 0) {
            await new Promise(resolve => {
                this.chatTimeout = setTimeout(() => {
                    this.returnToOriginalPosition(originalX, originalY);
                    resolve();
                }, remainingTime);
            });
        }
    }

    /**
     * Smooth tween movement helper
     */
    tweenMovement({x, y, duration}) {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this.character,
                x: x,
                y: y,
                duration: duration,
                ease: 'Sine.easeInOut',
                onComplete: resolve
            });
        });
    }

    /**
     * Returns character to original position
     */
    returnToOriginalPosition(originalX, originalY) {
        this.scene.tweens.add({
            targets: this.character,
            x: originalX,
            y: originalY,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Handles interaction updates with timeout and movement animation
     */
    async handleInteractUpdate(update) {
        if (!update.description) return false;

        // Clear any previous interaction state
        if (this.interactTimeout) clearTimeout(this.interactTimeout);
        this.stopMovement();

        this.current_activity = update.activity;
        this.pronunciation = "🤝";
        this.pronunciation_text?.setText(this.pronunciation);
        
        const message = `${update.description}`;
        this.directing = message;
        this.scene.bottomUI.updateCharacterInfo();
        
        // Play interaction animation
        await this.playInteractMovement();
        
        // Set timeout to clear interaction after delay
        this.interactTimeout = setTimeout(() => {
        }, this.calculateInteractDuration(message)); // Dynamic duration based on message
        
        return true;
    }

    /**
     * Plays interaction movement animation
     */
    async playInteractMovement() {
        const originalX = this.character.x;
        const originalY = this.character.y;
        
        // Interaction animation - purposeful movements
        const movements = [
            { x: originalX, y: originalY - 5, duration: 300 },
            { x: originalX, y: originalY + 2, duration: 200 },
            { x: originalX, y: originalY, duration: 100 }
        ];
        
        // Play animation sequence
        for (const move of movements) {
            if (this.current_activity !== "interact") break;
            await this.tweenMovement(move);
        }
        
        // Continuous idle interaction animation
        if (this.current_activity === "interact") {
            this.interactIdleInterval = setInterval(() => {
                if (this.current_activity !== "interact") {
                    clearInterval(this.interactIdleInterval);
                    return;
                }
                // Focused interaction movements
                this.scene.tweens.add({
                    targets: this.character,
                    x: originalX + (Math.random() * 6 - 3),
                    y: originalY + (Math.random() * 4 - 2),
                    duration: 1200,
                    ease: 'Sine.easeInOut'
                });
            }, 1200);
        }
    }

    /**
     * Calculates interaction display duration based on message length
     */
    calculateInteractDuration(message) {
        const baseDuration = 2500; // 2.5 seconds minimum
        const extraPerChar = 40; // 40ms per additional character
        return baseDuration + (message.length * extraPerChar);
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