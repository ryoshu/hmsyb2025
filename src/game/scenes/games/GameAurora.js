import Phaser from 'phaser';

export class GameAurora extends Phaser.Scene {
  constructor() {
    super({ key: 'GameAurora' });
  }

  preload() {
    // Preload assets if needed
    this.load.image('background', './assets/pcb_design_short.jpg');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);

    this.add.rectangle(0,0,this.scale.width, this.scale.height, 0x000000, 0.75).setOrigin(0, 0);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.wires = ['A', 'B', 'C'];
    this.terminals = ['1', '2', '3'];
    this.correctConnections = [];
    this.currentConnections = [];
    this.selectedWire = null;

    const heightPadding = 200;

    const yMod = 100;

    this.add.text(centerX, 40 + yMod, 'Wire Circuit Game', { fontSize: '48px', color: '#fff' }).setOrigin(0.5);
    this.instructionsText = this.add.text(
      centerX,
      yMod + 120,
      'Match the wire outputs on the left to the terminal inputs on the right.',
      {
        fontSize: '36px', // Adjust font size if needed
        color: '#fff',
        wordWrap: { width: this.scale.width - 200 }, // Scene width minus 100px padding on both sides
        align: 'center',
      }
    ).setOrigin(0.5);

    this.wireButtons = this.wires.map((wire, index) => {
      return this.createButton(centerX - 400, yMod + 250 + index * heightPadding, wire, () => this.selectWire(wire));
    });

    this.terminalButtons = this.terminals.map((terminal, index) => {
      return this.createButton(centerX + 350, yMod + 250 + index * heightPadding, terminal, () => this.connectToTerminal(terminal));
    });

    // Adjust the positions of the buttons to be next to each other with 3px padding
    const buttonSpacing = 3; // Space between the two buttons
    const buttonWidth = 100; // Approximate width of each button
    const totalWidth = buttonWidth * 2 + buttonSpacing;

    this.checkButton = this.createButton((centerX - totalWidth / 2) - 300, centerY + yMod, 'Check Circuit', () => this.checkCircuit());
    this.resetButton = this.createButton((centerX + totalWidth / 2) - buttonWidth + 150, centerY + yMod, 'Reset Game', () => this.resetGame());

    this.messageText = this.add.text(centerX, centerY - 100 + yMod, '', { fontSize: '48px', color: '#fff' }).setOrigin(0.5);

    this.graphics = this.add.graphics();
    this.resetGame();    
    this.classroom = this.add.text(0,20, 'Aurora', {
      fontSize: '48px',
      color: '#fff',
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
  }

  createButton(x, y, label, callback) {
    const button = this.add.text(x, y, label, {
      fontSize: '36px',
      backgroundColor: '#d3d3d3',
      padding: { x: 25, y: 25 }, // Adjust padding to make the button 50px wide and high
      color: '#000',
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback);
    return button;
  }

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  resetGame() {
    const shuffled = this.shuffle(this.terminals);
    this.correctConnections = this.wires.map((wire, index) => ({
      from: wire,
      to: shuffled[index],
    }));
    this.currentConnections = [];
    this.selectedWire = null;
    this.messageText.setText('');
    this.wireButtons.forEach(button => button.setStyle({ backgroundColor: '#d3d3d3' }));
    this.showColoredSolution();
    this.clearLines();
  }

  selectWire(wire) {
    // Reset all wire buttons to their original color
    this.wireButtons.forEach(button => button.setStyle({ backgroundColor: '#d3d3d3' }));

    // Highlight the selected wire button
    const selectedButton = this.wireButtons.find(button => button.text === wire);
    selectedButton.setStyle({ backgroundColor: '#a9a9a9' }); // Selected state color

    this.selectedWire = wire;
    this.messageText.setText('');
  }

  connectToTerminal(terminal) {
    if (!this.selectedWire) return;

    const colors = ['#ffd966', '#a4c2f4', '#b6d7a8'];

    // Reset the selected wire button to its original color
    const selectedButton = this.wireButtons.find(button => button.text === this.selectedWire);
    if (selectedButton) {
        selectedButton.setStyle({ backgroundColor: '#d3d3d3' });
    }

    this.correctConnections.forEach((conn, index) => {
      const color = colors[index % colors.length];
      const wireButton = this.wireButtons.find(button => button.text === conn.from);
      wireButton.setStyle({ backgroundColor: color });
    });

    // Update the current connections
    this.currentConnections = this.currentConnections.filter(c => c.from !== this.selectedWire);
    this.currentConnections.push({ from: this.selectedWire, to: terminal });

    // Draw the connection lines
    this.drawLines();

    // Clear the selected wire
    this.selectedWire = null;
  }

  checkCircuit() {
    const isCorrect = this.correctConnections.every(correct =>
      this.currentConnections.find(c => c.from === correct.from && c.to === correct.to)
    );
    if(isCorrect) {
      this.gameWin();
    } else {
      this.messageText.setText('❌ Incorrect Wiring');
    }
    
  }

  gameWin() {
    this.messageText.setText("✅ Circuit Complete! ✅\nYou're a circuit master!");

    this.checkButton.visible = false;
    this.resetButton.visible = false;

    // Restart the scene after a short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }

  showColoredSolution() {
    const colors = ['#ffd966', '#a4c2f4', '#b6d7a8'];
    this.wireButtons.forEach(button => button.setStyle({ backgroundColor: '#d3d3d3' }));
    this.terminalButtons.forEach(button => button.setStyle({ backgroundColor: '#d3d3d3' }));
    this.correctConnections.forEach((conn, index) => {
      const color = colors[index % colors.length];
      const wireButton = this.wireButtons.find(button => button.text === conn.from);
      const terminalButton = this.terminalButtons.find(button => button.text === conn.to);
      wireButton.setStyle({ backgroundColor: color });
      terminalButton.setStyle({ backgroundColor: color });
    });
  }

  drawLines() {
    this.clearLines();
    this.currentConnections.forEach(conn => {
      const wireButton = this.wireButtons.find(button => button.text === conn.from);
      const terminalButton = this.terminalButtons.find(button => button.text === conn.to);

      const x1 = wireButton.x + wireButton.width / 2;
      const y1 = wireButton.y + wireButton.height / 2;
      const x2 = terminalButton.x + terminalButton.width / 2;
      const y2 = terminalButton.y + terminalButton.height / 2;

      const isCorrect = this.correctConnections.some(c => c.from === conn.from && c.to === conn.to);
      this.graphics.lineStyle(3, isCorrect ? 0x00ff00 : 0xff0000);
      this.graphics.beginPath();
      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
      this.graphics.strokePath();
    });
  }

  clearLines() {
    this.graphics.clear();
  }
}