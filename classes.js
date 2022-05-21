class Sprite {
    constructor({position = {x:0, y:0}, imageSrc = '', scale = 1, framesMax = 1, offset = {x:0, y:0}}, framesHold = slowFrameFactor) {
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = Math.ceil(framesHold);
        this.position = position;
        this.offset = offset;

    }
    update() {
        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
                this.image.height * this.scale
        )
    }
}

class Fighter extends Sprite {
    constructor({
        position = {x:0, y:0}, 
        velocity = {x:0, y:0}, 
        size = {h: 125, w:50}, 
        color = 'red', 
        damagedColor = 'white', 
        name = 'anonymous', 
        attackOffset = {x: 30, y:10}, 
        keyMap,
        scale = 1, 
        imageSrc,
        framesMax,
        offset = {x:215, y:180},
        sprites = {
            attack1: {
                imageSrc: './Martial Hero/Sprites/Attack1.png',
                framesMax: 6
            },
            attack1Flipped: {
                imageSrc: './Martial Hero/Sprites/Attack1 Flipped.png',
                framesMax: 6
            },
            idle: {
                imageSrc: './Martial Hero/Sprites/Idle.png',
                framesMax: 8
            },
            idleFlipped: {
                imageSrc: './Martial Hero/Sprites/Idle Flipped.png',
                framesMax: 8
            },
            run: {
                imageSrc: './Martial Hero/Sprites/Run.png',
                framesMax: 8
            },
            runFlipped: {
                imageSrc: './Martial Hero/Sprites/Run Flipped.png',
                framesMax: 8
            },
            jump: {
                imageSrc: './Martial Hero/Sprites/Jump.png',
                framesMax: 2
            },
            jumpFlipped: {
                imageSrc: './Martial Hero/Sprites/Jump Flipped.png',
                framesMax: 2
            },
            fall: {
                imageSrc: './Martial Hero/Sprites/Fall.png',
                framesMax: 2
            },
            fallFlipped: {
                imageSrc: './Martial Hero/Sprites/Fall Flipped.png',
                framesMax: 2
            },
            death: {
                imageSrc: './Martial Hero/Sprites/Death.png',
                framesMax: 6
            },
            deathFlipped: {
                imageSrc: './Martial Hero/Sprites/Death.png',
                framesMax: 6
            }
        }
    }) {

        super({
            imageSrc,
            scale,
            framesMax,
            offset
        })

        this.position = position;
        this.velocity = velocity;

        this.standardizedVelocity = velocity;

        this.size = size;
        this.color = color;
        this.damagedColor = damagedColor;
        this.name = name;

        this.isAlive = true;
        this.maxHealth = 250;
        this.health = this.maxHealth;

        this.maxJumps = 2;
        this.hasFastFall = true;
        this.hasDash = true;
        this.jumps = this.maxJumps;
        this.isAttacking = false;
        this.canAttack = true;
        this.knockbacked = false;
        this.enemyLeft = false;
        this.isDashing = false;

        this.speed = 3.75;
        this.baseSpeed = 3.75;
        this.combo = 0;
        this.comboExpireTimer = null;
        this.speedReductionTimer = null;

        this.deathAnimationComplete = false;

        this.gravity = gravity;
        this.friction = 0.93;

        this.facingLeft = false;

        this.keyMap = keyMap;

        this.sprites = sprites;

        this.debugMode = false;
        
        this.velocityHighscore = 0;

        for (var loopSprite in this.sprites) {
            this.sprites[loopSprite].image = new Image()
            this.sprites[loopSprite].image.src = sprites[loopSprite].imageSrc
        }

        this.attackOffset = attackOffset;
        this.attackBoxes = {
            up: {
                facingLeft: false,
                attackOffset: {
                    x: attackOffset.x,
                    y: attackOffset.y
                },
                position: {
                    x: this.position.x - attackOffset.x,
                    y: this.position.y - attackOffset.y
                },
                size: {
                    w: 175,
                    h: 100
                },
                enemiesHit: []
            },
            middle: {
                facingLeft: false,
                attackOffset: {
                    x: attackOffset.x,
                    y: attackOffset.y
                },
                position: {
                    x: this.position.x - attackOffset.xf,
                    y: this.position.y - attackOffset.y
                },
                size: {
                    w: 200,
                    h: 100
                },
                enemiesHit: []
            },
            down: {
                facingLeft: false,
                attackOffset: {
                    x: attackOffset.x,
                    y: attackOffset.y
                },
                position: {
                    x: this.position.x - attackOffset.x,
                    y: this.position.y - attackOffset.y
                },
                size: {
                    w: 200,
                    h: 100
                },
                enemiesHit: []
            },
        }
        this.attackBox = this.attackBoxes["middle"];

        fighters.push(this);
    }

    attack() {
        if (this.isAttacking || !this.isAlive || this.knockbacked || !this.canAttack) {
            return;
        }
        this.framesHold = 1;
        this.updateAttackBox();
        this.isAttacking = true;
        this.canAttack = false;
        var id;
        setTimeout(() => {
            this.isAttacking = false;
            if (this.attackBox.enemiesHit.length > 0) {
                clearTimeout(id);
                this.canAttack = true;
                this.incrementCombo();
            } else {
                this.resetCombo();
                setTimeout(() => {
                    this.canAttack = true;
                },500)
            }
            this.attackBox.enemiesHit = [];
            this.framesHold = Math.ceil(slowFrameFactor);
        }, 100);
    }

    moveLeft() {
        if (this.hasControl()) {
            this.velocity.x = -this.speed;
        }
        this.facingLeft = true;
    }

    moveRight() {
        if (this.hasControl()) {
            this.velocity.x = this.speed;
        }
        this.facingLeft = false;
    }

    jump() {
        if (this.touchingWall() && !this.touchingFloor()) {
            this.velocity.x *= 2.5;
            this.velocity.y = -8;
        } else if (this.jumps > 0 && this.isAirborne()) {
            this.knockbacked = false;
            this.velocity.y = -10;
            this.jumps = 0;
        } else if (this.jumps > 0 && this.hasControl()) {
            this.velocity.y = -10;
            this.jumps--;
        }
    }   

    spamJump() {
        if (this.position.y + this.size.h === canvas.height) {
            this.jump();
        }
    }

    fastFall() {
        if (this.hasFastFall && this.isAlive) {
            this.velocity.y = Math.max(10, this.velocity.y += 10);
            this.hasFastFall = false;
            this.knockbacked = false;
        }
    }

    dash() {
        if (!this.hasDash) {
            return;
        }
        var oldVelocity = this.velocity.x;
        if (this.velocity.x < 0) {
            this.velocity.x -= 5;
        } else {
            this.velocity.x += 5;
            
        }
        if (this.facingLeft) {
            oldVelocity = -Math.abs(oldVelocity);
            this.velocity.x = -1.5 * Math.abs(this.velocity.x)
        } else {
            oldVelocity = Math.abs(oldVelocity);
            this.velocity.x = 1.5 * Math.abs(this.velocity.x)
        }
        
        this.hasDash = false;
        this.isDashing = true;
        this.velocity.y = 0;
        this.gravity = 0;
        this.friction = 0.99;
        setTimeout(() => {
            this.gravity = gravity;
            this.friction = 0.93;
            if(this.isAirborne) {
                this.velocity.x = oldVelocity;
            }
            if (this.touchingWall) {
                this.velocity.x = 0;
            }
            this.isDashing = false;
        }, 75)
        setTimeout(() => {
            this.hasDash = true;
        }, 500);
    }

    die() {
        if (!this.isAlive) {
            return
        }
        this.isAlive = false
    }

    receiveDamage(damage, source) {
        if (!this.isAlive) {
            return;
        }
        this.health -= damage;
        this.knockbacked = true;
        this.position.y -= 1;
        this.velocity.y = -8 + 0.382*source.velocity.y;
        var direction;
        if (source.position.x > this.position.x) {
            direction = -1
        } else {
            direction = 1;
        }
        if (direction * source.velocity.x > 0 && Math.abs(source.velocity.x) > Math.abs(this.velocity.x)) {
            this.velocity.x = this.velocity.x*0.5 + source.velocity.x*0.5 + direction*3;
        } else {
            this.velocity.x += direction*3;
        }
        this.updateHealth();
        if (this.health <= 0) {
            this.health = 0
            this.die()
        }
    }

    hasControl() {
        return this.isAlive && !this.knockbacked && Math.abs(this.velocity.x) <= this.speed;
    }

    hasMovementControl() {
        return this.hasControl();
    }

    touchingFloor() {
        return this.position.y + this.size.h >= canvas.height;
    }

    touchingWall() {
        return this.position.x <= 0 || this.position.x + this.size.w >= canvas.width;
    }

    isAirborne() {
        return !this.touchingFloor() && !this.touchingWall()
    }

    incrementCombo() {
        clearInterval(this.speedReductionTimer);
        clearTimeout(this.comboExpireTimer);
        this.combo++;
        this.speed = this.baseSpeed + Math.pow(this.combo * 0.5, 0.8);
        this.updateComboText();
        this.updateSpeedText();
        console.log(`${this.name} speed: ${this.speed}`)
        this.comboExpireTimer = setTimeout(() => {
            this.resetCombo();
        }, 1000);
    }

    update() {
        if (!this.deathAnimationComplete) {
            this.framesElapsed++
            if (this.framesElapsed % this.framesHold === 0) {
                if(this.framesCurrent < this.framesMax - 1) {
                    this.framesCurrent++;
                } else {
                    if (this.image === this.sprites.death.image || this.image === this.sprites.deathFlipped.image) {
                        this.deathAnimationComplete = true;
                    } else {
                        this.framesCurrent = 0;
                    }
                }
            }
        }
        if (this.position.x + this.velocity.x < 0) {
            this.position.x = 0
            this.velocity.x = -0.75 * this.velocity.x;
        } else if (this.position.x + this.velocity.x + this.size.w > canvas.width) {
            this.position.x = canvas.width - this.size.w;
            this.velocity.x = -0.75 * this.velocity.x;
        } else {
            this.position.x += standardizeVelocity(this.velocity.x);
            this.updateVelocityText();
            if (this.touchingFloor()) {
                this.velocity.x *= this.friction;
                this.jumps = this.maxJumps;
                this.hasFastFall = true;
                this.knockbacked = false;
            } else {
                this.velocity.x *= 0.998
            }
        }

        if (this.position.y + this.size.h + this.velocity.y > canvas.height) {
            this.position.y = canvas.height - this.size.h;
            this.velocity.y = 0;

        } else if(this.position.y + this.velocity.y < 0) {
            this.position.y = Math.abs(this.position.y + this.velocity.y)
            this.velocity.y *= -0.312
        } else {
            this.position.y += standardizeVelocity(this.velocity.y);
            if (this.position.y + this.size.h < canvas.height) {
                this.velocity.y += gravity
            }
            if (this.touchingWall()) {
                this.velocity.y = Math.min(this.velocity.y, 1.5);
            }
        }

        this.attackBox.position.x = this.position.x + this.attackBox.attackOffset.x
        this.attackBox.position.y = this.position.y + this.attackBox.attackOffset.y
        
        if (Math.abs(this.velocity.x) > this.velocityHighscore) {
            this.velocityHighscore = Math.abs(this.velocity.x);
        }
        this.updateSprite();
        this.updateEnemiesLeft();
        this.draw();
    }


    switchSprite(sprite) {

        if (this.image !== sprite.image) {
            this.framesMax = sprite.framesMax;
            this.image = sprite.image;
            this.framesCurrent = 0;
        }
    }


    updateSprite() {
        if (this.deathAnimationComplete) {
            return;
        }
        if (this.enemyLeft) {
            if (!this.isAlive && this.touchingFloor()) {
                this.switchSprite(this.sprites.deathFlipped);
                return;
            }
            if (this.isAttacking) {
                this.switchSprite(this.sprites.attack1Flipped)
                return;
            }
            if (this.velocity.y > 0.01) {
                this.switchSprite(this.sprites.fallFlipped)
                return;
            }
            if (this.velocity.y < -0.01) {
                this.switchSprite(this.sprites.jumpFlipped)
                return;
            }
            if (Math.abs(this.velocity.x) > 0.5) {
                this.switchSprite(this.sprites.runFlipped)
                return;
            } else {
                this.switchSprite(this.sprites.idleFlipped)
                return;
            }
        } else {
            if (!this.isAlive && this.touchingFloor()) {
                this.switchSprite(this.sprites.death);
                return;
            }
            if (this.isAttacking) {
                this.switchSprite(this.sprites.attack1)
                return;
            }
            if (this.velocity.y > 0.01) {
                this.switchSprite(this.sprites.fall)
                return;
            }
            if (this.velocity.y < -0.01) {
                this.switchSprite(this.sprites.jump)
                return;
            }
            if (Math.abs(this.velocity.x) > 0.5) {
                this.switchSprite(this.sprites.run)
                return;
            } else {
                this.switchSprite(this.sprites.idle)
                return;
            }
        } 
    }

    updateEnemiesLeft() {
        var enemyList = getOpponents(this);
        var leftEnemies = 0;
        var rightEnemies = 0;
        for (enemyFighter in enemyList) {
            var enemyFighter = enemyList[enemyFighter];
            if (this.position.x > enemyFighter.position.x) {
                leftEnemies++;
            } else {
                rightEnemies++;
            }
        }
        this.enemyLeft = leftEnemies > rightEnemies;
    }

    updateComboText() {
        try {
            var combo = document.getElementById(`${this.name}Flow`);
            combo.textContent = `Flow: ${this.combo}`;
        } catch {
            console.log("combotext not found");
        }
    }

    updateSpeedText() {
        try {
            var speed = document.getElementById(`${this.name}Speed`);
            speed.textContent = `Run Speed: ${this.speed.toFixed(2)}`;
        } catch {
            console.log("combotext not found");
        }
    }

    updateVelocityText() {
        try {
            var velocity = document.getElementById(`${this.name}Velocity`);
            velocity.textContent = `Velocity: ${Math.abs(this.velocity.x.toFixed(2))}`;
        } catch {
            console.log("combotext not found");
        }
    }

    resetCombo() {
        console.log(`${this.name} combo resetting...`)
        clearTimeout(this.comboExpireTimer);
        this.combo = 0;
        this.updateComboText();
        this.speedReductionTimer = setInterval(() => {
            if (this.speed * 0.9 < this.baseSpeed) {
                this.speed = this.baseSpeed;
                clearInterval(this.speedReductionTimer);
            } else {
                this.speed *= 0.93;
            }
            this.updateSpeedText();
        }, 50)
    }

    updateAttackBox() {

        if (keys[this.keyMap["jump"]["key"]]["pressed"] == true) {
            this.attackBox = this.attackBoxes["up"];
        } else if (keys[this.keyMap["fall"]["key"]]["pressed"] == true) {
            this.attackBox = this.attackBoxes["down"];
        } else {
            this.attackBox = this.attackBoxes["middle"];
        }

        if (this.enemyLeft) {
            if (!this.attackBox.facingLeft) {
                this.attackBox.attackOffset.x = (this.attackBox.attackOffset.x * -1) + this.size.w - this.attackBox.size.w;
                this.attackBox.facingLeft = true;
            }
        } else {
            if (this.attackBox.facingLeft) {
                this.attackBox.attackOffset.x = (this.attackBox.attackOffset.x - this.size.w + this.attackBox.size.w) * -1;
                this.attackBox.facingLeft = false;
            }
        }
    }

    updateHealth() {
        gsap.to(`#${this.name}Health`, {
            width: `${this.health / this.maxHealth * 100}%`
        })
    }

    drawRectangle() {
        if (this.knockbacked) {
            c.fillStyle = this.damagedColor;
        } else if (!this.isAlive) {
            c.fillStyle = 'gray'
        } else {
            c.fillStyle = this.color
        }
        c.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
        if (this.isAttacking) {
            c.fillStyle = 'purple'
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.size.w, this.attackBox.size.h);
        }
    }

    draw() {
        if (this.debugMode) {
            this.drawRectangle();
        }
        if (this.image.src == '') {
            this.drawRectangle();
        } else {
            c.drawImage(
                this.image,
                this.framesCurrent * (this.image.width / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                this.position.x - this.offset.x,
                this.position.y - this.offset.y,
                (this.image.width / this.framesMax) * this.scale,
                this.image.height * this.scale
            )
        }
    }
}

function standardizeVelocity(velocity) {
    return velocity * 144 / framesPerSecond;
}

// later
function standardizeMultiplier(value) {
    return Math.pow(value * 144 / framesPerSecond);
}
