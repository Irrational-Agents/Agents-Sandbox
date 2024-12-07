export class Persona {
    constructor(name, description, pronunciation, spawn_point = { x: 0, y: 0 }, anims, scene, speech_bubble=true, tile_width=32, move_speed=3) {
        this.name = name;
        this.character = null;
        this.initial = this.generateInitials(name);
        this.description = description;
        this.pronunciation = pronunciation;
        this.pronunciation_text = null
        this.spawn_point = spawn_point;
        this.x = spawn_point.x;
        this.y = spawn_point.y;
        this.movement_history = [spawn_point];
        this.direction = "down";
        this.chat = null;
        this.anims = anims;
        this.move_speed = move_speed;
        this.speech_bubble = null

        this.createSprite(scene, tile_width);
        this.createWalkAnimations();

        if (speech_bubble) {
            this.createSpeechBubble(scene)
        }

    }

    // Generate initials from the name (e.g., "John Doe" -> "JD")
    generateInitials(name) {
        const parts = name.split(" ");
        return parts[0][0] + (parts[parts.length - 1]?.[0] || "");
    }

    // Create the sprite and position it on the map
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
    }

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

    disableSpeechBubble() {
        if (this.speech_bubble) {
            this.speech_bubble.setVisible(false); // Hide the speech bubble
        }
        if (this.pronunciation_text) {
            this.pronunciation_text.setVisible(false); // Hide the text
        }
    }
    
    enableSpeechBubble() {
        if (this.speech_bubble) {
            this.speech_bubble.setVisible(true); // Show the speech bubble
        }
        if (this.pronunciation_text) {
            this.pronunciation_text.setVisible(true); // Show the text
        }
    }

    // Create walk animations for each direction (left, right, down, up)
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

    // Convert persona data to JSON for serialization
    toJSON() {
        return {
            name: this.name,
            initial: this.initial,
            description: this.description,
            pronunciation: this.pronunciation,
            spawn_point: this.spawn_point,
            movement_history: this.movement_history,
            direction: this.direction,
            chat: this.chat,
        };
    }
}
