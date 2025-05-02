import { Scene } from 'phaser';

export class GameAurora extends Scene
{
    constructor () {
        super('GameAurora');
    }

    create () {

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.cameras.main.setBackgroundColor(0x00ff00);

        // this.add.image(0, 0, 'background').setAlpha(0.5);

        this.add.text(centerX, centerY, 'Aurora', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }
}
