class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.handleGameOver = data.handleGameOver;
        this.score = 0;
        this.lives = 3;
        this.spawnRate = 1700;
        this.objectSpeed = 220;
        this.isLosingLife = false;
        this.startTime = 0;
        this.nextSpawnTime = 0;
        this.speedMultiplier = 1;
    }

    preload() {
        const ASSETS = {
            'basket': 'sepet.png', 'coke': 'normal.png', 'coke_zero': 'zero.png',
            'coke_light': 'light.png', 'fanta': 'fanta.png', 'sprite': 'sprite.png',
            'pepsi': 'pepsi.png', 'bomb': 'bomb.png', 'kitkat': 'kitkat.png', 
            'xpress': 'xpress.png', 'erikli': 'erikli.png', 'carrefour': 'carrefour.png'
        };
        if (window.location.href.includes('github.io')) {
            this.load.setBaseURL('https://kyrosil.github.io/Lezzet-Yagmuru/');
        }
        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    create() {
        this.startTime = this.time.now;
        
        this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 50, 'basket').setDisplaySize(130, 110).setCollideWorldBounds(true);
        this.player.body.immovable = true;
        
        this.goodItems = this.physics.add.group();
        this.badItems = this.physics.add.group();
        this.powerups = this.physics.add.group();
        
        this.physics.add.overlap(this.player, this.goodItems, this.collectGoodItem, null, this);
        this.physics.add.overlap(this.player, this.badItems, this.hitBadItem, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        
        this.updateScoreDisplay();
        this.updateLivesDisplay();
        
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0) {
                 this.player.x = Phaser.Math.Clamp(pointer.x, 65, this.scale.width - 65);
            }
        });
    }

    update(time, delta) {
        if (this.lives <= 0) return;
        
        const elapsedTime = (time - this.startTime) / 1000;
        this.objectSpeed = (220 + (elapsedTime * 9)) * this.speedMultiplier;
        this.spawnRate = Math.max(250, 1700 - (elapsedTime * 45));
        
        if (time > this.nextSpawnTime) {
            this.spawnObject();
            this.nextSpawnTime = time + this.spawnRate;
        }

        this.checkOutOfBounds(this.goodItems, true);
        this.checkOutOfBounds(this.badItems, false);
        this.checkOutOfBounds(this.powerups, false);
    }
    
    spawnObject() {
        if (this.lives <= 0) return;
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const spawnY = -200;
        const typeChance = Phaser.Math.FloatBetween(0, 100);
        let itemKey, group, width, height;

        if (typeChance < 3) { 
            itemKey = 'carrefour'; group = this.goodItems; width = 90; height = 90;
        } else if (typeChance < 73) {
            itemKey = Phaser.Utils.Array.GetRandom(['coke', 'coke_zero', 'coke_light', 'fanta', 'sprite']); 
            group = this.goodItems; width = 80; height = 100; 
        } else if (typeChance < 90) {
            itemKey = Phaser.Utils.Array.GetRandom(['pepsi', 'bomb']); 
            group = this.badItems; width = 85; height = 85; 
        } else {
            itemKey = Phaser.Utils.Array.GetRandom(['kitkat', 'xpress', 'erikli']); 
            group = this.powerups; width = 70; height = 70; 
        }
        
        const item = this.physics.add.sprite(x, spawnY, itemKey);
        if (item) {
            group.add(item);
            item.setDisplaySize(width, height);
            item.setVelocityY(this.objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    collectGoodItem(player, item) {
        const key = item.texture.key;
        if (key === 'carrefour') {
            this.score += 15;
            this.cameras.main.flash(100, 255, 255, 255);
        } else {
            this.score += 3;
        }
        item.destroy();
        this.updateScoreDisplay();
    }
    
    hitBadItem(player, item) { item.destroy(); this.score = Math.max(0, this.score - 5); this.updateScoreDisplay(); this.loseLife(); }
    
    collectPowerup(player, item) {
        const key = item.texture.key;
        item.destroy();
        if (key === 'erikli' && this.lives < 3) {
            this.lives++;
            this.updateLivesDisplay();
        } else if ((key === 'xpress' || key === 'kitkat') && this.speedMultiplier === 1) {
            this.speedMultiplier = 0.6;
            this.time.delayedCall(3000, () => { this.speedMultiplier = 1; }, [], this);
        }
    }
    
    loseLife() {
        if (this.lives > 0 && !this.isLosingLife) {
            this.isLosingLife = true;
            this.lives--;
            this.updateLivesDisplay();
            this.cameras.main.flash(150, 255, 60, 60);
            this.time.delayedCall(100, () => { this.isLosingLife = false; });
            if (this.lives <= 0) this.gameOver();
        }
    }
    
    checkOutOfBounds(group, isGood) {
        if (!group) return;
        const children = [...group.getChildren()];
        children.forEach(item => {
            if (item && item.y > this.scale.height + 100) {
                if (isGood) this.loseLife();
                item.destroy();
            }
        });
    }

    updateScoreDisplay() { 
        const scoreElement = document.getElementById('score-text');
        if (scoreElement) scoreElement.textContent = this.score; 
    }
    
    updateLivesDisplay() {
        const livesDisplay = document.getElementById('lives-display');
        if (!livesDisplay) return;
        livesDisplay.innerHTML = '';
        const baseURL = window.location.href.includes('github.io') ? 'https://kyrosil.github.io/Lezzet-Yagmuru/' : '';
        for (let i = 0; i < 3; i++) {
            const lifeImg = document.createElement('img');
            lifeImg.src = baseURL + 'normal.png';
            if(i >= this.lives) lifeImg.style.opacity = '0.3';
            livesDisplay.appendChild(lifeImg);
        }
    }

    gameOver() {
        this.physics.pause();
        if (this.gameTimer) this.gameTimer.destroy();
        if (this.bonusTimer) this.bonusTimer.destroy();
        if(this.player) this.player.setTint(0xff0000).setVelocityX(0);
        this.handleGameOver(this.score);
    }
}

export function createGame(handleGameOver) {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600
        },
        scene: [GameScene],
        physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
        transparent: true
    };
    if (window.phaserGame) { window.phaserGame.destroy(true); }
    window.phaserGame = new Phaser.Game(config);
    window.phaserGame.scene.start('GameScene', { handleGameOver: handleGameOver });
}
