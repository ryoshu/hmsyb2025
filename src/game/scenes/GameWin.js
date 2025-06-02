import { Scene } from 'phaser';
import { PerspectivePipeline } from '../pipelines/PerspectivePipeline';

export class GameWin extends Scene
{
    constructor ()
    {
        super('GameWin');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x000000);

        // this.add.image(512, 384, 'background').setAlpha(0.5);

        const storylineText = `
And with that, the virus was defeated. 
The yearbook freed from its evil grasp,
thus concluding our story. 
The classrooms showed all their appreciation and gratitude,
and the day was saved.
        `;

        const textObject = this.add.text(0, 0, storylineText, {
            fontSize: 58,
            color: '#00ff00',
            align: 'center',
            wordWrap: { width: 1000 },
            lineSpacing: 20,
        }).setOrigin(0.5);
        
        //textObject.setScale(1, 0.9); // Wider and squished vertically
        //textObject.setAngle(-20);      // Tilt backwards

        // Center the message text
        Phaser.Display.Align.In.Center(
            textObject,
            this.add.zone(
                this.cameras.main.width / 2,
                this.cameras.main.height + textObject.height / 2 - 100,
                this.cameras.main.width,
                this.cameras.main.height
            )
        );

        // Tween to scroll the text upward and shrink it for perspective
        this.tweens.add({
            targets: textObject,
            y: -500,
            scaleX: 0.5,
            scaleY: 0.1,
            duration: 20000, // 30 seconds to scroll
            ease: 'Linear',
            onComplete: () => {
                this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Tap to continue...', {
                    fontSize: 32,
                    color: '#fff'
                }).setOrigin(0.5);
            }
        });
        textObject.setPipeline('perspective');

        // Proceed on tap/click after scroll completes
        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu'); // Replace with your actual next scene key
        });
    }
}
