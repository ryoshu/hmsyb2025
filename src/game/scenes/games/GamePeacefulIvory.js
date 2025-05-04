import Phaser from 'phaser';

export class GamePeacefulIvory extends Phaser.Scene {
  constructor() {
    super({ key: 'GamePeacefulIvory' });
    this.imageSources = [
      'https://cdn.creazilla.com/cliparts/1991338/pyramids-clipart-xl.png',
      'https://cdn.creazilla.com/cliparts/30858/melindak-roman-colosseum-clipart-xl.png',
      'https://img.freepik.com/free-vector/ancient-mayan-pyramid-cartoon-icon-white-background-vector-illustration_1284-66707.jpg',
      'https://classroomclipart.com/image/static2/preview2/ancient-rome-column-architectural-clipart-10672.jpg',
      'https://cdn.creazilla.com/cliparts/63381/great-wall-of-china-clipart-md.png',
      'https://img.freepik.com/premium-vector/stonehenge-stones-clipart-vector-art-illustration_761413-36803.jpg?w=360',
      'https://classroomclipart.com/image/static7/preview2/ancient-chinese-pagoda-61315.jpg',
      'https://media.istockphoto.com/id/1616156815/vector/taj-mahal-icon-travel-landmarks-design-illustration.jpg?s=612x612&w=0&k=20&c=juv3EaV_2C6S_-dUTpz3rG4SaGAiM-QDM5l5JIZc8KQ=',
      'https://cdn.creazilla.com/cliparts/14480/petra-clipart-md.png',
      'https://media.istockphoto.com/id/1409321044/vector/djinguereber-mosque-in-timbuktu-mali.jpg?s=612x612&w=0&k=20&c=hN_KUIOsaH0i0aIZbDuPa-S8gyvm95vY8wPxDbJU9Bc='
    ];
    this.score = 0;
    this.targetImageSrc = '';
    this.totalBoxes = 25;
  }

  preload() {
    // Preload all images
    this.imageSources.forEach((src, index) => {
      this.load.image(`image${index}`, src);
    });
  }

  create() {
    this.add.text(10, 10, 'Find this image:', { fontSize: '20px', fill: '#000' });
    this.targetImage = this.add.image(100, 50, '').setScale(0.5).setOrigin(0.5);

    this.scoreText = this.add.text(10, 80, 'Score: 0', { fontSize: '24px', fill: '#000' });
    this.resultText = this.add.text(10, 110, '', { fontSize: '20px', fill: '#000' });
    this.winText = this.add.text(200, 300, '🎉 You Win! 🎉', { fontSize: '28px', fill: 'green' }).setVisible(false);

    this.gameContainer = this.add.container(0, 150);
    this.generateGameBoard();
  }

  getRandomImage() {
    return this.imageSources[Math.floor(Math.random() * this.imageSources.length)];
  }

  generateGameBoard() {
    this.gameContainer.removeAll(true);
    const imageList = [];

    for (let i = 0; i < this.totalBoxes; i++) {
      const imgSrc = this.getRandomImage();
      imageList.push(imgSrc);

      const x = 100 + (i % 5) * 110;
      const y = 150 + Math.floor(i / 5) * 110;

      const imageIndex = this.imageSources.indexOf(imgSrc);
      const image = this.add.image(x, y, `image${imageIndex}`).setInteractive();
      image.setScale(0.5);
      image.on('pointerdown', () => this.handleClick(imgSrc));
      this.gameContainer.add(image);
    }

    const randomIndex = Math.floor(Math.random() * imageList.length);
    this.targetImageSrc = imageList[randomIndex];
    const targetIndex = this.imageSources.indexOf(this.targetImageSrc);
    this.targetImage.setTexture(`image${targetIndex}`);
  }

  handleClick(clickedSrc) {
    if (clickedSrc === this.targetImageSrc) {
      this.score++;
      this.resultText.setText('Correct!').setStyle({ fill: 'green' });
      this.scoreText.setText(`Score: ${this.score}`);

      if (this.score >= 10) {
        this.winText.setVisible(true);
        this.gameContainer.setVisible(false);
        this.targetImage.setVisible(false);
        return;
      }

      this.time.delayedCall(1000, () => {
        this.resultText.setText('');
        this.generateGameBoard();
      });
    } else {
      this.resultText.setText('Incorrect! Try again.').setStyle({ fill: 'red' });

      this.time.delayedCall(1000, () => {
        this.resultText.setText('');
      });
    }
  }
}