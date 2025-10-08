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
    let spawnRate = 2000;
    let objectSpeed = 150;
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
        // GitHub Pages'de doğru adresi bulması için adres etiketini ekliyoruz
        if (window.location.href.includes('github.io')) {
             // Repo adın 'kyrosil' ise bu doğrudur. Değilse, sondaki 'kyrosil' kısmını kendi repo adınla değiştir.
            this.load.setBaseURL('https://kyrosil.github.io/Lezzet-Yagmuru/');
        }

        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    function create() {
        sceneContext = this;
        
        // DÜZELTME: setDisplaySize ile sabit boyut veriyoruz
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
        this.time.addEvent({ delay: Phaser.Math.Between(15000, 30000), callback: spawnBonus, loop: true });

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
        
        const elapsedTime = this.time.now / 1000;
        objectSpeed = 150 + (elapsedTime * 5);
        spawnRate = Math.max(400, 2000 - (elapsedTime * 40));
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

        if (typeChance < 0.65) { 
            itemKey = Phaser.Utils.Array.GetRandom(GOOD_ITEMS); 
            group = sceneContext.goodItems;
            width = 50; height = 70; // İçecek boyutları
        } else if (typeChance < 0.85) { 
            itemKey = Phaser.Utils.Array.GetRandom(BAD_ITEMS); 
            group = sceneContext.badItems;
            width = 60; height = 60; // Kötü obje boyutları
        } else { 
            itemKey = Phaser.Utils.Array.GetRandom(POWERUPS); 
            group = sceneContext.powerups;
            width = 50; height = 50; // Power-up boyutları
        }
        
        const item = group.create(x, -50, itemKey);
        if (item) {
            // DÜZELTME: setDisplaySize ile sabit boyut veriyoruz
            item.setDisplaySize(width, height);
            item.setVelocityY(objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    function spawnBonus() {
        if (lives <= 0 || !sceneContext) return;
        const x = Phaser.Math.Between(50, 750);
        const bonus = sceneContext.bonusItems.create(x, -50, 'carrefour');
        if (bonus) {
            // DÜZELTME: setDisplaySize ile sabit boyut veriyoruz
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
        for (let i = 0; i < 3; i++) {
            const lifeImg = document.createElement('img');
            // Can barındaki resmin yolunu direkt veriyoruz, base URL'den etkilenmesin diye.
            lifeImg.src = window.location.href.includes('github.io') ? 'https://kyrosil.github.io/kyrosil/normal.png' : 'normal.png';
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
