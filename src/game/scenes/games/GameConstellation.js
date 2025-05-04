import Phaser from 'phaser';

export class GameConstellation extends Phaser.Scene {
  constructor() {
    super({ key: 'GameConstellation' });
    this.gamePattern = [];
    this.playerPattern = [];
    this.level = 0;
    this.isGameActive = false;
    this.drumSounds = [];
  }

  preload() {
    // Load drum sounds
    this.load.audio('drum1', 'https://www.soundjay.com/button/beep-07.wav');
    this.load.audio('drum2', 'https://www.soundjay.com/button/beep-08b.wav');
    this.load.audio('drum3', 'https://www.soundjay.com/button/beep-09.wav');
    this.load.audio('drum4', 'https://www.soundjay.com/button/beep-10.wav');
  }

  create() {
    // Add drum sounds to the scene
    this.drumSounds = [
      this.sound.add('drum1'),
      this.sound.add('drum2'),
      this.sound.add('drum3'),
      this.sound.add('drum4'),
    ];

    // Create drums
    this.drums = [];
    for (let i = 0; i < 4; i++) {
      const drum = this.add.circle(200 + i * 150, 300, 50, 0xdddddd).setInteractive();
      drum.on('pointerdown', () => this.userClick(i));
      this.drums.push(drum);
    }

    // Add text for messages
    this.message = this.add.text(400, 100, 'Press Start', {
      fontSize: '24px',
      color: '#000',
    }).setOrigin(0.5);

    // Add start button
    const startButton = this.add.text(400, 500, 'Start Game', {
      fontSize: '32px',
      color: '#4CAF50',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => this.startGame());
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
    drum.setFillStyle(0x4CAF50);
    this.time.delayedCall(300, () => {
      drum.setFillStyle(0xdddddd);
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
      this.time.delayedCall(1500, () => this.startGame());
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
    this.time.delayedCall(1000, () => this.nextSequence());
  }

  showWinScreen() {
    this.message.setText('You Win!');
    this.isGameActive = false;
  }
}