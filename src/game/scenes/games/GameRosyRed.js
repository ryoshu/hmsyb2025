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
    this.message = this.add.text(10, 10, 'Click 10 stars to win!', {
      fontSize: '24px',
      color: '#fff',
    });

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

      if (this.score >= this.maxScore) {
        this.message.setText('You win! 🎉');
        this.clearRemainingStars();
      } else {
        this.spawnStar(); // Keep the number of stars constant
      }
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