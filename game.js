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
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        transparent: true
    };

    if (window.phaserGame) {
        window.phaserGame.destroy(true);
    }
    window.phaserGame = new Phaser.Game(config);
    
    let player, gameTimer;
    let score = 0;
    let lives = 3;
    let spawnRate = 1800; // Zorluk artırıldı: Başlangıç hızı düşürüldü
    let objectSpeed = 200; // Zorluk artırıldı: Başlangıç hızı artırıldı
    let sceneContext;

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
    
    const GOOD_ITEMS = ['coke', 'coke_zero', 'coke_light', 'fanta', 'sprite', 'cappy'];
    const BAD_ITEMS = ['pepsi', 'bomb'];
    const POWERUPS = ['kitkat', 'xpress', 'erikli'];

    function preload() {
        // DÜZELTME: Repo adın "Lezzet-Yagmuru" olarak güncellendi.
        if (window.location.href.includes('github.io')) {
            this.load.setBaseURL('https://kyrosil.github.io/Lezzet-Yagmuru/');
        }

        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    function create() {
        sceneContext = this;
        player = this.physics.add.sprite(400, 550, 'basket').setDisplaySize(120, 100).setCollideWorldBounds(true);
        player.body.immovable = true;
        
        this.goodItems = this.physics.add.group();
        this.badItems = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.bonusItems = this.physics.add.group();

        this.physics.add.overlap(player, this.goodItems, collectGoodItem, null, this);
        this.physics.add.overlap(player, this.badItems, hitBadItem, null, this);
        this.physics.add.overlap(player, this.powerups, collectPowerup, null, this);
        this.physics.add.overlap(player, this.bonusItems, collectBonusItem, null, this);
        
        gameTimer = this.time.addEvent({ delay: spawnRate, callback: spawnObject, callbackScope: this, loop: true });
        this.time.addEvent({ delay: Phaser.Math.Between(15000, 25000), callback: spawnBonus, loop: true });

        updateScoreDisplay();
        updateLivesDisplay();
        
        this.input.on('pointermove', (pointer) => {
            if (lives > 0) {
                 player.x = Phaser.Math.Clamp(pointer.x, 60, this.physics.world.bounds.width - 60);
            }
        });
    }

    function update() {
        if (lives <= 0) return;
        
        // ZORLUK AYARI GÜNCELLENDİ
        const elapsedTime = this.time.now / 1000;
        objectSpeed = 200 + (elapsedTime * 8); // Hız artık daha çabuk artıyor
        spawnRate = Math.max(300, 1800 - (elapsedTime * 50)); // Objeler daha sık düşüyor
        gameTimer.delay = spawnRate;

        checkOutOfBounds(this.goodItems, true);
        checkOutOfBounds(this.bonusItems, true);
        checkOutOfBounds(this.badItems, false);
        checkOutOfBounds(this.powerups, false);
    }
    
    function spawnObject() {
        if (lives <= 0 || !sceneContext) return;
        const x = Phaser.Math.Between(50, 750);
        const typeChance = Phaser.Math.FloatBetween(0, 1);
        let itemKey, group, width, height;

        // ZORLUK AYARI GÜNCELLENDİ: Kötü obje düşme ihtimali arttı
        if (typeChance < 0.55) { // %55 ihtimalle iyi obje
            itemKey = Phaser.Utils.Array.GetRandom(GOOD_ITEMS); 
            group = sceneContext.goodItems;
            width = 50; height = 70;
        } else if (typeChance < 0.85) { // %30 ihtimalle kötü obje
            itemKey = Phaser.Utils.Array.GetRandom(BAD_ITEMS); 
            group = sceneContext.badItems;
            width = 60; height = 60;
        } else { // %15 ihtimalle power-up
            itemKey = Phaser.Utils.Array.GetRandom(POWERUPS); 
            group = sceneContext.powerups;
            width = 50; height = 50;
        }
        
        // DÜZELTME: Başlangıç pozisyonu ekranın daha da üstü yapıldı (-100)
        const item = group.create(x, -100, itemKey);
        if (item) {
            item.setDisplaySize(width, height);
            item.setVelocityY(objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    function spawnBonus() {
        if (lives <= 0 || !sceneContext) return;
        const x = Phaser.Math.Between(50, 750);
        // DÜZELTME: Başlangıç pozisyonu ekranın daha da üstü yapıldı (-100)
        const bonus = sceneContext.bonusItems.create(x, -100, 'carrefour');
        if (bonus) {
            bonus.setDisplaySize(70, 70);
            bonus.setVelocityY(objectSpeed * 2.5);
        }
    }

    function collectGoodItem(player, item) { item.destroy(); score += 5; updateScoreDisplay(); }
    function collectBonusItem(player, item) { item.destroy(); score += 30; updateScoreDisplay(); }
    function hitBadItem(player, item) { item.destroy(); score = Math.max(0, score - 5); updateScoreDisplay(); loseLife(); }
    function collectPowerup(player, item) {
        const key = item.texture.key;
        item.destroy();
        if (key === 'erikli' && lives < 3) { lives++; updateLivesDisplay(); }
    }
    
    function loseLife() {
        if (lives > 0) {
            lives--;
            updateLivesDisplay();
            if (lives <= 0) gameOver();
        }
    }
    
    function checkOutOfBounds(group, isGood) {
        if (!group || !sceneContext) return;
        group.children.each(item => {
            if (item && item.y > sceneContext.physics.world.bounds.height + 50) {
                if (isGood) loseLife();
                item.destroy();
            }
        });
    }

    function updateScoreDisplay() { 
        const scoreElement = document.getElementById('score-text');
        if (scoreElement) scoreElement.textContent = score; 
    }
    
    function updateLivesDisplay() {
        const livesDisplay = document.getElementById('lives-display');
        if (!livesDisplay) return;
        livesDisplay.innerHTML = '';
        const baseURL = window.location.href.includes('github.io') ? 'https://kyrosil.github.io/Lezzet-Yagmuru/' : '';
        for (let i = 0; i < 3; i++) {
            const lifeImg = document.createElement('img');
            lifeImg.src = baseURL + 'normal.png';
            if(i >= lives) lifeImg.style.opacity = '0.3';
            livesDisplay.appendChild(lifeImg);
        }
    }

    function gameOver() {
        if (!sceneContext) return;
        sceneContext.physics.pause();
        if(gameTimer) gameTimer.paused = true;
        if(player) player.setTint(0xff0000);
        handleGameOver(score);
    }
}
