import Phaser from 'phaser';

export class GameGalaxy extends Phaser.Scene {
  constructor() {
    super({ key: 'GameGalaxy' });
  }

  preload() {
    // Preload assets if needed
  }

  create() {
    // Game setup
    this.gameSize = 8;
    this.cellSize = 50;
    this.grid = [];
    this.directions = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    };

    this.winMessage = null;
    this.hasWon = false;

    // Create grid
    this.createGrid();

    // Place items
    this.placeItem(1, 0, 'laser');
    this.placeItem(1, 2, 'mirror', '/');
    this.placeItem(0, 2, 'mirror', '\\');
    this.placeItem(2, 2, 'mirror', '/');
    this.placeItem(2, 4, 'mirror', '\\');
    this.placeItem(4, 4, 'mirror', '/');
    this.placeItem(4, 6, 'mirror', '/');
    this.placeItem(6, 6, 'mirror', '\\');
    this.placeItem(6, 7, 'mirror', '/');
    this.placeItem(0, 4, 'obstacle');
    this.placeItem(3, 3, 'obstacle');
    this.placeItem(4, 3, 'obstacle');
    this.placeItem(5, 5, 'obstacle');
    this.placeItem(7, 7, 'target');

    // Fire laser initially
    this.fireLaser();

    // Add click interaction for rotating mirrors
    this.input.on('pointerdown', (pointer) => {
      const col = Math.floor(pointer.x / this.cellSize);
      const row = Math.floor(pointer.y / this.cellSize);
      if (row >= 0 && row < this.gameSize && col >= 0 && col < this.gameSize) {
        const cell = this.grid[row][col];
        if (cell.type === 'mirror') {
          this.rotateMirror(cell);
        }
      }
    });
  }

  createGrid() {
    for (let row = 0; row < this.gameSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gameSize; col++) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const cell = this.add.rectangle(
          x + this.cellSize / 2,
          y + this.cellSize / 2,
          this.cellSize - 2,
          this.cellSize - 2,
          0x333333
        );
        cell.setStrokeStyle(1, 0xffffff);
        this.grid[row][col] = { type: 'empty', value: '', rect: cell };
      }
    }
  }

  placeItem(row, col, type, value = '') {
    const cell = this.grid[row][col];
    cell.type = type;
    cell.value = value;

    if (type === 'laser') {
      cell.rect.setFillStyle(0xff0000);
    } else if (type === 'mirror') {
      cell.rect.setFillStyle(0x5555ff);
      cell.text = this.add.text(
        col * this.cellSize + this.cellSize / 2,
        row * this.cellSize + this.cellSize / 2,
        value,
        { fontSize: '24px', color: '#ffffff' }
      ).setOrigin(0.5);
    } else if (type === 'target') {
      cell.rect.setFillStyle(0x00ff00);
    } else if (type === 'obstacle') {
      cell.rect.setFillStyle(0x555555);
    }
  }

  rotateMirror(cell) {
    if (cell.type === 'mirror') {
      cell.value = cell.value === '/' ? '\\' : '/';
      cell.text.setText(cell.value);
      this.fireLaser();
    }
  }

  clearBeams() {
    this.grid.flat().forEach((cell) => {
      if (cell.type === 'beam') {
        cell.type = 'empty';
        cell.rect.setFillStyle(0x333333);
      }
    });
    if (this.winMessage) {
      this.winMessage.destroy();
      this.winMessage = null;
    }
    this.hasWon = false;
  }

  fireLaser() {
    this.clearBeams();

    let row = 1;
    let col = 0;
    let dir = 'right';

    while (row >= 0 && col >= 0 && row < this.gameSize && col < this.gameSize) {
      const cell = this.grid[row][col];

      if (cell.type === 'obstacle') break;

      if (cell.type === 'target') {
        cell.rect.setFillStyle(0xffff00);
        this.showWin();
        break;
      }

      if (cell.type === 'mirror') {
        const mirror = cell.value;
        if (mirror === '/') {
          if (dir === 'right') dir = 'up';
          else if (dir === 'left') dir = 'down';
          else if (dir === 'up') dir = 'right';
          else if (dir === 'down') dir = 'left';
        } else if (mirror === '\\') {
          if (dir === 'right') dir = 'down';
          else if (dir === 'left') dir = 'up';
          else if (dir === 'up') dir = 'left';
          else if (dir === 'down') dir = 'right';
        }
      }

      cell.type = 'beam';
      cell.rect.setFillStyle(0xffff00);
      const [dr, dc] = this.directions[dir];
      row += dr;
      col += dc;
    }
  }

  showWin() {
    if (!this.hasWon) {
      this.hasWon = true;
      this.winMessage = this.add.text(
        this.gameSize * this.cellSize / 2,
        this.gameSize * this.cellSize / 2,
        '🎉 You Win! 🎉',
        { fontSize: '32px', color: '#00ff00', backgroundColor: '#000000' }
      ).setOrigin(0.5);
    }
  }
}