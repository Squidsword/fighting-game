const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0,0, canvas.width, canvas.height)

const gravity = 0.3;
const fighters = [];
class Sprite {
    constructor({position, velocity, size, color, name}) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
        this.name = name;

        this.maxHealth = 100;
        this.health = this.maxHealth;

        this.maxJumps = 2;
        this.hasFastFall = true;
        this.jumps = this.maxJumps;
        this.isAttacking = false;

        this.attackBox = {
            position: this.position,
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
            this.position.x = 0;
            this.velocity.x = 0;
        } else if (this.position.x + this.velocity.x + this.size.w > canvas.width) {
            this.position.x = canvas.width - this.size.w;
            this.velocity.x = 0;
        } else {
            this.position.x += this.velocity.x;
        }

        if (this.position.y + this.size.h + this.velocity.y > canvas.height) {
            this.position.y = canvas.height - this.size.h;
            this.velocity.y = 0;
            this.jumps = this.maxJumps;
            this.hasFastFall = true;
        } else if(this.position.y + this.velocity.y < 0) {
            this.position.y = Math.abs(this.position.y + this.velocity.y)
            this.velocity.y *= -0.618
        } else {
            this.position.y += this.velocity.y;
            this.velocity.y += gravity
        }
        
        this.draw();
    }

    moveLeft() {
        this.velocity.x = -2;
    }

    moveRight() {
        this.velocity.x = 2;
    }

    jump() {
        if (this.jumps > 0) {
            this.velocity.y = -10;
            this.jumps--;
        }
    }
    fastFall() {
        if (this.hasFastFall) {
            this.velocity.y = Math.max(5, this.velocity.y -= 5);
            this.hasFastFall = false;
        }
    }

    attack() {
        if (this.isAttacking) {
            return;
        }
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
            this.attackBox.enemiesHit = [];
        }, 100);
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

const player = new Sprite({
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

const enemy = new Sprite({
    position: {
        x: 925,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0
    },
    size:{
        h:150,
        w:50
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

    player.velocity.x = 0;
    enemy.velocity.x = 0;
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

    for (user in fighters) {
        var hitEnemies = checkHits(fighters[user]);
        for (enemyFighter in hitEnemies) {
            if (!fighters[user].attackBox.enemiesHit.includes(hitEnemies[enemyFighter])) {
                hitEnemies[enemyFighter].health -= 10;
                if (hitEnemies[enemyFighter].health < 0) {
                    hitEnemies[enemyFighter].health = 0;
                }
                fighters[user].attackBox.enemiesHit.push(hitEnemies[enemyFighter])
                console.log(hitEnemies[enemyFighter].name + " was hit")
            }
            
        }
    }

    resetJustPressed();
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