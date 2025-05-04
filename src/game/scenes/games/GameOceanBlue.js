import Phaser from 'phaser';

export class GameOceanBlue extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOceanBlue' });
  }

  preload() {
    // Preload assets if needed (e.g., images for player or tornadoes)
  }

  create() {
    // Set up game variables
    this.caughtCount = 0;
    this.tornadoes = [];

    // Add background color
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Create player
    this.player = this.add.rectangle(250, 550, 50, 50, 0x0000ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Create score text
    this.scoreText = this.add.text(20, 20, 'Tornadoes Caught: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000',
    });

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add timed events for tornado creation and collision checking
    this.time.addEvent({
      delay: 1000,
      callback: this.createTornado,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 100,
      callback: this.checkCollisions,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Handle player movement
    if (this.cursors.left.isDown) {
      this.player.x -= 5;
    } else if (this.cursors.right.isDown) {
      this.player.x += 5;
    }

    // Update tornado positions
    this.tornadoes.forEach((tornado, index) => {
      tornado.y += tornado.speed;
      if (tornado.y > 600) {
        tornado.destroy();
        this.tornadoes.splice(index, 1);
      }
    });

    // Update score text
    this.scoreText.setText(`Tornadoes Caught: ${this.caughtCount}`);
  }

  createTornado() {
    const size = Phaser.Math.Between(10, 30);
    const x = Phaser.Math.Between(size, 500 - size);
    const speed = Phaser.Math.FloatBetween(1, 3);

    const tornado = this.add.circle(x, -size, size, 0x000000);
    this.physics.add.existing(tornado);
    tornado.speed = speed;

    this.tornadoes.push(tornado);
  }

  checkCollisions() {
    this.tornadoes.forEach((tornado, index) => {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          tornado.getBounds()
        )
      ) {
        this.caughtCount++;
        tornado.destroy();
        this.tornadoes.splice(index, 1);

        if (this.caughtCount === 10) {
          this.scene.restart(); // Restart the scene
          alert('You caught 10 tornadoes! You win!');
        }
      }
    });
  }
}