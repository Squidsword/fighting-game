const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0,0, canvas.width, canvas.height)

const gravity = 0.3;
const fighters = [];

class Fighter {
    constructor({position = 0, velocity = 0, size = {h: 150, w:50}, color = 'red', name = 'anonymous', offset = {x: 20, y:30}}) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
        this.name = name;

        this.isAlive = true;
        this.maxHealth = 100;
        this.health = this.maxHealth;

        this.maxJumps = 2;
        this.hasFastFall = true;
        this.jumps = this.maxJumps;
        this.isAttacking = false;
        this.knockbacked = false;
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
        console.log(fighters)
        console.log(this)
        fighters.push(this);
        console.log(fighters)
    }

    draw() {
        c.fillStyle = this.color;
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
                this.velocity.x *= 0.9
            }
        }

        if (this.position.y + this.size.h + this.velocity.y > canvas.height) {
            this.position.y = canvas.height - this.size.h;
            this.velocity.y = 0;
            this.jumps = this.maxJumps;
            this.hasFastFall = true;
            this.knockbacked = false;
        } else if(this.position.y + this.velocity.y < 0) {
            this.position.y = Math.abs(this.position.y + this.velocity.y)
            this.velocity.y *= -0.618
        } else {
            this.position.y += this.velocity.y;
            this.velocity.y += gravity
        }
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y
        this.draw();
    }

    hasControl() {
        return this.isAlive && !this.knockbacked && Math.abs(this.velocity.x) <= 2
    }

    moveLeft() {
        if (this.hasControl()) {
            this.velocity.x = -2;
        }
    }

    moveRight() {
        if (this.hasControl()) {
            this.velocity.x = 2;
        }
    }

    touchingFloor() {
        return this.position.y + this.size.h >= canvas.height;
    }

    jump() {
        if (this.jumps > 0 && this.hasControl()) {
            this.velocity.y = -10;
            this.jumps--;
        }
    }
    fastFall() {
        if (this.hasFastFall && this.hasControl()) {
            this.velocity.y = Math.max(5, this.velocity.y -= 5);
            this.hasFastFall = false;
            this.knockbacked = false;
        }
    }

    attack() {
        if (this.isAttacking || !this.isAlive) {
            return;
        }
        this.updateAttackBox();
        setTimeout(() => {
            this.isAttacking = false;
            this.attackBox.enemiesHit = [];
        }, 100);
        this.isAttacking = true;
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
        var oldFacing = this.facingLeft;
        this.facingLeft = leftEnemies > rightEnemies;
        if (this.facingLeft && oldFacing != this.facingLeft) {
            this.attackBox.offset.x = (this.attackBox.offset.x * -1) - this.size.w;
        } else if (!this.facingLeft && oldFacing != this.facingLeft) {
            this.attackBox.offset.x = (this.attackBox.offset.x + this.size.w) * -1;
        }
    }

    die() {
        if (this.isAlive = true) {
            this.isAlive = false
            var temp = this.size.w;
            this.size.w = this.size.h;
            this.size.h = temp;
        }
    }

    receiveDamage(damage, source) {
        this.health -= damage;
        this.knockbacked = true;
        this.velocity.y -= 8;
        this.velocity.x = source*3;
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
    offset: {
        x: -70,
        y: 30
    },
    color:'red',
    name: 'enemy'
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
        if (keys[property]['behavior']['type'] === 'justPressed') {
            if(keys[property]['justPressed']) {
                keys[property]['behavior']['func']();
            }
        } else {
            if(keys[property]['pressed']) {
                keys[property]['behavior']['func']();
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

const keys = {
    w: {
        justPressed: false,
        pressed: false,
        behavior: {type:'justPressed', func: function() {
            player.jump();
        }}
    },
    a: {
        justPressed: false,
        pressed: false,
        behavior: {type:'pressed', func: function() {
            player.moveLeft();
        }}
    },
    s: {
        justPressed: false,
        pressed: false,
        behavior: {type:'justPressed', func: function() {
            player.fastFall();
        }}
    },
    d: {
        justPressed: false,
        pressed: false,
        behavior: {type:'pressed', func: function() {
            player.moveRight();
        }}
    },
    f: {
        justPressed:false,
        pressed: false,
        behavior: {type:'justPressed', func: function() {
            player.attack();
        }}
    },

    i: {
        justPressed: false,
        pressed: false,
        behavior: {type:'justPressed', func: function() {
            enemy.jump();
        }}
    },
    j: {
        justPressed: false,
        pressed: false,
        behavior: {type:'pressed', func: function() {
            enemy.moveLeft();
        }}
    },
    
    k: {
        justPressed: false,
        pressed: false,
        behavior: {type:'justPressed', func: function() {
            enemy.fastFall();
        }}
    },
    l: {
        justPressed: false,
        pressed: false,
        behavior: {type:'pressed', func: function() {
            enemy.moveRight();
        }}
    },
    h: {
        justPressed: false,
        pressed: false,
        behavior: {type:'justPressed', func: function() {
            enemy.attack();
        }}
    }
}

window.addEventListener('keydown', (event) => {
    console.log(event);
    try {
        keys[event.key].pressed = true;
        keys[event.key].justPressed = !event.repeat;
    } catch {
        
    }
    for (property in keys) {
        console.log(`${property}:${keys[String(property)]['pressed']} ${keys[String(property)]['justPressed']}`);
    }
})

window.addEventListener('keyup', (event) => {
    try {
        keys[event.key].pressed = false;
        keys[event.key].justPressed = false;
    } catch {
        
    }
})

function resetJustPressed() {
    for (property in keys) {
        keys[property]['justPressed'] = false;
    }
}

animate();