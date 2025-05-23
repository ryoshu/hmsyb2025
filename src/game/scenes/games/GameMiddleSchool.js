import Phaser from 'phaser';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';

export class GameMiddleSchool extends Phaser.Scene {
  constructor() {
    super({ key: 'GameMiddleSchool' });
  }

  preload() {
    // Preload assets if needed
  }

  create() {
    this.canvasWidth = this.sys.game.config.width;
    this.canvasHeight = this.sys.game.config.height;

    // Player setup
    this.player = this.add.rectangle(this.canvasWidth / 2, this.canvasHeight - 50, 60, 60, 0x0000ff);
    this.player.health = 100;
    this.player.speed = 200;

    // Boss setup
    this.boss = this.add.circle(this.canvasWidth / 2, this.canvasHeight / 2, 50, 0x00ff00);
    this.boss.maxHealth = 300;
    this.boss.health = 300;
    this.boss.lasers = [];

    // Damage spot setup
    this.damageSpot = null;
    this.createDamageSpot();

    // Score and game state
    this.score = 0;
    this.gameWon = false;

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();

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

    // this.createVirtualJoystick();
    // this.setCursorDebugInfo();
    // this.updateJoystickState();
  }
  /*
  createVirtualJoystick() {
    this.joyStick = this.plugins.get('rex-virtual-joystick-plugin"').add(
        this,
        Object.assign({}, this.joystickConfig, {
            radius: 32,
            base: this.add.image(0, 0, 'base').setDisplaySize(110, 110),
            thumb: this.add.image(0, 0, 'thumb').setDisplaySize(48, 48)
        })
    ).on('update', this.updateJoystickState, this);
    this.cursorKeys = this.joyStick.createCursorKeys();

    // Listener event to reposition virtual joystick
    // whatever place you click in game area
    this.input.on('pointerdown', pointer => {
        this.joyStick.x = pointer.x;
        this.joyStick.y = pointer.y;
        this.joyStick.base.x = pointer.x;
        this.joyStick.base.y = pointer.y;
        this.joyStick.thumb.x = pointer.x;
        this.joyStick.thumb.y = pointer.y;
    });

    // Listener event to return virtual 
    // joystick to its original position
    this.input.on('pointerup', pointer => {
        this.joyStick.x = this.staticXJsPos;
        this.joyStick.y = this.staticYJsPos;
        this.joyStick.base.x = this.staticXJsPos;
        this.joyStick.base.y = this.staticYJsPos;
        this.joyStick.thumb.x = this.staticXJsPos;
        this.joyStick.thumb.y = this.staticYJsPos;
        this.lastCursorDirection = "center";
        this.setCursorDebugInfo();
    });

  }
  
  setCursorDebugInfo() {
    const force = Math.floor(this.joyStick.force * 100) / 100;
    const angle = Math.floor(this.joyStick.angle * 100) / 100;
    let text = `Direction: ${this.lastCursorDirection}\n`;
    text += `Force: ${force}\n`;
    text += `Angle: ${angle}\n`;
    text += `FPS: ${this.sys.game.loop.actualFps}\n`;
    this.cursorDebugText.setText(text);
  }

  updateJoystickState() {
    let direction = '';
    for (let key in this.cursorKeys) {
        if (this.cursorKeys[key].isDown) {
          direction += key;
        }
    }

    // If no direction if provided then stop 
    // the player animations and exit the method
    if(direction.length === 0) { 
        this.stopPlayerAnimations();
        return;
    }

    // If last cursor direction is different
    //  the stop all player animations
    if (this.lastCursorDirection !== direction) {
        this.stopPlayerAnimations();
    }
    
    // Set the new cursor direction
    this.lastCursorDirection = direction;

    // Handle the player moving
    this.movePlayer();

    // Set debug info about the cursor
    this.setCursorDebugInfo();
  }
  */
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
    const minDistance = this.boss.radius + spotRadius + 100;

    do {
      x = Phaser.Math.Between(spotRadius, this.canvasWidth - spotRadius);
      y = Phaser.Math.Between(spotRadius, this.canvasHeight - spotRadius);
    } while (Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y) < minDistance);

    if (this.damageSpot) this.damageSpot.destroy();
    this.damageSpot = this.add.circle(x, y, spotRadius, 0xffff00);
  }

  movePlayer(delta) {
    const speed = this.player.speed * (delta / 1000);

    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;
    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown) this.player.x += speed;

    // Clamp player within bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, this.canvasWidth);
    this.player.y = Phaser.Math.Clamp(this.player.y, 0, this.canvasHeight);
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
        this.gameWon = true;
        this.add.text(this.canvasWidth / 2, this.canvasHeight / 2, '🎉 You Win! 🎉', {
          fontSize: '64px',
          color: '#00ff00',
        }).setOrigin(0.5);
      }
    }
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