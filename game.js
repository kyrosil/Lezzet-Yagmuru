// Bu, game.js dosyasının içeriğidir.
// KOD, TÜM HATALARI GİDERMEK İÇİN YENİDEN YAPILANDIRILDI.
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // Oyun her başladığında çağrılan ve değişkenleri sıfırlayan fonksiyon
    init(data) {
        this.handleGameOver = data.handleGameOver;
        this.score = 0;
        this.lives = 3;
        this.spawnRate = 1800; // Zorluk sıfırlandı
        this.objectSpeed = 200; // Zorluk sıfırlandı
    }

    preload() {
        const ASSETS = {
            'basket': 'sepet.png',
            'coke': 'normal.png',
            'coke_zero': 'zero.png',
            'coke_light': 'light.png',
            'fanta': 'fanta.png',
            'sprite': 'sprite.png',
            'cappy': 'cappy.png',
            'pepsi': 'pepsi.png',
            'bomb': 'bomb.png',
            'kitkat': 'kitkat.png',
            'xpress': 'xpress.png',
            'erikli': 'erikli.png',
            'carrefour': 'carrefour.png'
        };

        if (window.location.href.includes('github.io')) {
            this.load.setBaseURL('https://kyrosil.github.io/Lezzet-Yagmuru/');
        }

        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    create() {
        this.player = this.physics.add.sprite(400, 550, 'basket').setDisplaySize(130, 110).setCollideWorldBounds(true);
        this.player.body.immovable = true;
        
        this.goodItems = this.physics.add.group();
        this.badItems = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.bonusItems = this.physics.add.group();

        this.physics.add.overlap(this.player, this.goodItems, this.collectGoodItem, null, this);
        this.physics.add.overlap(this.player, this.badItems, this.hitBadItem, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.bonusItems, this.collectBonusItem, null, this);
        
        this.gameTimer = this.time.addEvent({ delay: this.spawnRate, callback: this.spawnObject, callbackScope: this, loop: true });
        this.bonusTimer = this.time.addEvent({ delay: Phaser.Math.Between(15000, 25000), callback: this.spawnBonus, callbackScope: this, loop: true });

        this.updateScoreDisplay();
        this.updateLivesDisplay();
        
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0) {
                 this.player.x = Phaser.Math.Clamp(pointer.x, 65, this.physics.world.bounds.width - 65);
            }
        });
    }

    update() {
        if (this.lives <= 0) return;
        
        const elapsedTime = this.time.now / 1000;
        this.objectSpeed = 200 + (elapsedTime * 8);
        this.spawnRate = Math.max(300, 1800 - (elapsedTime * 50));
        this.gameTimer.delay = this.spawnRate;

        this.checkOutOfBounds(this.goodItems, true);
        this.checkOutOfBounds(this.bonusItems, true);
        this.checkOutOfBounds(this.badItems, false);
        this.checkOutOfBounds(this.powerups, false);
    }
    
    spawnObject() {
        if (this.lives <= 0) return;
        const x = Phaser.Math.Between(50, 750);
        // ZORLUK DENGELENDİ: Kötü obje düşme ihtimali azaltıldı
        const typeChance = Phaser.Math.FloatBetween(0, 1);
        let itemKey, group, width, height;

        if (typeChance < 0.70) { // %70 ihtimalle iyi obje
            itemKey = Phaser.Utils.Array.GetRandom(['coke', 'coke_zero', 'coke_light', 'fanta', 'sprite', 'cappy']); 
            group = this.goodItems;
            width = 80; height = 100; 
        } else if (typeChance < 0.90) { // %20 ihtimalle kötü obje
            itemKey = Phaser.Utils.Array.GetRandom(['pepsi', 'bomb']); 
            group = this.badItems;
            width = 85; height = 85; 
        } else { // %10 ihtimalle power-up
            itemKey = Phaser.Utils.Array.GetRandom(['kitkat', 'xpress', 'erikli']); 
            group = this.powerups;
            width = 70; height = 70; 
        }
        
        // DÜZELTME: Başlangıç pozisyonu ekranın en tepesi olarak garantilendi
        const item = group.create(x, -100, itemKey);
        if (item) {
            item.setDisplaySize(width, height);
            item.setVelocityY(this.objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    spawnBonus() {
        if (this.lives <= 0) return;
        const x = Phaser.Math.Between(50, 750);
        const bonus = this.bonusItems.create(x, -100, 'carrefour');
        if (bonus) {
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
        group.children.each(item => {
            if (item && item.y > this.physics.world.bounds.height + 100) {
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
        this.gameTimer.destroy();
        this.bonusTimer.destroy();
        if(this.player) this.player.setTint(0xff0000);
        this.handleGameOver(this.score);
    }
}

// Bu fonksiyon dışarıdan çağrılacak ana fonksiyon
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
        scene: [GameScene], // Sahnemizi burada belirtiyoruz
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
    
    // Oyunu başlatırken handleGameOver fonksiyonunu sahneye iletiyoruz
    window.phaserGame = new Phaser.Game(config);
    window.phaserGame.scene.start('GameScene', { handleGameOver: handleGameOver });
}
