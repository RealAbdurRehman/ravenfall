const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;
const gameSpeed = 1.5;
let score = 0;
let ravensKilled = 0;

const collisionCanvas = document.getElementById("collision-canvas");
const collisionCtx = collisionCanvas.getContext("2d");
const COLLISION_CANVAS_WIDTH = collisionCanvas.width = window.innerWidth;
const COLLISION_CANVAS_HEIGHT = collisionCanvas.height = window.innerHeight;

const backgroundMusic = new Audio();
backgroundMusic.src = "./Public/Audios/background-music.mp3";
backgroundMusic.volume = 0.5;
backgroundMusic.loop = true;

const backgroundLayer1 = new Image();
backgroundLayer1.src = "./Public/Background/layer1.png";
const backgroundLayer2 = new Image();
backgroundLayer2.src = "./Public/Background/layer2.png";
const backgroundLayer3 = new Image();
backgroundLayer3.src = "./Public/Background/layer3.png";
const backgroundLayer4 = new Image();
backgroundLayer4.src = "./Public/Background/layer4.png";
const backgroundLayer5 = new Image();
backgroundLayer5.src = "./Public/Background/layer5.png";
const backgroundLayer6 = new Image();
backgroundLayer6.src = "./Public/Background/layer6.png";
const backgroundLayer7 = new Image();
backgroundLayer7.src = "./Public/Background/layer7.png";
const backgroundLayer8 = new Image();
backgroundLayer8.src = "./Public/Background/layer8.png";
const backgroundLayer9 = new Image();
backgroundLayer9.src = "./Public/Background/layer9.png";
const backgroundLayer10 = new Image();
backgroundLayer10.src = "./Public/Background/layer10.png";
class Layer {
    constructor(image, speedModifier, layerNumber) {
        this.x = 0;
        this.y = 0;
        this.layerNumber = layerNumber;
        this.width = 1920;
        this.height = 1080;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }
    update() {
        this.speed = gameSpeed * this.speedModifier;
        if (this.x <= -this.width) {
            this.x = 0;
        }
        this.x = this.x - this.speed;
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}
const layers = [
    new Layer(backgroundLayer1, 0.2, 1),
    new Layer(backgroundLayer2, 0.4, 2),
    new Layer(backgroundLayer3, 0.6, 3),
    new Layer(backgroundLayer4, 0.8, 4),
    new Layer(backgroundLayer5, 1, 5),
    new Layer(backgroundLayer6, 1.2, 6),
    new Layer(backgroundLayer7, 1.4, 7),
    new Layer(backgroundLayer8, 1.6, 8),
    new Layer(backgroundLayer9, 1.8, 9),
    new Layer(backgroundLayer10, 2, 10)
]

let ravens = [];
class Raven {
    constructor() {
        this.size = Math.random() * 100 + 125;
        this.x = -this.size;
        this.y = Math.random() * (CANVAS_HEIGHT - this.size);
        this.directionX = Math.random() * 15 + 5;
        this.directionY = Math.random() * 20 - 5;
        this.image = new Image();
        this.image.src = "./Public/Ravens/raven1.png";
        this.isMarkedForDeletion = false;
        this.frame = 1;
        this.timeToNextFrame = 0;
        this.frameInterval = Math.random() * 25 + 25;
        this.randomColors = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
        this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`;
        this.sound = new Audio();
        this.sound.src = "./Public/Audios/raven-death.wav";
        this.sound.volume = Math.random() * 0.25 + 0.25;
    }
    update(deltaTime) {
        if (this.y < 0 || this.y > CANVAS_HEIGHT - this.size) {
            this.directionY = this.directionY * -1;
        }
        this.x += this.directionX;
        this.y += this.directionY;
        if (this.x > CANVAS_WIDTH + this.size) this.isMarkedForDeletion = true;
        this.timeToNextFrame += deltaTime;
        if (this.timeToNextFrame >= this.frameInterval) {
            this.frame++;
            this.timeToNextFrame = 0;
        }
        if (this.frame > 25) {
            this.frame = 1;
        } else {
            this.image.src = `./Public/Ravens/raven${this.frame}.png`;
        }
    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.size, this.size);
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size * 1.5;
        this.spriteWidth = 256;
        this.spriteHeight = 256;
        this.image = new Image();
        this.image.src = "./Public/Explosions/boom.png";
        this.isMarkedForDeletion = false;
        this.timeToNextFrame = 0;
        this.frameInterval = 10;
        this.frameX = 0;
        this.columns = 8;
        this.rows = 8;
        this.maxFrames = this.columns * this.rows;
        this.frameY = 0;
        this.sound = new Audio();
        this.sound.src = "./Public/Audios/explosion.flac";
    }
    update(deltaTime) {
        if (this.frameX === 0) this.sound.play();
        this.timeToNextFrame += deltaTime;
        if (this.timeToNextFrame >= this.frameInterval) {
            this.frameX++;
            this.timeToNextFrame = 0;
            if (this.frameX >= this.columns) {
                this.frameX = 0;
                this.frameY++;
            }
            if (this.frameY > this.rows) {
                this.isMarkedForDeletion = true;
            }
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size);
    }
}

class Player {
    constructor() {
        this.spriteWidth = 1376;
        this.spriteHeight = 1280;
        this.width = this.spriteHeight * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.x = CANVAS_WIDTH * 0.5;
        this.y = CANVAS_HEIGHT - this.height * 0.7;
        this.image = new Image();
        this.image.src = "./Public/Player/playerLeft.png";
        this.isFacingRight = false;
        this.frame = 0;
        this.movingUp = false;
        this.bullets = 8;
        this.currentBullets = 8;
        this.isReloading = false;
    }
    updatePosition(x, y) {
        if (y < CANVAS_HEIGHT - this.height) y = CANVAS_HEIGHT - this.height + 25;
        if (x < CANVAS_WIDTH / 2) {
            this.image.src = "./Public/Player/playerLeft.png";
            this.isFacingRight = false;
        } else {
            this.image.src = "./Public/Player/playerRight.png";
            this.isFacingRight = true;
        }
        if (this.isFacingRight) {
            this.x = x - this.width;
        } else {
            this.x = x;
        }
        this.y = y;
    }
    shootAnimation() {
        let sounds = [];
        const sound = new Audio("./Public/Audios/fire.mp3");
        sound.volume = 0.5;
        sound.play();
        sounds.push(sound);
        if (sounds.length > 3) {
            sounds[0].pause();
            sounds.unshift();
        }
        const interval = setInterval(() => {
            this.frame++;
            if (this.frame > 4) {
                this.frame = 0;
                clearInterval(interval);
            }
        }, 75)
    }
    reload() {
        if (this.isReloading) return;
        this.isReloading = true;
        const reloadSound  = new Audio();
        reloadSound.src = "./Public/Audios/reload.mp3";
        if (this.isReloading) reloadSound.play();
        setTimeout(() => {
            this.currentBullets = 8;
            this.isReloading = false;
        }, 2500)
    }
    drawBullets() {
        ctx.font = "100px Bokor";
        ctx.fillStyle = "#333";
        ctx.fillText(`${this.currentBullets} / ${this.bullets}`, CANVAS_WIDTH - 250, CANVAS_HEIGHT - 70);
        ctx.fillStyle = "beige";
        ctx.fillText(`${this.currentBullets} / ${this.bullets}`, CANVAS_WIDTH - 255, CANVAS_HEIGHT - 75); 
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth + 80, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
const player = new Player();

class Crosshair {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = CANVAS_WIDTH / 2 - this.width;
        this.y = CANVAS_HEIGHT / 2 - this.height;
        this.image = new Image();
        this.image.src = "./Public/Crosshair/pistol-crosshair.png";
    }
    updatePosition(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
    }
    shooting() {
        this.width = 38;
        this.height = 38;
        setTimeout(() => {
            this.width = 40;
            this.height = 40;
        }, 50)
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
const crosshair = new Crosshair();

function drawScore() {
    ctx.font = "30px Bokor";
    ctx.fillStyle = "#333";
    ctx.fillText(`Score: ${score}`, 12, 32);
    ctx.fillStyle = "beige";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawRavensKilled() {
    ctx.font = "30px Bokor";
    ctx.fillStyle = "#333";
    ctx.fillText(`Ravens Vanquished: ${ravensKilled}`, 12, 62);
    ctx.fillStyle = "beige";
    ctx.fillText(`Ravens Vanquished: ${ravensKilled}`, 10, 60);
}

window.addEventListener("click", event => {
    if (player.currentBullets > 0) {
        backgroundMusic.play();
        const detectedPixelColor = collisionCtx.getImageData(event.x, event.y, 1, 1);
        const pc = detectedPixelColor.data;
        ravens.forEach(raven => {
            if (raven.randomColors[0] === pc[0] &&
                raven.randomColors[1] === pc[1] &&
                raven.randomColors[2] === pc[2]
            ) {
                explosions.push(new Explosion(raven.x, raven.y, raven.size));
                raven.isMarkedForDeletion = true;
                raven.sound.play();
                score += Math.floor(Math.random() * 50 + 10);
                ravensKilled++;
            }
        })
        player.shootAnimation();
        player.currentBullets--;
        crosshair.shooting();
    }
})

window.addEventListener("mousemove", event => {
    const x = event.x;
    const y = event.y;
    player.updatePosition(x, y);
    crosshair.updatePosition(x, y);
})

let timeToNextRaven = 0;
let ravenInterval = 1000;
let lastTime = 0;
function animate(timestamp) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    layers.forEach(layer => {
        if (layer.layerNumber !== 10) {
            layer.update();
            layer.draw();
        }
    })
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven >= ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort((a, b) => {
            return a.size - b.size;
        })
    }
    drawScore();
    drawRavensKilled();
    [...ravens, ...explosions].forEach(object => {
        object.update(deltaTime);
        object.draw();
    })
    layers[9].update();
    layers[9].draw();
    player.draw();
    player.drawBullets();
    crosshair.draw();
    ravens = ravens.filter(raven => !raven.isMarkedForDeletion);
    explosions = explosions.filter(explosion => !explosion.isMarkedForDeletion);
    if (player.currentBullets < 1) {
        player.reload();
    }
    requestAnimationFrame(animate);
}
animate(0);