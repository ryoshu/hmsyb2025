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

        this.add.image(512, 384, 'background').setAlpha(0.5);

        const storylineText = `
And with that, the virus was defeated. 
The yearbook freed from its evil grasp,
thus concluding our story. 
The classrooms showed all their appreciation and gratitude,
and the day was saved.
        `;

        const textObject = this.add.text(512, 2000, storylineText, {
            fontFamily: 'Arial Black',
            fontSize: 58,
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Tween to scroll the text upward
        this.tweens.add({
            targets: textObject,
            y: -500,
            duration: 30000, // 30 seconds to scroll
            ease: 'Linear',
            onComplete: () => {
                this.add.text(512, 500, 'Tap to continue...', {
                    fontSize: 32,
                    color: '#fff'
                }).setOrigin(0.5);
            }
        });

        // Proceed on tap/click after scroll completes
        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu'); // Replace with your actual next scene key
        });
    }
}
