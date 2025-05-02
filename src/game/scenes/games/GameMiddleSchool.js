import { Scene } from 'phaser';

export class GameMiddleSchool extends Scene
{
    constructor () {
        super('GameMiddleSchool');
        // Game state variables
        this.playerHealth = 100;
        this.bossHealth = 300;
        this.bossMaxHealth = 300;
        this.score = 0;
        this.gameWon = false;
    }

    preload() {
        // We could load sprites here but will use shapes for simplicity
        this.load.image('particle', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMTEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII=');
    }
    
    create() {
        // Create game objects
        this.cameras.main.setBackgroundColor('#111');
        console.log(this.physics);
        // Create player with physics
        this.player = this.physics.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            60, 
            60,
            0x0000ff
        );
        this.player.setCollideWorldBounds(true);
        
        // Create boss
        this.boss = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            50,
            0x00ff00
        );
        
        // Set up damage spot
        this.damageSpot = this.add.circle(0, 0, 30, 0xffff00);
        this.createDamageSpot();
        
        // Set up laser group with physics
        this.lasers = this.physics.add.group();
        
        // Set up collisions
        this.physics.add.overlap(this.player, this.lasers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.damageSpot, this.hitDamageSpot, null, this);
        
        // Set up health bars
        this.setupHealthBars();
        
        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Win screen (hidden initially)
        this.winText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            '🎉 You Win! 🎉',
            { 
                fontFamily: 'Arial',
                fontSize: '64px',
                fill: '#000'
            }
        ).setOrigin(0.5);
        this.winText.setVisible(false);
        
        // Timer for shooting lasers
        this.time.addEvent({
            delay: 500,
            callback: this.shootLaser,
            callbackScope: this,
            loop: true
        });
        
        // Clear lasers that go offscreen
        this.physics.world.on('worldbounds', (body) => {
            if (this.lasers.contains(body.gameObject)) {
                body.gameObject.destroy();
            }
        });
    }
    
    update() {
        if (this.gameWon) return;
        
        // Player movement
        this.movePlayer();
        
        // Update health bars
        this.updateHealthBars();
    }
    
    createDamageSpot() {
        const spotRadius = 30;
        const minDistance = this.boss.radius + spotRadius + 100;
        let x, y;
        
        do {
            x = Phaser.Math.Between(spotRadius, this.cameras.main.width - spotRadius);
            y = Phaser.Math.Between(spotRadius, this.cameras.main.height - spotRadius);
        } while (Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y) < minDistance);
        
        this.damageSpot.setPosition(x, y);
    }
    
    movePlayer() {
        // Reset velocity
        this.player.setVelocity(0);
        
        const speed = 300;
        
        // Handle movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }
    
    shootLaser() {
        if (this.gameWon) return;
        
        // Calculate number of lasers based on boss health
        const numberOfLasers = 1 + Math.floor((1 - (this.bossHealth / this.bossMaxHealth)) * 5);
        
        for (let i = 0; i < numberOfLasers; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = 200;
            
            // Create the laser with physics
            const laser = this.lasers.create(this.boss.x, this.boss.y, 'particle');
            laser.setScale(2.5);
            laser.setTint(0xff0000);
            
            // Set velocity based on angle
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            laser.setVelocity(vx, vy);
            
            // Auto-remove lasers when they leave the screen
            laser.setCollideWorldBounds(true);
            laser.body.onWorldBounds = true;
            
            // Create particle effect for lasers
            this.add.particles(this.boss.x, this.boss.y, 'particle', {
                speed: 100,
                lifespan: 300,
                scale: { start: 1, end: 0 },
                tint: 0xff0000,
                blendMode: 'ADD',
                emitting: false
            }).explode(10);
        }
    }
    
    hitPlayer(player, laser) {
        this.playerHealth -= 20;
        
        // Add particle effect
        this.add.particles(laser.x, laser.y, 'particle', {
            speed: 100,
            lifespan: 300,
            scale: { start: 1, end: 0 },
            tint: 0x0000ff,
            blendMode: 'ADD',
            emitting: false
        }).explode(20);
        
        // Destroy the laser
        laser.destroy();
        
        // Game over if health depleted
        if (this.playerHealth <= 0) {
            this.scene.restart();
        }
    }
    
    hitDamageSpot(player, spot) {
        this.score += 10;
        this.bossHealth -= 10;
        
        // Add particle effect
        this.add.particles(spot.x, spot.y, 'particle', {
            speed: 100,
            lifespan: 300,
            scale: { start: 1, end: 0 },
            tint: 0xffff00,
            blendMode: 'ADD',
            emitting: false
        }).explode(20);
        
        // Move damage spot
        this.createDamageSpot();
        
        // Win condition
        if (this.bossHealth <= 0) {
            this.gameWon = true;
            this.showWinScreen();
        }
    }
    
    setupHealthBars() {
        // Boss health bar
        const bossBarWidth = 300;
        const bossBarHeight = 20;
        const bossBarX = (this.cameras.main.width / 2) - (bossBarWidth / 2);
        const bossBarY = 30;
        
        // Background
        this.add.rectangle(
            bossBarX + bossBarWidth / 2,
            bossBarY + bossBarHeight / 2,
            bossBarWidth,
            bossBarHeight,
            0x444444
        );
        
        // Health fill
        this.bossHealthBar = this.add.rectangle(
            bossBarX,
            bossBarY,
            bossBarWidth,
            bossBarHeight,
            0x00ff00
        ).setOrigin(0, 0);
        
        // Border
        this.add.rectangle(
            bossBarX + bossBarWidth / 2,
            bossBarY + bossBarHeight / 2,
            bossBarWidth,
            bossBarHeight,
            0xffffff
        ).setStrokeStyle(2, 0xffffff).setFillStyle();
        
        // Player health bar (above player)
        const playerBarWidth = 60;
        const playerBarHeight = 10;
        
        // Background (will move with player)
        this.add.rectangle(0, 0, playerBarWidth, playerBarHeight, 0x444444)
            .setOrigin(0, 0)
            .setName('playerBarBg');
        
        // Health fill (will move with player)
        this.playerHealthBar = this.add.rectangle(
            0,
            0,
            playerBarWidth,
            playerBarHeight,
            0xff0000
        ).setOrigin(0, 0);
    }
    
    updateHealthBars() {
        // Update boss health bar
        const healthRatio = this.bossHealth / this.bossMaxHealth;
        this.bossHealthBar.width = 300 * healthRatio;
        
        // Update player health bar
        this.playerHealthBar.width = 60 * (this.playerHealth / 100);
        
        // Position player health bar above player
        this.playerHealthBar.setPosition(this.player.x, this.player.y - 20);
        this.children.getByName('playerBarBg').setPosition(this.player.x, this.player.y - 20);
    }
    
    showWinScreen() {
        // Create overlay
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x00ff00,
            0.85
        );
        
        // Show win text
        this.winText.setVisible(true);
        
        // Bring to top
        overlay.setDepth(10);
        this.winText.setDepth(11);
    }
}
