import Phaser from 'phaser';


export class GameComet extends Phaser.Scene {
  constructor() {
    super('GameComet');
    
    // Game state variables
    this.gameState = 'fire'; // Possible states: 'fire', 'transition', 'circuit'
    this.attempts = 0;
    this.maxStrikes = 0;
    this.selectedTerminal = null;
    this.connections = { positive: false, negative: false };
  }

  preload() {
    // Load assets
    this.load.image('match-btn', 'https://cdn.jsdelivr.net/gh/photonstorm/phaser3-examples@master/public/assets/sprites/button-green.png');
  }

  create() {
    // Set the background color to black
    this.cameras.main.setBackgroundColor('#000000');

    // Center the game objects
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Adjust positions of game elements
    this.maxStrikes = Math.floor(Math.random() * 5) + 2;

    // Create fire game objects
    this.createFireGame(centerX, centerY);

    // Create circuit game objects (initially hidden)
    this.createCircuitGame(centerX, centerY);

    // Initially show only the fire game
    this.toggleGameVisibility('fire');
  }

  update() {
    // Any per-frame updates would go here
  }

  // Create the fire lighting game
  createFireGame(centerX, centerY) {
    this.fireGameGroup = this.add.group();

    // Title
    const title = this.add.text(centerX, centerY - 200, 'Can You Light the Fire?', {
      fontSize: '32px',
      color: '#fff',
      align: 'center'
    }).setOrigin(0.5);

    // Strike match button
    this.matchBtn = this.add.image(centerX, centerY - 50, 'match-btn')
      .setInteractive()
      .setScale(2)
      .on('pointerdown', () => this.strikeMatch());

    // Add match text
    const matchText = this.add.text(centerX, centerY - 50, '🔥 Strike Match', {
      fontSize: '18px',
      color: '#fff'
    }).setOrigin(0.5);

    // Message text
    this.messageText = this.add.text(centerX, centerY + 50, 'Keep trying...', {
      fontSize: '24px',
      color: '#fff'
    }).setOrigin(0.5);

    // Fire icon
    this.fireIcon = this.add.text(centerX, centerY + 120, '', {
      fontSize: '60px',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Add all objects to the group
    this.fireGameGroup.add(title);
    this.fireGameGroup.add(this.matchBtn);
    this.fireGameGroup.add(matchText);
    this.fireGameGroup.add(this.messageText);
    this.fireGameGroup.add(this.fireIcon);
  }

  // Create the circuit connection game
  createCircuitGame(centerX, centerY) {
    this.circuitGameGroup = this.add.group();

    // Add background
    const background = this.add.rectangle(centerX, centerY, 400, 500, 0xf9f9f9)
      .setStrokeStyle(2, 0xcccccc);

    // Title
    const title = this.add.text(centerX, centerY - 350, 'Connect Battery to Bulb', {
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(centerX, centerY - 300, 'Click a battery terminal, then the matching lightbulb terminal', {
      fontSize: '24px',
      color: '#fff',
      align: 'center',
      wordWrap: { width: 800 }
    }).setOrigin(0.5);

    // Graphics for lines
    this.lineGraphics = this.add.graphics();

    // Add objects to group
    this.circuitGameGroup.add(background);
    this.circuitGameGroup.add(title);
    this.circuitGameGroup.add(instructions);
    this.circuitGameGroup.add(this.lineGraphics);

    // Create components
    this.createComponent(centerX, centerY - 150, 'Lightbulb', 0xffeaa7, 'bulb');
    this.createComponent(centerX, centerY + 100, 'Battery', 0xdfe6e9, 'battery');
  }

  // Create component with terminals
  createComponent(x, y, label, color, side) {
    // Component background
    const component = this.add.rectangle(x, y, 180, 120, color)
      .setStrokeStyle(2, 0x333333);

    // Component label
    const componentLabel = this.add.text(x, y - 30, label, {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#000'
    }).setOrigin(0.5);

    // Create terminals
    const xOffset = 40;

    // Positive terminal
    const positiveLabel = this.add.text(x - xOffset, y + 5, '+', {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#000'
    }).setOrigin(0.5);

    const positiveTerminal = this.add.circle(x - xOffset, y + 30, 12.5, 0x2d3436)
      .setInteractive()
      .setData({ type: 'positive', side: side }); // Attach 'side' data

    // Negative terminal
    const negativeLabel = this.add.text(x + xOffset, y + 5, '−', {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#000'
    }).setOrigin(0.5);

    const negativeTerminal = this.add.circle(x + xOffset, y + 30, 12.5, 0x2d3436)
      .setInteractive()
      .setData({ type: 'negative', side: side }); // Attach 'side' data

    // Add click listeners to terminals
    [positiveTerminal, negativeTerminal].forEach(terminal => {
      terminal.on('pointerdown', () => {
        this.handleTerminalClick(terminal);
      });
    });

    // Add all elements to circuit group
    this.circuitGameGroup.add(component);
    this.circuitGameGroup.add(componentLabel);
    this.circuitGameGroup.add(positiveLabel);
    this.circuitGameGroup.add(positiveTerminal);
    this.circuitGameGroup.add(negativeLabel);
    this.circuitGameGroup.add(negativeTerminal);
  }

  // Fire game - Strike match logic
  strikeMatch() {
    this.attempts++;

    if (this.attempts >= this.maxStrikes) {
      this.messageText.setText('🔥 Fire is lit!');
      this.fireIcon.setText('🔥🔥🔥');
      this.matchBtn.disableInteractive();
      this.matchBtn.setTint(0x888888);

      // Transition to circuit game after delay
      this.time.delayedCall(1000, () => {
        // Fade out effect
        this.cameras.main.fadeOut(800, 0, 0, 0);

        this.time.delayedCall(900, () => {
          this.toggleGameVisibility('circuit');
          // Fade back in
          this.cameras.main.fadeIn(800, 0, 0, 0);
        });
      });

    } else {
      this.messageText.setText(`You struck the match... (${this.attempts})`);
    }
  }

  // Circuit game - Terminal connection logic
  handleTerminalClick(terminal) {
    const terminalData = terminal.getData('type') ? { 
      type: terminal.getData('type'), 
      side: terminal.getData('side') 
    } : null;

    if (!this.selectedTerminal) {
      if (terminalData && terminalData.side === 'battery') {
        this.selectedTerminal = terminal;
        terminal.setFillStyle(0x00b894); // Green to show selection
      }
    } else {
      if (terminalData && terminalData.side === 'bulb') {
        if (terminalData.type === this.selectedTerminal.getData('type')) {
          this.drawLineBetween(this.selectedTerminal, terminal);
          this.connections[terminalData.type] = true;
          this.checkWin();
        } else {
          this.showMessage('Wrong terminal! Try again.');
        }

        this.selectedTerminal.setFillStyle(0x2d3436); // Reset to black
        this.selectedTerminal = null;
      }
    }
  }

  // Draw a line between two terminals
  drawLineBetween(startTerminal, endTerminal) {
    const startX = startTerminal.x;
    const startY = startTerminal.y;
    const endX = endTerminal.x;
    const endY = endTerminal.y;

    // Draw line
    this.lineGraphics.lineStyle(3, 0x0984e3);
    this.lineGraphics.beginPath();
    this.lineGraphics.moveTo(startX, startY);
    this.lineGraphics.lineTo(endX, endY);
    this.lineGraphics.closePath();
    this.lineGraphics.strokePath();
  }

  // Show message for a short time
  showMessage(text) {
    const message = this.add.text(300, 300, text, {
      fontSize: '20px',
      backgroundColor: '#000',
      color: '#fff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Make it disappear after a short delay
    this.time.delayedCall(1500, () => {
      message.destroy();
    });
  }

  // Check if player has won the circuit game
  checkWin() {
    if (this.connections.positive && this.connections.negative) {
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      // Create win screen
      //const winOverlay = this.add.rectangle(centerX, centerY, 400, 500, 0x00ff00, 0.2);
      const winOverlay = this.add.rectangle(centerX, centerY, 400, 500, 0x00ff00);

      const winText = this.add.text(centerX, centerY, '🎉 You Win! 🎉', {
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'green'
      }).setOrigin(0.5); // Center the text

      // Make lightbulb glow
      this.cameras.main.flash(1000, 255, 255, 200);

      // Got to main menu after short delay
      this.time.delayedCall(3000, () => {
        this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
      });
    }
  }

  // Toggle between fire and circuit games
  toggleGameVisibility(visibleGame) {
    if (visibleGame === 'fire') {
      this.fireGameGroup.setVisible(true);
      if (this.circuitGameGroup) this.circuitGameGroup.setVisible(false);
      this.gameState = 'fire';
    } else if (visibleGame === 'circuit') {
      this.fireGameGroup.setVisible(false);
      this.circuitGameGroup.setVisible(true);
      this.gameState = 'circuit';
    }
  }
}