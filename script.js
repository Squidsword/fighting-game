const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 526;

c.fillRect(0,0, canvas.width, canvas.height)

const gravity = 0.3;
const fighters = [];
const timer = new Date();


class Fighter {
    constructor({position = 0, velocity = 0, size = {h: 150, w:50}, color = 'red', damagedColor = 'white', name = 'anonymous', offset = {x: 20, y:30}}) {
        this.position = position;
        this.velocity = velocity;
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
        this.knockbacked = false;
        this.enemyLeft = false;

        this.speed = 3;
        this.gravity = gravity;

        this.facingLeft = false;

        this.attackBox = {
            offset: {
                x: offset.x,
                y: offset.y
            },
            position: {
                x: this.position.x - offset.x,
                y: this.position.y - offset.y
            },
            size: {
                w: 100,
                h: 50
            },
            enemiesHit: []
        }
        
        fighters.push(this);
    }

    draw() {
        if (this.knockbacked) {
            console.log("knockbacked")
            c.fillStyle = this.damagedColor;
        } else if (!this.isAlive) {
            c.fillStyle = 'gray'
        } else {
            c.fillStyle = this.color
        }
        c.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
        if (this.isAttacking) {
            c.fillStyle = 'green'
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.size.w, this.attackBox.size.h);
        }
    }

    update() {
        if (this.position.x + this.velocity.x < 0) {
            this.position.x = 0
            this.velocity.x = -0.75 * this.velocity.x;
        } else if (this.position.x + this.velocity.x + this.size.w > canvas.width) {
            this.position.x = canvas.width - this.size.w;
            this.velocity.x = -0.75 * this.velocity.x;
        } else {
            this.position.x += this.velocity.x;
            if (this.touchingFloor()) {
                this.velocity.x *= 0.93
                this.jumps = this.maxJumps;
                this.hasFastFall = true;
                this.knockbacked = false;
            } else {
                this.velocity.x *= 0.995
            }
        }

        if (this.position.y + this.size.h + this.velocity.y > canvas.height) {
            this.position.y = canvas.height - this.size.h;
            this.velocity.y = 0;

        } else if(this.position.y + this.velocity.y < 0) {
            this.position.y = Math.abs(this.position.y + this.velocity.y)
            this.velocity.y *= -0.312
        } else {
            this.position.y += this.velocity.y;
            this.velocity.y += gravity
            if (this.touchingWall()) {
                this.velocity.y = Math.min(this.velocity.y, 1.5);
            }
        }
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y
        this.draw();
    }

    hasControl() {
        return this.isAlive && !this.knockbacked && Math.abs(this.velocity.x) <= this.speed;
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

    touchingFloor() {
        return this.position.y + this.size.h >= canvas.height;
    }

    touchingWall() {
        return this.position.x <= 0 || this.position.x + this.size.w >= canvas.width;
    }

    isAirborne() {
        return !this.touchingFloor() && !this.touchingWall()
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
            this.velocity.y = Math.max(5, this.velocity.y += 5);
            this.hasFastFall = false;
            this.knockbacked = false;
        }
    }

    attack() {
        if (this.isAttacking || !this.isAlive) {
            return;
        }
        this.updateAttackBox();
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
            this.attackBox.enemiesHit = [];
        }, 100);
    }

    dash() {
        if (!this.hasDash) {
            return;
        }
        if (this.facingLeft) {
            this.velocity.x -= 10;
        } else {
            this.velocity.x += 10;
        }
        this.hasDash = false;
        this.velocity.y = 0;
        this.gravity = 0;
        setTimeout(() => {
            this.gravity = gravity;
            if(this.isAirborne) {
                this.velocity.x *= 0.2
            }
        }, 75)
        setTimeout(() => {
            this.hasDash = true;
        }, 500);
    }

    updateAttackBox() {
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
        if (this.enemyLeft == leftEnemies > rightEnemies) {
            return;
        }
        this.enemyLeft = leftEnemies > rightEnemies;
        if (this.enemyLeft) {
            this.attackBox.offset.x = (this.attackBox.offset.x * -1) - this.size.w;
        } else {
            this.attackBox.offset.x = (this.attackBox.offset.x + this.size.w) * -1;
        }
    }

    updateHealth() {
        var fighterHealth = document.getElementById(`${this.name}Health`)
        fighterHealth.style.width = `${this.health / this.maxHealth * 100}%`
    }

    die() {
        if (!this.isAlive) {
            return
        }
        this.isAlive = false
        var temp = this.size.w;
        this.size.w = this.size.h;
        this.size.h = temp;
    }

    receiveDamage(damage, source) {
        this.health -= damage;
        this.knockbacked = true;
        this.position.y -= 1;
        this.velocity.y -= 8;
        this.velocity.x = source*3;
        this.updateHealth();
        if (this.health <= 0) {
            this.health = 0
            this.die()
        }
    }
}

function checkCollision(object1, object2) {
    var horizontalCollision = object1.position.x + object1.size.w > object2.position.x &&
    object1.position.x < object2.position.x + object2.size.w;

    var verticalCollision = object1.position.y + object1.size.h > object2.position.y &&
    object1.position.y < object2.position.y + object2.size.h;
    
    if (horizontalCollision && verticalCollision) {
        return true;
    }
}

function checkHits(fighter) {
    var collisions = [];
    var opponents = getOpponents(fighter);
    for (opponent in opponents) {
        if (fighter.isAttacking && checkCollision(fighter.attackBox, opponents[opponent])) {
            collisions.push(opponents[opponent]);
        }
    }
    return collisions;
}

const player = new Fighter({
    position: {
        x: 50,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0,
        topSpeed: 10
    },
    size:{
        h:150,
        w:50
    },
    color:'blue',
    name: 'player'
});

const enemy = new Fighter({
    position: {
        x: 925,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0
    },
    size: {
        h:150,
        w:50
    },
    color:'red',
    name: 'enemy',
})

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0,0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    handleKeys();
    handleHits();

    resetJustPressed();
}

function handleKeys() {

    for (property in keys) {
        for (behavior in keys[property]['behaviors']) {
            if (keys[property]['behaviors'][behavior]['type'] === 'justPressed') {
                if(keys[property]['justPressed']) {
                    keys[property]['behaviors'][behavior]['func']();
                }
            } else if (keys[property]['behaviors'][behavior]['type'] === 'pressed'){
                if(keys[property]['pressed']) {
                    keys[property]['behaviors'][behavior]['func']();
                }
            } else if (keys[property]['behaviors'][behavior]['type'] === 'xpressed') {
                if(keys[property]['pressed'] && !keys[property]['justPressed']) {
                    keys[property]['behaviors'][behavior]['func']();
                }
            }
        }
    }

}

function handleHits() {
    for (user in fighters) {
        var hitEnemies = checkHits(fighters[user]);
        for (enemyFighter in hitEnemies) {
            if (!fighters[user].attackBox.enemiesHit.includes(hitEnemies[enemyFighter])) {
                fighters[user].position.x < hitEnemies[enemyFighter].position.x ? source = 1 : source = -1;
                hitEnemies[enemyFighter].receiveDamage(10, source)
                fighters[user].attackBox.enemiesHit.push(hitEnemies[enemyFighter])
                console.log(hitEnemies[enemyFighter].name + " was hit")
            }
            
        }
    }
}

function getOpponents(fighterPlayer) {
    var opponents = [];
    for (fighter in fighters) {
        if (fighters[fighter] !== fighterPlayer) {
            opponents.push(fighters[fighter]);
        }
    }
    return opponents;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const keys = {
    KeyW: {
        justPressed: false,
        pressed: false,
        behaviors: [{
            type:'justPressed',
            func: function() {
                player.jump();
            }
        },
        {
            type:'xpressed', 
            func: function() {
                player.spamJump();
            }
        }]
    },
    KeyA: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', func: function() {
            player.moveLeft();
        }}]
    },
    KeyS: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', func: function() {
            player.fastFall();
        }}]
    },
    KeyD: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', func: function() {
            player.moveRight();
        }}]
    },
    KeyF: {
        justPressed:false,
        pressed: false,
        behaviors: [{type:'justPressed', func: function() {
            player.attack();
        }}]
    },
    ShiftLeft: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', func: function() {
            player.dash();
        }}]
    },

    KeyP: {
        justPressed: false,
        pressed: false,
        behaviors: [{
            type:'justPressed',
            func: function() {
                enemy.jump();
            }
        },
        {
            type:'xpressed', 
            func: function() {
                enemy.spamJump();
            }
        }]
    },
    KeyL: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', func: function() {
            enemy.moveLeft();
        }}]
    },
    
    Semicolon: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', func: function() {
            enemy.fastFall();
        }}]
    },
    Quote: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', func: function() {
            enemy.moveRight();
        }}]
    },
    KeyK: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', func: function() {
            enemy.attack();
        }}]
    },
    ShiftRight: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', func: function() {
            enemy.dash();
        }}]
    }
}

window.addEventListener('keydown', (event) => {
    console.log(event);
    try {
        keys[event.code].pressed = true;
        keys[event.code].justPressed = !event.repeat;
    } catch {
        console.log("key not binded")
    }
    for (property in keys) {
        console.log(`${property}:${keys[String(property)]['pressed']} ${keys[String(property)]['justPressed']}`);
    }
})

window.addEventListener('keyup', (event) => {
    try {
        keys[event.code].pressed = false;
        keys[event.code].justPressed = false;
    } catch {
        
    }
})

function resetJustPressed() {
    for (property in keys) {
        keys[property]['justPressed'] = false;
    }
}

animate();