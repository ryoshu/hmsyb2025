import Phaser from 'phaser';

export class GameCelestialBlue extends Phaser.Scene {
  constructor() {
    super({ key: 'GameCelestialBlue' });
  }

  preload() {
    // Preload assets if needed (e.g., images for blocks)
  }

  create() {
    const size = 5;
    let selectedBlock = '🟥';

    const targetGrid = Array.from({ length: size }, () => Array(size).fill(''));
    const playerGrid = Array.from({ length: size }, () => Array(size).fill(''));

    // Generate target pattern
    const generateTargetPattern = () => {
      for (let x = 0; x < size; x++) {
        const height = Math.floor(Math.random() * 4) + 1;
        const block = ['🟥', '🟦', '🟩'][Math.floor(Math.random() * 3)];
        for (let y = size - 1; y >= size - height; y--) {
          targetGrid[y][x] = block;
        }
      }
    };

    // Render grid
    const renderGrid = (gridData, startX, startY, isPlayer = false) => {
      const cellSize = 50;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const cell = this.add.rectangle(
            startX + x * cellSize,
            startY + y * cellSize,
            cellSize - 2,
            cellSize - 2,
            0xf0f0f0
          ).setStrokeStyle(1, 0xcccccc);

          const text = this.add.text(
            startX + x * cellSize - cellSize / 2 + 10,
            startY + y * cellSize - cellSize / 2 + 10,
            gridData[y][x],
            { fontSize: '24px', color: '#000' }
          );

          if (isPlayer) {
            cell.setInteractive();
            cell.on('pointerdown', () => placeBlock(x));
          }
        }
      }
    };

    // Place block in player's grid
    const placeBlock = (x) => {
      for (let y = size - 1; y >= 0; y--) {
        if (playerGrid[y][x] === '') {
          playerGrid[y][x] = selectedBlock;
          break;
        }
      }
      renderGrid(playerGrid, 400, 100, true);
    };

    // Check pattern match
    const checkPattern = () => {
      let match = true;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (targetGrid[y][x] !== playerGrid[y][x]) {
            match = false;
          }
        }
      }
      resultText.setText(match ? '🎉 Pattern Matched!' : '❌ Try Again!');
    };

    // UI for block selection
    const createBlockButton = (block, x, y) => {
      const button = this.add.text(x, y, block, {
        fontSize: '32px',
        backgroundColor: '#ccc',
        padding: { x: 10, y: 5 },
      }).setInteractive();

      button.on('pointerdown', () => {
        selectedBlock = block;
        blockButtons.forEach((btn) => btn.setStyle({ backgroundColor: '#ccc' }));
        button.setStyle({ backgroundColor: '#000', color: '#fff' });
      });

      return button;
    };

    const blockButtons = [
      createBlockButton('🟥', 50, 50),
      createBlockButton('🟦', 150, 50),
      createBlockButton('🟩', 250, 50),
    ];

    // Check pattern button
    const checkButton = this.add.text(50, 400, '✅ Check Pattern', {
      fontSize: '24px',
      backgroundColor: '#ccc',
      padding: { x: 10, y: 5 },
    }).setInteractive();

    checkButton.on('pointerdown', checkPattern);

    // Result message
    const resultText = this.add.text(50, 450, '', { fontSize: '24px', color: '#000' });

    // Initialize game
    generateTargetPattern();
    renderGrid(targetGrid, 50, 100);
    renderGrid(playerGrid, 400, 100, true);
  }

  update() {
    // Update logic if needed
  }
}