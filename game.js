export function createGame(handleGameOver) {
    const config = {
        type: Phaser.AUTO,
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
        'carrefour': 'https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1'
    };
    
    const GOOD_ITEMS = ['coke', 'coke_zero', 'coke_light', 'fanta', 'sprite', 'cappy'];
    const BAD_ITEMS = ['pepsi', 'bomb'];
    const POWERUPS = ['kitkat', 'xpress', 'erikli'];

    function preload() {
        for (const key in ASSETS) {
            this.load.image(key, ASSETS[key]);
        }
    }

    function create() {
        sceneContext = this;
        player = this.physics.add.sprite(400, 550, 'basket').setScale(0.15).setCollideWorldBounds(true);
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
                 player.x = Phaser.Math.Clamp(pointer.x, (player.width * 0.15) / 2, this.physics.world.bounds.width - (player.width * 0.15) / 2);
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
        let itemKey, group, scale = 0.1;

        if (typeChance < 0.65) { itemKey = Phaser.Utils.Array.GetRandom(GOOD_ITEMS); group = sceneContext.goodItems; } 
        else if (typeChance < 0.85) { itemKey = Phaser.Utils.Array.GetRandom(BAD_ITEMS); group = sceneContext.badItems; } 
        else { itemKey = Phaser.Utils.Array.GetRandom(POWERUPS); group = sceneContext.powerups; scale = 0.05; }
        
        const item = group.create(x, -50, itemKey);
        if (item) {
            item.setScale(scale);
            item.setVelocityY(objectSpeed);
            item.setAngularVelocity(Phaser.Math.Between(-100, 100));
        }
    }
    
    function spawnBonus() {
        if (lives <= 0 || !sceneContext) return;
        const x = Phaser.Math.Between(50, 750);
        const bonus = sceneContext.bonusItems.create(x, -50, 'carrefour');
        if (bonus) {
            bonus.setScale(0.1);
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

    function updateScoreDisplay() { document.getElementById('score-text').textContent = score; }
    
    function updateLivesDisplay() {
        const livesDisplay = document.getElementById('lives-display');
        livesDisplay.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const lifeImg = document.createElement('img');
            lifeImg.src = ASSETS.coke;
            if(i >= lives) lifeImg.style.opacity = '0.3';
            livesDisplay.appendChild(lifeImg);
        }
    }

    function gameOver() {
        if (!sceneContext) return;
        sceneContext.physics.pause();
        gameTimer.paused = true;
        if(player) player.setTint(0xff0000);
        handleGameOver(score);
    }
}
