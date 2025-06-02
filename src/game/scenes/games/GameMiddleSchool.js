import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

export class GameMiddleSchool extends Phaser.Scene {
  constructor() {
    super({ key: 'GameMiddleSchool' });
  }

  preload() {
    this.load.image('GameMiddleSchoolEnabled_icon', 'assets/middle_school.png');
    this.load.image('player', 'assets/ms_player.png');
  }

  create() {
    // Add black background
    this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000).setOrigin(0, 0);

    this.canvasWidth = this.sys.game.config.width;
    this.canvasHeight = this.sys.game.config.height;

    // Player setup
    //this.player = this.add.rectangle(this.canvasWidth / 2, this.canvasHeight - 200, 60, 60, 0x0000ff);
    this.player = this.add.image(this.canvasWidth / 2, this.canvasHeight - 200, 'player').setScale(0.15).setRotation(-(Math.PI/2));
    this.player.health = 100;
    this.player.speed = 300;

    // Boss setup
    // this.boss = this.add.circle(this.canvasWidth / 2, this.canvasHeight / 2, 50, 0x00ff00);
    this.boss = this.add.image(this.canvasWidth / 2, this.canvasHeight / 2, 'GameMiddleSchoolEnabled_icon').setScale(0.3);
    this.boss.maxHealth = 300;
    this.boss.health = this.boss.maxHealth;
    this.boss.lasers = [];

    // Damage spot setup
    this.damageSpot = null;
    this.createDamageSpot();

    // Score and game state
    this.score = 0;
    this.gameWon = false;

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create virtual joystick
    this.createVirtualJoystick();

    // Boss health text
    this.add.text(this.canvasWidth / 2, 100, 'VIRUS HEALTH', {
      fontSize: '28px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: this.canvasWidth - 100 }
    }).setOrigin(0.5);

    // Directions
    this.add.text(this.canvasWidth / 2, this.canvasHeight - 20, 'Use the joystick or keyboard to get to the yellow spots!', {
      fontSize: '28px',
      color: '#ffff00',
      align: 'center',
      wordWrap: { width: this.canvasWidth - 100 }
    }).setOrigin(0.5);

    // Health bars
    this.playerHealthBar = this.add.graphics();
    this.bossHealthBar = this.add.graphics();

    // Timer for shooting lasers
    this.time.addEvent({
      delay: 1000,
      callback: this.shootLaser,
      callbackScope: this,
      loop: true,
    });

    // Debug text for joystick (optional)
    this.cursorDebugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff'
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

  update(time, delta) {
    if (this.gameWon) return;

    this.movePlayer(delta);
    this.moveLasers();
    this.checkCollisions();

    this.drawPlayerHealthBar();
    this.drawBossHealthBar();
  }

  createDamageSpot() {
    const spotRadius = 30;
    let x, y;

    // Define the playable area boundaries (avoid UI and joystick)
    const topMargin = 120; // Avoid boss health bar and text
    const bottomMargin = 180; // Avoid joystick and directions text
    const leftMargin = spotRadius;
    const rightMargin = spotRadius;

    // If boss is an image, estimate its radius for spacing
    const bossRadius = (this.boss.displayWidth || 100) / 2;
    const minDistance = bossRadius + spotRadius + 100;

    let attempts = 0;
    do {
      x = Phaser.Math.Between(leftMargin, this.canvasWidth - rightMargin);
      y = Phaser.Math.Between(topMargin, this.canvasHeight - bottomMargin);
      attempts++;
      // Prevent infinite loop in rare cases
      if (attempts > 100) break;
    } while (Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y) < minDistance);

    if (this.damageSpot) this.damageSpot.destroy();
    this.damageSpot = this.add.circle(x, y, spotRadius, 0xffff00);
  }

  movePlayer(delta) {
    const speed = this.player.speed * (delta / 1000);

    // Check both keyboard and joystick input
    const up = this.cursors.up.isDown || (this.joyStickCursors && this.joyStickCursors.up.isDown);
    const down = this.cursors.down.isDown || (this.joyStickCursors && this.joyStickCursors.down.isDown);
    const left = this.cursors.left.isDown || (this.joyStickCursors && this.joyStickCursors.left.isDown);
    const right = this.cursors.right.isDown || (this.joyStickCursors && this.joyStickCursors.right.isDown);

    if (up) {
      this.player.y -= speed;
      // -(Math.PI/2)
      //this.player.setRotation(-(Math.PI/2));
    }
    if (down) {
      this.player.y += speed;
      // (Math.PI/2)
      //this.player.setRotation(Math.PI/2);
    }
    if (left) {
      this.player.x -= speed;
      // -(Math.PI/)
      //this.player.setRotation(-(Math.PI));
    }
    if (right) {
      this.player.x += speed;
      // 0
      //this.player.setRotation(0);
    }

    // Clamp player within bounds (account for player size)
    console.log(`Player size: (${this.player.width}, ${this.player.height})`);
    const halfWidth = 50;
    const halfHeight = 50;
    this.player.x = Phaser.Math.Clamp(this.player.x, halfWidth, this.canvasWidth - halfWidth);
    this.player.y = Phaser.Math.Clamp(this.player.y, halfHeight, this.canvasHeight - halfHeight);
  }

  shootLaser() {
    if (this.gameWon) return;

    const numberOfLasers = 1 + Math.floor((1 - this.boss.health / this.boss.maxHealth) * 3);

    for (let i = 0; i < numberOfLasers; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const laserSpeed = 200;
      const laser = this.add.circle(this.boss.x, this.boss.y, 10, 0xff0000);
      laser.dx = Math.cos(angle) * laserSpeed;
      laser.dy = Math.sin(angle) * laserSpeed;
      this.boss.lasers.push(laser);
    }
  }

  moveLasers() {
    this.boss.lasers.forEach((laser, index) => {
      laser.x += laser.dx * (1 / 60);
      laser.y += laser.dy * (1 / 60);

      // Remove lasers that go out of bounds
      if (
        laser.x < 0 ||
        laser.x > this.canvasWidth ||
        laser.y < 0 ||
        laser.y > this.canvasHeight
      ) {
        laser.destroy();
        this.boss.lasers.splice(index, 1);
      }
    });
  }

  checkCollisions() {
    // Check laser collisions with player
    this.boss.lasers.forEach((laser, index) => {
      if (this.isCircleRectColliding(laser.x, laser.y, laser.radius, this.player.getBounds())) {
        this.player.health -= 20;
        laser.destroy();
        this.boss.lasers.splice(index, 1);

        if (this.player.health <= 0) {
          this.scene.restart();
        }
      }
    });

    // Check player collision with damage spot
    if (this.damageSpot && this.isCircleRectColliding(this.damageSpot.x, this.damageSpot.y, this.damageSpot.radius, this.player.getBounds())) {
      this.score += 10;
      this.boss.health -= 20;
      this.createDamageSpot();

      if (this.boss.health <= 0) {
        this.gameWin();
      }
    }
  }

  gameWin() {
    this.gameWon = true;

    this.player.visible = false;
    this.boss.visible = false;
    this.boss.lasers.forEach(laser => laser.destroy());
    this.playerHealthBar.visible = false;
    this.damageSpot.visible = false;
    this.bossHealthBar.visible = false;

    this.add.text(this.canvasWidth / 2, this.canvasHeight / 2, '🎉 You Win! 🎉', {
      fontSize: '64px',
      color: '#00ff00',
    }).setOrigin(0.5);

    // Got to main menu after short delay
    this.time.delayedCall(3000, () => {
      // this.scene.start('MainMenu');
      this.scene.start('GameWin');
    });
  }

  isCircleRectColliding(circleX, circleY, circleRadius, rect) {
    const closestX = Phaser.Math.Clamp(circleX, rect.x, rect.x + rect.width);
    const closestY = Phaser.Math.Clamp(circleY, rect.y, rect.y + rect.height);

    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;

    return distanceX * distanceX + distanceY * distanceY < circleRadius * circleRadius;
  }

  drawPlayerHealthBar() {
    this.playerHealthBar.clear();
    this.playerHealthBar.fillStyle(0x444444);
    this.playerHealthBar.fillRect(this.player.x - 30, this.player.y - 50, 60, 10);

    this.playerHealthBar.fillStyle(0xff0000);
    this.playerHealthBar.fillRect(
      this.player.x - 30,
      this.player.y - 50,
      (this.player.health / 100) * 60,
      10
    );
  }

  drawBossHealthBar() {
    this.bossHealthBar.clear();
    const barWidth = 300;
    const barHeight = 20;
    const x = this.canvasWidth / 2 - barWidth / 2;
    const y = 30;

    this.bossHealthBar.fillStyle(0x444444);
    this.bossHealthBar.fillRect(x, y, barWidth, barHeight);

    this.bossHealthBar.fillStyle(0x00ff00);
    this.bossHealthBar.fillRect(x, y, (this.boss.health / this.boss.maxHealth) * barWidth, barHeight);

    this.bossHealthBar.lineStyle(2, 0xffffff);
    this.bossHealthBar.strokeRect(x, y, barWidth, barHeight);
  }
}