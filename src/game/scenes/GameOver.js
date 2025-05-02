import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor () {
        super('GameOver');
    }

    create () {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(this.cameras.main.width, this.cameras.main.height, 'background').setAlpha(1);

        this.add.text(centerX, centerY, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
