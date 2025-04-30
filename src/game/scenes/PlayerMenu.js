import { Scene } from 'phaser';

/**
 * The PlayerMenu scene handles setting NPC config.
 * 
 * @extends Phaser.Scene
 */
export class PlayerMenu extends Scene {
    constructor() {
        super('PlayerMenu');
        this.currentSprite = null;
        this.npcs = {};
        this.player = null;
        this.npcTextElements = {};
    }

    create() {
        const sim_config = this.scene.settings.data.sim_config;
        const spawn = this.cache.json.get('spawn');

        this.add.text(100, 100 , 'NPC Config', {
            fontSize: '38px',
            fontStyle: 'bold'
        });

        this.createMenu(sim_config, spawn);

        if (sim_config['player_enabled']) {
            this.setupPlayer(sim_config, spawn);
        }
        
        this.createPlayButton();
    }

    createMenu(sim_config, spawn) {
        const chars = [...sim_config['npc_names']];

        this.npcs = sim_config['npcs'];

        let yOffset = 100;

        this.add.graphics()
            .fillStyle(0x000000, 0.6)
            .fillRoundedRect(380, 40, 380, 750, 10);

        this.npcDetailsText = this.add.text(400, 50, '', {
            fontSize: '18px',
            fill: '#ffffff',
            wordWrap: { width: 350, useAdvancedWrap: true }
        });

        this.add.graphics()
            .fillStyle(0x000000, 0.6)
            .fillRoundedRect(800, 40, 360, 750, 10);

        this.npcStatsInfo = this.add.text(820, 50, '', {
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: 350, useAdvancedWrap: true }
        });

        this.add.graphics()
            .fillStyle(0x000000, 0.6)
            .fillRoundedRect(1200, 350, 280, 180, 10);

        this.npcSpawnInfo = this.add.text(1210, 380, '', {
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: 250, useAdvancedWrap: true }
        });

        Object.values(this.npcs).forEach((npc, index) => {
            npc['current_location'] = spawn[npc['spawn']];
            npc['current_status'] = npc['current_status'] || {};
            npc["current_status"]['emoji'] = "💤";

            let text = this.add.text(100, yOffset + 100 + index * 50, `NPC-${index}`, {
                fontSize: '38px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { left: 20, right: 20, top: 5, bottom: 5 }
            }).setInteractive({ useHandCursor: true });

            text.on('pointerdown', () => {
                this.showNpcDetails(npc);
            });

            this.npcTextElements[npc.name] = text;
        });

        const firstNpcKey = Object.keys(this.npcs)[0];
        if (firstNpcKey) {
            this.showNpcDetails(this.npcs[firstNpcKey]);
        }
    }

    /**
     * Sets up the player character, adds it to the menu, and handles selection.
     */
    setupPlayer(sim_config, spawn) {
        const playerName = sim_config['player_name'];
        if (!playerName) return;

        this.player = sim_config['npcs'].find(npc => npc.name === playerName);
        if (!this.player) return;

        this.player['current_location'] = spawn[this.player['spawn']];
        this.player['current_status'] = this.player['current_status'] || {};
        this.player["current_status"]['emoji'] = "💤";

        let text = this.add.text(100, 150, "Player", {
            fontSize: '38px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { left: 8, right: 8, top: 5, bottom: 5 }
        }).setInteractive({ useHandCursor: true });

        text.on('pointerdown', () => {
            this.showNpcDetails(this.player);

            this.npcTextElements[this.player.name] = text;
        });
    }

    showNpcDetails(npc) {
        if (this.currentSprite) {
            this.currentSprite.destroy();
        }

        // Remove highlight from the previously selected NPC
        if (this.selectedNpcText) {
            this.selectedNpcText.setStyle({ backgroundColor: '#000000' });
        }

        // Highlight the newly selected NPC
        this.selectedNpcText = this.npcTextElements[npc.name];
        if (this.selectedNpcText) {
            this.selectedNpcText.setStyle({ backgroundColor: '#4444ff' }); // Blue highlight
        }

        const description = this.trimText(npc.description.join(' '), 1000);
        this.npcDetailsText.setText(`Name: ${npc.name} \nBirthday: ${npc.birthday}\n\nDescription: ${description}`);

        const personalityTraits = `
            Personality Traits:
            Openness: ${npc.personality_traits.openness}
            Conscientiousness: ${npc.personality_traits.conscientiousness}
            Extraversion: ${npc.personality_traits.extraversion}
            Agreeableness: ${npc.personality_traits.agreeableness}
            Neuroticism: ${npc.personality_traits.neuroticism}
        `;

        const skills = npc.skills.map(skill => `${skill.skill}: Level ${skill.level}`).join('\n');

        const goals = npc.goals.map(goal => {
            const longTerm = goal.long_term ? `Long-Term Goal: ${goal.long_term}` : '';
            const midTerm = goal.mid_term ? `Mid-Term Goal(s): \n${goal.mid_term.map(item => `- ${item.description} (Deadline: ${item.deadline})`).join('\n')}` : '';
            return `${longTerm}\n${midTerm}`;
        }).join('\n');

        const relationships = Object.keys(npc.social_relationships).map(key => {
            const relationship = npc.social_relationships[key];
            return `${key}: ${relationship.relationship} (Closeness: ${relationship.closeness})`;
        }).join('\n');

        this.npcStatsInfo.setText(`
            ${personalityTraits}\n\n
            Skills:\n${this.trimText(skills, 250)}\n\n
            Goals:\n${this.trimText(goals, 250)}\n\n
            Relationships:\n${this.trimText(relationships, 250)}
        `);

        const spawn = npc['spawn'];
        const character = npc['character'];

        this.npcSpawnInfo.setText(`Spawn Location: ${spawn}\n\nNPC Character: ${character}`);

        this.currentSprite = this.add.sprite(1300, 200, character, "down").setScale(9);
    }

    createPlayButton() {
        this.scene.settings.data.sim_config['npcs'] = this.npcs;
        this.scene.settings.data.sim_config['player'] = this.player;
        const playButton = this.add.text(1250, 650, 'Play', {
            fontSize: '48px',
            fill: '#ffffff',
            backgroundColor: '#ffcc00',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setInteractive({ useHandCursor: true });

        playButton.on('pointerover', () => {
            playButton.setStyle({ fill: '#ff0000', backgroundColor: '#ffff00' });
        });
        playButton.on('pointerout', () => {
            playButton.setStyle({ fill: '#ffffff', backgroundColor: '#ffcc00' });
        });

        playButton.on('pointerdown', () => {
            this.scene.settings.data.sim_config['npcs'] = this.npcs;
            this.scene.settings.data.sim_config['player'] = this.player
            this.scene.start('Game', { ...this.scene.settings.data });
        });
    }

    trimText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }
}
