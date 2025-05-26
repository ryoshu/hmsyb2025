import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        const logo = this.load.image('logo', 'assets/HM-New-Logo.jpg');
        // Center the message text on the screen
        Phaser.Display.Align.In.Center(
          logo,
          this.add.zone(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height
          )
        );
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
