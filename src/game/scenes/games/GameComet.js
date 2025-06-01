// Full updated Phaser scene with robotic arm level including win logic, goal drop zone, improved controls
import Phaser from 'phaser';

// import matter-js
import Matter, {
  World,
  Engine,
  Bodies,
  Mouse,
  MouseConstraint,
  Runner,
  Render
} from "matter-js";


export class GameComet extends Phaser.Scene {
  constructor() {
    super('GameComet');
    this.gameState = 'fire';
    this.attempts = 0;
    this.maxStrikes = 0;
    this.selectedTerminal = null;
    this.connections = { positive: false, negative: false };
    this.armControl = { baseUp: false, baseDown: false, jointUp: false, jointDown: false };
  }

  preload() {
    this.load.image('goal', 'assets/goal.png');
    this.load.image('block', 'assets/block.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    this.maxStrikes = Math.floor(Math.random() * 5) + 2;

    this.createFireGame(centerX, centerY);
    this.createCircuitGame(centerX, centerY);
    this.toggleGameVisibility('fire');
  }

  update() {
    if (this.block && this.goalZone && Phaser.Geom.Intersects.RectangleToRectangle(this.block.getBounds(), this.goalZone.getBounds())) {
      if (!this.winShown) {
        this.showMessage('✅ Block placed! You win!');
        this.winShown = true;
        this.time.delayedCall(2000, () => {
          this.scene.restart();
        });
      }
    }

    if (this.arm1 && this.arm2) {
      if (this.armControl.baseUp) {
        this.arm1.setAngularVelocity(-0.05);
      } else if (this.armControl.baseDown) {
        this.arm1.setAngularVelocity(0.05);
      } else {
        this.arm1.setAngularVelocity(0);
      }

      if (this.armControl.jointUp) {
        this.arm2.setAngularVelocity(-0.05);
      } else if (this.armControl.jointDown) {
        this.arm2.setAngularVelocity(0.05);
      } else {
        this.arm2.setAngularVelocity(0);
      }
    }
  }

  createFireGame(centerX, centerY) {
    this.fireGameGroup = this.add.group();

    const title = this.add.text(centerX, centerY - 200, 'Can You Light the Fire?', {
      fontSize: '32px', color: '#fff'
    }).setOrigin(0.5);

    this.matchBtn = this.add.rectangle(centerX, centerY - 50, 180, 50, 0x000000)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.strikeMatch());

    const matchText = this.add.text(centerX, centerY - 50, '🔥 Strike Match', {
      fontSize: '18px', color: '#fff'
    }).setOrigin(0.5);

    this.messageText = this.add.text(centerX, centerY + 50, 'Keep trying...', {
      fontSize: '24px', color: '#fff'
    }).setOrigin(0.5);

    this.fireIcon = this.add.text(centerX, centerY + 120, '', {
      fontSize: '60px'
    }).setOrigin(0.5);

    this.fireGameGroup.addMultiple([title, matchText, this.messageText, this.fireIcon]);
  }

  createCircuitGame(centerX, centerY) {
    this.circuitGameGroup = this.add.group();
    const background = this.add.rectangle(centerX, centerY, 400, 500, 0xf9f9f9)
      .setStrokeStyle(2, 0xcccccc);

    const title = this.add.text(centerX, centerY - 350, 'Connect Battery to Bulb', {
      fontSize: '32px', color: '#fff'
    }).setOrigin(0.5);

    const instructions = this.add.text(centerX, centerY - 300, 'Click a battery terminal, then the matching lightbulb terminal', {
      fontSize: '24px', color: '#fff', align: 'center', wordWrap: { width: 800 }
    }).setOrigin(0.5);

    this.lineGraphics = this.add.graphics();

    this.circuitGameGroup.addMultiple([background, title, instructions, this.lineGraphics]);
    this.createComponent(centerX, centerY - 150, 'Lightbulb', 0xffeaa7, 'bulb');
    this.createComponent(centerX, centerY + 100, 'Battery', 0xdfe6e9, 'battery');
  }

  createComponent(x, y, label, color, side) {
    const component = this.add.rectangle(x, y, 180, 120, color).setStrokeStyle(2, 0x333333);
    const labelText = this.add.text(x, y - 30, label, { fontSize: '32px', color: '#000' }).setOrigin(0.5);

    const xOffset = 40;
    const posLabel = this.add.text(x - xOffset, y + 5, '+', { fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const posTerminal = this.add.circle(x - xOffset, y + 30, 12.5, 0x2d3436)
      .setInteractive().setData({ type: 'positive', side });

    const negLabel = this.add.text(x + xOffset, y + 5, '−', { fontSize: '32px', color: '#000' }).setOrigin(0.5);
    const negTerminal = this.add.circle(x + xOffset, y + 30, 12.5, 0x2d3436)
      .setInteractive().setData({ type: 'negative', side });

    [posTerminal, negTerminal].forEach(t => {
      t.on('pointerdown', () => this.handleTerminalClick(t));
    });

    this.circuitGameGroup.addMultiple([component, labelText, posLabel, posTerminal, negLabel, negTerminal]);
  }

  strikeMatch() {
    this.attempts++;
    if (this.attempts >= this.maxStrikes) {
      this.messageText.setText('🔥 Fire is lit!');
      this.fireIcon.setText('🔥🔥🔥');
      this.matchBtn.disableInteractive();

      this.time.delayedCall(1000, () => {
        this.cameras.main.fadeOut(800);
        this.time.delayedCall(900, () => {
          this.toggleGameVisibility('circuit');
          this.cameras.main.fadeIn(800);
        });
      });
    } else {
      this.messageText.setText(`You struck the match... (${this.attempts})`);
    }
  }

  handleTerminalClick(terminal) {
    const data = { type: terminal.getData('type'), side: terminal.getData('side') };
    if (!this.selectedTerminal && data.side === 'battery') {
      this.selectedTerminal = terminal;
      terminal.setFillStyle(0x00b894);
    } else if (this.selectedTerminal && data.side === 'bulb') {
      if (data.type === this.selectedTerminal.getData('type')) {
        this.drawLineBetween(this.selectedTerminal, terminal);
        this.connections[data.type] = true;
        this.checkWin();
      } else {
        this.showMessage('Wrong terminal! Try again.');
      }
      this.selectedTerminal.setFillStyle(0x2d3436);
      this.selectedTerminal = null;
    }
  }

  drawLineBetween(start, end) {
    this.lineGraphics.lineStyle(3, 0x0984e3).beginPath();
    this.lineGraphics.moveTo(start.x, start.y);
    this.lineGraphics.lineTo(end.x, end.y);
    this.lineGraphics.strokePath();
  }

  showMessage(text) {
    const msg = this.add.text(300, 300, text, {
      fontSize: '20px', backgroundColor: '#000', color: '#fff', padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => msg.destroy());
  }

  checkWin() {
    if (this.connections.positive && this.connections.negative) {
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      const winOverlay = this.add.rectangle(centerX, centerY, 400, 500, 0x00ff00);
      const winText = this.add.text(centerX, centerY, '🎉 You Win! 🎉', {
        fontSize: '32px', color: 'green'
      }).setOrigin(0.5);

      this.cameras.main.flash(1000, 255, 255, 200);

      this.time.delayedCall(3000, () => {
        winOverlay.destroy();
        winText.destroy();
        this.startRoboticArmGame(centerX, centerY);
      });
    }
  }

  startRoboticArmGame(centerX, centerY) {
    
    
    this.toggleGameVisibility(null);
    this.matter.world.setBounds();
    this.createRoboticArmGame(centerX, centerY);
  }

  createRoboticArmGame(centerX, centerY) {
    this.roboticGroup = this.add.group();
    const base = this.matter.add.rectangle(centerX, centerY + 100, 40, 100, { isStatic: true });
    this.arm1 = this.matter.add.rectangle(centerX, centerY, 150, 20, { chamfer: { radius: 10 } });
    this.arm2 = this.matter.add.rectangle(centerX + 75, centerY, 100, 20, { chamfer: { radius: 10 } });
    this.block = this.matter.add.image(centerX + 250, centerY + 50, 'block');

    this.goalZone = this.matter.add.image(centerX + 300, centerY + 200, 'goal', undefined, { isStatic: true });
    this.goalZone.setDisplaySize(80, 80);

    this.matter.add.constraint(base, this.arm1, 0, 0.9, {
      pointA: { x: 0, y: -50 },
      pointB: { x: -75, y: 0 }
    });
    this.matter.add.constraint(this.arm1, this.arm2, 0, 0.9, {
      pointA: { x: 75, y: 0 },
      pointB: { x: -50, y: 0 }
    });

    const baseUp = this.add.text(50, 100, '▲', { fontSize: '32px' }).setInteractive();
    const baseDown = this.add.text(50, 140, '▼', { fontSize: '32px' }).setInteractive();
    const jointUp = this.add.text(100, 100, '▲', { fontSize: '32px' }).setInteractive();
    const jointDown = this.add.text(100, 140, '▼', { fontSize: '32px' }).setInteractive();

    baseUp.on('pointerdown', () => this.armControl.baseUp = true);
    baseUp.on('pointerup', () => this.armControl.baseUp = false);
    baseDown.on('pointerdown', () => this.armControl.baseDown = true);
    baseDown.on('pointerup', () => this.armControl.baseDown = false);
    jointUp.on('pointerdown', () => this.armControl.jointUp = true);
    jointUp.on('pointerup', () => this.armControl.jointUp = false);
    jointDown.on('pointerdown', () => this.armControl.jointDown = true);
    jointDown.on('pointerup', () => this.armControl.jointDown = false);

    this.roboticGroup.addMultiple([baseUp, baseDown, jointUp, jointDown]);
  }

  toggleGameVisibility(visibleGame) {
    if (visibleGame === 'fire') {
      this.fireGameGroup.setVisible(true);
      this.circuitGameGroup?.setVisible(false);
      this.gameState = 'fire';
    } else if (visibleGame === 'circuit') {
      this.fireGameGroup.setVisible(false);
      this.circuitGameGroup.setVisible(true);
      this.gameState = 'circuit';
    } else {
      this.fireGameGroup.setVisible(false);
      this.circuitGameGroup.setVisible(false);
    }
  }
}