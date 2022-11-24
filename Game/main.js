const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gameScore = document.querySelector('.game-score');
const gamePoints = document.querySelector('.points');
let highScore = document.querySelector('.record');
highScore.textContent = JSON.parse(localStorage.getItem('record'))

gameStart.addEventListener('click', onGameStart);

function onGameStart(event) {
    gameStart.classList.add('hide')

    //player
    const player = document.createElement('div');
    player.classList.add('player');
    player.style.top = playerObj.y + 'px';
    player.style.left = playerObj.x + 'px'; //this is only for now will need changing
    gameArea.appendChild(player);

    playerObj.width = player.offsetWidth;
    playerObj.height = player.offsetHeight;

    // infinite game loop
    window.requestAnimationFrame(gameAction)
}

//global key listeners

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

let keys = {};
let playerObj = {
    x: 150,
    y: 100,
    width: 0,
    height: 0,
    lastTimeFiredProjectile: 0
};
let game = {
    speed: 2,
    movingMultiplier: 4,
    projectileMultiplier: 5,
    projectileInterval: 1000,
    cloudSpawnInterval: 3000,
    enemySpawnInterval: 1000,
    enemyKillBonus: 1
};
let scene = {
    score: 0,
    lastCloudSpawn: 0,
    lastEnemySpawn: 0,
    isActiveGame: true
}

function onKeyDown(event) {
    keys[event.code] = true;
}

function onKeyUp(event) {
    keys[event.code] = false;
}

function gameAction(timestamp) {
    const player = document.querySelector('.player')

    // apply gravity
    let isInAir = (playerObj.y + playerObj.height) <= gameArea.offsetHeight
    if (isInAir) {
        playerObj.y += game.speed;
    }

    //add clouds
    if (timestamp - scene.lastCloudSpawn > game.cloudSpawnInterval + 20000 * Math.random()) {
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        cloud.x = gameArea.offsetWidth - 190;
        cloud.style.left = cloud.x + 'px';
        cloud.style.top = (gameArea.offsetHeight - 200) * Math.random() + 'px';

        gameArea.appendChild(cloud);
        scene.lastCloudSpawn = timestamp;
    }

    // modify cloud position
    let clouds = document.querySelectorAll('.cloud');
    clouds.forEach(cl => {
        cl.x -= game.speed;
        cl.style.left = cl.x + 'px';

        if (cl.x + cl.offsetWidth <= 0) {
            cl.parentElement.removeChild(cl);
        }
    })

    //add enemies
    if (timestamp - scene.lastEnemySpawn > game.enemySpawnInterval + 5000 * Math.random()) {
        let enemy = document.createElement('div');
        enemy.classList.add('enemy');
        enemy.x = gameArea.offsetWidth - 60;
        enemy.style.left = enemy.x + 'px';
        enemy.style.top = (gameArea.offsetHeight - 60) * Math.random() + 'px';
        gameArea.appendChild(enemy)
        scene.lastEnemySpawn = timestamp;
    }

    //modify enemy position
    let enemies = document.querySelectorAll('.enemy');
    enemies.forEach(en => {
        en.x -= game.speed * 3;
        en.style.left = en.x + 'px';
        if (en.x + enemies.offsetWidth <= 0) {
            en.parentElement.removeChild(en);
        }
    })

    //shooting
    if (keys.Space && timestamp - playerObj.lastTimeFiredProjectile > game.projectileInterval) {
        player.classList.add('shooting');
        addProjectile(playerObj);
        playerObj.lastTimeFiredProjectile = timestamp
    } else {
        player.classList.remove('shooting');
    }

    let projectiles = document.querySelectorAll('.projectile');
    projectiles.forEach(pr => {
        pr.x += game.speed * game.projectileMultiplier;
        pr.style.left = pr.x + 'px';

        if (pr.x + pr.offsetWidth > gameArea.offsetWidth) {
            pr.parentElement.removeChild(pr)
        }
    })

    // move the player
    if (keys.ArrowUp && playerObj.y > 0) {
        playerObj.y -= game.speed * game.movingMultiplier;
    }

    if (keys.ArrowDown && isInAir && playerObj.y + playerObj.height + 105 < gameArea.offsetHeight) {
        playerObj.y += game.speed * game.movingMultiplier;
    }

    if (keys.ArrowLeft && playerObj.x > 0) {
        playerObj.x -= game.speed * game.movingMultiplier;
    }

    if (keys.ArrowRight && playerObj.x + playerObj.width < gameArea.offsetWidth) {
        playerObj.x += game.speed * game.movingMultiplier;
    }

    //collision detection
    enemies.forEach(en => {
        if (Collision(player, en)) {
            gameOverAction();
        }

        projectiles.forEach(pr => {
            if (Collision(pr, en)) {
                scene.score += game.enemyKillBonus;
                en.parentElement.removeChild(en);
                pr.parentElement.removeChild(pr);
            }
        })
    })

    gamePoints.textContent = scene.score;
    // apply movement
    player.style.top = playerObj.y + 'px';
    player.style.left = playerObj.x + 'px';

    if (scene.isActiveGame) {
        window.requestAnimationFrame(gameAction);
    }
}

function addProjectile() {
    let projectile = document.createElement('div');

    projectile.classList.add('projectile');
    projectile.style.top = (playerObj.y + playerObj.height / 3 - 5) + 'px';
    projectile.x = playerObj.x + playerObj.width;
    projectile.style.left = projectile.x + 'px';

    gameArea.appendChild(projectile)
}

function Collision(firstElement, secondElement) {
    let firstRect = firstElement.getBoundingClientRect();
    let secondRect = secondElement.getBoundingClientRect();

    return !(firstRect.top > secondRect.bottom ||
        firstRect.bottom < secondRect.top ||
        firstRect.right < secondRect.left ||
        firstRect.left > secondRect.right);
}

function gameOverAction() {
    if (Number(gamePoints.textContent) > Number(highScore.textContent)) {
        highScore.textContent = gamePoints.textContent
        localStorage.setItem('record', highScore.textContent)
    }
    scene.isActiveGame = false;
    gameOver.classList.remove('hide');
    playAgainButton.addEventListener('click', startAgain)
}

let playAgainButton = document.createElement('button');
playAgainButton.textContent = 'Play Again';
playAgainButton.classList.add('play-again');
gameOver.appendChild(playAgainButton);

function startAgain(event) {
    location.reload()
}