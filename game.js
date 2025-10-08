class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.handleGameOver = data.handleGameOver;
        this.score = 0;
        this.lives = 3;
        this.objectSpeed = 200;
        this.playerSpeed = 600;
        this.spawnRate = 1800; // ms cinsinden ilk düşme aralığı
        this.nextSpawnTime = 0; // Bir sonraki objenin düşeceği zaman
    }

    preload() {
        const ASSETS = {
            'basket': 'sepet.png', 'coke': 'normal.png', 'coke_zero': 'zero.png',
            'coke_light': 'light.png', 'fanta': 'fanta.png', 'sprite': 'sprite.png',
            'cappy': 'https://i.imgur.com/832gT26.png', 'pepsi': 'pepsi.png',
            'bomb': 'bomb.png', 'kitkat': 'kitkat.png', 'xpress': 'xpress.png',
            'erikli': 'erikli.png', 'carrefour': 'carrefour.png'
        };

        if (window.location.href.includes('github.io')) {
            this.load.setBaseURL('https://kyrosil.github.io/Lezzet-Yagmuru/');
        }

        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    create() {
        this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 50, 'basket').setDisplaySize(130, 110).setCollideWorldBounds(true);
        this.player.body.immovable = true;
        
        this.goodItems = this.physics.add.group();
        this.badItems = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.bonusItems = this.physics.add.group();

        this.physics.add.overlap(this.player, this.goodItems, this.collectGoodItem, null, this);
        this.physics.add.overlap(this.player, this.badItems, this.hitBadItem, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.bonusItems, this.collectBonusItem, null, this);
        
        // Bonus zamanlayıcısı hala event ile çalışabilir, daha az kritik.
        this.bonusTimer = this.time.addEvent({ delay: Phaser.Math.Between(15000, 25000), callback: this.spawnBonus, callbackScope: this, loop: true });

        this.updateScoreDisplay();
        this.updateLivesDisplay();
        
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0) {
                 this.physics.moveTo(this.player, pointer.x, this.player.y, this.playerSpeed);
            } else {
                this.player.setVelocityX(0);
            }
        });
    }

    update(time, delta) {
        if (this.lives <= 0) return;
        
        const elapsedTime = this.time.sinceStart / 1000;
        this.objectSpeed = 200 + (elapsedTime * 8);
        this.spawnRate = Math.max(300, 1800 - (elapsedTime * 50));
        
        // YENİ VE GARANTİLİ OBJE DÜŞÜRME MANTIĞI
        if (time > this.nextSpawnTime) {
            this.spawnObject();
            this.nextSpawnTime = time + this.spawnRate;
        }

        if (this.player.body) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.input.x, this.player.y);
            if (distance < 4) {
                this.player.setVelocityX(0);
            }
        }

        this.checkOutOfBounds(this.goodItems, true);
        this.checkOutOfBounds(this.bonusItems, true);
        this.checkOutOfBounds(this.badItems, false);
        this.checkOutOfBounds(this.powerups, false);
    }
    
    spawnObject() {
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const typeChance = Phaser.Math.FloatBetween(0, 1);
        let itemKey, group, width, height;

        if (typeChance < 0.70) {
            itemKey = Phaser.Utils.Array.GetRandom(['coke', 'coke_zero', 'coke_light', 'fanta', 'sprite', 'cappy']); 
            group = this.goodItems; width = 80; height = 100; 
        } else if (typeChance < 0.90) {
            itemKey = Phaser.Utils.Array.GetRandom(['pepsi', 'bomb']); 
            group = this.badItems; width = 85; height = 85; 
        } else {
            itemKey = Phaser.Utils.Array.GetRandom(['kitkat', 'xpress', 'erikli']); 
            group = this.powerups; width = 70; height = 70; 
        }
        
        const item = this.physics.add.sprite(x, -100, itemKey);
        if (item) {
            group.add(item);
            item.setDisplaySize(width, height);
            item.setVelocityY(this.objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    spawnBonus() {
        if (this.lives <= 0) return;
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const bonus = this.physics.add.sprite(x, -100, 'carrefour');
        if (bonus) {
            this.bonusItems.add(bonus);
            bonus.setDisplaySize(90, 90);
            bonus.setVelocityY(this.objectSpeed * 2.5);
        }
    }

    collectGoodItem(player, item) { item.destroy(); this.score += 5; this.updateScoreDisplay(); }
    collectBonusItem(player, item) { item.destroy(); this.score += 30; this.updateScoreDisplay(); }
    hitBadItem(player, item) { item.destroy(); this.score = Math.max(0, this.score - 5); this.updateScoreDisplay(); this.loseLife(); }
    
    collectPowerup(player, item) {
        const key = item.texture.key;
        item.destroy();
        if (key === 'erikli' && this.lives < 3) { this.lives++; this.updateLivesDisplay(); } 
        else if (key === 'xpress') { this.playerSpeed = 1000; this.time.delayedCall(5000, () => { this.playerSpeed = 600; }, [], this); } 
        else if (key === 'kitkat') { this.physics.world.timeScale = 0.5; this.time.delayedCall(3000, () => { this.physics.world.timeScale = 1; }, [], this); }
    }
    
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            this.updateLivesDisplay();
            if (this.lives <= 0) this.gameOver();
        }
    }
    
    checkOutOfBounds(group, isGood) {
        if (!group) return;
        const children = group.getChildren();
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
        this.bonusTimer.destroy();
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
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        transparent: true
    };

    if (window.phaserGame) {
        window.phaserGame.destroy(true);
    }
    
    window.phaserGame = new Phaser.Game(config);
    window.phaserGame.scene.start('GameScene', { handleGameOver: handleGameOver });
}
