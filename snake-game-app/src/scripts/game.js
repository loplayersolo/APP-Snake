const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let canvasSize;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = spawnFood();
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;

let gameInterval;
let moveDelay = 200; // ms
let lastMoveTime = 0;

// Função que ajusta o tamanho do canvas conforme a tela
function resizeCanvas() {
    let minSide = Math.min(window.innerWidth, window.innerHeight) - 40;
    // garante que fique múltiplo do "box" (20)
    minSide = Math.floor(minSide / box) * box;
    canvas.width = minSide;
    canvas.height = minSide;
    canvasSize = minSide;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function spawnFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    // Draw snake com efeitos visuais progressivos
for (let i = 0; i < snake.length; i++) {
    if (score < 5) {
        // fase inicial
        ctx.fillStyle = i === 0 ? "#ffe066" : "#aee9f7";
    } else if (score < 10) {
        // fase 2
        ctx.fillStyle = i === 0 ? "#ff6347" : "#90ee90";
    } else if (score < 20) {
        // fase 3
        ctx.fillStyle = i === 0 ? "#b266ff" : "#ff9966";
    } else {
        // fase 4 (efeito arco-íris)
        const hue = (i * 30 + Date.now() / 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    }

    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
}

    

    // Draw food
    ctx.fillStyle = "#ffe066";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw score e high score
ctx.fillStyle = "#ffe066";
ctx.font = "20px Arial";
ctx.textAlign = "left";
ctx.fillText("Score: " + score, 10, 30);

ctx.textAlign = "right";
ctx.fillText("High Score: " + highScore, canvas.width - 10, 30);

}

function update() {
    let head = { x: snake[0].x, y: snake[0].y };

    if (direction === "LEFT") head.x -= box;
    if (direction === "UP") head.y -= box;
    if (direction === "RIGHT") head.x += box;
    if (direction === "DOWN") head.y += box;

    // Game over conditions
    if (
        head.x < 0 || head.x >= canvasSize ||
        head.y < 0 || head.y >= canvasSize ||
        collision(head, snake)
    ) {
      // Game Over personalizado
cancelAnimationFrame(gameInterval); // garante parar o loop

let gameOverHue = 0;

function drawGameOver() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // texto animado em várias cores
    // texto mudando para cores aleatórias
const randomColor = `rgb(${Math.floor(Math.random() * 256)}, 
                        ${Math.floor(Math.random() * 256)}, 
                        ${Math.floor(Math.random() * 256)})`;

ctx.fillStyle = randomColor;
ctx.font = "bold 50px Arial";
ctx.textAlign = "center";
ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);


    ctx.fillStyle = "#ffe066";
    ctx.font = "20px Arial";
    ctx.fillText("Pontuação: " + score, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText("Pressione Start para jogar novamente", canvas.width / 2, canvas.height / 2 + 80);

    gameOverHue = (gameOverHue + 0.5) % 360;
    requestAnimationFrame(drawGameOver);
}

drawGameOver();
return;

    }

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;

        if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
}


          if (moveDelay > 50) { // limite mínimo para não ficar impossível
                 moveDelay -= 10; // cada comida deixa o jogo mais rápido
    }
        if (score === 5) {
            // Aumenta o canvas e o mapa
            canvas.width = 600;
            canvas.height = 600;
            canvasSize = 600;
        }
        food = spawnFood(); // Chame depois de atualizar o tamanho
    } else {
        snake.pop();
    }

    snake.unshift(head);
    draw();
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

document.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
        event.preventDefault(); // Impede o scroll da página
        if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
        else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
        else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
        else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    }
});
// Controle por toque (celular)
canvas.addEventListener("touchstart", function (event) {
    const touchX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    const touchY = event.touches[0].clientY - canvas.getBoundingClientRect().top;

    const head = snake[0];

    // Verifica distância entre toque e cabeça da cobra
    const dx = touchX - head.x;
    const dy = touchY - head.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Movimento horizontal
        if (dx > 0 && direction !== "LEFT") {
            direction = "RIGHT";
        } else if (dx < 0 && direction !== "RIGHT") {
            direction = "LEFT";
        }
    } else {
        // Movimento vertical
        if (dy > 0 && direction !== "UP") {
            direction = "DOWN";
        } else if (dy < 0 && direction !== "DOWN") {
            direction = "UP";
        }
    }

    event.preventDefault(); // impede rolagem na tela
}, { passive: false });


function gameLoop(currentTime) {
    if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffe066";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!lastMoveTime) lastMoveTime = currentTime;
    if (currentTime - lastMoveTime > moveDelay) {
        update();
        lastMoveTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}


function startGame() {
    direction = "RIGHT";
    snake = [{ x: 9 * box, y: 10 * box }];
    food = spawnFood();
    score = 0;
    moveDelay = 200;
    lastMoveTime = 0;
    // Não use mais setInterval
    requestAnimationFrame(gameLoop);
}

let isPaused = false;

// Botões de controle
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
// Controles móveis
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

if (upBtn) {
    upBtn.addEventListener("click", () => {
        if (direction !== "DOWN") direction = "UP";
    });
    downBtn.addEventListener("click", () => {
        if (direction !== "UP") direction = "DOWN";
    });
    leftBtn.addEventListener("click", () => {
        if (direction !== "RIGHT") direction = "LEFT";
    });
    rightBtn.addEventListener("click", () => {
        if (direction !== "LEFT") direction = "RIGHT";
    });
}


startBtn.addEventListener("click", () => {
    startGame();
});

pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";
});



startGame();