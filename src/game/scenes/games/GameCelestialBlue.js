import Phaser from 'phaser';

export class GameCelestialBlue extends Phaser.Scene {
  constructor() {
    super({ key: 'GameCelestialBlue' });
  }

  preload() {
    // Preload assets if needed (e.g., images for blocks)
  }

  create() {
    // Add message text
    this.message = this.add.text(0, 0, 'Match the block pattern in the grid!', {
      fontSize: '48px',
      color: '#000',
    });
    
    // Center the message text
    Phaser.Display.Align.In.Center(
      this.message,
      this.add.zone(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );
    
    const size = 5;
    let selectedBlock = '🟥';
    
    // Center the message text
    Phaser.Display.Align.In.Center(
      this.message,
      this.add.zone(
        this.cameras.main.width / 2,
        100,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );

    this.classroom = this.add.text(0,0, 'Celestial Blue', {
      fontSize: '48px',
      color: '#000000',
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

    const targetGrid = Array.from({ length: size }, () => Array(size).fill(''));
    const playerGrid = Array.from({ length: size }, () => Array(size).fill(''));

    const sceneWidth = this.scale.width;
    const sceneHeight = this.scale.height;

    const gridWidth = size * 50; // Each cell is 50px wide
    const gridHeight = size * 50; // Each cell is 50px tall

    const targetGridX = (sceneWidth - gridWidth) / 2 - 325; // Centered horizontally, shifted left
    const targetGridY = (sceneHeight - gridHeight) / 2 -250; // Centered vertically

    const playerGridX = (sceneWidth - gridWidth) / 2 + 250; // Centered horizontally, shifted right
    const playerGridY = targetGridY;

    const uiStartX = (sceneWidth - 300) / 2; // Center UI horizontally
    const uiStartY = (sceneHeight - gridHeight) / 2 + gridHeight + 50; // Below the grids

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
      const cellSize = 80;
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
            startX + x * cellSize,
            startY + y * cellSize,
            gridData[y][x],
            { fontSize: '48px', color: '#000', align: 'center' }
          );

          // Center the text within the cell
          text.setOrigin(0.5, 0.5);

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
      renderGrid(playerGrid, playerGridX, playerGridY, true);
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

      if(match) {
        this.gameWin();
      } else {
        this.resultText.setText('❌ Try Again!');
        //
        //  Reset the game after 1 second
        this.time.delayedCall(1000, () => {
          this.scene.restart();
        });
      }
      
    };

    // UI for block selection
    const createBlockButton = (block, x, y) => {
      const button = this.add.text(x, y, block, {
        fontSize: '32px',
        backgroundColor: '#ccc',
        padding: { x: 10, y: 5 },
        align: 'center',
      }).setInteractive();

      // Center the text within the button
      button.setOrigin(0.5, 0.5);

      // Adjust the position to account for centering
      button.setPosition(x + button.width / 2, y + button.height / 2);

      button.on('pointerdown', () => {
        selectedBlock = block;
        blockButtons.forEach((btn) => btn.setStyle({ backgroundColor: '#ccc' }));
        button.setStyle({ backgroundColor: '#000', color: '#fff' });
      });

      return button;
    };

    const blockButtonWidth = 50; // Approximate width of each button
    const buttonSpacing = 50; // Space between buttons
    const totalWidth = (blockButtonWidth * 3) + (buttonSpacing * 2); // Total width of all buttons and spaces
    const startX = (this.cameras.main.width - totalWidth) / 2; // Starting X position to center the buttons

    const blockButtons = [
      createBlockButton('🟥', startX, uiStartY),
      createBlockButton('🟦', startX + blockButtonWidth + buttonSpacing, uiStartY),
      createBlockButton('🟩', startX + (blockButtonWidth + buttonSpacing) * 2, uiStartY),
    ];

    // Check pattern button
    const checkButton = this.add.text(0, 0, '✅ Check Pattern', {
      fontSize: '24px',
      backgroundColor: '#ccc',
      padding: { x: 10, y: 5 },
    }).setInteractive();

    // Dynamically center the button horizontally
    checkButton.setOrigin(0.5, 0.5); // Center the button's origin
    checkButton.setPosition(
      this.cameras.main.width / 2, // Center horizontally based on the scene width
      uiStartY + 100 // Adjust vertical position as needed
    );

    // Add interaction for the button
    checkButton.on('pointerdown', checkPattern);

    // Result message
    this.resultText = this.add.text(0, 0, '', { fontSize: '24px', color: '#000' });

    // Dynamically center the resultText horizontally
    this.resultText.setOrigin(0.5, 0); // Set origin to center horizontally
    this.resultText.setPosition(
      this.cameras.main.width / 2, // Center horizontally based on the camera width
      this.cameras.main.height / 2 + 75 // Adjust vertical position as needed
    );

    // Initialize game
    generateTargetPattern();
    renderGrid(targetGrid, targetGridX, targetGridY);
    renderGrid(playerGrid, playerGridX, playerGridY, true);
  }

  gameWin() {
    this.resultText.setText('🎉 Pattern Matched! You win!');

    // Got to main menu after short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }

  update() {
    // Update logic if needed
  }
}