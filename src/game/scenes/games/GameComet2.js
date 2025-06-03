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

    // Timer
    this.timerText = this.add.text(10, 490, '', {
      fontSize: '20px',
      color: '#000'
    });
    this.startTime = this.time.now;
    this.reached = new Set();
  }

  update() {
    this.handlePlayerMovement();

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.timerText.setText('Time: ' + elapsed + 's');
  }

  handlePlayerMovement() {
    const speed = 150;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
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
}
