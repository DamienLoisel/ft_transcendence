/**
 * Fichier principal pour GOAT PONG 3D - Futuristic Edition
 */

// Éléments DOM
let canvas, engine, gameScene, gameLogic;
let startScreen, gameOverScreen, scoreDisplay, loadingProgress;
let tournamentScreen, mainMenu;

// Éléments des menus
let play1v1Button, playVsComputerButton, playTournamentButton;
let settingsScreen1v1, settingsScreenComputer, settingsScreenTournament;
let startGame1v1Button, startGameComputerButton, startGameTournamentButton;
let backButtons;

// Sliders et valeurs
let gameSettings = {
    ballSpeed: 5,
    paddleWidth: 5,
    obstacles: 5,
    computerDifficulty: 5,
    playerCount: 4,
    underdogBracket: false,
    controls: {
        player1Up: 'q',
        player1Down: 'a',
        player2Up: 'ArrowUp',
        player2Down: 'ArrowDown'
    }
};

// État du jeu
let isGameRunning = false;

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les éléments du DOM
    canvas = document.getElementById('renderCanvas');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    scoreDisplay = document.getElementById('scoreDisplay');
    tournamentScreen = document.getElementById('tournamentScreen');
    mainMenu = document.getElementById('mainMenu');
    loadingProgress = document.getElementById('loadingProgress');
    
    // Récupérer les boutons du menu principal
    play1v1Button = document.getElementById('play1v1Button');
    playVsComputerButton = document.getElementById('playVsComputerButton');
    playTournamentButton = document.getElementById('playTournamentButton');
    
    // Récupérer les écrans de paramètres
    settingsScreen1v1 = document.getElementById('settingsScreen1v1');
    settingsScreenComputer = document.getElementById('settingsScreenComputer');
    settingsScreenTournament = document.getElementById('settingsScreenTournament');
    
    // Récupérer les boutons de démarrage
    startGame1v1Button = document.getElementById('startGame1v1');
    startGameComputerButton = document.getElementById('startGameComputer');
    startGameTournamentButton = document.getElementById('startGameTournament');
    
    // Récupérer les boutons retour
    backButton1v1 = document.getElementById('backButton1v1');
    backButtonComputer = document.getElementById('backButtonComputer');
    backButtonTournament = document.getElementById('backButtonTournament');
    
    // Initialiser le moteur Babylon.js
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    // Masquer le score au démarrage
    scoreDisplay.style.display = 'none';
    
    // Événements des boutons du menu principal
    play1v1Button.addEventListener('click', show1v1Settings);
    playVsComputerButton.addEventListener('click', showComputerSettings);
    playTournamentButton.addEventListener('click', showTournamentSettings);
    
    // Événements des boutons de démarrage
    startGame1v1Button.addEventListener('click', start1v1Game);
    startGameComputerButton.addEventListener('click', startComputerGame);
    startGameTournamentButton.addEventListener('click', startTournamentGame);
    
    // Événements des boutons retour
    backButton1v1.addEventListener('click', showMainMenu);
    backButtonComputer.addEventListener('click', showMainMenu);
    backButtonTournament.addEventListener('click', showMainMenu);
    
    // Événement du bouton de redémarrage
    restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', restartGame);
    
    // Événement du bouton Home
    homeButton = document.getElementById('homeButton');
    homeButton.addEventListener('click', returnToMainMenu);
    
    // Événement du bouton de match suivant dans le tournoi
    nextMatchButton = document.getElementById('nextMatchButton');
    nextMatchButton.addEventListener('click', nextTournamentMatch);
    
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
            // Tous les boutons sont activés une fois le chargement terminé
        }
    }, 100);
}

// Afficher l'écran des paramètres 1v1
function show1v1Settings() {
    mainMenu.style.display = 'none';
    settingsScreen1v1.style.display = 'flex';
    
    // Configurer les sliders et leurs valeurs
    setupSlider('ballSpeed1v1', 'ballSpeedValue1v1', value => gameSettings.ballSpeed = value);
    setupSlider('paddleWidth1v1', 'paddleWidthValue1v1', value => gameSettings.paddleWidth = value);
    setupSlider('obstacles1v1', 'obstaclesValue1v1', value => gameSettings.obstacles = value);
    
    // Configurer les contrôles
    document.getElementById('player1Up1v1').value = gameSettings.controls.player1Up;
    document.getElementById('player1Down1v1').value = gameSettings.controls.player1Down;
    document.getElementById('player2Up1v1').value = gameSettings.controls.player2Up;
    document.getElementById('player2Down1v1').value = gameSettings.controls.player2Down;
}

// Afficher l'écran des paramètres contre l'ordinateur
function showComputerSettings() {
    mainMenu.style.display = 'none';
    settingsScreenComputer.style.display = 'flex';
    
    // Configurer les sliders et leurs valeurs
    setupSlider('ballSpeedComputer', 'ballSpeedValueComputer', value => gameSettings.ballSpeed = value);
    setupSlider('paddleWidthComputer', 'paddleWidthValueComputer', value => gameSettings.paddleWidth = value);
    setupSlider('obstaclesComputer', 'obstaclesValueComputer', value => gameSettings.obstacles = value);
    setupSlider('computerDifficulty', 'computerDifficultyValue', value => gameSettings.computerDifficulty = value);
    
    // Configurer les contrôles
    document.getElementById('playerUpComputer').value = gameSettings.controls.player1Up;
    document.getElementById('playerDownComputer').value = gameSettings.controls.player1Down;
}

// Afficher l'écran des paramètres du tournoi
function showTournamentSettings() {
    mainMenu.style.display = 'none';
    settingsScreenTournament.style.display = 'flex';
    
    // Configurer les sliders et leurs valeurs
    setupSlider('ballSpeedTournament', 'ballSpeedValueTournament', value => gameSettings.ballSpeed = value);
    setupSlider('paddleWidthTournament', 'paddleWidthValueTournament', value => gameSettings.paddleWidth = value);
    setupSlider('obstaclesTournament', 'obstaclesValueTournament', value => gameSettings.obstacles = value);
    setupSlider('playerCount', 'playerCountValue', value => gameSettings.playerCount = value);
    
    // Configurer la checkbox
    document.getElementById('underdogBracket').addEventListener('change', function() {
        gameSettings.underdogBracket = this.checked;
    });
    
    // Configurer les contrôles
    document.getElementById('player1UpTournament').value = gameSettings.controls.player1Up;
    document.getElementById('player1DownTournament').value = gameSettings.controls.player1Down;
    document.getElementById('player2UpTournament').value = gameSettings.controls.player2Up;
    document.getElementById('player2DownTournament').value = gameSettings.controls.player2Down;
}

// Configurer un slider et sa valeur affichée
function setupSlider(sliderId, valueId, updateCallback) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    // Mettre à jour l'affichage initial
    valueDisplay.textContent = slider.value;
    
    // Ajouter l'écouteur d'événement pour les changements
    slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        valueDisplay.textContent = value;
        updateCallback(value);
    });
}

// Revenir au menu principal
function showMainMenu() {
    settingsScreen1v1.style.display = 'none';
    settingsScreenComputer.style.display = 'none';
    settingsScreenTournament.style.display = 'none';
    mainMenu.style.display = 'flex';
}

// Démarrer une partie 1v1
function start1v1Game() {
    // Masquer l'écran de paramètres
    startScreen.style.display = 'none';
    settingsScreen1v1.style.display = 'none';
    
    // Afficher le score
    scoreDisplay.style.display = 'block';
    
    // Appliquer les paramètres du jeu
    GameConfig.initialBallSpeed = gameSettings.ballSpeed;
    GameConfig.paddleDepth = gameSettings.paddleWidth * 0.6; // 5 -> 3 comme demandé
    
    // Sauvegarder les contrôles personnalisés
    gameSettings.controls.player1Up = document.getElementById('player1Up1v1').value;
    gameSettings.controls.player1Down = document.getElementById('player1Down1v1').value;
    gameSettings.controls.player2Up = document.getElementById('player2Up1v1').value;
    gameSettings.controls.player2Down = document.getElementById('player2Down1v1').value;
    
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

// Démarrer une partie contre l'ordinateur
function startComputerGame() {
    // Pour l'instant, afficher simplement le GIF du chien
    startScreen.style.display = 'none';
    settingsScreenComputer.style.display = 'none';
    
    // Sauvegarder les contrôles personnalisés
    gameSettings.controls.player1Up = document.getElementById('playerUpComputer').value;
    gameSettings.controls.player1Down = document.getElementById('playerDownComputer').value;
    
    // Créer un élément pour afficher le GIF
    const dogGifContainer = document.createElement('div');
    dogGifContainer.style.position = 'absolute';
    dogGifContainer.style.top = '0';
    dogGifContainer.style.left = '0';
    dogGifContainer.style.width = '100%';
    dogGifContainer.style.height = '100%';
    dogGifContainer.style.display = 'flex';
    dogGifContainer.style.justifyContent = 'center';
    dogGifContainer.style.alignItems = 'center';
    dogGifContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    dogGifContainer.style.zIndex = '30';
    
    const dogGif = document.createElement('img');
    dogGif.src = 'assets/dog.gif';
    dogGif.style.maxWidth = '80%';
    dogGif.style.maxHeight = '80%';
    
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Menu';
    backButton.className = 'game-button';
    backButton.style.position = 'absolute';
    backButton.style.bottom = '50px';
    
    backButton.addEventListener('click', () => {
        document.body.removeChild(dogGifContainer);
        startScreen.style.display = 'flex';
        showMainMenu();
    });
    
    dogGifContainer.appendChild(dogGif);
    dogGifContainer.appendChild(backButton);
    document.body.appendChild(dogGifContainer);
}

// Variables pour le tournoi
let tournamentPlayers = [];
let tournamentMatches = [];
let currentMatch = 0;
let tournamentScores = {};

// Démarrer un tournoi
function startTournamentGame() {
    // Masquer l'écran de paramètres
    startScreen.style.display = 'none';
    settingsScreenTournament.style.display = 'none';
    
    // Appliquer les paramètres du jeu
    GameConfig.initialBallSpeed = gameSettings.ballSpeed;
    GameConfig.paddleDepth = gameSettings.paddleWidth * 0.6;
    
    // Sauvegarder les contrôles personnalisés
    gameSettings.controls.player1Up = document.getElementById('player1UpTournament').value;
    gameSettings.controls.player1Down = document.getElementById('player1DownTournament').value;
    gameSettings.controls.player2Up = document.getElementById('player2UpTournament').value;
    gameSettings.controls.player2Down = document.getElementById('player2DownTournament').value;
    
    // Initialiser le tournoi
    initializeTournament();
    
    // Afficher l'écran du tournoi
    tournamentScreen.style.display = 'flex';
    
    // Afficher les scores initiaux
    updateTournamentScores();
    
    // Configurer le premier match
    setupNextMatch();
}

// Initialiser le tournoi
function initializeTournament() {
    // Créer les joueurs
    tournamentPlayers = [];
    for (let i = 1; i <= gameSettings.playerCount; i++) {
        tournamentPlayers.push(`Player ${i}`);
    }
    
    // Générer tous les matchs possibles (chaque joueur contre chaque joueur)
    tournamentMatches = [];
    for (let i = 0; i < tournamentPlayers.length; i++) {
        for (let j = i + 1; j < tournamentPlayers.length; j++) {
            tournamentMatches.push([tournamentPlayers[i], tournamentPlayers[j]]);
        }
    }
    
    // Réinitialiser les scores
    tournamentScores = {};
    tournamentPlayers.forEach(player => {
        tournamentScores[player] = 0;
    });
    
    // Réinitialiser le match actuel
    currentMatch = 0;
}

// Configurer le prochain match
function setupNextMatch() {
    if (currentMatch < tournamentMatches.length) {
        const [player1, player2] = tournamentMatches[currentMatch];
        document.getElementById('matchTitle').textContent = `Match ${currentMatch + 1}: ${player1} vs ${player2}`;
    } else {
        // Tournoi terminé
        document.getElementById('matchTitle').textContent = 'Tournament Finished!';
        document.getElementById('nextMatchButton').textContent = 'Back to Menu';
    }
}

// Passer au match suivant
function nextTournamentMatch() {
    if (currentMatch < tournamentMatches.length) {
        // Simuler le résultat du match (aléatoire pour l'instant)
        const [player1, player2] = tournamentMatches[currentMatch];
        const winner = Math.random() < 0.5 ? player1 : player2;
        
        // Mettre à jour les scores
        tournamentScores[winner]++;
        updateTournamentScores();
        
        // Passer au match suivant
        currentMatch++;
        setupNextMatch();
    } else {
        // Retour au menu principal
        tournamentScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        showMainMenu();
    }
}

// Mettre à jour l'affichage des scores du tournoi
function updateTournamentScores() {
    const scoresContainer = document.getElementById('tournamentScores');
    scoresContainer.innerHTML = '';
    
    // Trier les joueurs par score
    const sortedPlayers = Object.keys(tournamentScores).sort((a, b) => {
        return tournamentScores[b] - tournamentScores[a];
    });
    
    // Afficher les scores
    sortedPlayers.forEach(player => {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'player-score';
        scoreDiv.innerHTML = `<span>${player}</span><span>${tournamentScores[player]} points</span>`;
        scoresContainer.appendChild(scoreDiv);
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
    winnerText.textContent = `Player ${winner} wins!`;
    
    // Afficher l'écran de fin de partie
    gameOverScreen.style.display = 'flex';
    
    // Arrêter la boucle de rendu
    isGameRunning = false;
}

// Retourner au menu principal
function returnToMainMenu() {
    // Masquer l'écran de fin de partie
    gameOverScreen.style.display = 'none';
    
    // Arrêter le jeu en cours
    isGameRunning = false;
    
    // Masquer le score
    scoreDisplay.style.display = 'none';
    
    // Afficher l'écran de démarrage et le menu principal
    startScreen.style.display = 'flex';
    showMainMenu();
}
