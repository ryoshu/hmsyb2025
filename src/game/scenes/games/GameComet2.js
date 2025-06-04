import Phaser from 'phaser';

export class GameComet2 extends Phaser.Scene {
  constructor() {
    super('GameComet2');
    this.tileSize = 108;
    this.maze = [
      [1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,1],
      [1,0,1,0,1,0,1,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,1,0,1,0,1],
      [1,1,0,1,0,1,0,1,0,1],
      [1,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,0,1],
      [1,1,1,1,1,1,1,1,1,1]
    ];
  }

  preload() {
    this.load.image('wall', 'assets/COM-1.jpg');
    this.load.image('path', 'assets/COM-2.jpg');
    this.load.image('terminal', 'assets/COM-3.jpg');
    this.load.image('player', 'assets/ms_player.png');
  }

  create() {
    this.wallGroup = this.physics.add.staticGroup();
    this.terminalGroup = this.physics.add.staticGroup();

    const offsetY = 0;

    // Render maze
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const tile = this.maze[y][x];
        const px = x * this.tileSize;
        const py = y * this.tileSize + offsetY;
        console.log(tile);
        const key = tile === 1 ? 'wall' : 'path';
        console.log(key);
        

        if (tile === 1) {
          this.wallGroup.create(px + this.tileSize / 2, py + this.tileSize / 2, 'COM-1')
            .setDisplaySize(this.tileSize, this.tileSize)
            .refreshBody();
        }
        
        this.add.image(px, py, key).setOrigin(0).setDisplaySize(this.tileSize, this.tileSize);
      }
    }

    // Add terminals
    this.terminals = [
      this.addTerminal(8, 1),
      this.addTerminal(1, 7)
    ];

    // Add player
    this.player = this.physics.add.sprite(
      1 * this.tileSize + this.tileSize / 2,
      1 * this.tileSize + this.tileSize / 2,
      'player'
    ).setDisplaySize(this.tileSize * 0.9, this.tileSize * 0.9);

    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.add.overlap(this.player, this.terminalGroup, this.reachTerminal, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Add this line to create the virtual joystick
    this.createVirtualJoystick();

    // Add debug text for joystick (optional)
    this.cursorDebugText = this.add.text(10, 520, '', {
      fontSize: '16px',
      color: '#333'
    });

    // Timer
    this.timerText = this.add.text(10, 490, '', {
      fontSize: '20px',
      color: '#000'
    });
    this.startTime = this.time.now;
    this.reached = new Set();

    // Add instructions
    this.instructionsText = this.add.text(0, 0,
      'Use the joystick or keyboard to capture the terminals', {
      fontSize: '28px',
      color: '#ffffff',
      wordWrap: { width: this.cameras.main.width - 20, useAdvancedWrap: true },
    }).setOrigin(0.5, 0.5);

    // Center the message text
    Phaser.Display.Align.In.Center(
      this.instructionsText,
      this.add.zone(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 200,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );
  }

  update() {
    this.handlePlayerMovement();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.timerText.setText('Time: ' + elapsed + 's');
  }

  handlePlayerMovement() {
    const speed = 150;
    this.player.setVelocity(0);

    // Combine joystick and keyboard input
    let left = false, right = false, up = false, down = false;

    if (this.joyStickCursors) {
      left = left || this.joyStickCursors.left.isDown;
      right = right || this.joyStickCursors.right.isDown;
      up = up || this.joyStickCursors.up.isDown;
      down = down || this.joyStickCursors.down.isDown;
    }
    if (this.cursors) {
      left = left || this.cursors.left.isDown;
      right = right || this.cursors.right.isDown;
      up = up || this.cursors.up.isDown;
      down = down || this.cursors.down.isDown;
    }

    if (left) {
      this.player.setVelocityX(-speed);
    } else if (right) {
      this.player.setVelocityX(speed);
    }

    if (up) {
      this.player.setVelocityY(-speed);
    } else if (down) {
      this.player.setVelocityY(speed);
    }
  }

  addTerminal(x, y) {
    const px = x * this.tileSize + this.tileSize / 2;
    const py = y * this.tileSize + this.tileSize / 2;
    const terminal = this.terminalGroup.create(px, py, 'terminal')
      .setDisplaySize(this.tileSize * 0.9, this.tileSize * 0.9)
      .refreshBody();
    terminal.setData('id', `${x},${y}`);
    return terminal;
  }

  reachTerminal(player, terminal) {
    const id = terminal.getData('id');
    if (!this.reached.has(id)) {
      this.reached.add(id);
      terminal.setTint(0x00ff00);

      if (this.reached.size === this.terminals.length) {
        this.showWinMessage();
      }
    }
  }

  showWinMessage() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.add.text(centerX, 1500, 'You Win!', {
      fontSize: '50px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu');
    });
  }

    createVirtualJoystick() {
      // Position joystick in bottom-right corner
      const joystickX = this.scale.width - 150;
      const joystickY = this.scale.height - 150;
  
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
          if (pointer.y > this.canvasHeight / 2) {
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
            this.setCursorDebugInfo();
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
      let dragStartX = 0;
      let dragStartY = 0;
  
      this.input.on('pointerdown', (pointer) => {
        const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBase.x, this.joystickBase.y);
        if (distance < 64) {
          isDragging = true;
          dragStartX = pointer.x;
          dragStartY = pointer.y;
        }
      });
  
      this.input.on('pointermove', (pointer) => {
        if (isDragging) {
          const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBase.x, this.joystickBase.y);
          const maxDistance = 50;
          
          if (distance <= maxDistance) {
            this.joystickThumb.x = pointer.x;
            this.joystickThumb.y = pointer.y;
          } else {
            const angle = Phaser.Math.Angle.Between(this.joystickBase.x, this.joystickBase.y, pointer.x, pointer.y);
            this.joystickThumb.x = this.joystickBase.x + Math.cos(angle) * maxDistance;
            this.joystickThumb.y = this.joystickBase.y + Math.sin(angle) * maxDistance;
          }
  
          // Update cursor keys based on thumb position
          const deltaX = this.joystickThumb.x - this.joystickBase.x;
          const deltaY = this.joystickThumb.y - this.joystickBase.y;
          const deadZone = 20;
  
          this.joyStickCursors.up.isDown = deltaY < -deadZone;
          this.joyStickCursors.down.isDown = deltaY > deadZone;
          this.joyStickCursors.left.isDown = deltaX < -deadZone;
          this.joyStickCursors.right.isDown = deltaX > deadZone;
        }
      });
  
      this.input.on('pointerup', () => {
        if (isDragging) {
          isDragging = false;
          this.joystickThumb.x = this.joystickBase.x;
          this.joystickThumb.y = this.joystickBase.y;
          
          // Reset all cursor keys
          this.joyStickCursors.up.isDown = false;
          this.joyStickCursors.down.isDown = false;
          this.joyStickCursors.left.isDown = false;
          this.joyStickCursors.right.isDown = false;
        }
      });
    }
  
    setCursorDebugInfo() {
      const force = this.joyStick ? Math.floor((this.joyStick.force || 0) * 100) / 100 : 0;
      const angle = this.joyStick ? Math.floor((this.joyStick.angle || 0) * 100) / 100 : 0;
      let text = `Direction: ${this.lastCursorDirection}\n`;
      text += `Force: ${force}\n`;
      text += `Angle: ${angle}\n`;
      text += `FPS: ${Math.floor(this.sys.game.loop.actualFps)}\n`;
      this.cursorDebugText.setText(text);
    }
  
    updateJoystickState() {
      let direction = '';
      
      // Check joystick cursor keys (only if rex plugin joystick exists)
      if (this.joyStickCursors && this.joyStick && this.joyStick.createCursorKeys) {
        for (let key in this.joyStickCursors) {
          if (this.joyStickCursors[key].isDown) {
            direction += key;
          }
        }
      }
  
      // If no direction is provided then stop player animations and exit
      if (direction.length === 0) { 
        this.lastCursorDirection = "center";
        return;
      }
  
      // Set the new cursor direction
      this.lastCursorDirection = direction;
  
      // Set debug info about the cursor
      this.setCursorDebugInfo();
    }
}
