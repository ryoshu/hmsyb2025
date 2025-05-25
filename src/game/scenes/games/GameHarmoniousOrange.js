import Phaser from 'phaser';

export class GameHarmoniousOrange extends Phaser.Scene {
    constructor() {
        super({ key: 'GameHarmoniousOrange' });
    }

    preload() {
        // No assets to preload
    }

    create() {
        this.geyserHeight = 0;
        this.maxHeight = 400;
        this.winTimer = 0;
        this.winTime = 10000;
        this.gameActive = true;

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Set up the container
        this.geyserContainer = this.add.graphics();
        this.geyserContainer.lineStyle(4, 0x4682b4);
        this.geyserContainer.fillStyle(0x87ceeb);
        this.geyserContainer.fillRect(centerX - 200, centerY - 600, 400, 800);
        this.geyserContainer.strokeRect(centerX - 200, centerY - 600, 400, 800);

        // Set up the geyser
        this.geyser = this.add.graphics();
        this.updateGeyser();

        // Set up the button background
        const buttonWidth = 400; // Default width for the button
        const buttonHeight = 50;
        const buttonBg = this.add.rectangle(centerX, centerY + 250, buttonWidth, buttonHeight, 0xff6347);
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.on('pointerdown', this.lowerGeyser, this);

        // Set up the button text
        const buttonText = this.add.text(centerX, centerY + 250, 'Click to Lower the Geyser', {
            font: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Ensure the text is rendered above the button background
        buttonText.setDepth(1);

        // Set up the timer text
        this.timerText = this.add.text(centerX, centerY + 320, 'Time Left: 10.0s', {
            font: '20px',
            fill: '#333333'
        }).setOrigin(0.5);

        // Set up the message text
        this.messageText = this.add.text(centerX, centerY + 350, '', {
            font: '24px',
            fill: '#ff6347'
        }).setOrigin(0.5);

        // Start the geyser increase timer
        this.increaseTimer = this.time.addEvent({
            delay: 100,
            callback: this.increaseGeyserHeight,
            callbackScope: this,
            loop: true
        });

        // Start the win condition check timer
        this.winCheckTimer = this.time.addEvent({
            delay: 100,
            callback: this.checkWinCondition,
            callbackScope: this,
            loop: true
        });
    }

    updateGeyser() {
        this.geyser.clear();
        this.geyser.fillStyle(0x00bfff);
        const heightPixels = (this.geyserHeight / 200) * 800;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.geyser.fillRect(centerX - 200, centerY + 200 - heightPixels, 400, heightPixels);
    }

    increaseGeyserHeight() {
        if (!this.gameActive) return;
        
        if (this.geyserHeight < 200) {
            this.geyserHeight += 4;
            this.updateGeyser();
        } else {
            this.gameOver();
        }
    }

    lowerGeyser() {
        if (!this.gameActive) return;
        
        if (this.geyserHeight > 0) {
            this.geyserHeight -= 10;
            if (this.geyserHeight < 0) this.geyserHeight = 0;
            this.updateGeyser();
        }
    }

    gameOver() {
        this.gameActive = false;
        this.increaseTimer.remove();
        this.winCheckTimer.remove();
        this.messageText.setText('Game Over! The geyser overflowed!');
        this.timerText.setText('');

        // Reset game variables
        this.geyserHeight = 0;
        this.winTimer = 0;
        this.updateGeyser();

        // Restart the scene after a short delay
        this.time.delayedCall(3000, () => {
            this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
        });
    }

    youWin() {
        this.gameActive = false;
        this.increaseTimer.remove();
        this.winCheckTimer.remove();
        this.messageText.setText('You Win! You kept the geyser under control!');
        this.timerText.setText('');

        // Reset game variables
        this.geyserHeight = 0;
        this.winTimer = 0;
        this.updateGeyser();

        // Restart the scene after a short delay
        this.time.delayedCall(3000, () => {
            this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
        });
    }

    checkWinCondition() {
        if (!this.gameActive) return;
        
        if (this.geyserHeight < 200) {
            this.winTimer += 100;
            let timeLeft = ((this.winTime - this.winTimer) / 1000).toFixed(1);
            this.timerText.setText(`Time Left: ${timeLeft}s`);
            if (this.winTimer >= this.winTime) {
                this.youWin();
            }
        } else {
            this.winTimer = 0;
            this.timerText.setText(`Time Left: 10.0s`);
        }
    }
}
