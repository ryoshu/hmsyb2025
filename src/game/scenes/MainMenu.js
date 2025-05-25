import { Scene } from 'phaser';

export class MainMenu extends Scene
{

    constructor () {
        super('MainMenu');
    }

    create () {

        const GAMES = [
            'GameRosyRed',
            'GameOrangeBlossom',
            'GameSunnyYellow',
            'GameCelestialBlue',
            'GameHarmoniousOrange',
            'GamePeacefulIvory',
            'GameSereneIndigo',
            'GameOceanBlue',
            'GameAurora',
            'GameConstellation',
            'GameGalaxy',
            'GameComet',
            'GameMiddleSchool',
        ];

        let sceneKeys = this.scene.manager.keys;
        console.log(sceneKeys); 

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        console.log(`${centerX}, ${centerY}`)

        const baseY = 200;

        for(let i = 0; i < GAMES.length; ++i) { 
            let x = centerX - 500;
            let y = baseY + (100 * i);

            console.log("debug: " + i + ">" + Math.floor(GAMES.length * .5));
            console.log(Object.getOwnPropertyNames(GAMES[i]));
            console.log(GAMES[i])
            
            if(i > Math.floor(GAMES.length * .5)) {
                x = centerX + 50;
                y = baseY + (100 * (i % Math.floor(GAMES.length * .5)));
            }
            const gameButton = this.add.text(x, y, GAMES[i], { 
                fill: '#0f0',
                fontSize: 38
            });
            gameButton.setInteractive();
            gameButton.on('pointerdown', () => { 
                this.scene.start(GAMES[i]); 
            });
        }
        
        // this.add.image(512, 384, 'background');

        // this.add.image(512, 300, 'logo');

        const hmsLockup = this.add.text(centerX, 100, 'Hudson Montessori\nYearbook Game 2025', {
            fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.scale.on('resize', this.resizeGame, this);
    }

    resizeGame(gameSize, baseSize, displaySize, resolution) {
        console.log(this);
        const width = gameSize.width;
        const height = gameSize.height;

        console.log(`resizeGaem: ${width}, ${height}`)
    }
}
