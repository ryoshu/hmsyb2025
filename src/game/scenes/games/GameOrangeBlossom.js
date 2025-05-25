import { Scene } from 'phaser';

export class GameOrangeBlossom extends Scene {
    constructor() {
        super({key: 'GameOrangeBlossom'});

        
        this.gameState = 'instructions'; // instructions, playing, victory, final
        this.currentLevel = 1;
        this.selected = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.score = 0;
        this.planets = [];
        this.takenCells = [];
        this.gridRows = 5;
        this.gridCols = 5;
        
        // Dynamic sizing properties
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.centerX = 0;
        this.centerY = 0;
        
        this.levelConfigs = {
            1: { planets: 8, moons: 0, time: 120 },
            2: { planets: 8, moons: 2, time: 150 },
            3: { planets: 8, moons: 4, time: 180 }
        };
        
        this.cardsData = [
            {
                "image": "assets/mercury.png", 
                "name": "mercury",
                "type": "planet"
            }, 
            {
                "image": "assets/venus.png", 
                "name": "venus",
                "type": "planet"
            }, 
            {
                "image": "assets/earth.png", 
                "name": "earth",
                "type": "planet"
            }, 
            {
                "image": "assets/mars.png", 
                "name": "mars",
                "type": "planet"
            }, 
            {
                "image": "assets/jupiter.png", 
                "name": "jupiter",
                "type": "planet"
            }, 
            {
                "image": "assets/saturn.png", 
                "name": "saturn",
                "type": "planet"
            }, 
            {
                "image": "assets/uranus.png", 
                "name": "uranus",
                "type": "planet"
            }, 
            {
                "image": "assets/neptune.png", 
                "name": "neptune",
                "type": "planet"
            }, 
            {
                "image": "assets/moon.png", 
                "name": "moon",
                "type": "moon"
            }, 
            {
                "image": "assets/europa.png", 
                "name": "europa",
                "type": "moon"
            }, 
            {
                "image": "assets/ganymede.png", 
                "name": "ganymede",
                "type": "moon"
            }, 
            {
                "image": "assets/titan.png", 
                "name": "titan",
                "type": "moon"
            }
        ];
    }
    
    preload() {
        // Set up dynamic sizing
        this.updateDimensions();
        
        // Load actual planet and moon images
        this.cardsData.forEach(card => {
            this.load.image(card.name, card.image);
        });
        
        // Create star background
        const starGraphics = this.add.graphics();
        starGraphics.fillStyle(0xFFFFFF);
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * this.gameWidth;
            const y = Math.random() * this.gameHeight;
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.8 + 0.2;
            starGraphics.fillStyle(0xFFFFFF, alpha);
            starGraphics.fillCircle(x, y, size);
        }
        starGraphics.generateTexture('stars', this.gameWidth, this.gameHeight);
        starGraphics.destroy();
    }
    
    updateDimensions() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        this.centerX = this.gameWidth / 2;
        this.centerY = this.gameHeight / 2;
    }
    
    create() {
        // Update dimensions for responsive design
        this.updateDimensions();
        
        // Add black background
        this.add.rectangle(this.centerX, this.centerY, this.gameWidth, this.gameHeight, 0x000000);
        
        // Add star background
        this.add.image(this.centerX, this.centerY, 'stars');
        
        // Initialize UI elements
        this.setupUI();
        this.showInstructions();
        
        // Handle window resize
        this.scale.on('resize', this.handleResize, this);
    }
    
    handleResize() {
        this.updateDimensions();
        // Refresh current screen
        if (this.gameState === 'instructions') {
            this.showInstructions();
        }
    }
    
    setupUI() {
        // Create text styles
        this.titleStyle = { fontSize: '32px', fill: '#ffffff', align: 'center' };
        this.textStyle = { fontSize: '18px', fill: '#ffffff', align: 'center' };
        this.buttonStyle = { fontSize: '20px', fill: '#ffffff', backgroundColor: '#4CAF50', padding: { x: 20, y: 10 } };
        
        // Create UI groups for different screens
        this.instructionsGroup = this.add.group();
        this.gameGroup = this.add.group();
        this.victoryGroup = this.add.group();
        this.finalGroup = this.add.group();
    }
    
    showInstructions() {
        this.gameState = 'instructions';
        this.clearAllGroups();
        
        const title = this.add.text(this.centerX, this.centerY - 150, 'Welcome to the Space Memory Game!', this.titleStyle).setOrigin(0.5);
        const instructions1 = this.add.text(this.centerX, this.centerY - 80, 'Click on planets and moons to select them.', this.textStyle).setOrigin(0.5);
        const instructions2 = this.add.text(this.centerX, this.centerY - 50, 'Match two of the same to make them disappear!', this.textStyle).setOrigin(0.5);
        const instructions3 = this.add.text(this.centerX, this.centerY - 20, 'Clear all matches before time runs out to win!', this.textStyle).setOrigin(0.5);
        
        const startButton = this.add.text(this.centerX, this.centerY + 50, 'Start Level 1', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.startGame())
            .on('pointerover', () => startButton.setStyle({ fill: '#45a049' }))
            .on('pointerout', () => startButton.setStyle({ fill: '#ffffff' }));
        
        this.instructionsGroup.addMultiple([title, instructions1, instructions2, instructions3, startButton]);
    }
    
    startGame() {
        this.setupLevel(this.currentLevel);
    }
    
    setupLevel(level) {
        this.gameState = 'playing';
        this.clearAllGroups();
        this.planets = [];
        this.selected = [];
        this.matchedPairs = 0;
        this.takenCells = [];
        
        const config = this.levelConfigs[level];
        
        // Create header UI - positioned relative to screen size
        const headerY = Math.max(50, this.gameHeight * 0.08);
        const levelTitle = this.add.text(this.centerX, headerY, `Level ${level}`, this.titleStyle).setOrigin(0.5);
        this.timerText = this.add.text(this.centerX, headerY + 40, 'Time: ', this.textStyle).setOrigin(0.5);
        this.messageText = this.add.text(this.centerX, headerY + 70, '', this.textStyle).setOrigin(0.5);
        
        this.gameGroup.addMultiple([levelTitle, this.timerText, this.messageText]);
        
        // Prepare cards
        const planetCards = this.cardsData.filter(item => item.type === 'planet').slice(0, config.planets);
        const moonCards = this.cardsData.filter(item => item.type === 'moon').slice(0, config.moons);
        let cards = [...planetCards, ...moonCards];
        cards = [...cards, ...cards]; // Duplicate for matching pairs
        this.totalPairs = cards.length / 2;
        
        this.shuffle(cards);
        
        // Create planet sprites with responsive positioning
        const gameAreaWidth = Math.min(this.gameWidth * 0.8, 800); // Max 800px or 80% of screen
        const gameAreaHeight = Math.min(this.gameHeight * 0.6, 500); // Max 500px or 60% of screen
        const cellWidth = gameAreaWidth / this.gridCols;
        const cellHeight = gameAreaHeight / this.gridRows;
        const startX = this.centerX - gameAreaWidth / 2;
        const startY = this.centerY - gameAreaHeight / 2 + 50; // Offset down a bit
        
        // Scale planet size based on available space
        const planetSize = Math.min(80, Math.min(cellWidth, cellHeight) * 0.8);
        
        cards.forEach(card => {
            let position;
            do {
                const row = Math.floor(Math.random() * this.gridRows);
                const col = Math.floor(Math.random() * this.gridCols);
                position = `${row}-${col}`;
            } while (this.takenCells.includes(position));
            
            this.takenCells.push(position);
            const [row, col] = position.split('-').map(Number);
            
            const x = startX + col * cellWidth + cellWidth / 2;
            const y = startY + row * cellHeight + cellHeight / 2;
            
            const planet = this.add.image(x, y, card.name)
                .setDisplaySize(planetSize, planetSize)
                .setInteractive()
                .on('pointerdown', () => this.selectPlanet(planet))
                .on('pointerover', () => {
                    if (!planet.isSelected && !planet.isMatched) {
                        planet.setDisplaySize(planetSize * 1.1, planetSize * 1.1);
                    }
                })
                .on('pointerout', () => {
                    if (!planet.isSelected && !planet.isMatched) {
                        planet.setDisplaySize(planetSize, planetSize);
                    }
                });
            
            // Store the original size for reset purposes
            planet.originalSize = planetSize;
            
            planet.cardName = card.name;
            planet.isMatched = false;
            planet.isSelected = false;
            
            this.planets.push(planet);
            this.gameGroup.add(planet);
        });
        
        this.startTimer(config.time);
    }
    
    selectPlanet(planet) {
        if (this.selected.length === 2 || planet.isMatched || planet.isSelected) return;
        
        planet.isSelected = true;
        planet.setDisplaySize(planet.originalSize, planet.originalSize); // Reset to original size
        planet.setTint(0x0000ff); // Blue tint for selection
        this.selected.push(planet);
        
        if (this.selected.length === 2) {
            if (this.selected[0].cardName === this.selected[1].cardName) {
                // Match found
                this.matchedPairs++;
                this.time.delayedCall(500, () => {
                    this.selected[0].setVisible(false);
                    this.selected[1].setVisible(false);
                    this.selected[0].isMatched = true;
                    this.selected[1].isMatched = true;
                    this.selected = [];
                    
                    if (this.matchedPairs === this.totalPairs) {
                        this.timer.remove();
                        this.time.delayedCall(500, () => this.showVictoryScreen());
                    }
                });
            } else {
                // No match
                this.time.delayedCall(1000, () => {
                    this.selected[0].clearTint();
                    this.selected[1].clearTint();
                    this.selected[0].setDisplaySize(this.selected[0].originalSize, this.selected[0].originalSize);
                    this.selected[1].setDisplaySize(this.selected[1].originalSize, this.selected[1].originalSize);
                    this.selected[0].isSelected = false;
                    this.selected[1].isSelected = false;
                    this.selected = [];
                });
            }
        }
    }
    
    startTimer(seconds) {
        this.timeLeft = seconds;
        this.updateTimerDisplay();
        
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    this.timer.remove();
                    this.messageText.setText("⏰ Time's Up!");
                    this.showRetryOption();
                }
            },
            loop: true
        });
    }
    
    updateTimerDisplay() {
        this.timerText.setText(`Time: ${this.timeLeft}`);
    }
    
    showVictoryScreen() {
        this.gameState = 'victory';
        this.clearAllGroups();
        this.score += this.timeLeft * 10;
        
        const title = this.add.text(this.centerX, this.centerY - 100, 'Level Complete!', this.titleStyle).setOrigin(0.5);
        const stars = this.add.text(this.centerX, this.centerY - 50, this.getStarsDisplay(), { fontSize: '40px', fill: '#FFD700' }).setOrigin(0.5);
        
        this.victoryGroup.addMultiple([title, stars]);
        
        if (this.currentLevel === 3) {
            this.time.delayedCall(1000, () => this.showFinalScreen());
        } else {
            this.startCooldown();
        }
    }
    
    showRetryOption() {
        this.gameState = 'victory';
        this.clearAllGroups();
        
        const title = this.add.text(this.centerX, this.centerY - 100, "Time's Up!", this.titleStyle).setOrigin(0.5);
        
        const resetButton = this.add.text(this.centerX - 100, this.centerY + 50, 'Reset Level', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.resetLevel());
        
        const backButton = this.add.text(this.centerX + 100, this.centerY + 50, 'Back to Menu', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.backToInstructions());
        
        this.victoryGroup.addMultiple([title, resetButton, backButton]);
        
        if (this.currentLevel < 3) {
            const nextButton = this.add.text(this.centerX, this.centerY + 50, 'Next Level', this.buttonStyle)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.nextLevel());
            this.victoryGroup.add(nextButton);
            
            // Adjust button positions to accommodate 3 buttons
            resetButton.setX(this.centerX - 150);
            backButton.setX(this.centerX + 150);
        }
    }
    
    startCooldown() {
        let countdown = 5;
        const cooldownText = this.add.text(this.centerX, this.centerY, `Next level in ${countdown}...`, this.textStyle).setOrigin(0.5);
        this.victoryGroup.add(cooldownText);
        
        const countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--;
                if (countdown <= 0) {
                    countdownTimer.remove();
                    this.showVictoryButtons();
                } else {
                    cooldownText.setText(`Next level in ${countdown}...`);
                }
            },
            loop: true
        });
    }
    
    showVictoryButtons() {
        const nextButton = this.add.text(this.centerX - 150, this.centerY + 100, 'Next Level', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.nextLevel());
        
        const resetButton = this.add.text(this.centerX, this.centerY + 100, 'Reset Level', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.resetLevel());
        
        const backButton = this.add.text(this.centerX + 150, this.centerY + 100, 'Back to Menu', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.backToInstructions());
        
        this.victoryGroup.addMultiple([nextButton, resetButton, backButton]);
    }
    
    getStarsDisplay() {
        let stars = '';
        for (let i = 1; i <= 3; i++) {
            if (i <= this.currentLevel) {
                stars += '⭐';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }
    
    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel <= 3) {
            this.setupLevel(this.currentLevel);
        } else {
            this.showFinalScreen();
        }
    }
    
    resetLevel() {
        this.setupLevel(this.currentLevel);
    }
    
    backToInstructions() {
        this.currentLevel = 1;
        this.score = 0;
        this.showInstructions();
    }
    
    showFinalScreen() {
        this.gameState = 'final';
        this.clearAllGroups();
        
        const title = this.add.text(this.centerX, this.centerY - 150, 'Congratulations! 🎉', this.titleStyle).setOrigin(0.5);
        const stars = this.add.text(this.centerX, this.centerY - 80, '⭐ ⭐ ⭐', { fontSize: '50px', fill: '#FFD700' }).setOrigin(0.5);
        const subtitle = this.add.text(this.centerX, this.centerY - 20, 'You matched all planets and moons!', this.textStyle).setOrigin(0.5);
        const scoreText = this.add.text(this.centerX, this.centerY + 20, `Total Points: ${this.score}`, this.textStyle).setOrigin(0.5);
        
        const playAgainButton = this.add.text(this.centerX, this.centerY + 100, 'Play Again', this.buttonStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.backToInstructions());
        
        this.finalGroup.addMultiple([title, stars, subtitle, scoreText, playAgainButton]);
    }
    
    clearAllGroups() {
        this.instructionsGroup.clear(true, true);
        this.gameGroup.clear(true, true);
        this.victoryGroup.clear(true, true);
        this.finalGroup.clear(true, true);
        
        if (this.timer) {
            this.timer.remove();
        }
    }
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}