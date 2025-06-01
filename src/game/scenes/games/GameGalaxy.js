import Phaser from 'phaser';

export class GameGalaxy extends Phaser.Scene {
  constructor() {
    super({ key: 'GameGalaxy' });
    this.gameSize = 8;
    this.cellSize = 75;
    this.gap = 2;
    this.grid = [];
    this.directions = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1]
    };
    this.laserBeams = [];
    this.winText = null;
  }

  create() {
    // Calculate grid dimensions
    const gridWidth = this.gameSize * this.cellSize + (this.gameSize - 1) * this.gap;
    const gridHeight = this.gameSize * this.cellSize + (this.gameSize - 1) * this.gap;
    
    this.cameras.main.setBackgroundColor('#000000');

    // Center the grid
    const startX = (this.cameras.main.width - gridWidth) / 2;
    const startY = (this.cameras.main.height - gridHeight) / 2 + 30; // Adding a bit of space for title
    
    // Create title
    this.add.text(this.cameras.main.width / 2, startY - 80, 'Laser Mirror Puzzle', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.add.text(this.cameras.main.width / 2, startY + 725, 'Reposition mirrors to move light\nfrom start to finish.', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Create grid cells
    for (let i = 0; i < this.gameSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gameSize; j++) {
        const x = startX + j * (this.cellSize + this.gap);
        const y = startY + i * (this.cellSize + this.gap);
        
        // Create cell background
        const cell = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0x333333)
          .setOrigin(0)
          .setInteractive();
        
        // Store cell data
        this.grid[i][j] = {
          rect: cell,
          x: x,
          y: y,
          type: 'empty',
          value: '',
          text: null,
          beam: null
        };
        
        // Add click handler
        cell.on('pointerdown', () => {
          this.rotateMirror(i, j);
        });
      }
    }

    // Create win message but hide it initially
    this.winText = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 500, '🎉 You Win!', {
      fontSize: '24px',
      backgroundColor: '#00ff00',
      color: '#000000',
      padding: { x: 40, y: 20 },
      stroke: '#00cc00',
      strokeThickness: 3
    }).setOrigin(0.5).setVisible(false);

    // Setup the initial game state
    this.setupGame();
    this.fireLaser();
    
    this.classroom = this.add.text(0,0, 'Galaxy', {
      fontSize: '48px',
      color: '#fff',
    });

    // Center the message text
    Phaser.Display.Align.In.Center(
      this.classroom,
      this.add.zone(
        this.cameras.main.width / 2,
        20,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );
  }

  setupGame() {
    // 🔴 Laser source
    this.placeItem(1, 0, 'laser');

    // 🪞 Mirrors
    this.placeItem(1, 2, 'mirror', '/');
    this.placeItem(0, 2, 'mirror', '\\');
    this.placeItem(2, 2, 'mirror', '/');
    this.placeItem(2, 4, 'mirror', '\\');
    this.placeItem(4, 4, 'mirror', '/');
    this.placeItem(4, 6, 'mirror', '/');
    this.placeItem(6, 6, 'mirror', '\\');
    this.placeItem(6, 7, 'mirror', '/');

    // ❌ Obstacles
    this.placeItem(0, 4, 'obstacle');
    this.placeItem(3, 3, 'obstacle');
    this.placeItem(4, 3, 'obstacle');
    this.placeItem(5, 5, 'obstacle');

    // 🎯 Target
    this.placeItem(7, 7, 'target');
  }

  placeItem(row, col, type, value = '') {
    const cell = this.grid[row][col];
    cell.type = type;
    cell.value = value;
    
    // Remove any existing text
    if (cell.text) cell.text.destroy();
    
    // Set cell appearance based on type
    if (type === 'mirror') {
      cell.text = this.add.text(
        cell.x + this.cellSize / 2, 
        cell.y + this.cellSize / 2, 
        value, 
        { fontSize: '24px', color: '#ffffff' }
      ).setOrigin(0.5);
      cell.rect.setFillStyle(0x333333);
    } 
    else if (type === 'laser') {
      cell.text = this.add.text(
        cell.x + this.cellSize / 2, 
        cell.y + this.cellSize / 2, 
        'L', 
        { fontSize: '24px', color: '#ffffff' }
      ).setOrigin(0.5);
      cell.rect.setFillStyle(0xff0000);
    } 
    else if (type === 'target') {
      cell.text = this.add.text(
        cell.x + this.cellSize / 2, 
        cell.y + this.cellSize / 2, 
        'T', 
        { fontSize: '24px', color: '#ffffff' }
      ).setOrigin(0.5);
      cell.rect.setFillStyle(0x00ff00);
    } 
    else if (type === 'obstacle') {
      cell.text = this.add.text(
        cell.x + this.cellSize / 2, 
        cell.y + this.cellSize / 2, 
        'X', 
        { fontSize: '24px', color: '#aaaaaa' }
      ).setOrigin(0.5);
      cell.rect.setFillStyle(0x555555);
    }
  }

  rotateMirror(row, col) {
    const cell = this.grid[row][col];
    
    if (cell.type === 'mirror') {
      // Toggle mirror orientation
      cell.value = cell.value === '/' ? '\\' : '/';
      cell.text.setText(cell.value);
      
      // Recalculate laser path
      this.fireLaser();
    }
  }

  clearBeams() {
    // Remove all beam graphics
    this.laserBeams.forEach(beam => {
      if (beam) beam.destroy();
    });
    this.laserBeams = [];
    
    // Hide win message
    this.winText.setVisible(false);
  }

  fireLaser() {
    this.clearBeams();

    let [row, col] = [1, 0]; // Start position
    let dir = 'right';
    let hitTarget = false;

    while (row >= 0 && col >= 0 && row < this.gameSize && col < this.gameSize) {
      const cell = this.grid[row][col];

      if (cell.type === 'obstacle') break;

      if (cell.type === 'target') {
        // Add beam effect on target
        this.addBeam(row, col);
        hitTarget = true;
        break;
      }

      // Add beam effect
      this.addBeam(row, col);

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

      let [dr, dc] = this.directions[dir];
      row += dr;
      col += dc;
    }

    if (hitTarget) {
      this.gameWin();
    }
  }

  addBeam(row, col) {
    const cell = this.grid[row][col];
    
    // Create yellow overlay for beam
    const beam = this.add.rectangle(
      cell.x, 
      cell.y, 
      this.cellSize, 
      this.cellSize,
      0xffff00,
      0.7
    ).setOrigin(0);
    
    // Store beam reference for later cleanup
    this.laserBeams.push(beam);
    
    // Make sure text is visible over beam
    if (cell.text) {
      cell.text.setDepth(1);
      // If it's on a beam path, set text color to black for better visibility
      cell.text.setColor('#000000');
    }
  }

  gameWin() {
    this.winText.setVisible(true);
    this.winText.setDepth(1000); // Set a high depth value to ensure it's on top

    // Hide win message after 3 seconds
    this.time.delayedCall(3000, () => {
        this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }
}
