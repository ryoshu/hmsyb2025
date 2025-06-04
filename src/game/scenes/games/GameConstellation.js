import Phaser from 'phaser';

export class GameConstellation extends Phaser.Scene {
  constructor() {
    super({ key: 'GameConstellation' });
    this.gamePattern = [];
    this.playerPattern = [];
    this.level = 0;
    this.isGameActive = false;
    this.drumSounds = [];
    this.startButton = null;
  }

  preload() {
    // Load drum sounds
    this.load.audio('drum1', './assets/CON-1.1.mp3');
    this.load.audio('drum2', './assets/CON-2.1.mp3');
    this.load.audio('drum3', './assets/CON-3.1.mp3');
    this.load.audio('drum4', './assets/CON-4.1.mp3');
    
    // Load drum images
    this.load.image('drumImg1', 'assets/CON-1.png');
    this.load.image('drumImg2', 'assets/CON-2.png');
    this.load.image('drumImg3', 'assets/CON-3.png');
    this.load.image('drumImg4', 'assets/CON-4.png');
  }

  create() {
    // Add black background
    this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0xffffff).setOrigin(0, 0);

    // Get game dimensions for centering
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // Add drum sounds to the scene
    this.drumSounds = [
      this.sound.add('drum1'),
      this.sound.add('drum2'),
      this.sound.add('drum3'),
      this.sound.add('drum4'),
    ];

    // Create drums with images, centered horizontally
    this.drums = [];
    const drumSpacing = 240; // Spacing between drums
    const totalWidth = (4 - 1) * drumSpacing; // Total width of all drums
    const startX = centerX - totalWidth / 2; // Starting X position for centering
    
    for (let i = 0; i < 4; i++) {
      const drum = this.add.image(startX + i * drumSpacing, centerY, `drumImg${i + 1}`).setInteractive();
      const drumSize = 200;
      drum.setDisplaySize(drumSize, drumSize);

      // Scale drums if needed (adjust this value as needed)
      //drum.setScale(0.8);
      
      drum.on('pointerdown', () => this.userClick(i));
      this.drums.push(drum);
    }

    // Add text for messages, centered above drums
    this.message = this.add.text(centerX, centerY - 250, 'Follow the pattern!', {
      fontSize: '48px',
      color: '#000000',
    }).setOrigin(0.5);

    // Add start button, centered below drums
    this.startButton = this.add.text(centerX, centerY + 250, 'Start Game', {
      fontSize: '48px',
      color: '#4CAF50',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    this.startButton.on('pointerdown', () => this.startGame());    
    this.classroom = this.add.text(0,0, 'Constellation', {
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
  }

  nextSequence() {
    this.playerPattern = [];
    const randomIndex = Math.floor(Math.random() * 4);
    this.gamePattern.push(randomIndex);
    this.playPattern();
    this.message.setText(`Level ${this.level + 1}`);
  }

  playPattern() {
    this.gamePattern.forEach((index, i) => {
      this.time.delayedCall(600 * i, () => {
        this.animateDrum(index);
        this.drumSounds[index].play();
      });
    });
  }

  animateDrum(index) {
    const drum = this.drums[index];
    // Create a highlight effect by tinting the drum
    drum.setTint(0x4CAF50);
    this.time.delayedCall(300, () => {
      drum.clearTint();
    });
  }

  checkAnswer(currentLevel) {
    if (this.playerPattern[currentLevel] === this.gamePattern[currentLevel]) {
      if (this.playerPattern.length === this.gamePattern.length) {
        this.level++;
        if (this.level === 5) {
          this.showWinScreen();
        } else {
          this.time.delayedCall(1000, () => this.nextSequence());
        }
      }
    } else {
      this.message.setText('Wrong! Try again.');
      this.playerPattern = [];
      this.gamePattern = [];
      this.isGameActive = false; // Disable input
      // Disable drum interactivity
      this.drums.forEach(drum => drum.disableInteractive());
      this.time.delayedCall(3000, () => this.startGame());
    }
  }

  userClick(index) {
    if (!this.isGameActive) return;

    this.playerPattern.push(index);
    this.animateDrum(index);
    this.drumSounds[index].play();

    this.checkAnswer(this.playerPattern.length - 1);
  }

  startGame() {
    this.isGameActive = true;
    this.gamePattern = [];
    this.playerPattern = [];
    this.level = 0;
    this.message.setText('Get Ready!');
    // Re-enable drum interactivity
    this.drums.forEach(drum => drum.setInteractive());
    this.time.delayedCall(1000, () => this.nextSequence());
    this.startButton.setVisible(false); // Hide the start button
  }

  showWinScreen() {
    this.message.setText('You Win!');
    this.isGameActive = false;
    // Got to main menu after short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }
}