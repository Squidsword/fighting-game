const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0,0, canvas.width, canvas.height)

const gravity = 0.3;
class Sprite {
    constructor({position, velocity, size, color}) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.color = color;

        this.maxHealth = 100;
        this.maxJumps = 2;
        this.hasFastFall = true;
        this.jumps = 2;

        this.attackBox = {
            position: this.position,
            size: {
                w: 100,
                h: 50
            }
        }
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);

        c.fillStyle = 'green'
        c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.size.w, this.attackBox.size.h);
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
}

function checkCollision(object1, object2) {
    horizontalCollision = object1.position.x + object1.size.w > object2.position.x &&
    object1.position.x < object2.position.x + object2.size.w;

    verticalCollision = object1.position.y + object1.size.h > object2.position.y &&
    object1.position.y < object2.position.y + object2.size.h;
    
    if (horizontalCollision && verticalCollision) {
        return true;
    }
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
    color:'blue'
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
    color:'red'
})

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0,0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    player.velocity.x = 0;
    if (keys.w.justPressed) {
        player.jump();
    } else if (keys.a.pressed) {
        player.velocity.x = -2;
    } else if (keys.s.justPressed) {
        player.fastFall();
    } else if (keys.d.pressed) {
        player.velocity.x = 2;
    }

    enemy.velocity.x = 0;
    if (keys.i.justPressed) {
        enemy.jump();
    } else if (keys.j.pressed) {
        enemy.velocity.x = -2;
    } else if (keys.k.justPressed) {
        enemy.fastFall();
    } else if (keys.l.pressed) {
        enemy.velocity.x = 2;
    }

    if (checkCollision(player.attackBox, enemy)) {
        console.log("collision")
    }

    resetJustPressed();
}

const keys = {
    w: {
        justPressed: false,
        pressed: false
    },
    a: {
        justPressed: false,
        pressed: false
    },
    s: {
        justPressed: false,
        pressed: false
    },
    d: {
        justPressed: false,
        pressed: false
    },

    i: {
        justPressed: false,
        pressed: false
    },
    j: {
        justPressed: false,
        pressed: false
    },
    k: {
        justPressed: false,
        pressed: false
    },
    l: {
        justPressed: false,
        pressed: false
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