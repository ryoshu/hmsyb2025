import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'; // Add this if using rex plugin

export class GameOceanBlue extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOceanBlue' });
  }

  preload() {
    // Load the tornado sprite
    this.load.image('tornado', './assets/OB-2.png');

    // Preload joystick textures (optional, for fallback)
    this.load.once('complete', () => {
      // Generate textures for fallback joystick
      if (!this.textures.exists('joystick-base')) {
        const g = this.add.graphics().fillStyle(0x888888, 0.5).fillCircle(64, 64, 64);
        g.generateTexture('joystick-base', 128, 128);
        g.destroy();
      }
      if (!this.textures.exists('joystick-thumb')) {
        const g = this.add.graphics().fillStyle(0xcccccc, 0.8).fillCircle(32, 32, 32);
        g.generateTexture('joystick-thumb', 64, 64);
        g.destroy();
      }
    });
  }

  create() {
    // Add message text
    this.message = this.add.text(0, 0, 'Catch the tornadoes!', {
      fontSize: '48px',
      color: '#000000',
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
    // this.cameras.main.setBackgroundColor('#87CEEB');
    this.cameras.main.setBackgroundColor('#ffffff');

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

    // --- Virtual Joystick Setup (left/right only) ---
    this.createVirtualJoystick();

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

  createVirtualJoystick() {
    const joystickX = 120;
    const joystickY = this.scale.height - 120;

    // Generate textures if not already present (for fallback)
    if (!this.textures.exists('joystick-base')) {
      const g = this.add.graphics().fillStyle(0x888888, 0.5).fillCircle(64, 64, 64);
      g.generateTexture('joystick-base', 128, 128);
      g.destroy();
    }
    if (!this.textures.exists('joystick-thumb')) {
      const g = this.add.graphics().fillStyle(0xcccccc, 0.8).fillCircle(32, 32, 32);
      g.generateTexture('joystick-thumb', 64, 64);
      g.destroy();
    }

    // Try to use rexvirtualjoystickplugin if available
    const plugin = this.plugins.get('rexvirtualjoystickplugin');
    if (plugin) {
      this.joyStick = plugin.add(this, {
        x: joystickX,
        y: joystickY,
        radius: 64,
        base: this.add.image(0, 0, 'joystick-base').setDisplaySize(128, 128),
        thumb: this.add.image(0, 0, 'joystick-thumb').setDisplaySize(64, 64),
        dir: '4dir', // Only 4 directions, but we'll only use left/right
        forceMin: 16,
        enable: true
      });
      this.joyStickCursors = this.joyStick.createCursorKeys();
    } else {
      // Fallback: Simple touch-based joystick
      this.createSimpleJoystick(joystickX, joystickY);
    }
  }

  createSimpleJoystick(x, y) {
    this.joystickBase = this.add.image(x, y, 'joystick-base').setDisplaySize(128, 128).setAlpha(0.7);
    this.joystickThumb = this.add.image(x, y, 'joystick-thumb').setDisplaySize(64, 64).setAlpha(0.8);

    this.joyStickCursors = {
      left: { isDown: false },
      right: { isDown: false }
    };

    let isDragging = false;
    let dragStartX = 0;

    this.input.on('pointerdown', (pointer) => {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBase.x, this.joystickBase.y);
      if (distance < 64) {
        isDragging = true;
        dragStartX = pointer.x;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (isDragging) {
        const deltaX = pointer.x - this.joystickBase.x;
        const deadZone = 20;

        // Only left/right
        this.joyStickCursors.left.isDown = deltaX < -deadZone;
        this.joyStickCursors.right.isDown = deltaX > deadZone;

        // Move thumb visually
        const maxDistance = 50;
        if (Math.abs(deltaX) <= maxDistance) {
          this.joystickThumb.x = pointer.x;
        } else {
          this.joystickThumb.x = this.joystickBase.x + Math.sign(deltaX) * maxDistance;
        }
      }
    });

    this.input.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        this.joystickThumb.x = this.joystickBase.x;
        this.joyStickCursors.left.isDown = false;
        this.joyStickCursors.right.isDown = false;
      }
    });
  }

  update() {
    // Handle player movement (keyboard or joystick)
    const left = this.cursors.left.isDown || (this.joyStickCursors && this.joyStickCursors.left && this.joyStickCursors.left.isDown);
    const right = this.cursors.right.isDown || (this.joyStickCursors && this.joyStickCursors.right && this.joyStickCursors.right.isDown);

    if (left) {
      this.player.x -= 5;
    } else if (right) {
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
    const scale = Phaser.Math.FloatBetween(0.1, 0.5); // Random scale for variety
    const speed = Phaser.Math.FloatBetween(1, 3);

    // Create tornado sprite instead of circle
    const tornado = this.add.image(0, 0, 'tornado');
    tornado.setScale(scale);
    
    // Calculate spawn position based on tornado's actual width after scaling
    const tornadoWidth = tornado.displayWidth;
    const x = Phaser.Math.Between(tornadoWidth / 2, this.scale.width - tornadoWidth / 2);
    tornado.setPosition(x, -tornado.displayHeight / 2);
    
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

        if (this.caughtCount === 10) {
          this.gameWin();
        }
      }
    });
  }
}