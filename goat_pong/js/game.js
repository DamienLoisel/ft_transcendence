/**
 * Logique du jeu GOAT PONG 3D - Futuristic Edition
 */

class GameLogic {
    constructor(gameScene, scoreDisplay) {
        this.gameScene = gameScene;
        this.scene = gameScene.scene;
        this.scoreDisplay = scoreDisplay;
        
        // Scores
        this.player1Score = 0;
        this.player2Score = 0;
        
        // État du jeu
        this.isGameOver = false;
        this.isPaused = false;
        
        // Contrôles
        this.inputMap = {};
        
        // Vitesse de la balle
        this.ballVelocity = { x: 0, z: 0 };
        
        // Initialiser la balle
        this.resetBall();
        
        // Configurer les événements
        this.setupEventListeners();
        
        // Audio context pour les sons
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log("Web Audio API non supportée");
        }
    }

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Écouteurs pour les touches du clavier
        window.addEventListener("keydown", (e) => {
            this.inputMap[e.key] = true;
        });
        
        window.addEventListener("keyup", (e) => {
            this.inputMap[e.key] = false;
        });
    }

    // Réinitialiser la balle
    resetBall() {
        // Réinitialiser la position
        this.gameScene.resetBall();
        
        // Direction aléatoire, mais jamais complètement verticale
        // Angle plus restreint pour favoriser les trajectoires horizontales
        const angle = (Math.random() * Math.PI/3) - Math.PI/6;
        const direction = Math.random() < 0.5 ? -1 : 1;
        
        // Vitesse initiale plus élevée
        const initialSpeed = GameConfig.initialBallSpeed * 1.2;
        
        this.ballVelocity = {
            x: Math.cos(angle) * initialSpeed * direction,
            z: Math.sin(angle) * initialSpeed * (Math.random() < 0.5 ? -1 : 1)
        };
        
        console.log("Ball reset with velocity:", this.ballVelocity);
    }

    // Mettre à jour le jeu
    update(deltaTime) {
        if (this.isGameOver || this.isPaused) return;
        
        // Mettre à jour les raquettes
        this.updatePaddles(deltaTime);
        
        // Mettre à jour la balle
        this.updateBall(deltaTime);
        
        // Vérifier les collisions
        this.checkCollisions();
        
        // Note: La vérification du score est maintenant gérée par increaseScore
    }

    // Mettre à jour les raquettes
    updatePaddles(deltaTime) {
        const paddleSpeed = GameConfig.paddleSpeed * deltaTime;
        const halfLength = GameConfig.fieldLength / 2 - GameConfig.paddleDepth / 2;
        
        // Déplacer la raquette du joueur 1
        if (this.inputMap[GameConfig.player1Keys.up]) {
            this.gameScene.player1Paddle.position.z -= paddleSpeed;
        }
        if (this.inputMap[GameConfig.player1Keys.down]) {
            this.gameScene.player1Paddle.position.z += paddleSpeed;
        }
        
        // Déplacer la raquette du joueur 2
        if (this.inputMap[GameConfig.player2Keys.up]) {
            this.gameScene.player2Paddle.position.z -= paddleSpeed;
        }
        if (this.inputMap[GameConfig.player2Keys.down]) {
            this.gameScene.player2Paddle.position.z += paddleSpeed;
        }
        
        // Limiter les raquettes aux bords du terrain
        this.gameScene.player1Paddle.position.z = Math.max(-halfLength, Math.min(halfLength, this.gameScene.player1Paddle.position.z));
        this.gameScene.player2Paddle.position.z = Math.max(-halfLength, Math.min(halfLength, this.gameScene.player2Paddle.position.z));
    }

    // Mettre à jour la balle
    updateBall(deltaTime) {
        // Appliquer un facteur de vitesse pour rendre le jeu plus rapide
        const speedFactor = 1.5;
        
        // Mettre à jour la position de la balle
        this.gameScene.ball.position.x += this.ballVelocity.x * deltaTime * speedFactor;
        this.gameScene.ball.position.z += this.ballVelocity.z * deltaTime * speedFactor;
        
        // Debug - afficher la vélocité de la balle
        if (Math.random() < 0.01) { // Afficher seulement 1% du temps pour éviter de spammer la console
            console.log(`Ball velocity: ${this.ballVelocity.x.toFixed(3)}, ${this.ballVelocity.z.toFixed(3)}`);
            console.log(`Ball position: ${this.gameScene.ball.position.x.toFixed(2)}, ${this.gameScene.ball.position.z.toFixed(2)}`);
        }
        
        // Faire tourner la balle
        const rotationSpeed = 0.05;
        this.gameScene.ball.rotate(
            BABYLON.Axis.Z,
            this.ballVelocity.x * rotationSpeed,
            BABYLON.Space.LOCAL
        );
        this.gameScene.ball.rotate(
            BABYLON.Axis.X,
            -this.ballVelocity.z * rotationSpeed,
            BABYLON.Space.LOCAL
        );
    }

    // Vérifier les collisions
    checkCollisions() {
        const ball = this.gameScene.ball;
        const ballRadius = GameConfig.ballDiameter / 2;
        
        // Vérifier si la balle est sortie du terrain (but)
        const halfWidth = GameConfig.fieldWidth / 2;
        if (ball.position.x < -halfWidth) {
            // But pour le joueur 2
            this.increaseScore('player2');
            this.resetBall();
            return;
        } else if (ball.position.x > halfWidth) {
            // But pour le joueur 1
            this.increaseScore('player1');
            this.resetBall();
            return;
        }
        
        // Collision avec les murs supérieur et inférieur
        const halfLength = GameConfig.fieldLength / 2;
        if (ball.position.z - ballRadius <= -halfLength) {
            // Repositionner la balle pour éviter qu'elle ne traverse le mur
            ball.position.z = -halfLength + ballRadius;
            this.ballVelocity.z = -this.ballVelocity.z;
            this.playSound('wall');
            
            // Effet de collision
            if (this.gameScene.effects) {
                this.gameScene.effects.createCollisionEffect(
                    new BABYLON.Vector3(ball.position.x, ball.position.y, -halfLength),
                    new BABYLON.Color4(0, 0.7, 1, 1)
                );
            }
        }
        else if (ball.position.z + ballRadius >= halfLength) {
            // Repositionner la balle pour éviter qu'elle ne traverse le mur
            ball.position.z = halfLength - ballRadius;
            this.ballVelocity.z = -this.ballVelocity.z;
            this.playSound('wall');
            
            // Effet de collision
            if (this.gameScene.effects) {
                this.gameScene.effects.createCollisionEffect(
                    new BABYLON.Vector3(ball.position.x, ball.position.y, halfLength),
                    new BABYLON.Color4(0, 0.7, 1, 1)
                );
            }
        }
        
        // Collision avec la raquette du joueur 1
        this.checkPaddleCollision(this.gameScene.player1Paddle, 'left');
        
        // Collision avec la raquette du joueur 2
        this.checkPaddleCollision(this.gameScene.player2Paddle, 'right');
    }

    // Vérifier la collision avec une raquette
    checkPaddleCollision(paddle, side) {
        const ball = this.gameScene.ball;
        const ballRadius = GameConfig.ballDiameter / 2;
        
        // Dimensions de la raquette
        const paddleWidth = GameConfig.paddleWidth;
        const paddleHeight = GameConfig.paddleHeight;
        const paddleDepth = GameConfig.paddleDepth;
        
        // Position de la raquette
        const paddlePos = paddle.position;
        
        // Vérifier si la balle est en collision avec la raquette
        if (
            ball.position.y - ballRadius < paddlePos.y + paddleHeight / 2 &&
            ball.position.y + ballRadius > paddlePos.y - paddleHeight / 2 &&
            ball.position.z + ballRadius > paddlePos.z - paddleDepth / 2 &&
            ball.position.z - ballRadius < paddlePos.z + paddleDepth / 2
        ) {
            // Collision avec la raquette gauche (joueur 1)
            if (side === 'left' && 
                ball.position.x - ballRadius <= paddlePos.x + paddleWidth / 2 &&
                ball.position.x > paddlePos.x - paddleWidth &&
                this.ballVelocity.x < 0) {
                
                // Repositionner la balle pour éviter qu'elle ne traverse la raquette
                ball.position.x = paddlePos.x + paddleWidth / 2 + ballRadius;
                
                // Calculer l'effet selon la position d'impact sur la raquette
                const hitPosition = (ball.position.z - paddlePos.z) / (paddleDepth / 2);
                
                // Inverser la direction horizontale
                this.ballVelocity.x = -this.ballVelocity.x;
                
                // Appliquer l'effet vertical
                this.ballVelocity.z = hitPosition * Math.abs(this.ballVelocity.x);
                
                // Augmenter légèrement la vitesse
                this.increaseBallSpeed();
                
                // Jouer un son
                this.playSound('paddle');
                
                // Effet de collision
                if (this.gameScene.effects) {
                    this.gameScene.effects.createCollisionEffect(
                        new BABYLON.Vector3(paddlePos.x + paddleWidth / 2, ball.position.y, ball.position.z),
                        BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(GameConfig.player1Color))
                    );
                }
            }
            // Collision avec la raquette droite (joueur 2)
            else if (side === 'right' && 
                    ball.position.x + ballRadius >= paddlePos.x - paddleWidth / 2 &&
                    ball.position.x < paddlePos.x + paddleWidth &&
                    this.ballVelocity.x > 0) {
                
                // Repositionner la balle pour éviter qu'elle ne traverse la raquette
                ball.position.x = paddlePos.x - paddleWidth / 2 - ballRadius;
                
                // Calculer l'effet selon la position d'impact sur la raquette
                const hitPosition = (ball.position.z - paddlePos.z) / (paddleDepth / 2);
                
                // Inverser la direction horizontale
                this.ballVelocity.x = -this.ballVelocity.x;
                
                // Appliquer l'effet vertical
                this.ballVelocity.z = hitPosition * Math.abs(this.ballVelocity.x);
                
                // Augmenter légèrement la vitesse
                this.increaseBallSpeed();
                
                // Jouer un son
                this.playSound('paddle');
                
                // Effet de collision
                if (this.gameScene.effects) {
                    this.gameScene.effects.createCollisionEffect(
                        new BABYLON.Vector3(paddlePos.x - paddleWidth / 2, ball.position.y, ball.position.z),
                        BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(GameConfig.player2Color))
                    );
                }
            }
        }
    }

    // Augmenter la vitesse de la balle
    increaseBallSpeed() {
        // Calculer la vitesse actuelle
        const currentSpeed = Math.sqrt(
            this.ballVelocity.x * this.ballVelocity.x + 
            this.ballVelocity.z * this.ballVelocity.z
        );
        
        // Calculer le facteur d'augmentation (plus important pour rendre le jeu plus dynamique)
        const increaseFactor = 1 + (GameConfig.ballSpeedIncrease * 1.5 / currentSpeed);
        
        // Appliquer l'augmentation
        this.ballVelocity.x *= increaseFactor;
        this.ballVelocity.z *= increaseFactor;
        
        // Limiter la vitesse maximale
        const newSpeed = Math.sqrt(
            this.ballVelocity.x * this.ballVelocity.x + 
            this.ballVelocity.z * this.ballVelocity.z
        );
        
        if (newSpeed > GameConfig.maxBallSpeed) {
            const scaleFactor = GameConfig.maxBallSpeed / newSpeed;
            this.ballVelocity.x *= scaleFactor;
            this.ballVelocity.z *= scaleFactor;
        }
        
        // Debug - afficher la nouvelle vitesse
        console.log(`Ball speed increased to: ${newSpeed.toFixed(3)}`);
    }

    // Augmenter le score d'un joueur
    increaseScore(player) {
        const ball = this.gameScene.ball;
        const halfWidth = GameConfig.fieldWidth / 2;
        
        if (player === 'player1') {
            this.player1Score++;
            
            // Effet de score
            if (this.gameScene.effects) {
                this.gameScene.effects.createScoreEffect(
                    new BABYLON.Vector3(halfWidth, ball.position.y, ball.position.z),
                    BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(GameConfig.player1Color))
                );
            }
        } else if (player === 'player2') {
            this.player2Score++;
            
            // Effet de score
            if (this.gameScene.effects) {
                this.gameScene.effects.createScoreEffect(
                    new BABYLON.Vector3(-halfWidth, ball.position.y, ball.position.z),
                    BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString(GameConfig.player2Color))
                );
            }
        }
        
        // Mettre à jour l'affichage du score
        this.updateScoreDisplay();
        
        // Jouer un son
        this.playSound('score');
        
        // Vérifier si la partie est terminée
        this.checkGameOver();
    }
    
    // Mettre à jour l'affichage du score
    updateScoreDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `${this.player1Score} - ${this.player2Score}`;
        }
    }

    // Vérifier si le jeu est terminé
    checkGameOver() {
        if (this.player1Score >= GameConfig.maxScore) {
            this.endGame(1);
        } else if (this.player2Score >= GameConfig.maxScore) {
            this.endGame(2);
        }
    }

    // Terminer le jeu
    endGame(winner) {
        this.isGameOver = true;
        
        // Événement de fin de jeu
        const event = new CustomEvent('gameOver', { detail: { winner } });
        window.dispatchEvent(event);
    }

    // Jouer un son
    playSound(type, volume = GameConfig.soundVolume) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Configurer le son selon le type
            switch (type) {
                case 'paddle':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                    break;
                case 'wall':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(volume * 0.7, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                    break;
                case 'score':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                    break;
            }
        } catch (e) {
            console.log('Erreur audio:', e);
        }
    }

    // Mettre en pause le jeu
    pauseGame() {
        this.isPaused = true;
    }

    // Reprendre le jeu
    resumeGame() {
        this.isPaused = false;
    }

    // Réinitialiser le jeu
    resetGame() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.updateScoreDisplay();
        this.resetBall();
    }
}
