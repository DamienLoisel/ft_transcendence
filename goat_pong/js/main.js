/**
 * Fichier principal pour GOAT PONG 3D - Futuristic Edition
 */

// Éléments DOM
let canvas, engine, gameScene, gameLogic;
let startScreen, gameOverScreen, scoreDisplay, loadingProgress;
let startButton, restartButton;

// État du jeu
let isGameRunning = false;

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les éléments du DOM
    canvas = document.getElementById('renderCanvas');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    scoreDisplay = document.getElementById('scoreDisplay');
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    loadingProgress = document.getElementById('loadingProgress');
    
    // Initialiser le moteur Babylon.js
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    // Événements des boutons
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Événement de redimensionnement
    window.addEventListener('resize', function() {
        engine.resize();
    });
    
    // Événement de fin de partie
    window.addEventListener('gameOver', handleGameOver);
    
    // Simuler un chargement pour l'effet visuel
    simulateLoading();
});

// Simuler un chargement progressif
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        loadingProgress.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            startButton.disabled = false;
        }
    }, 100);
}

// Démarrer le jeu
function startGame() {
    // Masquer l'écran de démarrage
    startScreen.style.display = 'none';
    
    // Créer la scène de jeu
    gameScene = new GameScene(engine);
    
    // Créer la logique de jeu
    gameLogic = new GameLogic(gameScene, scoreDisplay);
    
    // Démarrer la boucle de rendu
    isGameRunning = true;
    engine.runRenderLoop(function() {
        if (isGameRunning) {
            const deltaTime = engine.getDeltaTime() / 1000;
            gameLogic.update(deltaTime);
            gameScene.scene.render();
        }
    });
}

// Redémarrer le jeu
function restartGame() {
    // Masquer l'écran de fin de partie
    gameOverScreen.style.display = 'none';
    
    // Réinitialiser le jeu
    if (gameLogic) {
        gameLogic.resetGame();
    }
    
    // Redémarrer la boucle de rendu
    isGameRunning = true;
}

// Gérer la fin de partie
function handleGameOver(event) {
    const winner = event.detail.winner;
    
    // Afficher le gagnant
    const winnerText = document.getElementById('winnerText');
    winnerText.textContent = `Joueur ${winner} gagne!`;
    
    // Afficher l'écran de fin de partie
    gameOverScreen.style.display = 'flex';
    
    // Arrêter la boucle de rendu
    isGameRunning = false;
}
