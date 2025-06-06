/**
 * Pong 2D avec Babylon.js
 * Contrôles:
 * - Joueur 1: A (haut) / T (bas)
 * - Joueur 2: Flèche gauche (gauche) / Flèche droite (droite)
 * 5 points pour gagner
 */

// Configuration du jeu
const gameConfig = {
    // Dimensions du terrain
    fieldWidth: 22,
    fieldHeight: 14,
    
    // Dimensions des raquettes
    paddleWidth: 0.2,
    paddleHeight: 1.5,
    paddleOffset: 0.5, // Distance des raquettes par rapport aux bords
    
    // Dimensions de la balle
    ballSize: 0.3,
    initialBallSpeed: 0.01,
    ballSpeedIncrease: 0.003, // Augmentation de la vitesse après chaque rebond
    
    // Vitesse des raquettes
    paddleSpeed: 0.025,
    
    // Score maximum pour gagner
    maxScore: 5,
    
    // Contrôles
    player1Keys: { up: 'a', down: 'q' },
    player2Keys: { up: 'ArrowUp', down: 'ArrowDown' }
};

// Variables globales
let canvas, engine, scene;
let player1Paddle, player2Paddle, ball;
let player1Score = 0, player2Score = 0;
let gameStarted = false;
let inputMap = {};
let ballVelocity = { x: 0, y: 0 };
let scoreDisplay, startButton, gameOverScreen, winnerText, restartButton;

// Initialisation de Babylon.js
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('renderCanvas');
    engine = new BABYLON.Engine(canvas, true);
    
    // Événements clavier
    window.addEventListener('keydown', function(e) {
        inputMap[e.key] = true;
    });
    
    window.addEventListener('keyup', function(e) {
        inputMap[e.key] = false;
    });
    
    // Éléments UI
    scoreDisplay = document.getElementById('scoreDisplay');
    startButton = document.getElementById('startButton');
    gameOverScreen = document.getElementById('gameOverScreen');
    winnerText = document.getElementById('winnerText');
    restartButton = document.getElementById('restartButton');
    
    // Événements des boutons
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Créer la scène
    createScene();
    
    // Boucle de rendu
    engine.runRenderLoop(function() {
        if (gameStarted) {
            updateGame();
        }
        scene.render();
    });
    
    // Redimensionnement
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

// Création de la scène
function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);
    
    // Caméra pour un rendu 2D
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 10, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    
    // Configuration pour un rendu orthographique
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = gameConfig.fieldHeight/2;
    camera.orthoBottom = -gameConfig.fieldHeight/2;
    camera.orthoLeft = -gameConfig.fieldWidth/2;
    camera.orthoRight = gameConfig.fieldWidth/2;
    
    // Désactiver les contrôles de la caméra
    camera.detachControl();
    
    // Lumière
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Terrain (ligne centrale)
    const centerLine = BABYLON.MeshBuilder.CreateBox("centerLine", {
        width: 0.1,
        height: 0.1,
        depth: gameConfig.fieldHeight
    }, scene);
    centerLine.position.y = 0.05;
    centerLine.material = new BABYLON.StandardMaterial("centerLineMat", scene);
    centerLine.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    centerLine.material.alpha = 0.3;
    
    // Raquette du joueur 1 (gauche)
    player1Paddle = BABYLON.MeshBuilder.CreateBox("player1Paddle", {
        width: gameConfig.paddleWidth,
        height: 0.1,
        depth: gameConfig.paddleHeight
    }, scene);
    player1Paddle.position = new BABYLON.Vector3(
        -gameConfig.fieldWidth/2 + gameConfig.paddleOffset,
        0.05,
        0
    );
    player1Paddle.material = new BABYLON.StandardMaterial("player1PaddleMat", scene);
    player1Paddle.material.diffuseColor = new BABYLON.Color3(1, 0.3, 0.3);
    
    // Raquette du joueur 2 (droite)
    player2Paddle = BABYLON.MeshBuilder.CreateBox("player2Paddle", {
        width: gameConfig.paddleWidth,
        height: 0.1,
        depth: gameConfig.paddleHeight
    }, scene);
    player2Paddle.position = new BABYLON.Vector3(
        gameConfig.fieldWidth/2 - gameConfig.paddleOffset,
        0.05,
        0
    );
    player2Paddle.material = new BABYLON.StandardMaterial("player2PaddleMat", scene);
    player2Paddle.material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 1);
    
    // Balle
    ball = BABYLON.MeshBuilder.CreateSphere("ball", {
        diameter: gameConfig.ballSize
    }, scene);
    ball.position = new BABYLON.Vector3(0, gameConfig.ballSize/2, 0);
    ball.material = new BABYLON.StandardMaterial("ballMat", scene);
    ball.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    
    // Créer des lignes de bordure visibles pour délimiter le terrain
    const borderMaterial = new BABYLON.StandardMaterial("borderMat", scene);
    borderMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    borderMaterial.alpha = 0.3;
    
    // Ligne supérieure
    const topBorder = BABYLON.MeshBuilder.CreateBox("topBorder", {
        width: gameConfig.fieldWidth,
        height: 0.05,
        depth: 0.05
    }, scene);
    topBorder.position = new BABYLON.Vector3(0, 0.025, -gameConfig.fieldHeight/2);
    topBorder.material = borderMaterial;
    
    // Ligne inférieure
    const bottomBorder = BABYLON.MeshBuilder.CreateBox("bottomBorder", {
        width: gameConfig.fieldWidth,
        height: 0.05,
        depth: 0.05
    }, scene);
    bottomBorder.position = new BABYLON.Vector3(0, 0.025, gameConfig.fieldHeight/2);
    bottomBorder.material = borderMaterial;
    
    return scene;
}

// Démarrer le jeu
function startGame() {
    // S'assurer que la scène est créée
    if (!scene) {
        createScene();
    }
    
    resetBall();
    player1Score = 0;
    player2Score = 0;
    updateScoreDisplay();
    gameStarted = true;
    startButton.style.display = 'none';
    gameOverScreen.style.display = 'none';
}

// Redémarrer le jeu
function restartGame() {
    startGame();
}

// Réinitialiser la balle
function resetBall() {
    if (!ball) return; // S'assurer que la balle existe
    
    ball.position = new BABYLON.Vector3(0, gameConfig.ballSize/2, 0);
    
    // Direction aléatoire, mais jamais complètement verticale
    const angle = (Math.random() * Math.PI/2) - Math.PI/4;
    const direction = Math.random() < 0.5 ? -1 : 1;
    
    ballVelocity = {
        x: Math.cos(angle) * gameConfig.initialBallSpeed * direction,
        y: Math.sin(angle) * gameConfig.initialBallSpeed * (Math.random() < 0.5 ? -1 : 1)
    };
}

// Mettre à jour le jeu
function updateGame() {
    const deltaTime = engine.getDeltaTime();
    
    // Déplacer les raquettes
    updatePaddles(deltaTime);
    
    // Déplacer la balle
    updateBall(deltaTime);
    
    // Vérifier les collisions
    checkCollisions();
    
    // Vérifier le score
    checkScore();
}

// Mettre à jour les raquettes
function updatePaddles(deltaTime) {
    const paddleSpeed = gameConfig.paddleSpeed * deltaTime;
    const halfHeight = gameConfig.fieldHeight/2 - gameConfig.paddleHeight/2;
    
    // Joueur 1
    if (inputMap[gameConfig.player1Keys.up]) {
        player1Paddle.position.z -= paddleSpeed;
    }
    if (inputMap[gameConfig.player1Keys.down]) {
        player1Paddle.position.z += paddleSpeed;
    }
    
    // Joueur 2
    if (inputMap[gameConfig.player2Keys.up]) {
        player2Paddle.position.z -= paddleSpeed;
    }
    if (inputMap[gameConfig.player2Keys.down]) {
        player2Paddle.position.z += paddleSpeed;
    }
    
    // Limiter les raquettes aux bords du terrain
    player1Paddle.position.z = Math.max(-halfHeight, Math.min(halfHeight, player1Paddle.position.z));
    player2Paddle.position.z = Math.max(-halfHeight, Math.min(halfHeight, player2Paddle.position.z));
}

// Mettre à jour la balle
function updateBall(deltaTime) {
    ball.position.x += ballVelocity.x * deltaTime;
    ball.position.z += ballVelocity.y * deltaTime;
}

// Vérifier les collisions
function checkCollisions() {
    const ballRadius = gameConfig.ballSize / 2;
    
    // Collision avec les murs supérieur et inférieur
    if (ball.position.z - ballRadius <= -gameConfig.fieldHeight/2) {
        ball.position.z = -gameConfig.fieldHeight/2 + ballRadius; // Repositionner la balle
        ballVelocity.y = -ballVelocity.y;
        playSound('wall');
    } else if (ball.position.z + ballRadius >= gameConfig.fieldHeight/2) {
        ball.position.z = gameConfig.fieldHeight/2 - ballRadius; // Repositionner la balle
        ballVelocity.y = -ballVelocity.y;
        playSound('wall');
    }
    
    // Collision avec la raquette du joueur 1
    if (ball.position.x - ballRadius <= player1Paddle.position.x + gameConfig.paddleWidth/2 &&
        ball.position.x + ballRadius >= player1Paddle.position.x - gameConfig.paddleWidth/2 &&
        ball.position.z + ballRadius >= player1Paddle.position.z - gameConfig.paddleHeight/2 &&
        ball.position.z - ballRadius <= player1Paddle.position.z + gameConfig.paddleHeight/2 &&
        ballVelocity.x < 0) {
        
        // Rebond avec effet selon la position d'impact sur la raquette
        const hitPosition = (ball.position.z - player1Paddle.position.z) / (gameConfig.paddleHeight/2);
        ballVelocity.x = -ballVelocity.x;
        ballVelocity.y = hitPosition * Math.abs(ballVelocity.x);
        
        // Augmenter légèrement la vitesse
        const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
        ballVelocity.x = (ballVelocity.x / speed) * (speed + gameConfig.ballSpeedIncrease);
        ballVelocity.y = (ballVelocity.y / speed) * (speed + gameConfig.ballSpeedIncrease);
        
        playSound('paddle');
    }
    
    // Collision avec la raquette du joueur 2
    if (ball.position.x + ballRadius >= player2Paddle.position.x - gameConfig.paddleWidth/2 &&
        ball.position.x - ballRadius <= player2Paddle.position.x + gameConfig.paddleWidth/2 &&
        ball.position.z + ballRadius >= player2Paddle.position.z - gameConfig.paddleHeight/2 &&
        ball.position.z - ballRadius <= player2Paddle.position.z + gameConfig.paddleHeight/2 &&
        ballVelocity.x > 0) {
        
        // Rebond avec effet selon la position d'impact sur la raquette
        const hitPosition = (ball.position.z - player2Paddle.position.z) / (gameConfig.paddleHeight/2);
        ballVelocity.x = -ballVelocity.x;
        ballVelocity.y = hitPosition * Math.abs(ballVelocity.x);
        
        // Augmenter légèrement la vitesse
        const speed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
        ballVelocity.x = (ballVelocity.x / speed) * (speed + gameConfig.ballSpeedIncrease);
        ballVelocity.y = (ballVelocity.y / speed) * (speed + gameConfig.ballSpeedIncrease);
        
        playSound('paddle');
    }
}

// Vérifier le score
function checkScore() {
    // Balle sortie à gauche (point pour joueur 2)
    if (ball.position.x < -gameConfig.fieldWidth/2 - 1) {
        player2Score++;
        updateScoreDisplay();
        playSound('score');
        checkGameOver();
        resetBall();
    }
    
    // Balle sortie à droite (point pour joueur 1)
    if (ball.position.x > gameConfig.fieldWidth/2 + 1) {
        player1Score++;
        updateScoreDisplay();
        playSound('score');
        checkGameOver();
        resetBall();
    }
}

// Mettre à jour l'affichage du score
function updateScoreDisplay() {
    scoreDisplay.textContent = `${player1Score} - ${player2Score}`;
}

// Vérifier si le jeu est terminé
function checkGameOver() {
    if (player1Score >= gameConfig.maxScore) {
        endGame(1);
    } else if (player2Score >= gameConfig.maxScore) {
        endGame(2);
    }
}

// Terminer le jeu
function endGame(winner) {
    gameStarted = false;
    winnerText.textContent = `Joueur ${winner} gagne!`;
    gameOverScreen.style.display = 'block';
}

// Jouer un son
function playSound(type, volume = 0.5) {
    try {
        // Créer un son simple avec l'API Web Audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
    
    // Configurer le son selon le type
    switch (type) {
        case 'paddle':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'wall':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            gainNode.gain.setValueAtTime(volume * 0.7, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'score':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
    } catch (e) {
        console.log('Erreur audio:', e);
    }
}
