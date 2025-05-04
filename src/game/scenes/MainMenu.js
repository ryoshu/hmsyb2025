import { Scene } from 'phaser';
import { GAMES } from '../Settings';

export class MainMenu extends Scene
{
    constructor () {
        super('MainMenu');
    }

    create () {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        console.log(`${centerX}, ${centerY}`)

        const baseY = 200;

        for(let i = 0; i < GAMES.length; ++i) { 
            let x = centerX - 500;
            let y = baseY + (100 * i);

            console.log(i + ">" + Math.floor(GAMES.length * .5));
            if(i > Math.floor(GAMES.length * .5)) {
                x = centerX + 50;
                y = baseY + (100 * (i % Math.floor(GAMES.length * .5)));
            }
            const gameButton = this.add.text(x, y, GAMES[i].name, { 
                fill: '#0f0',
                fontFamily: 'Arial Black', 
                fontSize: 38
            });
            gameButton.setInteractive();
            gameButton.on('pointerdown', () => { 
                this.scene.start(GAMES[i].name); 
            });   
        }
        
        // this.add.image(512, 384, 'background');

        // this.add.image(512, 300, 'logo');

        const hmsLockup = this.add.text(centerX, 100, 'Hudson Montessori\nYearbook Game 2025', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        console.log(hmsLockup);

        this.scale.on('resize', this.resizeGame, this);
    }

    resizeGame(gameSize, baseSize, displaySize, resolution) {
        console.log(this);
        const width = gameSize.width;
        const height = gameSize.height;

        console.log(`resizeGaem: ${width}, ${height}`)
    }
}
