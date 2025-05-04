import { Boot } from './scenes/Boot';
// import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

import { GAMES } from './Settings';

console.log(GAMES)


// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    //width: 1024,
    //height: 768,
    parent: 'game-container',
    // backgroundColor: '#028af8',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1080,
        height: 1920,
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        // MainGame,
        GameOver
    ].concat(GAMES),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    }
};

const StartGame = (parent) => {
    const game = new Game({ ...config, parent });
    console.log(game.canvas)
    return game;
}

export default StartGame;
