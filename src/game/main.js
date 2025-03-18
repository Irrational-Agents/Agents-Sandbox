import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Maploader } from './scenes/Maploader';
import { Preloader } from './scenes/Preloader';
import Phaser from 'phaser';

/**
 * Configuration for the Phaser game instance.
 * 
 * This configuration includes settings for the game type, dimensions, physics, scenes, and other core parameters.
 * The game will be rendered inside the element with the ID `game-container`.
 * 
 * @constant {Object} config - The configuration object for the Phaser game.
 * @property {number} width - The width of the game canvas.
 * @property {number} height - The height of the game canvas.
 * @property {string} parent - The ID of the DOM element to render the game into.
 * @property {string} backgroundColor - The background color of the game canvas.
 * @property {boolean} pixelArt - Whether pixel art rendering is enabled.
 * @property {Object} scale - The scale settings, including the zoom level.
 * @property {Object} physics - The physics settings, including gravity for the arcade physics system.
 * @property {Array} scene - An array of scenes to load and transition between in the game.
 */
const config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#028af8',
    pixelArt: true,
    scale: { zoom: 0.95 },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Maploader,
        Game
    ]
};

/**
 * Starts a new Phaser game instance with the given parent DOM element.
 * 
 * This function initializes the Phaser game using the provided configuration and assigns it to the specified parent element.
 * The parent element is passed as an argument to ensure that the game is rendered within the correct DOM container.
 * 
 * @function
 * @param {string} parent - The ID of the DOM element to render the Phaser game into.
 * @returns {Phaser.Game} The Phaser game instance.
 */
const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
