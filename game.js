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
    
    let player, gameTimer, bonusTimer;
    let score, lives, spawnRate, objectSpeed;
    let sceneContext;

    const ASSETS = {
        'basket': 'sepet.png', 'coke': 'normal.png', 'coke_zero': 'zero.png',
        'coke_light': 'light.png', 'fanta': 'fanta.png', 'sprite': 'sprite.png',
        'cappy': 'https://i.imgur.com/832gT26.png', 'pepsi': 'pepsi.png',
        'bomb': 'bomb.png', 'kitkat': 'kitkat.png', 'xpress': 'xpress.png',
        'erikli': 'erikli.png', 'carrefour': 'carrefour.png'
    };
    
    const GOOD_ITEMS = ['coke', 'coke_zero', 'coke_light', 'fanta', 'sprite', 'cappy'];
    const BAD_ITEMS = ['pepsi', 'bomb'];
    const POWERUPS = ['kitkat', 'xpress', 'erikli'];

    function preload() {
        if (window.location.href.includes('github.io')) {
            this.load.setBaseURL('https://kyrosil.github.io/Lezzet-Yagmuru/');
        }
        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    function create() {
        sceneContext = this;

        // DÜZELTME 1: Her oyun başladığında tüm değerler sıfırlanıyor.
        score = 0;
        lives = 3;
        spawnRate = 1800;
        objectSpeed = 200;
        
        player = this.physics.add.sprite(400, 550, 'basket').setDisplaySize(130, 110).setCollideWorldBounds(true);
        player.body.immovable = true;
        
        this.goodItems = this.physics.add.group();
        this.badItems = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.bonusItems = this.physics.add.group();

        this.physics.add.overlap(player, this.goodItems, collectGoodItem, null, this);
        this.physics.add.overlap(player, this.badItems, hitBadItem, null, this);
        this.physics.add.overlap(player, this.powerups, collectPowerup, null, this);
        this.physics.add.overlap(player, this.bonusItems, collectBonusItem, null, this);
        
        if (gameTimer) gameTimer.destroy();
        gameTimer = this.time.addEvent({ delay: spawnRate, callback: spawnObject, callbackScope: this, loop: true });
        
        if (bonusTimer) bonusTimer.destroy();
        bonusTimer = this.time.addEvent({ delay: Phaser.Math.Between(15000, 25000), callback: spawnBonus, loop: true });

        updateScoreDisplay();
        updateLivesDisplay();
        
        this.input.on('pointermove', (pointer) => {
            if (lives > 0) {
                 player.x = Phaser.Math.Clamp(pointer.x, 65, this.physics.world.bounds.width - 65);
            }
        });
    }

    function update(time, delta) {
        if (lives <= 0) return;
        
        const elapsedTime = this.time.now / 1000;
        objectSpeed = 200 + (elapsedTime * 8);
        spawnRate = Math.max(300, 1800 - (elapsedTime * 50));
        gameTimer.delay = spawnRate;

        checkOutOfBounds(this.goodItems, true);
        checkOutOfBounds(this.bonusItems, true);
        checkOutOfBounds(this.badItems, false);
        checkOutOfBounds(this.powerups, false);
    }
    
    function spawnObject() {
        if (lives <= 0 || !sceneContext) return;
        const x = Phaser.Math.Between(50, sceneContext.scale.width - 50);
        const typeChance = Phaser.Math.FloatBetween(0, 1);
        let itemKey, group, width, height;

        if (typeChance < 0.70) {
            itemKey = Phaser.Utils.Array.GetRandom(GOOD_ITEMS); 
            group = sceneContext.goodItems; width = 80; height = 100; 
        } else if (typeChance < 0.90) {
            itemKey = Phaser.Utils.Array.GetRandom(BAD_ITEMS); 
            group = sceneContext.badItems; width = 85; height = 85; 
        } else {
            itemKey = Phaser.Utils.Array.GetRandom(POWERUPS); 
            group = sceneContext.powerups; width = 70; height = 70; 
        }
        
        // DÜZELTME 2: Başlangıç pozisyonu artık dinamik olarak ekranın tepesinin üstü.
        const spawnY = sceneContext.cameras.main.worldView.y - 100;
        const item = group.create(x, spawnY, itemKey);
        if (item) {
            item.setDisplaySize(width, height);
            item.setVelocityY(objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    function spawnBonus() {
        if (lives <= 0 || !sceneContext) return;
        const x = Phaser.Math.Between(50, sceneContext.scale.width - 50);
        const spawnY = sceneContext.cameras.main.worldView.y - 100;
        const bonus = sceneContext.bonusItems.create(x, spawnY, 'carrefour');
        if (bonus) {
            bonus.setDisplaySize(90, 90);
            bonus.setVelocityY(objectSpeed * 2.5);
        }
    }

    function collectGoodItem(player, item) { item.destroy(); score += 5; updateScoreDisplay(); }
    function collectBonusItem(player, item) { item.destroy(); score += 30; updateScoreDisplay(); }
    function hitBadItem(player, item) { item.destroy(); score = Math.max(0, score - 5); updateScoreDisplay(); loseLife(); }
    
    function collectPowerup(player, item) {
        const key = item.texture.key;
        item.destroy();
        
        // DÜZELTME 3: Tüm güçlendirmeler artık çalışıyor.
        if (key === 'erikli' && lives < 3) {
            lives++;
            updateLivesDisplay();
        } else if (key === 'xpress' || key === 'kitkat') {
            sceneContext.physics.world.timeScale = 0.5; // Her şeyi yavaşlat
            sceneContext.time.delayedCall(3000, () => {
                if (sceneContext && sceneContext.physics) {
                    sceneContext.physics.world.timeScale = 1; // 3 saniye sonra normale döndür
                }
            }, [], sceneContext);
        }
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
        const children = [...group.getChildren()]; // Diziyi kopyala
        children.forEach(item => {
            if (item && item.y > sceneContext.scale.height + 100) {
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
        if (gameTimer) gameTimer.destroy();
        if (bonusTimer) bonusTimer.destroy();
        if (player) player.setTint(0xff0000).setVelocityX(0);
        handleGameOver(score);
    }
}
