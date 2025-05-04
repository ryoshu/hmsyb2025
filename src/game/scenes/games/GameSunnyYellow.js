import Phaser from 'phaser';

export class GameSunnyYellow extends Phaser.Scene {
  constructor() {
    super({ key: 'GameSunnyYellow' });
  }

  preload() {
    // Load assets
    this.load.image('background', 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/01775b08-79cb-497a-8c51-5e84cb379777/dicvsf3-ab6b34cb-90cf-4ec0-bf8a-b07c3907bad3.png/v1/fill/w_1207,h_662,q_70,strp/3_train_tracks_background_by_australiaartstudios_dicvsf3-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzAyIiwicGF0aCI6IlwvZlwvMDE3NzViMDgtNzljYi00OTdhLThjNTEtNWU4NGNiMzc5Nzc3XC9kaWN2c2YzLWFiNmIzNGNiLTkwY2YtNGVjMC1iZjhhLWIwN2MzOTA3YmFkMy5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.7bMd3T9kANQWwApuHBQVHoqn7OH5n3NQtp5H0tuD0AU');
    this.load.image('train', 'https://static.vecteezy.com/system/resources/thumbnails/009/342/543/small/vintage-train-on-railroad-clipart-design-illustration-free-png.png');
  }

  create() {
    // Add background
    this.add.image(400, 300, 'background').setOrigin(0.5, 0.5).setDisplaySize(800, 600);

    // Add train sprite
    this.train = this.add.sprite(100, 550, 'train').setOrigin(0.5, 0.5).setScale(0.5).setInteractive();
    this.train.setData('moving', false);

    // Add timer text
    this.timerText = this.add.text(650, 10, 'Time: 30', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 },
    });

    // Add message text
    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
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
      x: this.train.x + 50,
      duration: 500,
      onComplete: () => {
        this.train.setData('moving', false);

        if (this.train.x >= 750) {
          this.win();
        }
      },
    });
  }

  gameOver() {
    this.messageText.setText('Game Over!').setVisible(true);
    this.train.disableInteractive();
  }

  win() {
    this.messageText.setText('You Win!').setVisible(true);
    this.train.disableInteractive();
    this.timerEvent.remove(false);
  }
}

// Add this scene to a Phaser game instance
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameSunnyYellow,
};

const game = new Phaser.Game(config);