import Phaser from 'phaser';

export class GameSereneIndigo extends Phaser.Scene {
  constructor() {
    super({ key: 'GameSereneIndigo' });
  }

  preload() {
    // Preload assets if needed
  }

  create() {
    // Game dimensions
    this.gameWidth = this.sys.game.config.width;
    this.gameHeight = this.sys.game.config.height;

    // Player setup
    this.player = this.add.rectangle(50, this.gameHeight - 75, 50, 50, 0xff0000);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Obstacles setup
    this.obstacles = this.physics.add.group();
    this.obstacleSpeed = 200;
    this.createObstacles();

    // Score setup
    this.score = 0;
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fill: '#fff',
    });

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision detection
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.handleCollision,
      null,
      this
    );

    // Win condition
    this.hasWon = false;
  }

  update() {
    // Player movement
    if (this.cursors.up.isDown && this.player.y > 25) {
      this.player.y -= 5;
    } else if (this.cursors.down.isDown && this.player.y < this.gameHeight - 25) {
      this.player.y += 5;
    }

    // Move obstacles
    this.obstacles.children.iterate((obstacle) => {
      obstacle.x -= this.obstacleSpeed * 0.02;
      if (obstacle.x < -75) {
        obstacle.x = this.gameWidth + 75;
        obstacle.y = Phaser.Math.Between(75, this.gameHeight - 75);

        if (!this.hasWon) {
          this.score++;
          this.scoreText.setText(`Score: ${this.score}`);

          if (this.score >= 10) {
            this.hasWon = true;
            this.showWinScreen();
          }
        }
      }
    });
  }

  createObstacles() {
    for (let i = 0; i < 3; i++) {
      const obstacle = this.add.rectangle(
        this.gameWidth + i * 200,
        Phaser.Math.Between(75, this.gameHeight - 75),
        150,
        150,
        0x000000
      );
      this.physics.add.existing(obstacle);
      this.obstacles.add(obstacle);
    }
  }

  handleCollision() {
    this.scene.restart();
    alert('Game Over!');
  }

  showWinScreen() {
    const winText = this.add.text(
      this.gameWidth / 2,
      this.gameHeight / 2,
      '🎉 YOU WIN! 🎉',
      {
        fontSize: '48px',
        fill: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: { x: 20, y: 10 },
      }
    );
    winText.setOrigin(0.5);
  }
}