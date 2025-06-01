import Phaser from 'phaser';

export class GameRosyRed extends Phaser.Scene {
  constructor() {
    super({ key: 'GameRosyRed' });
    this.score = 0;
    this.maxScore = 10;
    this.starsOnScreen = 3;
    this.starParticles = [];
  }

  preload() {
    this.load.image('particle', 'assets/star.png');
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#000');
    
    // Create star background
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xFFFFFF);
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * this.gameWidth;
        const y = Math.random() * this.gameHeight;
        const size = Math.random() * 2 + 0.5;
        const alpha = Math.random() * 0.8 + 0.2;
        starGraphics.fillStyle(0xFFFFFF, alpha);
        starGraphics.fillCircle(x, y, size);
    }
    starGraphics.generateTexture('stars', this.gameWidth, this.gameHeight);
    starGraphics.destroy();
    
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

    this.emitter = this.add.particles(this.cameras.main.width / 2, this.cameras.main.height / 2, 'particle', {
        frame: [ 'yellow' ],
        lifespan: 4000,
        speed: { min: 20, max: 250 },
        scale: { start: 0.8, end: 0 },
        gravityY: 150,
        blendMode: 'ADD',
        emitting: false
    });

    this.classroom = this.add.text(0,0, 'Rosy Red', {
      fontSize: '48px',
      color: '#fff',
    });

    // Center the message text
    Phaser.Display.Align.In.Center(
      this.classroom,
      this.add.zone(
        this.cameras.main.width / 2,
        40,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );
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
        this.message.setPosition(centerX, 80);
      }

      if (this.score >= this.maxScore) {
        this.gameWin();
      } else {
        this.spawnStar(); // Keep the number of stars constant
      }
    });
  }

  gameWin() {
    this.emitter.explode(16);

    // Update the message text
    this.message.setText("✨ You're a super star! ✨");

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