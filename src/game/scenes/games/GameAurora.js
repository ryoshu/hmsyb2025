import Phaser from 'phaser';

export class GameAurora extends Phaser.Scene {
  constructor() {
    super({ key: 'GameAurora' });
  }

  preload() {
    // Preload assets if needed
  }

  create() {
    this.wires = ['A', 'B', 'C'];
    this.terminals = ['1', '2', '3'];
    this.correctConnections = [];
    this.currentConnections = [];
    this.selectedWire = null;

    this.add.text(250, 20, 'Wire Circuit Game', { fontSize: '24px', color: '#000' }).setOrigin(0.5);

    this.wireButtons = this.wires.map((wire, index) => {
      return this.createButton(100, 100 + index * 50, wire, () => this.selectWire(wire));
    });

    this.terminalButtons = this.terminals.map((terminal, index) => {
      return this.createButton(400, 100 + index * 50, terminal, () => this.connectToTerminal(terminal));
    });

    this.checkButton = this.createButton(250, 300, 'Check Circuit', () => this.checkCircuit());
    this.resetButton = this.createButton(250, 350, 'Reset Game', () => this.resetGame());

    this.messageText = this.add.text(250, 400, '', { fontSize: '18px', color: '#000' }).setOrigin(0.5);

    this.graphics = this.add.graphics();
    this.resetGame();
  }

  createButton(x, y, label, callback) {
    const button = this.add.text(x, y, label, {
      fontSize: '16px',
      backgroundColor: '#d3d3d3',
      padding: { x: 10, y: 5 },
      color: '#000',
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback)
      .on('pointerover', () => button.setStyle({ backgroundColor: '#a9a9a9' }))
      .on('pointerout', () => button.setStyle({ backgroundColor: '#d3d3d3' }));
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
    this.selectedWire = wire;
    this.wireButtons.forEach(button => {
      button.setStyle({ backgroundColor: button.text === wire ? '#a9a9a9' : '#d3d3d3' });
    });
    this.messageText.setText('');
  }

  connectToTerminal(terminal) {
    if (!this.selectedWire) return;

    this.currentConnections = this.currentConnections.filter(c => c.from !== this.selectedWire);
    this.currentConnections.push({ from: this.selectedWire, to: terminal });

    const isCorrect = this.correctConnections.some(c => c.from === this.selectedWire && c.to === terminal);
    const terminalButton = this.terminalButtons.find(button => button.text === terminal);
    terminalButton.setStyle({ backgroundColor: isCorrect ? '#b6d7a8' : '#f4cccc' });

    this.drawLines();
    this.selectedWire = null;
    this.wireButtons.forEach(button => button.setStyle({ backgroundColor: '#d3d3d3' }));
  }

  checkCircuit() {
    const isCorrect = this.correctConnections.every(correct =>
      this.currentConnections.find(c => c.from === correct.from && c.to === correct.to)
    );
    this.messageText.setText(isCorrect ? '✅ Circuit Complete!' : '❌ Incorrect Wiring');
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