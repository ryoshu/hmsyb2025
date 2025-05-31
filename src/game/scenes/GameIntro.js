import { Scene } from 'phaser';

export class GameIntro extends Scene
{
    constructor () {
        super({ key : 'GameIntro' });
    }

    preload() {
        this.load.image('logo', 'assets/hms-yb2025-intro.jpg'); 
        this.load.image('logo-inverted', 'assets/hms-yb2025-intro-inverted.jpg'); 
        this.load.image('logo-distorted', 'assets/hms-yb2025-intro-distorted.jpg'); 
        this.load.image('logo-inverted-distorted', 'assets/hms-yb2025-intro-inverted-distorted.jpg'); 
        this.load.glsl('hsl', 'assets/shaders/hsl.frag');
    }

    create () {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.anims.create({
            key: 'distort',
            frames: [
                { key: 'logo' },
                { key: 'logo-inverted' },
                { key: 'logo-distorted' },
                { key: 'logo-inverted-distorted' },
                { key: 'logo' },
                { key: 'logo-inverted' },
                { key: 'logo-distorted' },
                { key: 'logo-inverted-distorted' },
                { key: 'logo' },
                { key: 'logo-inverted' },
            ],
            frameRate: 24,
            repeat: 1
        });

        /*const logoImg =  this.add.image(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'logo'
        );*/
        /*
        const shader = this.add.shader({
            name: 'hsl',
            fragmentKey: 'hsl',
            setupUniforms: (setUniform, drawingContext) =>
            {
                setUniform('time', this.game.loop.getDuration());
            },
        }, 400, 300, this.scale.width, this.scale.width);
        
        this.add.image(400, 300, 'logo');

        */
        const logoSprite = this.add.sprite(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'logo'
        )
        
        this.time.delayedCall(1000, () => {
            logoSprite.play('distort');
        });

        this.cameras.main.setBackgroundColor(0xffffff);

        //this.add.image(this.cameras.main.width / 2, this.cameras.main.height /2, 'logo').setAlpha(1);
    }
}
