const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

var slowFrameFactor = 10;
var framesPerSecond = 144;


var framesPassed = 0;
var lastAnimationFrame = new Date();

canvas.width = 1280;
canvas.height = Math.round(canvas.width * 9 / 16) * 0.82

c.fillRect(0,0, canvas.width, canvas.height)

var gravity = 43.2 / framesPerSecond
const fighters = [];
const timer = new Date();

// Big thanks to Chris Courses

const player = new Fighter({
    position: {
        x: canvas.width * 0.10,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0,
        topSpeed: 10
    },
    color:'blue',
    name: 'player',
    imageSrc: './Martial Hero/Sprites/Idle.png',
    framesMax: 8,
    scale: 2.5,
    keyMap: {
        jump: {
            key: "KeyW"
        },
        left: {
            key: "KeyA"
        },
        fall: {
            key: "KeyS"
        },
        right: {
            key: "KeyD"
        },
        hit: {
            key: "KeyF"
        },
        dash: {
            key: "Shift Left"
        }
    }
});

const enemy = new Fighter({
    position: {
        x: canvas.width * 0.9 - 75,
        y: 200
    },
    velocity: {
        x: 0,
        y: 0
    },
    color:'red',
    name: 'enemy',
    imageSrc: './Martial Hero/Sprites/Idle.png',
    framesMax: 8,
    scale: 2.5,
    keyMap: {
        jump: {
            key: "KeyP"
        },
        left: {
            key: "KeyL"
        },
        fall: {
            key: "Semicolon"
        },
        right: {
            key: "Quote"
        },
        hit: {
            key: "KeyK"
        },
        dash: {
            key: "Shift Right"
        }
    }
})

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
                hitEnemies[enemyFighter].receiveDamage(10, fighters[user])
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
    KeyW: {
        justPressed: false,
        pressed: false,
        behaviors: [{
            type:'justPressed',
            action: "playerJump",
            func: function() {
                player.jump();
            }
        },
        {
            type:'xpressed', 
            action: "playerSpamJump",
            func: function() {
                player.spamJump();
            }
        }]
    },
    KeyA: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', action: "playerMoveLeft", func: function() {
            player.moveLeft();
        }}]
    },
    KeyS: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', action: "playerFastFall", func: function() {
            player.fastFall();
        }}]
    },
    KeyD: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', action: "playerMoveRight", func: function() {
            player.moveRight();
        }}]
    },
    KeyF: {
        justPressed:false,
        pressed: false,
        behaviors: [{type:'justPressed', action: "playerAttack", func: function() {
            if (!player.isAttacking) {
                player.attack();
            }
        }}]
    },
    ShiftLeft: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', action: "playerDash", func: function() {
            player.dash();
        }}]
    },

    KeyP: {
        justPressed: false,
        pressed: false,
        behaviors: [{
            type:'justPressed',
            action: "enemyJump",
            func: function() {
                enemy.jump();
            }
        },
        {
            type:'xpressed', 
            action: "enemySpamJump",
            func: function() {
                enemy.spamJump();
            }
        }]
    },
    KeyL: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', action:"enemyMoveLeft", func: function() {
            enemy.moveLeft();
        }}]
    },
    
    Semicolon: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', action: "enemyFastFall", func: function() {
            enemy.fastFall();
        }}]
    },
    Quote: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'pressed', action: "enemyMoveRight", func: function() {
            enemy.moveRight();
        }}]
    },
    KeyK: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', action: "enemyAttack", func: function() {
            if (!enemy.isAttacking) {
                enemy.attack();
            }
        }}]
    },
    ShiftRight: {
        justPressed: false,
        pressed: false,
        behaviors: [{type:'justPressed', action: "enemyDash", func: function() {
            enemy.dash();
        }}]
    }
}

window.addEventListener('keydown', (event) => {
    try {
        keys[event.code].pressed = true;
        keys[event.code].justPressed = !event.repeat;
    } catch {
        console.log("key not binded")
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

var background = new Sprite({
    imageSrc: './Martial Hero/Sprites/background.jpg',
    scale: canvas.width / 1920
})

function animate() {
    if (framesPassed % 60 === 0) {
        sixtyFrameTime = (new Date() - lastAnimationFrame) / 1000;
        lastAnimationFrame = new Date();
        framesPerSecond = 60 / sixtyFrameTime;
        slowFrameFactor = framesPerSecond * 0.1;
        for (fighterSprite in fighters) {
            if (!fighters[fighterSprite].isAttacking) {
                fighters[fighterSprite].framesHold = Math.ceil(slowFrameFactor);
            }
        }
    }
    window.requestAnimationFrame(animate);
    background.update();

    handleKeys();
    handleHits();

    player.update();
    enemy.update();

    resetJustPressed();
    framesPassed++;
}

animate();