import { Scene } from 'phaser';

export class MainMenu extends Scene
{

    constructor () {
        super('MainMenu');
    }

    preload () {
        this.load.image('GameRosyRed_icon', 'assets/classroom_icons/RosyRed.png');
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
        this.load.image('GameMiddleSchool_icon', 'assets/middle_school_disabled.png');
        this.load.image('GameMiddleSchoolEnabled_icon', 'assets/middle_school.png');

        // Load playedGames from localStorage if available
        const savedPlayedGames = localStorage.getItem('playedGames');
        if (savedPlayedGames) {
            this.registry.set('playedGames', JSON.parse(savedPlayedGames));
        }
    }


    create () {

        // Track played games in registry
        if (!this.registry.has('playedGames')) {
            this.registry.set('playedGames', {});
        }
        let playedGames = this.registry.get('playedGames');

        const prevScene = this.registry.get('gameScene');
        if (prevScene && prevScene.startsWith('Game')) {
            playedGames[prevScene] = true;
            this.registry.set('playedGames', playedGames);
            // Save to localStorage
            localStorage.setItem('playedGames', JSON.stringify(playedGames));
        }
        console.log(`Previous scene: ${prevScene}`);
        // Add black background
        this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000).setOrigin(0, 0);

        // Create star background
        const starGraphics = this.add.graphics();
        starGraphics.fillStyle(0xFFFFFF);
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * this.scale.width;
            const y = Math.random() * this.scale.height;
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.8 + 0.2;
            starGraphics.fillStyle(0xFFFFFF, alpha);
            starGraphics.fillCircle(x, y, size);
        }
        starGraphics.generateTexture('stars', this.scale.width, this.scale.height);
        //starGraphics.destroy();

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
        
        GAMES.reverse(); // Reverse the order of games

        let sceneKeys = this.scene.manager.keys;
        console.log(sceneKeys); 

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        console.log(`${centerX}, ${centerY}`)
        
        this.canvasWidth = this.sys.game.config.width;
        this.canvasHeight = this.sys.game.config.height;

        const iconCoordinates = [
            {x : centerX + 150, y: this.canvasHeight - 150, scale: 1.15}, // GameRosyRed
            {x : centerX - 150,  y: this.canvasHeight - 150, scale: 1.15}, // GameOrangeBlossom 
            {x : centerX + 250, y: this.canvasHeight - 450, scale: .75}, // GameSunnyYellow
            {x : centerX, y: this.canvasHeight - 400, scale: .5}, // GameCelestialBlue
            {x : centerX - 250, y: this.canvasHeight - 450, scale: .75}, // GameHarmoniousOrange
            {x : centerX + 275, y: this.canvasHeight - 700, scale: .5}, // GamePeacefulIvory
            {x : centerX, y: this.canvasHeight - 650, scale: .75}, // GameSereneIndigo
            {x : centerX - 275, y: this.canvasHeight - 700, scale: .5}, // GameOceanBlue
            {x : centerX + 300, y: this.canvasHeight - 950, scale: .75}, // GameAurora
            {x : centerX, y: this.canvasHeight - 900, scale: .75}, // GameConstellation
            {x : centerX - 300, y: this.canvasHeight - 950, scale: .75}, // GameGalaxy
            {x : centerX, y: this.canvasHeight - 1150, scale: .75}, // GameComet
            {x : centerX, y: this.canvasHeight - 1650, scale: 1}, // GameMiddleSchool
        ]

        iconCoordinates.reverse(); // Reverse the coordinates to match the reversed game order

        const baseY = 200;

        for(let i = 0; i < GAMES.length; ++i) { 
            let x = centerX;
            let y = baseY + (100 * i);

            const playedGamesCount = Object.keys(playedGames).length;
            console.log(`games played: ${playedGamesCount}`);
            /*
            console.log("debug: " + i + ">" + Math.floor(GAMES.length * .5));
            console.log(Object.getOwnPropertyNames(GAMES[i]));
            console.log(GAMES[i])
            
            if(i > Math.floor(GAMES.length * .5)) {
                x = centerX + 50;
                y = baseY + (100 * (i % Math.floor(GAMES.length * .5)));
            }
            */
            
            const classContainer = this.add.container(iconCoordinates[i].x, iconCoordinates[i].y);
            const iconKey = GAMES[i] + '_icon';
            
            if (!this.textures.exists(iconKey)) {
                console.warn(`Icon for ${GAMES[i]} not found: ${iconKey}`);
                continue; // Skip if icon does not exist
            }

            if(i > 0) {
                // edge cases
                let circleBgColor = 0xffffff; // Default to white
                let circleStrokeColor = 0x000000; // Default to black

                if(i === 5 || i === 9) {
                    circleBgColor = 0x000000;
                    circleStrokeColor = 0xffffff;
                }

                // Create a white circle with a black 2px stroke
                const circleBg = this.add.graphics();
                if (playedGames[GAMES[i]]) {
                    circleBg.lineStyle(30, 0xffd800, 1); // Green stroke, 20px
                } else {
                    circleBg.lineStyle(20, circleStrokeColor, 1); // Black stroke, 20px
                }
                
                circleBg.fillStyle(circleBgColor, 1);    // White fill
                circleBg.strokeCircle(0, 0, 100);   // Draw stroke
                circleBg.fillCircle(0, 0, 100);     // Draw fill

                classContainer.add(circleBg);
            }

            let classIcon = null;
            if(i === 0 && playedGamesCount >= 12) {
                // handle case where GameMiddleSchool is enabled
                classIcon = this.add.image(0, 0, `GameMiddleSchoolEnabled_icon`).setScale(iconCoordinates[i].scale);
            } else {
                classIcon = this.add.image(0, 0, `${GAMES[i]}_icon`).setScale(iconCoordinates[i].scale);
            }


            
            classContainer.add(classIcon);

            /*
            const gameButton = this.add.text(x, y, GAMES[i], { 
                fill: '#0f0',
                fontSize: 38
            });
            classContainer.add(gameButton);
            */
            
            if(i > 0 || playedGamesCount >= 12) {
                classIcon.setInteractive();
                classIcon.on('pointerdown', () => { 
                    this.registry.set('gameScene', GAMES[i]); // Store current scene
                    this.scene.start(GAMES[i]); 
                });
            }
        }
        
        console.log(this.textures);

        // Log active scenes
        const activeScenes = [];
        for (const key in this.scene.manager.keys) {
            const scene = this.scene.manager.keys[key];
            if (scene.scene && scene.scene.isActive()) {
                activeScenes.push(key);
                console.log(`Active scene: ${key}`);
            }
        }
        console.log('Active scenes:', activeScenes);

        // this.add.image(512, 384, 'background');

        // this.add.image(512, 300, 'logo');

        const hmsLockup = this.add.text(centerX, 100, 'Save The Yearbook!', {
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
