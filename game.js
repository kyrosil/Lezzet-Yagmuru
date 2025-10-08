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
    
    let player, cursors;
    let score = 0;
    let lives = 3;
    let scoreText, livesDisplay;
    let gameTimer;
    let spawnRate = 2000;
    let objectSpeed = 150;

    const ASSETS = {
        'basket': 'https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/70897/shopping-cart-clipart-md.png',
        'coke': 'https://pizzaghost.com/wp-content/uploads/2021/07/Coke-330ml.png',
        'coke_zero': 'https://www.coca-cola.com/content/dam/onexp/ph/en/brands/coca-cola/coca-cola-zero-sugar.png',
        'coke_light': 'https://allopizza88.fr/wp-content/uploads/2019/03/coca-cola-light.png',
        'fanta': 'https://static.vecteezy.com/system/resources/previews/054/314/808/non_2x/fanta-soft-drink-in-can-free-png.png',
        'sprite': 'https://pizzaghost.com/wp-content/uploads/2021/07/Sprite-330ml.png',
        'cappy': 'https://www.ngf.co.za/wp-content/uploads/2023/11/wp-image-32261014061239-scaled-1.jpg',
        'pepsi': 'https://www.pepsiislamabad.com/wp-content/uploads/2023/07/Pepsi-250ml-CAN-Front-min-1011x1024.png',
        'bomb': 'https://static.vecteezy.com/system/resources/previews/020/043/557/large_2x/bomb-free-download-free-png.png',
        'kitkat': 'https://www.riteway.vg/media/catalog/product/cache/9c614b974d9c34e8f596ae8002e01786/e/9/e99f8657e78587dff94261562a9e02a4.png',
        'xpress': 'https://www.nescafe.com/tr/sites/default/files/2024-02/Xpress_Original_3D_on-2.png',
        'erikli': 'https://suiste.com/images/1b5ff16c-b791-4cf1-af6e-ba25c74b53f9.png',
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
        
        this.time.addEvent({ delay: Phaser.Math.Between(15000, 30000), callback: () => spawnBonus(this), loop: true });

        scoreText = document.getElementById('score-text');
        livesDisplay = document.getElementById('lives-display');
        updateLivesDisplay();
        
        this.input.on('pointermove', (pointer) => {
            if (lives > 0) {
                 player.x = Phaser.Math.Clamp(pointer.x, player.width / 2, this.physics.world.bounds.width - (player.width * 0.15) / 2);
            }
        });
    }

    function update(time, delta) {
        if (lives <= 0) return;
        
        const elapsedTime = this.time.now / 1000;
        objectSpeed = 150 + (elapsedTime * 5);
        spawnRate = Math.max(400, 2000 - (elapsedTime * 40));
        gameTimer.delay = spawnRate;

        checkOutOfBounds(this.goodItems, true, this);
        checkOutOfBounds(this.bonusItems, true, this);
        checkOutOfBounds(this.badItems, false, this);
        checkOutOfBounds(this.powerups, false, this);
    }
    
    function spawnObject() {
        if (lives <= 0) return;
        const x = Phaser.Math.Between(50, 750);
        const typeChance = Phaser.Math.FloatBetween(0, 1);
        let itemKey, group, scale = 0.1;

        if (typeChance < 0.65) {
            itemKey = Phaser.Utils.Array.GetRandom(GOOD_ITEMS);
            group = this.goodItems;
        } else if (typeChance < 0.85) {
            itemKey = Phaser.Utils.Array.GetRandom(BAD_ITEMS);
            group = this.badItems;
        } else {
            itemKey = Phaser.Utils.Array.GetRandom(POWERUPS);
            group = this.powerups;
            scale = 0.05; // Power-up'ları daha küçük yapalım
        }

        const item = group.create(x, -50, itemKey).setScale(scale);
        item.setVelocityY(objectSpeed);
        item.setAngularVelocity(Phaser.Math.Between(-100, 100)); // Kendi etrafında dönsün
    }
    
    function spawnBonus(scene) {
        if (lives <= 0) return;
        const x = Phaser.Math.Between(50, 750);
        const bonus = scene.bonusItems.create(x, -50, 'carrefour').setScale(0.1);
        bonus.setVelocityY(objectSpeed * 2.5);
    }

    function collectGoodItem(player, item) { item.destroy(); score += 5; updateScoreDisplay(); }
    function collectBonusItem(player, item) { item.destroy(); score += 30; updateScoreDisplay(); }
    function hitBadItem(player, item) { item.destroy(); score = Math.max(0, score - 5); updateScoreDisplay(); loseLife(); }

    function collectPowerup(player, item) {
        const key = item.texture.key;
        item.destroy();
        if (key === 'erikli' && lives < 3) {
            lives++;
            updateLivesDisplay();
        }
    }
    
    function loseLife() {
        if (lives > 0) {
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                gameOver(this);
            }
        }
    }
    
    function checkOutOfBounds(group, isGood, scene) {
        group.children.each(item => {
            if (item && item.y > scene.physics.world.bounds.height + 50) {
                if (isGood) loseLife();
                item.destroy();
            }
        });
    }

    function updateScoreDisplay() { scoreText.textContent = score; }
    
    function updateLivesDisplay() {
        livesDisplay.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const lifeImg = document.createElement('img');
            lifeImg.src = ASSETS.coke;
            if(i >= lives) lifeImg.style.opacity = '0.3';
            livesDisplay.appendChild(lifeImg);
        }
    }

    function gameOver(scene) {
        scene.physics.pause();
        gameTimer.paused = true;
        player.setTint(0xff0000); // Sepeti kırmızı yap
        handleGameOver(score);
    }
}
