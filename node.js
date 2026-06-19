const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const COLS = 15;
const ROWS = 15;

let maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,4,0,0,1,5,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,1,5,0,1,0,0,0,0,4,0,1,0,1],
    [1,0,1,1,0,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1,5,1],
    [1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,4,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,5,1,0,0,1,0,1,4,0,0,0,1,0,1],
    [1,0,1,0,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,1,0,0,0,0,1,0,1,5,1],
    [1,1,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = { x: 1, y: 1 };
let score = 0;
let lives = 3;
let gameOver = false;
let won = false;

const initialCoins = [];

function findInitialCoins() {
    initialCoins.length = 0;
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (maze[y][x] === 5) initialCoins.push({x, y});
        }
    }
}

function resetCoins() {
    initialCoins.forEach(coin => maze[coin.y][coin.x] = 5);
}

let keys = {};

function movePlayer(dx, dy) {
    if (gameOver || won) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) return;
    if (maze[newY][newX] === 1) return;
    
    player.x = newX;
    player.y = newY;
    
    const tile = maze[newY][newX];
    
    if (tile === 5) {
        score += 100;
        maze[newY][newX] = 0;
        updateHUD();
    }
    
    if (tile === 4) handleTrap();
    if (tile === 3) winGame();
    
    draw();
}

function handleTrap() {
    lives--;
    updateHUD();
    
    if (lives <= 0) {
        gameOver = true;
        setTimeout(() => {
            alert("💀 GAME OVER!");
            restartGame();
        }, 200);
        return;
    }
    
    player.x = 1;
    player.y = 1;
    
    canvas.style.filter = 'brightness(3)';
    setTimeout(() => canvas.style.filter = 'none', 200);
}

function winGame() {
    won = true;
    document.getElementById('final-score').textContent = `Pontuação Final: ${score}`;
    document.getElementById('win-modal').style.display = 'flex';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = maze[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;
            
            // Chão
            ctx.fillStyle = '#34495e';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            
            if (tile === 1) {
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#455a7a';
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
            if (tile === 3) {
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            }
            if (tile === 4) {
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            }
            if (tile === 5) {
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Jogador
    const px = player.x * TILE_SIZE + TILE_SIZE / 2;
    const py = player.y * TILE_SIZE + TILE_SIZE / 2;
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(px + 5, py + 8, TILE_SIZE/2.3, TILE_SIZE/5, 0, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(px, py, TILE_SIZE/2.3, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px - 8, py - 6, 6, 0, Math.PI*2);
    ctx.arc(px + 8, py - 6, 6, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(px - 8, py - 6, 3, 0, Math.PI*2);
    ctx.arc(px + 8, py - 6, 3, 0, Math.PI*2);
    ctx.fill();
}

function updateHUD() {
    document.getElementById('score').textContent = String(score).padStart(4, '0');
    const livesEl = document.getElementById('lives');
    livesEl.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('div');
        heart.className = 'life';
        livesEl.appendChild(heart);
    }
}

function gameLoop() {
    if (gameOver || won) return;
    
    if (keys['arrowup'] || keys['w']) movePlayer(0, -1);
    else if (keys['arrowdown'] || keys['s']) movePlayer(0, 1);
    else if (keys['arrowleft'] || keys['a']) movePlayer(-1, 0);
    else if (keys['arrowright'] || keys['d']) movePlayer(1, 0);
    
    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    player.x = 1; player.y = 1;
    score = 0; lives = 3;
    gameOver = false; won = false;
    resetCoins();
    document.getElementById('win-modal').style.display = 'none';
    updateHUD();
    draw();
}

function init() {
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;
    
    findInitialCoins();
    updateHUD();
    draw();
    gameLoop();
    
    if ('ontouchstart' in window) {
        document.getElementById('mobile-controls').style.display = 'grid';
    }
}

// Event listeners
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Iniciar quando a página carregar
window.onload = init;