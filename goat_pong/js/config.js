/**
 * Configuration du jeu GOAT PONG 3D - Futuristic Edition
 */

const GameConfig = {
    // Dimensions du terrain
    fieldWidth: 30,
    fieldLength: 16,
    fieldHeight: 1,
    
    // Dimensions des raquettes
    paddleWidth: 0.3,
    paddleHeight: 0.5,
    paddleDepth: 3,
    paddleOffset: 14, // Distance des raquettes par rapport au centre
    
    // Dimensions de la balle
    ballDiameter: 0.6,
    initialBallSpeed: 5,
    ballSpeedIncrease: 0.3, // Augmentation de la vitesse après chaque rebond
    maxBallSpeed: 15, // Vitesse maximale de la balle
    
    // Vitesse des raquettes
    paddleSpeed: 6,
    
    // Score maximum pour gagner
    maxScore: 5,
    
    // Paramètres du tournoi
    tournamentMode: false,
    playerCount: 4,
    underdogBracket: false,
    
    // Mode ordinateur
    computerMode: false,
    computerDifficulty: 5,
    
    // Contrôles
    player1Keys: { up: 'q', down: 'a' },
    player2Keys: { up: 'ArrowDown', down: 'ArrowUp' },
    
    // Couleurs
    player1Color: "#ff00ff", // Rose fluo
    player2Color: "#ff00ff", // Rose fluo
    
    // Effets visuels
    enableParticles: true,
    enablePostProcessing: true,
    enableShadows: true,
    
    // Paramètres d'ambiance
    ambientIntensity: 0.2,
    
    // Paramètres des flammes
    flameHeight: 0.8,
    flameIntensity: 2,
    flameColorHex: '#00b3ff', // Bleu
    
    // Paramètres sonores
    soundVolume: 0.5,
    
    // Paramètres de caméra
    cameraFOV: 0.8, // Field of view
    cameraX: 0,
    cameraY: 18,
    cameraZ: -22, // Coordonnées de la caméra
    
    // Paramètres de l'environnement
    skyboxSize: 1000,
    
    // Paramètres de debug
    debugMode: false
};
