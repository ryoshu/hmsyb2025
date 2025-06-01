import { Scene } from 'phaser';

export class GameWin extends Scene
{
    constructor ()
    {
        super('GameWin');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x00ff00);

        const storyline = "And with that, the virus was defeated. The yearbook freed from its evil grasp, thus concluding our story. The classrooms showed all their appreciation and gratitude, and the day, was saved.";

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            //this.scene.start('');

        });
    }

    
}
