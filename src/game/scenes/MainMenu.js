import { Scene } from 'phaser';

export class MainMenu extends Scene
{

    constructor () {
        super('MainMenu');
    }

    preload () {
        this.load.image('GameRosyRed_icon', 'assets/classroom_icons/Aurora.png');
        this.load.image('GameOrangeBlossom_icon', 'assets/classroom_icons/OrangeBlossom.png');
        this.load.image('GameSunnyYellow_icon', 'assets/classroom_icons/SunnyYellow.png');
        this.load.image('GameCelestialBlue_icon', 'assets/classroom_icons/CelestialBlue.png');
        this.load.image('GameHarmoniousOrange_icon', 'assets/classroom_icons/HarmoniousOrange.png');
        this.load.image('GamePeacefulIvory_icon', 'assets/classroom_icons/PeacefulIvory.png');
        this.load.image('GameSereneIndigo_icon', 'assets/classroom_icons/SereneIndigo.png');
        this.load.image('GameOceanBlue_icon', 'assets/classroom_icons/OceanBlue.png');
        this.load.image('GameAurora_icon', 'assets/classroom_icons/Aurora.png');
        this.load.image('GameConstellation_icon', 'assets/classroom_icons/Constellation.png');
        this.load.image('GameGalaxy_icon', 'assets/classroom_icons/Galaxy.png');
        this.load.image('GameComet_icon', 'assets/classroom_icons/Comet.png');
        this.load.image('GameMiddleSchool_icon', 'assets/classroom_icons/MiddleSchool.png');
    }


    create () {
        // Add black background
        this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000).setOrigin(0, 0);

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

        GAMES.reverse();

        let sceneKeys = this.scene.manager.keys;
        console.log(sceneKeys); 

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        console.log(`${centerX}, ${centerY}`)

        const baseY = 200;

        for(let i = 0; i < GAMES.length; ++i) { 
            let x = centerX;
            let y = baseY + (200 * i);


            console.log("debug: " + i + ">" + Math.floor(GAMES.length * .5));
            console.log(Object.getOwnPropertyNames(GAMES[i]));
            console.log(GAMES[i])
            
            /*
            if(i > Math.floor(GAMES.length * .5)) {
                x = centerX + 50;
                y = baseY + (100 * (i % Math.floor(GAMES.length * .5)));
            }
            */
            const classContainer = this.add.container(x, y);
            const iconKey = GAMES[i] + '_icon';
            
            if (!this.textures.exists(iconKey)) {
                console.warn(`Icon for ${GAMES[i]} not found: ${iconKey}`);
                continue; // Skip if icon does not exist
            }
            

            const classIcon = this.add.image(0, 0, `${GAMES[i]}_icon`);
            classContainer.add(classIcon);
            
            /*
            const gameButton = this.add.text(x, y, GAMES[i], { 
                fill: '#0f0',
                fontSize: 38
            });
            classContainer.add(gameButton);
            */
            classIcon.setInteractive();
            classIcon.on('pointerdown', () => { 
                this.scene.start(GAMES[i]); 
            });
        }
        
        console.log(this.textures);

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
