import { Scene } from 'phaser';


export class Story extends Scene
{
    constructor () {
        super('Story');
    }

    preload () {
        this.load.image('logo-inverted', 'assets/hms-yb2025-intro-inverted.jpg');         
    }

    create () {
        // Set the background color to black
        this.cameras.main.setBackgroundColor(0x000000);
        const bgIamge = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'logo-inverted'
        ).setOrigin(0.5, 0.5);
        // fade bgIamge out
        this.tweens.add({
            targets: bgIamge,
            alpha: 0.25,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                // after the fade out, destroy the image
                // bgIamge.destroy();
            }
        });
        
        // width of the screen
        const screenWidth = this.cameras.main.width;
        // height of the screen 
        const screenHeight = this.cameras.main.height;
        
        this.msgText = this.add.text(0, screenHeight / 2, '', {
            fontSize: 38, color: '#00ff00',
            stroke: '#000000', strokeThickness: 8,
            align: 'left', width: screenWidth - 20,
            wordWrap: { width: screenWidth - 20, useAdvancedWrap: true }
        }).setOrigin(0, 0);
        
        this.msgText.setPosition(10, screenHeight / 2 - this.msgText.height / 2);
        
        let text = 'The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents. We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far. The sciences, each straining in its own direction, have hitherto harmed us little; but some day the piecing together of dissociated knowledge will open up such terrifying vistas of reality, and of our frightful position therein, that we shall either go mad from the revelation or flee from the deadly light into the peace and safety of a new dark age.';

        // phaser timer loop
        this.typingTimer = this.time.addEvent({
            delay: 10, // 1 second
            callback: () => {
                console.log('Timer event triggered');
                // pop the first letter from the text
                if (text.length > 0) {
                    this.msgText.text += text.charAt(0);
                    this.msgText.setPosition(0, screenHeight / 2 - this.msgText.height / 2);
                    text = text.slice(1);
                } else {
                    // Stop the timer when the text is fully displayed
                    this.typingTimer.remove();
                }
                // You can add more logic here if needed
            },
            loop: true // Set to true if you want it to repeat
        });

        // add green button with the text "Save The Yearbook!"
        // make the button have a green background with black text
        const buttonY = screenHeight - 200;
        const buttonBackground = this.add.rectangle(screenWidth / 2, buttonY, 
            400, 80, 0x00ff00)
            .setOrigin(0.5)
            .setInteractive();
        //buttonBackground.setStrokeStyle(4, 0x000000);
        buttonBackground.on('pointerover', () => {
            buttonBackground.setFillStyle(0x00cc00); // Darker green on hover
        });
        buttonBackground.on('pointerout', () => {
            buttonBackground.setFillStyle(0x00ff00); // Original green on hover out
        });
        // add text to the button
        const buttonText = this.add.text(screenWidth / 2, buttonY, 'Skip Intro', {
            fontSize: 32, color: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        // make the button interactive
        buttonBackground.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        buttonText.alpha = 0; // Start invisible

        // Fade in button and text together
        this.tweens.add({
            targets: [buttonBackground, buttonText],
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });
    }

    
    
}
