/**
 * Création de la scène pour GOAT PONG 3D - Futuristic Edition
 */

class GameScene {
    constructor(engine) {
        this.engine = engine;
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.player1Paddle = null;
        this.player2Paddle = null;
        this.ball = null;
        this.field = null;
        this.walls = [];
        this.effects = null;
        this.flameEmitters = [];
        
        // Créer la scène
        this.createScene();
    }

    // Créer la scène principale
    createScene() {
        // Nouvelle scène
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0.1, 1);
        
        // Pas de physique, gestion simple des collisions
        
        // Initialiser les effets visuels
        this.effects = new VisualEffects(this.scene);
        
        // Créer la caméra
        this.createCamera();
        
        // Créer les lumières
        this.createLights();
        
        // Créer le skybox
        this.createSkybox();
        
        // Créer le terrain
        this.createField();
        
        // Créer les raquettes
        this.createPaddles();
        
        // Créer la balle
        this.createBall();
        
        // Créer les effets visuels
        this.effects = new VisualEffects(this.scene);
        
        // Ajouter des flammes bleues aux coins du terrain
        this.addFlames();
        
        // Configurer les ombres maintenant que tous les objets sont créés
        this.setupShadows();
        
        // Ajouter des effets de post-processing
        this.effects.setupPostProcessing(this.camera);
        
        // Ajouter une traînée à la balle
        this.effects.createBallTrail(this.ball);
        
        // Debug
        if (GameConfig.debugMode) {
            this.scene.debugLayer.show();
        }
        
        return this.scene;
    }

    // Créer la caméra
    createCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 3,
            30,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        
        // Position et cible de la caméra
        this.camera.setPosition(new BABYLON.Vector3(GameConfig.cameraX, GameConfig.cameraY, GameConfig.cameraZ));
        this.camera.target = new BABYLON.Vector3(0, 0, 0);
        
        // Limites de zoom
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 50;
        
        // Limites d'angle
        this.camera.lowerBetaLimit = 0.1;
        this.camera.upperBetaLimit = Math.PI / 2;
        
        // Désactiver les contrôles de la caméra
        this.camera.detachControl();
        
        // Champ de vision
        this.camera.fov = GameConfig.cameraFOV;
    }

    // Créer les lumières
    createLights() {
        // Lumière ambiante
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = GameConfig.ambientIntensity;
        ambientLight.diffuse = new BABYLON.Color3(0, 0.5, 1);
        ambientLight.specular = new BABYLON.Color3(0, 0.5, 1);
        ambientLight.groundColor = new BABYLON.Color3(0, 0.1, 0.2);
        
        // Lumière directionnelle principale
        const mainLight = new BABYLON.DirectionalLight(
            "mainLight",
            new BABYLON.Vector3(0, -1, 0.5),
            this.scene
        );
        mainLight.intensity = 0.7;
        mainLight.diffuse = new BABYLON.Color3(1, 1, 1);
        mainLight.specular = new BABYLON.Color3(1, 1, 1);
        
        // On stocke la lumière pour ajouter les ombres plus tard
        this.mainLight = mainLight;
        this.shadowGenerator = null;
        
        // Les ombres seront configurées après la création des objets
        
        // Lumières ponctuelles aux coins du terrain
        const cornerLights = [];
        const halfWidth = GameConfig.fieldWidth / 2;
        const halfLength = GameConfig.fieldLength / 2;
        
        // Positions des coins
        const cornerPositions = [
            new BABYLON.Vector3(-halfWidth, 2, -halfLength),
            new BABYLON.Vector3(halfWidth, 2, -halfLength),
            new BABYLON.Vector3(-halfWidth, 2, halfLength),
            new BABYLON.Vector3(halfWidth, 2, halfLength)
        ];
        
        // Créer une lumière à chaque coin
        cornerPositions.forEach((pos, index) => {
            const light = new BABYLON.PointLight(`cornerLight${index}`, pos, this.scene);
            light.diffuse = new BABYLON.Color3(0, 0.7, 1);
            light.specular = new BABYLON.Color3(0, 0.7, 1);
            light.intensity = 0.5;
            light.range = 20;
            cornerLights.push(light);
        });
    }

    // Créer le skybox
    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: GameConfig.skyboxSize }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMaterial", this.scene);
        skyboxMaterial.backFaceCulling = false;
        
        // Utiliser une couleur unie au lieu d'une texture
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0.1); // Bleu foncé
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0.05); // Légère lueur bleue
        
        // Désactiver les réflexions
        skyboxMaterial.disableLighting = true;
        
        skybox.material = skyboxMaterial;
        
        // Rendre le skybox non affecté par les lumières
        skybox.infiniteDistance = true;
    }

    // Créer le terrain de jeu
    createField() {
        // Matériau pour le terrain
        const fieldMaterial = this.effects.createGridMaterial("fieldMaterial");
        
        // Créer le terrain
        this.field = BABYLON.MeshBuilder.CreateGround(
            "field",
            {
                width: GameConfig.fieldWidth,
                height: GameConfig.fieldLength
            },
            this.scene
        );
        this.field.material = fieldMaterial;
        this.field.receiveShadows = true;
        
        // Pas de physique pour le terrain
        
        // Créer les murs autour du terrain
        this.createWalls();
        
        // Ajouter une ligne centrale
        this.createCenterLine();
    }

    // Créer les murs autour du terrain
    createWalls() {
        const wallHeight = 1;
        const wallThickness = 0.2;
        const halfWidth = GameConfig.fieldWidth / 2;
        const halfLength = GameConfig.fieldLength / 2;
        
        // Matériau pour les murs
        const wallMaterial = this.effects.createNeonMaterial(
            "wallMaterial",
            new BABYLON.Color3(0, 0.7, 1),
            this.scene
        );
        
        // Mur supérieur
        const topWall = BABYLON.MeshBuilder.CreateBox(
            "topWall",
            {
                width: GameConfig.fieldWidth + wallThickness * 2,
                height: wallHeight,
                depth: wallThickness
            },
            this.scene
        );
        topWall.position = new BABYLON.Vector3(0, wallHeight / 2, -halfLength - wallThickness / 2);
        topWall.material = wallMaterial;
        topWall.receiveShadows = true;
        
        // Pas de physique pour les murs
        
        this.walls.push(topWall);
        
        // Mur inférieur
        const bottomWall = BABYLON.MeshBuilder.CreateBox(
            "bottomWall",
            {
                width: GameConfig.fieldWidth + wallThickness * 2,
                height: wallHeight,
                depth: wallThickness
            },
            this.scene
        );
        bottomWall.position = new BABYLON.Vector3(0, wallHeight / 2, halfLength + wallThickness / 2);
        bottomWall.material = wallMaterial;
        bottomWall.receiveShadows = true;
        
        // Pas de physique pour les murs
        
        this.walls.push(bottomWall);
        
        // Mur gauche (derrière la raquette du joueur 1)
        const leftWall = BABYLON.MeshBuilder.CreateBox(
            "leftWall",
            {
                width: wallThickness,
                height: wallHeight,
                depth: GameConfig.fieldLength + wallThickness * 2
            },
            this.scene
        );
        leftWall.position = new BABYLON.Vector3(-halfWidth - wallThickness / 2, wallHeight / 2, 0);
        leftWall.material = wallMaterial;
        leftWall.receiveShadows = true;
        this.walls.push(leftWall);
        
        // Mur droit (derrière la raquette du joueur 2)
        const rightWall = BABYLON.MeshBuilder.CreateBox(
            "rightWall",
            {
                width: wallThickness,
                height: wallHeight,
                depth: GameConfig.fieldLength + wallThickness * 2
            },
            this.scene
        );
        rightWall.position = new BABYLON.Vector3(halfWidth + wallThickness / 2, wallHeight / 2, 0);
        rightWall.material = wallMaterial;
        rightWall.receiveShadows = true;
        this.walls.push(rightWall);
    }

    // Créer la ligne centrale
    createCenterLine() {
        const centerLine = BABYLON.MeshBuilder.CreateGround(
            "centerLine",
            {
                width: 0.1,
                height: GameConfig.fieldLength
            },
            this.scene
        );
        centerLine.position.y = 0.01; // Légèrement au-dessus du terrain pour éviter le z-fighting
        
        // Matériau pour la ligne centrale
        const centerLineMaterial = new BABYLON.StandardMaterial("centerLineMaterial", this.scene);
        centerLineMaterial.emissiveColor = new BABYLON.Color3(0, 0.7, 1);
        centerLineMaterial.alpha = 0.7;
        centerLine.material = centerLineMaterial;
    }

    // Créer les raquettes
    createPaddles() {
        // Matériau pour la raquette du joueur 1 (bleu)
        const player1Material = this.effects.createNeonMaterial(
            "player1Material",
            BABYLON.Color3.FromHexString(GameConfig.player1Color),
            this.scene
        );
        
        // Matériau pour la raquette du joueur 2 (rouge)
        const player2Material = this.effects.createNeonMaterial(
            "player2Material",
            BABYLON.Color3.FromHexString(GameConfig.player2Color),
            this.scene
        );
        
        // Créer la raquette du joueur 1 (gauche)
        this.player1Paddle = BABYLON.MeshBuilder.CreateBox(
            "player1Paddle",
            {
                width: GameConfig.paddleWidth,
                height: GameConfig.paddleHeight,
                depth: GameConfig.paddleDepth
            },
            this.scene
        );
        
        // Positionner correctement la raquette du joueur 1 à gauche
        const player1X = -GameConfig.fieldWidth / 2 + GameConfig.paddleWidth / 2 + 0.5;
        this.player1Paddle.position = new BABYLON.Vector3(
            player1X,
            GameConfig.paddleHeight / 2,
            0
        );
        console.log("Player 1 paddle position:", this.player1Paddle.position);
        this.player1Paddle.material = player1Material;
        this.player1Paddle.receiveShadows = true;
        
        // Créer la raquette du joueur 2 (droite)
        this.player2Paddle = BABYLON.MeshBuilder.CreateBox(
            "player2Paddle",
            {
                width: GameConfig.paddleWidth,
                height: GameConfig.paddleHeight,
                depth: GameConfig.paddleDepth
            },
            this.scene
        );
        
        // Positionner correctement la raquette du joueur 2 à droite
        const player2X = GameConfig.fieldWidth / 2 - GameConfig.paddleWidth / 2 - 0.5;
        this.player2Paddle.position = new BABYLON.Vector3(
            player2X,
            GameConfig.paddleHeight / 2,
            0
        );
        console.log("Player 2 paddle position:", this.player2Paddle.position);
        this.player2Paddle.material = player2Material;
        this.player2Paddle.receiveShadows = true;
    }

    // Créer la balle
    createBall() {
        // Créer la sphère
        this.ball = BABYLON.MeshBuilder.CreateSphere(
            "ball",
            { diameter: GameConfig.ballDiameter },
            this.scene
        );
        this.ball.position = new BABYLON.Vector3(0, GameConfig.ballDiameter / 2, 0);
        
        // Matériau pour la balle
        const ballMaterial = new BABYLON.StandardMaterial("ballMaterial", this.scene);
        ballMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        ballMaterial.specularPower = 128;
        this.ball.material = ballMaterial;
        
        // Ajouter un effet de lueur à la balle
        const ballGlow = new BABYLON.HighlightLayer("ballGlow", this.scene);
        ballGlow.addMesh(this.ball, new BABYLON.Color3(0, 0.7, 1));
        
        // Pas de physique pour la balle
    }

    // Ajouter des flammes bleues aux coins du terrain
    addFlames() {
        const halfWidth = GameConfig.fieldWidth / 2;
        const halfLength = GameConfig.fieldLength / 2;
        
        // Positions des flammes aux coins
        const flamePositions = [
            new BABYLON.Vector3(-halfWidth, 0, -halfLength),
            new BABYLON.Vector3(halfWidth, 0, -halfLength),
            new BABYLON.Vector3(-halfWidth, 0, halfLength),
            new BABYLON.Vector3(halfWidth, 0, halfLength)
        ];
        
        // Créer des flammes à chaque coin
        flamePositions.forEach(position => {
            // Créer un piédestal pour la flamme
            const pedestal = BABYLON.MeshBuilder.CreateCylinder(
                "pedestal",
                {
                    height: 0.5,
                    diameter: 0.8,
                    tessellation: 16
                },
                this.scene
            );
            pedestal.position = new BABYLON.Vector3(position.x, 0.25, position.z);
            
            // Matériau pour le piédestal
            const pedestalMaterial = new BABYLON.StandardMaterial("pedestalMaterial", this.scene);
            pedestalMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
            pedestalMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.4);
            pedestal.material = pedestalMaterial;
            
            // Ajouter les flammes
            const flameEmitter = new BABYLON.Vector3(position.x, 0.5, position.z);
            const flame = this.effects.createBlueFlames(flameEmitter);
            this.flameEmitters.push({ position: flameEmitter, system: flame });
        });
    }

    // Réinitialiser la position de la balle
    resetBall() {
        this.ball.position = new BABYLON.Vector3(0, GameConfig.ballDiameter / 2, 0);
        
        // Pas de physique pour la balle
    }

    // Configurer les ombres
    setupShadows() {
        if (GameConfig.enableShadows && this.mainLight && this.ball && this.player1Paddle && this.player2Paddle) {
            this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.mainLight);
            this.shadowGenerator.useBlurExponentialShadowMap = true;
            this.shadowGenerator.blurKernel = 32;
            
            // Ajouter les objets qui projettent des ombres
            this.shadowGenerator.addShadowCaster(this.ball);
            this.shadowGenerator.addShadowCaster(this.player1Paddle);
            this.shadowGenerator.addShadowCaster(this.player2Paddle);
            
            // Configurer les objets qui reçoivent des ombres
            this.field.receiveShadows = true;
            this.walls.forEach(wall => {
                wall.receiveShadows = true;
            });
        }
    }

    // Nettoyer les ressources
    dispose() {
        if (this.effects) {
            this.effects.dispose();
        }
        
        if (this.scene) {
            this.scene.dispose();
        }
    }
}
