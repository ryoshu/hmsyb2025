import Phaser from 'phaser';

export class GameOceanBlue extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOceanBlue' });
  }

  preload() {
    // Preload assets if needed (e.g., images for player or tornadoes)
  }

  create() {
    // Add message text
    this.message = this.add.text(0, 0, 'Catch the tornadoes!', {
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

    // Make the message disappear after 2 seconds
    this.time.delayedCall(2000, () => {
      this.message.setVisible(false);
    });

    // Set up game variables
    this.caughtCount = 0;
    this.tornadoes = [];

    // Calculate play area dimensions
    const playAreaWidth = this.scale.width;
    const playAreaHeight = this.scale.height - 50; // 50px padding at the bottom

    // Add background color
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Create player
    this.player = this.add.rectangle(playAreaWidth / 2, playAreaHeight - 50, 50, 50, 0x0000ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Remove bounding box visuals
    this.player.body.debugShowBody = false;
    this.player.body.debugShowVelocity = false;

    // Create score text
    this.scoreText = this.add.text(20, 20, 'Tornadoes Caught: 0', {
      fontSize: '48px',
      color: '#fff'
    });

    // Center the score text
    Phaser.Display.Align.In.Center(
      this.scoreText,
      this.add.zone(
        this.cameras.main.width / 2,
        40,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add timed events for tornado creation and collision checking
    this.tornadoCreationEvent = this.time.addEvent({
      delay: 1000,
      callback: this.createTornado,
      callbackScope: this,
      loop: true,
    });

    this.collisionCheckEvent = this.time.addEvent({
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
      if (tornado.y > this.scale.height - 50) { // Adjust for play area height
        tornado.destroy();
        this.tornadoes.splice(index, 1);
      }
    });

    // Update score text
    this.scoreText.setText(`Tornadoes Caught: ${this.caughtCount}`);
  }

  gameWin() {
    // Update the message text with the win message
    this.message.setText('You caught 10 tornadoes! You win!');
    this.message.setVisible(true); // Make the message visible

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

    // Hide the score text
    this.scoreText.setVisible(false);

    // Clear all tornadoes from the screen
    this.tornadoes.forEach((tornado) => {
      tornado.destroy();
    });
    this.tornadoes = [];

    // Stop updating the game loop
    this.physics.world.pause();
    //this.scene.pause();

    // Remove timed events
    this.tornadoCreationEvent.remove();
    this.collisionCheckEvent.remove();

    // Restart the scene after a short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }

  createTornado() {
    const size = Phaser.Math.Between(10, 30);
    const x = Phaser.Math.Between(size, this.scale.width - size);
    const speed = Phaser.Math.FloatBetween(1, 3);

    const tornado = this.add.circle(x, -size, size, 0x000000);
    this.physics.add.existing(tornado);
    tornado.speed = speed;

    // Remove bounding box visuals
    tornado.body.debugShowBody = false;
    tornado.body.debugShowVelocity = false;

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

        if (this.caughtCount === 1) {
          this.gameWin();
        }
      }
    });
  }
}