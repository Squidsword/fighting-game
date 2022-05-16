class Fighter {
    constructor({position = 0, velocity = 0, size = {h: 150, w:50}, color = 'red', name = 'anonymous', offset = {x: 20, y:30}}) {
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
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x
        this.attackBox.position.y = this.position.y + this.attackBox.offset.y
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