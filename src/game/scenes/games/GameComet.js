import Phaser from 'phaser';

export class GameComet extends Phaser.Scene {
  constructor() {
    super({ key: 'GameComet' });
  }

  preload() {
    // Preload assets if needed
  }

  create() {
    // Game 1: Lighting the fire
    this.attempts = 0;
    this.maxStrikes = Phaser.Math.Between(2, 6);

    this.add.text(300, 50, 'Can You Light the Fire?', { fontSize: '24px', color: '#000' }).setOrigin(0.5);
    this.message = this.add.text(300, 150, 'Keep trying...', { fontSize: '18px', color: '#000' }).setOrigin(0.5);

    this.fireIcon = this.add.text(300, 200, '', { fontSize: '60px', color: '#ff9900' }).setOrigin(0.5);

    this.fireButton = this.add.text(300, 300, '🔥 Strike Match', {
      fontSize: '18px',
      backgroundColor: '#ff9900',
      padding: { x: 15, y: 10 },
      color: '#fff',
      borderRadius: 5,
    })
      .setInteractive()
      .on('pointerdown', this.strikeMatch, this);

    // Transition overlays
    this.leftOverlay = this.add.rectangle(0, 300, 400, 600, 0x000000).setOrigin(0, 0.5).setAlpha(0);
    this.rightOverlay = this.add.rectangle(400, 300, 400, 600, 0x000000).setOrigin(0, 0.5).setAlpha(0);

    // Game 2: Connecting battery to bulb
    this.game2Container = this.add.container(0, 0).setVisible(false);

    this.game2Container.add([
      this.add.text(300, 50, 'Connect Battery to Bulb', { fontSize: '24px', color: '#000' }).setOrigin(0.5),
      this.add.text(300, 100, 'Click a battery terminal, then the matching lightbulb terminal', { fontSize: '16px', color: '#000' }).setOrigin(0.5),
    ]);

    this.lineGraphics = this.add.graphics();
    this.game2Container.add(this.lineGraphics);

    this.bulb = this.add.rectangle(300, 200, 160, 100, 0xffeaa7);
    this.battery = this.add.rectangle(300, 400, 160, 100, 0xdfe6e9);
    this.game2Container.add([this.bulb, this.battery]);

    this.bulbTerminals = {
      positive: this.add.circle(270, 180, 10, 0x2d3436).setInteractive(),
      negative: this.add.circle(330, 180, 10, 0x2d3436).setInteractive(),
    };
    this.batteryTerminals = {
      positive: this.add.circle(270, 380, 10, 0x2d3436).setInteractive(),
      negative: this.add.circle(330, 380, 10, 0x2d3436).setInteractive(),
    };
    this.game2Container.add(Object.values(this.bulbTerminals));
    this.game2Container.add(Object.values(this.batteryTerminals));

    this.winText = this.add.text(300, 300, '🎉 You Win! 🎉', { fontSize: '32px', color: 'green' }).setOrigin(0.5).setVisible(false);
    this.game2Container.add(this.winText);

    this.selectedTerminal = null;
    this.connections = { positive: false, negative: false };

    this.setupTerminalListeners();
  }

  strikeMatch() {
    this.attempts++;
    if (this.attempts >= this.maxStrikes) {
      this.message.setText('🔥 Fire is lit!');
      this.fireIcon.setText('🔥🔥🔥');
      this.fireButton.disableInteractive().setStyle({ backgroundColor: '#888' });
      this.startTransition();
    } else {
      this.message.setText(`You struck the match... (${this.attempts})`);
    }
  }

  startTransition() {
    this.tweens.add({
      targets: [this.leftOverlay, this.rightOverlay],
      alpha: 1,
      duration: 600,
      onComplete: () => {
        this.fireButton.setVisible(false);
        this.message.setVisible(false);
        this.fireIcon.setVisible(false);
        this.game2Container.setVisible(true);

        this.tweens.add({
          targets: [this.leftOverlay, this.rightOverlay],
          alpha: 0,
          duration: 600,
        });
      },
    });
  }

  setupTerminalListeners() {
    Object.values(this.batteryTerminals).forEach((terminal) => {
      terminal.on('pointerdown', () => {
        if (!this.selectedTerminal) {
          this.selectedTerminal = terminal;
          terminal.setFillStyle(0x00b894);
        }
      });
    });

    Object.values(this.bulbTerminals).forEach((terminal) => {
      terminal.on('pointerdown', () => {
        if (this.selectedTerminal) {
          if (this.selectedTerminal === this.batteryTerminals[terminal.name]) {
            this.drawLineBetween(this.selectedTerminal, terminal);
            this.connections[terminal.name] = true;
            this.checkWin();
          } else {
            alert('Wrong terminal! Try again.');
          }
          this.selectedTerminal.setFillStyle(0x2d3436);
          this.selectedTerminal = null;
        }
      });
    });
  }

  drawLineBetween(start, end) {
    this.lineGraphics.lineStyle(3, 0x0984e3);
    this.lineGraphics.beginPath();
    this.lineGraphics.moveTo(start.x, start.y);
    this.lineGraphics.lineTo(end.x, end.y);
    this.lineGraphics.strokePath();
  }

  checkWin() {
    if (this.connections.positive && this.connections.negative) {
      this.winText.setVisible(true);
    }
  }
}