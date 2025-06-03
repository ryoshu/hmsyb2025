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
        
        let text = 'It was the day of the yearbook launch but then . . . An evil virus attacked. It took control of the yearbook, with the ability to delete the entire book. And now it’s time for you to help stop the virus. ';

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

                    // add green button with the text "Save The Yearbook!"
                    // make the button have a green background with black text
                    const buttonY = this.msgText.y + this.msgText.height + 100;
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
                    this.add.text(screenWidth / 2, buttonY, 'Save The Yearbook!', {
                        fontSize: 32, color: '#000000',
                        align: 'center'
                    }).setOrigin(0.5);
                    // make the button interactive
                    buttonBackground.on('pointerdown', () => {
                        this.scene.start('MainMenu');
                    });
                }
                // You can add more logic here if needed
            },
            loop: true // Set to true if you want it to repeat
        });
    }

    
    
}
