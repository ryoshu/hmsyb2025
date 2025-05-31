import Phaser from 'phaser';

export class GameSunnyYellow extends Phaser.Scene {
  constructor() {
    super('GameSunnyYellow');
  }

  preload() {
    // Load assets
    this.load.image('train', './assets/sunny_yellow_train.png');
    this.load.image('train_background', './assets/sunny_yellow_background.jpg');
  }

  create() {
    // Add background
    
    this.add.image(0, 0, 'train_background')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);
    
    // Add train sprite
    this.train = this.add.sprite(50, this.scale.height / 2 + 325, 'train')
      .setOrigin(0.5, 0.5)
      .setScale(0.65)
      .setInteractive();
    this.train.setData('moving', false);

    // Add timer text
    this.timerText = this.add.text(this.scale.width / 2, 40, 'Time: 30', {
      fontSize: '48px',
      color: '#fff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0); // Center horizontally and align top vertically

    // Add instruction text
    this.instructionText = this.add.text(this.scale.width / 2, 150, 'Tap the train to get home!', {
      fontSize: '32px',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setVisible(true); // Set visible to true

    // Add message text
    this.messageText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontSize: '48px',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center',
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5 },
    }).setOrigin(0.5).setVisible(false);

    // Timer setup
    this.timer = 30;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Train click event
    this.train.on('pointerdown', this.moveTrain, this);
  }

  updateTimer() {
    this.timer--;
    this.timerText.setText('Time: ' + this.timer);

    if (this.timer <= 0) {
      this.timerEvent.remove(false);
      this.gameOver();
    }
  }

  moveTrain() {
    if (this.train.getData('moving')) return;

    this.train.setData('moving', true);
    this.tweens.add({
      targets: this.train,
      x: this.train.x + 100,
      duration: 500,
      onComplete: () => {
        this.train.setData('moving', false);

        if (this.train.x >= 950) {
          this.gameWin();
        }
      },
    });
  }

  gameOver() {
    this.messageText.setText('Game Over!').setVisible(true);
    this.train.disableInteractive();
  }

  gameWin() {
    this.messageText.setText('You Win!').setVisible(true);
    this.train.disableInteractive();
    this.timerEvent.remove(false);

    // Restart the scene after a short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }
}

// Add this scene to a Phaser game instance
/*
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameSunnyYellow,
};

const game = new Phaser.Game(config);
*/