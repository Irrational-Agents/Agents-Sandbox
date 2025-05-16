// ui/UIConfig.js
export const UI_CONFIG = {
    OVERLAY: {
        PANEL: {
            WIDTH_RATIO: 1.0,
            HEIGHT: 120,
            ALPHA: 0.85,
            Y_POSITION: 40
        },
        TEXT: {
            OFFSET_X: 0.9,
            FONT_SIZE: '48px',
            COLOR: '#ffffff'
        },
        CLOCK: {
            OFFSET_X: 0.1,
            FONT_SIZE: '24px',
            COLOR: '#ffffff',
            STYLE: 'bold'
        },
        BUTTONS: {
            RESTART: {
                OFFSET_X: 0.8,
                FONT_SIZE: '20px',
                COLOR: '#ff0000',
                BG_COLOR: '#ffffff',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            CAMERA: {
                OFFSET_X: 0.6,
                FONT_SIZE: '20px',
                COLOR: '#ffffff',
                BG_COLOR: '#0000ff',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            NPC_STATUS: {
                OFFSET_X: 0.38,
                FONT_SIZE: '20px',
                COLOR: '#ff0000',
                BG_COLOR: '#ffcc00',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            },
            LLM_LOGS: {
                OFFSET_X: 0.18,
                FONT_SIZE: '20px',
                COLOR: '#ffffff',
                BG_COLOR: '#ff0000',
                PADDING: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        }
    },
    BOTTOM_UI: {
        Y_POSITION_RATIO: 0.925,
        WIDTH_RATIO: 0.9,
        HEIGHT: 100,
        BORDER_THICKNESS: 4,
        BORDER_COLOR: 0xffffff,
        PANEL_COLOR: 0x000000,
        PANEL_ALPHA: 0.85,
        CHARACTER: {
            X_OFFSET: -0.5,
            Y_OFFSET: 0,
            SCALE: 3,
            SPRITE_OFFSET: 50,
            NAME_OFFSET: 100,
            STATUS_OFFSET: 120,
            NAME_FONT: '24px',
            STATUS_FONT: '24px',
            COLOR: '#ffffff',
            STYLE: 'bold'
        },
        THINKING: {
            WIDTH: 800,
            HEIGHT: 100,
            OFFSET: 100,
            FONT_SIZE: '16px',
            COLOR: '#ffffff',
            STYLE: 'italic'
        }
    },
    NPC_STATS: {
        WIDTH_RATIO: 0.8,
        HEIGHT_RATIO: 0.7,
        PANEL_COLOR: 0x000039,
        PANEL_ALPHA: 0.7,
        BORDER_COLOR: 0xffffff,
        BORDER_THICKNESS: 3,
        TITLE: {
            TEXT: "NPC Stats",
            FONT_SIZE: '32px',
            COLOR: '#ffffff',
            OFFSET_Y: 20
        },
        STATS: {
            FONT_SIZE: '20px',
            COLOR: '#ffffff',
            LINE_HEIGHT: 30,
            OFFSET_X: 20,
            OFFSET_Y: -500,
            PROPERTY_WIDTH: 150
        }
    }
};