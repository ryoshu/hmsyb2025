import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

export class GameSereneIndigo extends Phaser.Scene {
  constructor() {
    super({ key: 'GameSereneIndigo' });
  }

  preload() {
    // Preload assets if needed
    this.load.image('bridge', './assets/bridge.png');
    this.load.image('bicycle', './assets/bicycle-top-down.png');
    this.load.image('bike1', './assets/bike1.png');
    this.load.image('bike2', './assets/bike2.png');
    this.load.image('bike3', './assets/bike3.png');
    this.load.image('bike4', './assets/bike4.png');
    this.load.image('bike5', './assets/bike5.png');
  }

  create() {
    // Game dimensions
    this.gameWidth = this.sys.game.config.width;
    this.gameHeight = this.sys.game.config.height;

    const bridgeImgWidth = 650;
    const bridgeImgHeight = 840;

    this.bridgeTopBound = 350;
    this.bridgeBottomBound = this.gameHeight - 350;

    this.bridgeBackground = this.add.tileSprite(743, 960, 1486, 1920, "bridge");

    // Add message text
    this.message = this.add.text(this.cameras.main.width / 2, 175, 'Race the cyclists to make it across the bridge!', {
      fontSize: '28px',
      color: '#fff',
    }).setOrigin(0.5);

    // Player setup
    const bicycle = this.add.image(100, this.gameHeight / 2, 'bicycle').setOrigin(0.5, 0.5);

    this.player = bicycle;
    this.player.isStroked = false; // Ensure no outline
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

    // Virtual controller setup
    this.createVirtualJoystick();

    // Movement state variables
    this.isMovingUp = false;
    this.isMovingDown = false;

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

    this.classroom = this.add.text(0,0, 'Serene Indigo', {
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

  createVirtualJoystick() {
    // Position joystick in bottom-right corner
    const joystickX = this.gameWidth - 100;
    const joystickY = this.gameHeight - 200;

    // Create temporary graphics objects for texture generation, then destroy them
    const tempBaseGraphics = this.add.graphics()
      .fillStyle(0x888888, 0.5)
      .fillCircle(64, 64, 64);
    
    const joystickBase = tempBaseGraphics.generateTexture('joystick-base', 128, 128);
    tempBaseGraphics.destroy(); // Remove the temporary graphics object
    
    const tempThumbGraphics = this.add.graphics()
      .fillStyle(0xcccccc, 0.8)
      .fillCircle(32, 32, 32);
    
    const joystickThumb = tempThumbGraphics.generateTexture('joystick-thumb', 64, 64);
    tempThumbGraphics.destroy(); // Remove the temporary graphics object

    // Store static position for reset
    this.staticXJsPos = joystickX;
    this.staticYJsPos = joystickY;

    // Check if plugin is available, if not create a simple touch-based joystick
    const plugin = this.plugins.get('rexvirtualjoystickplugin');
    
    if (plugin) {
      // Create the virtual joystick using rex plugin
      this.joyStick = plugin.add(this, {
        x: joystickX,
        y: joystickY,
        radius: 64,
        base: this.add.image(0, 0, 'joystick-base').setDisplaySize(128, 128),
        thumb: this.add.image(0, 0, 'joystick-thumb').setDisplaySize(64, 64),
        dir: '8dir',   // 8 directions
        forceMin: 16,
        enable: true
      });

      // Create cursor keys from joystick
      this.joyStickCursors = this.joyStick.createCursorKeys();

      // Update joystick state
      this.joyStick.on('update', this.updateJoystickState, this);

      // Optional: Allow repositioning joystick on touch/click
      this.input.on('pointerdown', (pointer) => {
        // Only reposition if touch is in the lower half of screen
        if (pointer.y > this.gameHeight / 2) {
          this.joyStick.x = pointer.x;
          this.joyStick.y = pointer.y;
          this.joyStick.base.x = pointer.x;
          this.joyStick.base.y = pointer.y;
          this.joyStick.thumb.x = pointer.x;
          this.joyStick.thumb.y = pointer.y;
        }
      });

      // Return joystick to original position when released
      this.input.on('pointerup', () => {
        if (this.joyStick) {
          this.joyStick.x = this.staticXJsPos;
          this.joyStick.y = this.staticYJsPos;
          this.joyStick.base.x = this.staticXJsPos;
          this.joyStick.base.y = this.staticYJsPos;
          this.joyStick.thumb.x = this.staticXJsPos;
          this.joyStick.thumb.y = this.staticYJsPos;
          this.lastCursorDirection = "center";
          this.isMovingUp = false;
          this.isMovingDown = false;
        }
      });

    } else {
      // Fallback: Create a simple touch-based movement system
      console.warn('Virtual joystick plugin not found, using simple touch controls');
      this.createSimpleJoystick(joystickX, joystickY);
    }

    // Track last direction for animations
    this.lastCursorDirection = "center";
  }

  createSimpleJoystick(x, y) {
    // Create visual joystick elements
    this.joystickBase = this.add.image(x, y, 'joystick-base').setDisplaySize(128, 128).setAlpha(0.7);
    this.joystickThumb = this.add.image(x, y, 'joystick-thumb').setDisplaySize(64, 64).setAlpha(0.8);
    
    // Simple cursor keys simulation
    this.joyStickCursors = {
      up: { isDown: false },
      down: { isDown: false },
      left: { isDown: false },
      right: { isDown: false }
    };

    let isDragging = false;

    this.input.on('pointerdown', (pointer) => {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBase.x, this.joystickBase.y);
      if (distance < 64) {
        isDragging = true;
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (isDragging) {
        const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBase.x, this.joystickBase.y);
        const maxDistance = 50;
        
        if (distance <= maxDistance) {
          this.joystickThumb.x = this.joystickBase.x; // Keep X centered
          this.joystickThumb.y = pointer.y;
        } else {
          const angle = Phaser.Math.Angle.Between(this.joystickBase.x, this.joystickBase.y, this.joystickBase.x, pointer.y);
          this.joystickThumb.x = this.joystickBase.x; // Keep X centered
          this.joystickThumb.y = this.joystickBase.y + Math.sin(angle) * maxDistance;
        }

        // Update cursor keys based on thumb position (only vertical movement)
        const deltaY = this.joystickThumb.y - this.joystickBase.y;
        const deadZone = 20;

        this.isMovingUp = deltaY < -deadZone;
        this.isMovingDown = deltaY > deadZone;
        
        // Set cursor keys for compatibility
        this.joyStickCursors.up.isDown = this.isMovingUp;
        this.joyStickCursors.down.isDown = this.isMovingDown;
        this.joyStickCursors.left.isDown = false; // Disable left movement
        this.joyStickCursors.right.isDown = false; // Disable right movement
      }
    });

    this.input.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        this.joystickThumb.x = this.joystickBase.x;
        this.joystickThumb.y = this.joystickBase.y;
        
        // Reset movement state
        this.isMovingUp = false;
        this.isMovingDown = false;
        
        // Reset all cursor keys
        this.joyStickCursors.up.isDown = false;
        this.joyStickCursors.down.isDown = false;
        this.joyStickCursors.left.isDown = false;
        this.joyStickCursors.right.isDown = false;
      }
    });
  }

  updateJoystickState() {
    let direction = '';
    
    // Check joystick cursor keys (only if rex plugin joystick exists)
    if (this.joyStickCursors && this.joyStick && this.joyStick.createCursorKeys) {
      // Only check for up/down movement
      if (this.joyStickCursors.up.isDown) {
        direction += 'up';
        this.isMovingUp = true;
        this.isMovingDown = false;
      } else if (this.joyStickCursors.down.isDown) {
        direction += 'down';
        this.isMovingDown = true;
        this.isMovingUp = false;
      } else {
        this.isMovingUp = false;
        this.isMovingDown = false;
      }
    }

    // If no direction is provided then stop player animations and exit
    if (direction.length === 0) { 
      this.lastCursorDirection = "center";
      this.isMovingUp = false;
      this.isMovingDown = false;
      return;
    }

    // Set the new cursor direction
    this.lastCursorDirection = direction;
  }

  update() {
    this.bridgeBackground.tilePositionX += 5;
    // Player movement - combining keyboard and virtual controls (only up/down)
    const movingUp = (this.cursors.up.isDown || this.isMovingUp) && this.player.y > 25;
    const movingDown = (this.cursors.down.isDown || this.isMovingDown) && this.player.y < this.gameHeight - 25;

    if (movingUp) {
      this.player.y -= 5;
    } else if (movingDown) {
      this.player.y += 5;
    }

    // Move obstacles - add null check
    if (this.obstacles && this.obstacles.children) {
      this.obstacles.children.iterate((obstacle) => {
        if (obstacle && obstacle.x !== undefined) {
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
        }
      });
    }
  }

  createObstacles() {

    for (let i = 0; i < 3; i++) {
      const spawnY = Phaser.Math.Between(this.bridgeTopBound, this.bridgeBottomBound);
      console.log("spawnY: " + spawnY);
      console.log(this.bridgeTopBound);
      console.log(this.bridgeBottomBound);

      const obstacle = this.add.sprite(
        this.gameWidth + i * 200,
        spawnY,
        `bike${ Math.floor(Math.random()*5) + 1 }`
      ).setOrigin(0.5, 0.5);
      
      /*
      const obstacle = this.add.rectangle(
        this.gameWidth + i * 200,
        Phaser.Math.Between(75, this.gameHeight - 75),
        150,
        150,
        0x000000
      );
      */
      this.physics.add.existing(obstacle);
      this.obstacles.add(obstacle);
    }
  }

  handleCollision() {
    // Stop the physics simulation
    this.physics.pause();

    // Clear all obstacles
    this.obstacles.clear(true, true);

    // Display "Game Over" message
    const gameOverText = this.add.text(
      this.gameWidth / 2,
      this.gameHeight / 2,
      'Game Over! Restarting...',
      {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: { x: 20, y: 10 },
      }
    );
    gameOverText.setOrigin(0.5);

    // Restart the scene after a short delay
    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  showWinScreen() {
    // Stop the physics simulation
    this.physics.pause();

    // Clear all obstacles
    this.obstacles.clear(true, true);

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

    // Got to main menu after short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }
}