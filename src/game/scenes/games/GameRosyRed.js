import Phaser from 'phaser';

export class GameRosyRed extends Phaser.Scene {
  constructor() {
    super({ key: 'GameRosyRed' });
    this.score = 0;
    this.maxScore = 10;
    this.starsOnScreen = 3;
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#000');
    
    // Add message text
    this.message = this.add.text(0, 0, 'Click 10 stars to win!', {
      fontSize: '48px',
      color: '#fff',
    });

    // Center the message text
    Phaser.Display.Align.In.Center(
      this.message,
      this.add.zone(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );

    // Spawn initial stars
    for (let i = 0; i < this.starsOnScreen; i++) {
      this.spawnStar();
    }
  }

  spawnStar() {
    if (this.score >= this.maxScore) return;

    // Generate random position for the star
    const x = Phaser.Math.Between(60, this.cameras.main.width - 60);
    const y = Phaser.Math.Between(60, this.cameras.main.height - 60);

    // Draw the star using Phaser's graphics
    const star = this.add.star(x, y, 5, 20, 40, 0xffff00).setInteractive();

    // Add click event to the star
    star.on('pointerdown', () => {
      this.score++;
      star.destroy(); // Remove the star
      this.message.setText(`Stars clicked: ${this.score}`);

      // Move the message to the top of the screen with 20px padding and center it horizontally
      if (this.score === 1) {
        const centerX = this.cameras.main.width / 2 - this.message.width / 2;
        this.message.setPosition(centerX, 20);
      }

      if (this.score >= this.maxScore) {
        this.gameWin();
      } else {
        this.spawnStar(); // Keep the number of stars constant
      }
    });
  }

  gameWin() {
    // Update the message text
    this.message.setText("You're a super star! 🎉");

    // Center the message text on the screen
    Phaser.Display.Align.In.Center(
      this.message,
      this.add.zone(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );

    // Clear all remaining stars
    this.clearRemainingStars();

    // Add a 3-second timeout to transition back to the main scene
    this.time.delayedCall(3000, () => {
        this.scene.start('MainMenu'); // Replace 'MainScene' with the actual key of your main scene
    });
  }

  clearRemainingStars() {
    // Remove all remaining stars
    this.children.list.forEach((child) => {
      if (child.type === 'Star') {
        child.destroy();
      }
    });
  }
}