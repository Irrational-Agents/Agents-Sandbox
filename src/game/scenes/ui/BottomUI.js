import { UI_CONFIG } from './UIConfig';

export class BottomUI {
    constructor(scene) {
        this.scene = scene;
        this.uiElements = {};
        this.currentTexts = {
            processing: '',
            engaging: '',
            directing: ''
        };
        this.textQueues = {
            processing: [],
            engaging: [],
            directing: []
        };
        this.isTyping = {
            processing: false,
            engaging: false,
            directing: false
        };
        // Base dimensions from config
        this.baseBoxHeight = UI_CONFIG.BOTTOM_UI.THINKING.HEIGHT;
        this.baseBoxWidth = (UI_CONFIG.BOTTOM_UI.THINKING.WIDTH - 20) / 3;
    }

    create() {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height * UI_CONFIG.BOTTOM_UI.Y_POSITION_RATIO;
        const config = UI_CONFIG.BOTTOM_UI;

        // Create border
        const border = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width * config.WIDTH_RATIO + config.BORDER_THICKNESS,
            config.HEIGHT + config.BORDER_THICKNESS,
            config.BORDER_COLOR
        );

        // Create panel
        const bPanel = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width * config.WIDTH_RATIO,
            config.HEIGHT,
            config.PANEL_COLOR,
            config.PANEL_ALPHA
        );

        // Determine character sprite
        const charSpriteKey = (this.scene.camara_id === 0 || this.scene.camara_id === -1) 
            ? this.scene.player_name 
            : this.scene.npc_names[this.scene.camara_id - 1];

        // Add character sprite
        this.uiElements.npcSprite = this.scene.add.sprite(
            this.scene.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.SPRITE_OFFSET,
            config.CHARACTER.Y_OFFSET,
            charSpriteKey,
            "down"
        )
        .setScale(config.CHARACTER.SCALE)
        .setOrigin(0.5, 0.5);

        // Add character name
        this.uiElements.charSpriteName = this.scene.add.text(
            this.scene.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.NAME_OFFSET,
            -30,
            charSpriteKey,
            {
                fontSize: config.CHARACTER.NAME_FONT,
                fill: config.CHARACTER.COLOR,
                fontStyle: config.CHARACTER.STYLE
            }
        ).setScrollFactor(0);

        // Add character status
        this.uiElements.charSpriteStatus = this.scene.add.text(
            this.scene.scale.width * config.WIDTH_RATIO * config.CHARACTER.X_OFFSET + config.CHARACTER.STATUS_OFFSET,
            10,
            `${this.scene.npcs[charSpriteKey].current_activity} ${this.scene.npcs[charSpriteKey].pronunciation}`,
            {
                fontSize: config.CHARACTER.STATUS_FONT,
                fill: config.CHARACTER.COLOR,
                fontStyle: config.CHARACTER.STYLE
            }
        ).setScrollFactor(0);

        // Create text boxes container
        this.uiElements.textBoxesContainer = this.scene.add.container(
            0,
            -10
        ).setScrollFactor(0);

        // Calculate positions for the three boxes
        const boxWidth = (config.THINKING.WIDTH - 20) / 3; // Divide width equally with some spacing
        const boxHeight = config.THINKING.HEIGHT;
        const startX = -config.THINKING.WIDTH / 2 + boxWidth / 2 + config.THINKING.OFFSET;

        // Create three text boxes with new categories
        const textBoxConfigs = [
            { type: 'processing', color: 0x334477, title: 'Thinking' },
            { type: 'engaging', color: 0x447744, title: 'Speaking' },
            { type: 'directing', color: 0x774434, title: 'Interacting' }
        ];

        textBoxConfigs.forEach((boxConfig, index) => {
            const boxX = startX + index * (this.baseBoxWidth + 10);
            
            // Create box container
            const boxContainer = this.scene.add.container(boxX, 0);
            
            // Create box background (will be updated dynamically)
            const bg = this.scene.add.graphics();
            this.updateBoxBackground(bg, boxConfig.color, this.baseBoxHeight);
            
            // Add title
            const title = this.scene.add.text(
                0,
                -this.baseBoxHeight/2 + 10,
                boxConfig.title,
                {
                    fontSize: '20px',
                    fill: '#ffffff',
                    fontStyle: 'bold',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            // Add content text
            const content = this.scene.add.text(
                0,
                -this.baseBoxHeight/2 + 30,
                '',
                {
                    fontSize: config.THINKING.FONT_SIZE || '14px',
                    fill: config.THINKING.COLOR || '#ffffff',
                    fontStyle: config.THINKING.STYLE || 'normal',
                    wordWrap: { 
                        width: this.baseBoxWidth - 20,
                        useAdvancedWrap: true 
                    },
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            // Store references
            boxContainer.add([bg, title, content]);
            this.uiElements.textBoxesContainer.add(boxContainer);
            
            this.uiElements[`${boxConfig.type}Box`] = boxContainer;
            this.uiElements[`${boxConfig.type}Bg`] = bg; // Store background reference
            this.uiElements[`${boxConfig.type}Content`] = content;
            this.uiElements[`${boxConfig.type}Title`] = title;
        });

        // Group all bottom UI elements
        this.uiElements.container = this.scene.add.container(centerX, centerY, [
            border,
            bPanel,
            this.uiElements.npcSprite,
            this.uiElements.charSpriteName,
            this.uiElements.charSpriteStatus,
            this.uiElements.textBoxesContainer
        ])
        .setDepth(1000)
        .setScrollFactor(0);

    }

    updateCharacterInfo() {
        const charSpriteKey = this.scene.getCameraTexture();
        if (this.uiElements.npcSprite && charSpriteKey) {
            this.uiElements.npcSprite.setTexture(charSpriteKey, "down");
            this.uiElements.charSpriteName.setText(charSpriteKey);
            this.uiElements.charSpriteStatus.setText(
                `${this.scene.npcs[charSpriteKey].current_activity} ${this.scene.npcs[charSpriteKey].pronunciation}`
            );

            this.textQueues = {
                processing: [],
                engaging: [],
                directing: []
            };

            this.clearDirectingText()
            this.clearEngagingText()
            this.clearProcessingText()

            this.setProcessingText(this.scene.npcs[charSpriteKey].processing,1)
            this.setDirectingText(this.scene.npcs[charSpriteKey].directing,1)
            this.setEngagingText(this.scene.npcs[charSpriteKey].engaging,1)
        }
    }

    // Method to set text in any box with optional typing animation
    setBoxText(boxType, text, instant = false) {
        const contentElement = this.uiElements[`${boxType}Content`];
        if (!contentElement) return;
        
        if (instant) {
            this.currentTexts[boxType] = text;
            contentElement.setText(text);
            this.isTyping[boxType] = false;
        } else {
            this.textQueues[boxType].push(text);
            if (!this.isTyping[boxType]) {
                this.processTextQueue(boxType);
            }
        }
    }

    // Process the text queue with typing animation for a specific box
    processTextQueue(boxType) {
        if (this.textQueues[boxType].length === 0) {
            this.isTyping[boxType] = false;
            return;
        }

        this.isTyping[boxType] = true;
        const nextText = this.textQueues[boxType].shift();
        this.currentTexts[boxType] = '';
        this.uiElements[`${boxType}Content`].setText('');

        const chars = nextText.split('');
        let i = 0;
        
        const typeNextChar = () => {
            if (i < chars.length) {
                this.currentTexts[boxType] += chars[i];
                this.uiElements[`${boxType}Content`].setText(this.currentTexts[boxType]);
                i++;
                this.scene.time.delayedCall(30, typeNextChar); // Adjust typing speed here
            } else {
                this.isTyping[boxType] = false;
                this.processTextQueue(boxType);
            }
        };

        typeNextChar();
    }

    // Clear a specific text box
    clearBoxText(boxType) {
        this.textQueues[boxType] = [];
        this.currentTexts[boxType] = '';
        this.isTyping[boxType] = false;
        if (this.uiElements[`${boxType}Content`]) {
            this.uiElements[`${boxType}Content`].setText('');
        }
    }

    // Convenience methods for each box type
    setProcessingText(text, instant = false) {
        this.setBoxText('processing', text, instant);
    }

    setEngagingText(text, instant = false) {
        this.setBoxText('engaging', text, instant);
    }

    setDirectingText(text, instant = false) {
        this.setBoxText('directing', text, instant);
    }

    clearProcessingText() {
        this.setBoxText('processing', '...', true);
    }

    clearEngagingText() {
        this.setBoxText('engaging', '...', true);
    }

    clearDirectingText() {
        this.setBoxText('directing', '...', true);
    }
    
    // Helper to update box background with new height
    updateBoxBackground(bg, color, height) {
        bg.clear()
            .fillStyle(color, 0.9)
            .fillRoundedRect(
                -this.baseBoxWidth/2, 
                -height/2 + 10, 
                this.baseBoxWidth, 
                height, 
                10
            )
            .lineStyle(2, 0xffffff, 0.5)
            .strokeRoundedRect(
                -this.baseBoxWidth/2, 
                -height/2 + 10, 
                this.baseBoxWidth, 
                height, 
                10
            );
    }

    // Calculate required height based on text content
    calculateRequiredHeight(text, boxType) {
        const content = this.uiElements[`${boxType}Content`];
        if (!content) return this.baseBoxHeight;
        
        // Temporarily set the text to measure
        const tempText = this.scene.add.text(0, 0, text, content.style);
        tempText.setWordWrapWidth(this.baseBoxWidth - 20);
        const textHeight = tempText.getBounds().height;
        tempText.destroy();
        
        // Minimum height is base height, add extra for text overflow
        return Math.max(this.baseBoxHeight, textHeight + 40); // 40px padding for title and margins
    }

    // Updated setBoxText with dynamic height adjustment
    setBoxText(boxType, text, instant = false) {
        const contentElement = this.uiElements[`${boxType}Content`];
        const bgElement = this.uiElements[`${boxType}Bg`];
        const titleElement = this.uiElements[`${boxType}Title`];
        
        if (!contentElement || !bgElement) return;
        
        // Calculate required height
        const requiredHeight = this.calculateRequiredHeight(text, boxType);
        
        // Update background height
        this.updateBoxBackground(bgElement, 
            boxType === 'processing' ? 0x334477 : 
            boxType === 'engaging' ? 0x447744 : 0x774434, 
            requiredHeight);
        
        // Reposition title and content
        titleElement.y = -requiredHeight/2 + 10;
        contentElement.y = -requiredHeight/2 + 30;
        
        if (instant) {
            this.currentTexts[boxType] = text;
            contentElement.setText(text);
            this.isTyping[boxType] = false;
        } else {
            this.textQueues[boxType].push(text);
            if (!this.isTyping[boxType]) {
                this.processTextQueue(boxType);
            }
        }
    }

    // Updated processTextQueue with height adjustment
    processTextQueue(boxType) {
        if (this.textQueues[boxType].length === 0) {
            this.isTyping[boxType] = false;
            return;
        }

        const nextText = this.textQueues[boxType].shift();
        const requiredHeight = this.calculateRequiredHeight(nextText, boxType);
        this.adjustBoxHeight(boxType, requiredHeight);
        
        this.isTyping[boxType] = true;
        this.currentTexts[boxType] = '';
        this.uiElements[`${boxType}Content`].setText('');

        const chars = nextText.split('');
        let i = 0;
        
        const typeNextChar = () => {
            if (i < chars.length) {
                this.currentTexts[boxType] += chars[i];
                this.uiElements[`${boxType}Content`].setText(this.currentTexts[boxType]);
                i++;
                this.scene.time.delayedCall(30, typeNextChar);
            } else {
                this.isTyping[boxType] = false;
                this.processTextQueue(boxType);
            }
        };

        typeNextChar();
    }

    // Helper to adjust box height and reposition elements
    adjustBoxHeight(boxType, newHeight) {
        const bg = this.uiElements[`${boxType}Bg`];
        const content = this.uiElements[`${boxType}Content`];
        const title = this.uiElements[`${boxType}Title`];
        
        if (!bg || !content || !title) return;
        
        this.updateBoxBackground(bg, 
            boxType === 'processing' ? 0x334477 : 
            boxType === 'engaging' ? 0x447744 : 0x774434, 
            newHeight);
        
        title.y = -newHeight/2 + 10;
        content.y = -newHeight/2 + 30;
    }
}