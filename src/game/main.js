import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Maploader } from './scenes/Maploader';
import { Preloader } from './scenes/Preloader';

import Phaser from 'phaser';



// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#028af8',
    pixelArt: true,
    scale: {zoom: 0.95},
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

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
