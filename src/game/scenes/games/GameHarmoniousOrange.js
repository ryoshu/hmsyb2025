import Phaser from 'phaser';

export class GameHarmoniousOrange extends Phaser.Scene {
    constructor() {
        super({ key: 'GameHarmoniousOrange' });
    }

    preload() {
        // Preload assets if needed (e.g., images for geyser, button, etc.)
    }

    create() {
        this.add.text(400, 50, 'Click the Geyser to Keep it Under Control!', {
            fontSize: '24px',
            color: '#000',
        }).setOrigin(0.5);

        // Geyser container
        this.geyserContainer = this.add.rectangle(400, 300, 200, 400, 0x87ceeb);
        this.geyserContainer.setStrokeStyle(2, 0x4682b4);

        // Geyser
        this.geyser = this.add.rectangle(400, 500, 200, 0, 0x00bfff);
        this.geyserHeight = 0;
        this.maxHeight = 400;

        // Timer text
        this.timerText = this.add.text(400, 550, 'Time Left: 10.0s', {
            fontSize: '18px',
            color: '#333',
        }).setOrigin(0.5);

        // Message text
        this.messageText = this.add.text(400, 600, '', {
            fontSize: '24px',
            color: '#ff6347',
        }).setOrigin(0.5);

        // Geyser button
        this.geyserButton = this.add.rectangle(400, 700, 200, 50, 0xff6347)
            .setInteractive()
            .on('pointerdown', this.lowerGeyser, this);
        this.add.text(400, 700, 'Click to Lower the Geyser', {
            fontSize: '16px',
            color: '#fff',
        }).setOrigin(0.5);

        // Game variables
        this.winTime = 10000; // 10 seconds
        this.winTimer = 0;
        this.gameOverFlag = false;

        // Start the game loop
        this.time.addEvent({
            delay: 100,
            callback: this.increaseGeyserHeight,
            callbackScope: this,
            loop: true,
        });

        this.time.addEvent({
            delay: 100,
            callback: this.checkWinCondition,
            callbackScope: this,
            loop: true,
        });
    }

    increaseGeyserHeight() {
        if (this.gameOverFlag) return;

        if (this.geyserHeight < this.maxHeight) {
            this.geyserHeight = Math.min(this.geyserHeight + 8, this.maxHeight); // Ensure it doesn't exceed maxHeight
            this.geyser.height = this.geyserHeight;
            this.geyser.y = 500 - this.geyserHeight / 2; // Adjust position
        } else {
            this.gameOver();
        }
    }

    lowerGeyser() {
        if (this.gameOverFlag) return;

        if (this.geyserHeight > 0) {
            this.geyserHeight = Math.max(this.geyserHeight - 40, 0); // Ensure it doesn't go below 0
            this.geyser.height = this.geyserHeight;
            this.geyser.y = 500 - this.geyserHeight / 2; // Adjust position
        }
    }

    gameOver() {
        this.gameOverFlag = true;
        this.messageText.setText('Game Over! The geyser overflowed!');
        this.timerText.setText('');
        this.geyserButton.disableInteractive();
    }

    youWin() {
        this.gameOverFlag = true;
        this.messageText.setText('You Win! You kept the geyser under control!');
        this.timerText.setText('');
        this.geyserButton.disableInteractive();
    }

    checkWinCondition() {
        if (this.gameOverFlag) return;

        if (this.geyserHeight < this.maxHeight) {
            this.winTimer += 100;
            const timeLeft = ((this.winTime - this.winTimer) / 1000).toFixed(1);
            this.timerText.setText(`Time Left: ${timeLeft}s`);

            if (this.winTimer >= this.winTime) {
                this.youWin();
            }
        } else {
            // Reset win timer if the geyser overflows
            this.winTimer = 0;
            this.timerText.setText('Time Left: 10.0s');
        }
    }
}