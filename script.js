//------------------------------------------------------------------------------
//Game Classes
//------------------------------------------------------------------------------

class GameObject {
    constructor(context, x, y, width, height, vx, vy, color) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
    }

    update(secondsPassed) {
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }
    
    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    reset() {
        
    }
}

class Wall extends GameObject {
    constructor(context, x, y, width, height) {
        super(context, x, y, width, height, 0, 0, "#808080");
    }
}

class EndZone extends GameObject {
    constructor(context, x, y, width, height) {
        super(context, x, y, width, height, 0, 0, "#40ff26");
    }
}

class Obstacle extends GameObject {
    constructor(context, x, y, vx, vy, x2, y2) {
        super(context, x, y, 25, 25, vx, vy, "#fc0303");
        this.x1 = x;
        this.y1 = y;
        this.x2 = x2;
        this.y2 = y2;
    }
    
    update(secondsPassed) {
        
        
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
        
        
        if (this.x <= this.x1) {
            this.vx *= -1;
            this.x = this.x1;
        }
        if (this.x >= this.x2) {
            this.vx *= -1;
            this.x = this.x2;
        }
        if (this.y <= this.y1) {
            this.vy *= -1;
            this.y = this.y1;
        }
        if (this.y >= this.y2) {
            this.vy *= -1;
            this.y = this.y2;
        }
        
    }
    
}

class Coin extends GameObject {
    constructor(context, x, y) {
        super(context, x, y, 25, 25, 0, 0, "#fcca53");
        this.origX = x;
        this.origY = y;
        this.collected = false;
    }
    
    collect() {
        this.x = -100;
        this.y = -100;
        coinSound.play();
        totalCoins--;
        this.collected = true;
    }
    
    reset() {
        this.x = this.origX;
        this.y = this.origY;
        if (this.collected) {
            totalCoins++;
        }
        this.collected = false;
    }
    
}

class Player extends GameObject {
    constructor(context, x, y, vx, vy) {
        super(context, x, y, 25, 25, vx, vy, "#03c8ff");
        this.origX = x;
        this.origY = y;
    }
    
    update(secondsPassed) {
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
        
        for (let i = 0; i < gameObjects.length; i++) {
            if (this.collidesWith(gameObjects[i])) {
                if (gameObjects[i] instanceof Coin) {
                    gameObjects[i].collect();
                } else if (gameObjects[i] instanceof Wall) {
                    this.x -= this.vx * secondsPassed;
                    this.vx = 0;
                    this.y -= this.vy * secondsPassed;
                    this.vy = 0;
                } else if (gameObjects[i] instanceof Obstacle) {
                    resetGame();
                } else if (gameObjects[i] instanceof EndZone) {
                    if (totalCoins === 0 && !ended) {
                        endGame();
                    }
                }
            }
        }
    }
    
    updateVX(v) {
        this.vx = v;
    }
    
    updateVY(v) {
        this.vy = v;
    }
    
    reset() {
        this.x = this.origX;
        this.y = this.origY;
        this.vx = 0;
        this.vy = 0;
        oofSound.play();
    }

}

//------------------------------------------------------------------------------
// MAIN SCRIPT
//------------------------------------------------------------------------------

let canvas;
let ended = false;
let context;
let secondsPassed;
let oldTimeStamp = 0;
let fps;
let gameObjects = [];
let keys = [0, 0, 0, 0];
let totalCoins;
let coinSound = new Audio('https://codehs.com/uploads/fc7015ad271cdcd66604a896d361d92e');
let oofSound = new Audio('https://codehs.com/uploads/cb769d486596dccfacca9e19e97ac369');
let YAYSound = new Audio('https://codehs.com/uploads/1db7f916e3417f08cce7db84256aaeac');
const display = document.getElementById('display');
let startTime;
let running = false;
let intervalId;
let finalTime;

window.onload = init;

//CONTROLS
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            keys[0] = 1;  gameObjects[1].updateVY(-150);
            break;
        case "ArrowDown":
            keys[1] = 1;  gameObjects[1].updateVY(150);
            break;
        case "ArrowRight":
            keys[2] = 1;  gameObjects[1].updateVX(150);
            break;
        case "ArrowLeft":
            keys[3] = 1;  gameObjects[1].updateVX(-150);
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "ArrowUp":
            keys[0] = 0;  gameObjects[1].updateVY(0);
            break;
        case "ArrowDown":
            keys[1] = 0;  gameObjects[1].updateVY(0);
            break;
        case "ArrowRight":
            keys[2] = 0;  gameObjects[1].updateVX(0);
            break;
        case "ArrowLeft":
            keys[3] = 0;  gameObjects[1].updateVX(0);
            break;
    }
});

window.addEventListener('gamepadconnected', (event) => {
    console.log('connected:', event.gamepad.connected);
});

function updateGamepadInput() {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad) {
        let xAxis = gamepad.axes[0];
        let yAxis = gamepad.axes[1];
        
        gameObjects[1].updateVX(xAxis * 150);
        gameObjects[1].updateVY(yAxis * 150);
    } else {
        gameObjects[1].updateVY((keys[1] - keys[0]) * 150);
        gameObjects[1].updateVX((keys[2] - keys[3]) * 150);
    }
}


//GAME FUNCTIONS
function init() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    createWorld();
    console.log(gameObjects);
    
    startStop();
    
    window.requestAnimationFrame(gameLoop);
}

function createWorld() {
    gameObjects = [
        new EndZone(context, 425, 550, 175, 50),
        new Player(context, 75, 562.5, 0, 0),
        
        new Obstacle(context, 425, 200, 103, 0, 525, 200),
        new Obstacle(context, 450, 200, 103, 0, 550, 200),
        new Obstacle(context, 475, 200, 103, 0, 575, 200),
        
        new Obstacle(context, 425, 275, 129, 0, 525, 275),
        new Obstacle(context, 450, 275, 129, 0, 550, 275),
        new Obstacle(context, 475, 275, 129, 0, 575, 275),
        
        new Obstacle(context, 425, 350, 97, 0, 525, 350),
        new Obstacle(context, 450, 350, 97, 0, 550, 350),
        new Obstacle(context, 475, 350, 97, 0, 575, 350),
        
        new Obstacle(context, 425, 425, 116, 0, 525, 425),
        new Obstacle(context, 450, 425, 116, 0, 550, 425),
        new Obstacle(context, 475, 425, 116, 0, 575, 425),
        
        new Obstacle(context, 425, 500, 134, 0, 525, 500),
        new Obstacle(context, 450, 500, 134, 0, 550, 500),
        new Obstacle(context, 475, 500, 134, 0, 575, 500),
        
        new Wall(context, 175, 175, 50, 425),
        new Wall(context, 375, 175, 50, 425),
        new Wall(context, 0, -100, 600, 100),
        new Wall(context, 0, 600, 600, 100),
        new Wall(context, -100, 0, 100, 600),
        new Wall(context, 600, 0, 100, 600),
        new Coin(context, 287.5, 562.5),
        new Coin(context, 287.5, 87.5),
        new Obstacle(context, 0, 200, 56, 0, 150, 200),
        new Obstacle(context, 0, 300, 103, 0, 150, 300),
        new Obstacle(context, 0, 400, 72, 0, 150, 400),
        new Obstacle(context, 0, 500, 163, 0, 150, 500),
        new Obstacle(context, 0, 0, 60, 60, 150, 150),
        new Obstacle(context, 287.5, 0, 0, 350, 287.5, 575),
        new Obstacle(context, 225, 250, 78, 0, 350, 250),
        new Obstacle(context, 225, 350, 129, 0, 350, 350),
        new Obstacle(context, 225, 450, 100, 0, 350, 450),
        new Obstacle(context, 0, 87.5, 600, 0, 587.5, 87.5)
    ];
    totalCoins = 2;
}

function update(secondsPassed) {
    gameObjects.forEach(obj => obj.update(secondsPassed));
}

function draw() {
    context.fillStyle = "#e7e7e7";
    context.fillRect(0, 0, 600, 600);
    gameObjects.forEach(obj => obj.draw());
}

function gameLoop(timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    updateGamepadInput();

    context.clearRect(0, 0, canvas.width, canvas.height);
    update(secondsPassed);
    draw();
    window.requestAnimationFrame(gameLoop);
}

function resetGame() {
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].reset();
    }
    resetTimer();
    startStop();
    ended = false;
}

function endGame() {
    startStop();
    finalTimeP.innerText = finalTime;
    YAYSound.play();
    showEnd();
    ended = true;
}


//POPUPS
function showInstructions() {
    document.getElementById("instructionBox").style.display = "block";
}

function hideInstructions() {
    document.getElementById("instructionBox").style.display = "none";
}

function showEnd() {
    document.getElementById("EndScreen").style.display = "block";
}

function hideEnd() {
    document.getElementById("EndScreen").style.display = "none";
}


//TIMER
function updateDisplay() {
    const currentTime = new Date().getTime();
    let elapsedMilliseconds = currentTime - startTime;
    
    const seconds = Math.floor(elapsedMilliseconds / 1000);
    elapsedMilliseconds %= 1000; 
    
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(displaySeconds).padStart(2, '0');
    const formattedMilliseconds = String(elapsedMilliseconds).padStart(3, '0');

    finalTime = `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
    display.textContent = `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
}

function startStop() {
    if (running) {
        clearInterval(intervalId);
    } else {
        startTime = new Date().getTime() - (startTime ? (new Date().getTime() - startTime) : 0);
        intervalId = setInterval(updateDisplay, 10);
    }
    running = !running;
}

function resetTimer() {
   clearInterval(intervalId);
   running = false;
   display.textContent = '00:00:000';
   startTime = undefined;
}