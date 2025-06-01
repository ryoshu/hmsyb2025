import Phaser from 'phaser';

export class GamePeacefulIvory extends Phaser.Scene {
  constructor() {
    super('GamePeacefulIvory');
    this.score = 0;
    this.totalBoxes = 25;
    this.imageSources = [
      './assets/pyramids-clipart-xl.jpg',
      './assets/melindak-roman-colosseum-clipart-xl.jpg',
      './assets/ancient-mayan-pyramid-cartoon-icon-white-background-vector-illustration_1284-66707.jpg',
      './assets/ancient-rome-column-architectural-clipart-10672.jpg',
      './assets/great-wall-of-china-clipart-md.jpg',
      './assets/stonehenge-stones-clipart-vector-art-illustration_761413-36803.jpg',
      './assets/ancient-chinese-pagoda-61315.jpg',
      './assets/taj-mahal-icon-travel-landmarks-design-illustration.jpg',
      './assets/petra-clipart-md.jpg',
      './assets/djinguereber-mosque-in-timbuktu-mali.jpg'
    ];
    this.targetImageSrc = '';
    this.resultDisplayTimer = null;
  }

  preload() {
    // Load all images
    this.imageSources.forEach((src, index) => {
      this.load.image(`landmark${index}`, src);
    });
    
    // Load any additional assets
    //this.load.image('background', 'https://phaser.io/images/tutorials/52/light-grass.png');
  }

  create() {
    // Remove the background image setup
    // this.add.image(400, 300, 'background').setScale(2);

    // Set up game container
    this.createGameBoard();

    // Set up score display
    this.scoreText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 325, 'Score: 0', { 
      fontSize: '24px', 
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Result text display
    this.resultText = this.add.text(this.scale.width / 2, this.scale.height - 20, '', { 
      fontSize: '20px', 
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Target image text
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 400, 'Find this image:', { 
      fontSize: '20px', 
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Win screen (initially hidden)
    this.winScreen = this.add.text(this.scale.width / 2, this.scale.height / 2, '🎉 You Win! 🎉', {
      fontSize: '48px',
      color: '#00aa00',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.winScreen.setVisible(false);

    this.classroom = this.add.text(0,0, 'Peaceful Ivory', {
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

  createGameBoard() {
    // Clean up any existing game objects
    if (this.imageBoxes) {
        this.imageBoxes.forEach(box => box.destroy());
    }

    this.imageBoxes = [];
    const imageList = [];

    // Calculate grid layout dynamically
    const gridSpacing = 110;
    const gridWidth = 5;
    const gridHeight = Math.ceil(this.totalBoxes / gridWidth);

    const boardWidth = gridWidth * gridSpacing;
    const boardHeight = gridHeight * gridSpacing;

    const startX = (this.scale.width - boardWidth) / 2 + gridSpacing / 2;
    const startY = (this.scale.height - boardHeight) / 2 + gridSpacing / 2;

    for (let i = 0; i < this.totalBoxes; i++) {
        const row = Math.floor(i / gridWidth);
        const col = i % gridWidth;

        const x = startX + col * gridSpacing;
        const y = startY + row * gridSpacing;

        // Get random image source
        const imageIndex = Math.floor(Math.random() * this.imageSources.length);
        const imgKey = `landmark${imageIndex}`;
        imageList.push(imgKey);

        // Create image sprite
        const box = this.add.sprite(x, y, imgKey);
        box.setDisplaySize(100, 100);
        box.setInteractive();

        // Add border effect (invisible by default)
        const border = this.add.rectangle(x, y, 104, 104, 0x333333);
        border.setStrokeStyle(2, 0x333333);
        border.setVisible(false);

        // Store reference to source image
        box.imgKey = imgKey;

        // Set up interaction
        box.on('pointerover', () => {
            border.setStrokeStyle(2, 0x000000); // Set the border to a thin black outline
            border.setVisible(true); // Show the border
            box.clearTint(); // Ensure the sprite does not get tinted
        });

        box.on('pointerout', () => {
            border.setVisible(false); // Hide the border
            box.clearTint(); // Reset any tinting effect
        });

        box.on('pointerdown', () => {
            this.handleClick(box.imgKey);
        });

        this.imageBoxes.push(box);
        this.imageBoxes.push(border);
    }

    // Select random image as target
    const randomIndex = Math.floor(Math.random() * imageList.length);
    this.targetImageSrc = imageList[randomIndex];

    // Show target image
    if (this.targetImage) {
        this.targetImage.destroy();
    }
    this.targetImage = this.add.sprite(this.scale.width / 2, startY - 110, this.targetImageSrc);
    this.targetImage.setDisplaySize(80, 80);

    // Add border around target image
    if (this.targetBorder) {
        this.targetBorder.destroy();
    }
    this.targetBorder = this.add.rectangle(this.scale.width / 2, startY - 110, 86, 86);
    this.targetBorder.setStrokeStyle(3, 0x333333);
  }

  gameWin() {
    // Display the win screen
    this.winScreen.setVisible(true);

    // Hide all game elements
    this.imageBoxes.forEach(box => box.setVisible(false));
    this.targetImage.setVisible(false);
    this.targetBorder.setVisible(false);

    
    // Got to main menu after short delay
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenu'); // Replace 'MainMenu' with the actual key of your main menu scene
    });
  }

  handleClick(clickedImgKey) {
    // Clear any existing timer
    if (this.resultDisplayTimer) {
      this.time.removeEvent(this.resultDisplayTimer);
    }

    if (clickedImgKey === this.targetImageSrc) {
      // Correct choice
      this.score++;
      this.scoreText.setText('Score: ' + this.score);
      this.resultText.setText('Correct!');
      this.resultText.setColor('#00aa00');
      
      if (this.score >= 10) {
        // Trigger the win condition
        this.gameWin();
        return;
      }
      
      // Set timer to create a new game board
      this.resultDisplayTimer = this.time.delayedCall(1000, () => {
        this.resultText.setText('');
        this.createGameBoard();
      });
    } else {
      // Incorrect choice
      this.resultText.setText('Incorrect! Try again.');
      this.resultText.setColor('#aa0000');
      
      // Set timer to clear message
      this.resultDisplayTimer = this.time.delayedCall(1000, () => {
        this.resultText.setText('');
      });
    }
  }

  getRandomImage() {
    const index = Math.floor(Math.random() * this.imageSources.length);
    return `landmark${index}`;
  }
}