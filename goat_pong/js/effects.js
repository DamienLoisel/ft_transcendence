/**
 * Effets visuels pour GOAT PONG 3D - Futuristic Edition
 */

class VisualEffects {
    constructor(scene) {
        this.scene = scene;
        this.particleSystems = [];
    }

    // Créer des flammes bleues
    createBlueFlames(position, emitDirection = new BABYLON.Vector3(0, 1, 0)) {
        if (!GameConfig.enableParticles) return null;

        // Système de particules pour les flammes
        const flameParticles = new BABYLON.ParticleSystem("flames", 2000, this.scene);
        
        // Créer une texture de particule générée dynamiquement
        const flareTexture = this.createFlareTexture("flameFlare");
        flameParticles.particleTexture = flareTexture;
        
        // Couleurs des flammes (bleu)
        const flameColor = BABYLON.Color3.FromHexString(GameConfig.flameColorHex);
        flameParticles.color1 = new BABYLON.Color4(flameColor.r, flameColor.g, flameColor.b, 1.0);
        flameParticles.color2 = new BABYLON.Color4(flameColor.r * 0.7, flameColor.g * 0.7, flameColor.b, 1.0);
        flameParticles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0);
        
        // Taille des particules
        flameParticles.minSize = 0.1;
        flameParticles.maxSize = 0.5;
        
        // Durée de vie des particules
        flameParticles.minLifeTime = 0.2;
        flameParticles.maxLifeTime = 0.5;
        
        // Émission
        flameParticles.emitRate = 500;
        flameParticles.minEmitPower = 1;
        flameParticles.maxEmitPower = 3;
        flameParticles.updateSpeed = 0.01;
        
        // Direction d'émission
        flameParticles.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5).add(emitDirection);
        flameParticles.direction2 = new BABYLON.Vector3(0.5, 1, 0.5).add(emitDirection);
        
        // Position
        flameParticles.emitter = position;
        
        // Forme d'émission
        flameParticles.createConeEmitter(0.2, 0.5);
        
        // Gravité
        flameParticles.gravity = new BABYLON.Vector3(0, 0, 0);
        
        // Mélange additif pour un effet lumineux
        flameParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Démarrer les particules
        flameParticles.start();
        
        this.particleSystems.push(flameParticles);
        return flameParticles;
    }

    // Effet de traînée pour la balle
    createBallTrail(ball) {
        if (!GameConfig.enableParticles || !ball) return null;

        const ballTrail = new BABYLON.ParticleSystem("ballTrail", 1000, this.scene);
        
        // Texture et couleurs
        ballTrail.particleTexture = this.createFlareTexture("ballTrailFlare");
        ballTrail.color1 = new BABYLON.Color4(0, 0.7, 1.0, 1.0);
        ballTrail.color2 = new BABYLON.Color4(0, 0.5, 1.0, 1.0);
        ballTrail.colorDead = new BABYLON.Color4(0, 0, 0.2, 0);
        
        // Taille des particules
        ballTrail.minSize = 0.1;
        ballTrail.maxSize = 0.3;
        
        // Durée de vie des particules
        ballTrail.minLifeTime = 0.1;
        ballTrail.maxLifeTime = 0.3;
        
        // Émission
        ballTrail.emitRate = 300;
        ballTrail.minEmitPower = 0.1;
        ballTrail.maxEmitPower = 0.3;
        ballTrail.updateSpeed = 0.01;
        
        // Position
        ballTrail.emitter = ball;
        
        // Forme d'émission
        ballTrail.createSphereEmitter(0.1);
        
        // Mélange additif pour un effet lumineux
        ballTrail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Démarrer les particules
        ballTrail.start();
        
        this.particleSystems.push(ballTrail);
        return ballTrail;
    }

    // Effet d'explosion lors d'une collision
    createCollisionEffect(position, color) {
        if (!GameConfig.enableParticles) return;

        const collisionParticles = new BABYLON.ParticleSystem("collision", 300, this.scene);
        
        // Texture et couleurs
        collisionParticles.particleTexture = this.createFlareTexture("explosionFlare");
        collisionParticles.color1 = color;
        collisionParticles.color2 = color;
        collisionParticles.colorDead = new BABYLON.Color4(color.r, color.g, color.b, 0);
        
        // Taille des particules
        collisionParticles.minSize = 0.1;
        collisionParticles.maxSize = 0.5;
        
        // Durée de vie des particules
        collisionParticles.minLifeTime = 0.2;
        collisionParticles.maxLifeTime = 0.4;
        
        // Émission
        collisionParticles.emitRate = 300;
        collisionParticles.minEmitPower = 1;
        collisionParticles.maxEmitPower = 3;
        collisionParticles.updateSpeed = 0.01;
        
        // Position
        collisionParticles.emitter = position;
        
        // Forme d'émission
        collisionParticles.createSphereEmitter(0.1);
        
        // Mélange additif pour un effet lumineux
        collisionParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Durée limitée
        collisionParticles.targetStopDuration = 0.2;
        
        // Démarrer les particules
        collisionParticles.start();
        
        // Auto-destruction après l'effet
        setTimeout(() => {
            collisionParticles.dispose();
            const index = this.particleSystems.indexOf(collisionParticles);
            if (index !== -1) {
                this.particleSystems.splice(index, 1);
            }
        }, 500);
    }

    // Effet de score
    createScoreEffect(position) {
        if (!GameConfig.enableParticles) return;

        const scoreParticles = new BABYLON.ParticleSystem("score", 500, this.scene);
        
        // Texture et couleurs
        scoreParticles.particleTexture = this.createFlareTexture("scoreFlare");
        scoreParticles.color1 = new BABYLON.Color4(1, 1, 0, 1);
        scoreParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        scoreParticles.colorDead = new BABYLON.Color4(1, 0, 0, 0);
        
        // Taille des particules
        scoreParticles.minSize = 0.2;
        scoreParticles.maxSize = 0.8;
        
        // Durée de vie des particules
        scoreParticles.minLifeTime = 0.5;
        scoreParticles.maxLifeTime = 1.5;
        
        // Émission
        scoreParticles.emitRate = 500;
        scoreParticles.minEmitPower = 2;
        scoreParticles.maxEmitPower = 5;
        scoreParticles.updateSpeed = 0.01;
        
        // Position
        scoreParticles.emitter = position;
        
        // Forme d'émission (explosion)
        scoreParticles.createSphereEmitter(0.1);
        
        // Mélange additif pour un effet lumineux
        scoreParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        // Durée limitée
        scoreParticles.targetStopDuration = 0.3;
        
        // Démarrer les particules
        scoreParticles.start();
        
        // Auto-destruction après l'effet
        setTimeout(() => {
            scoreParticles.dispose();
            const index = this.particleSystems.indexOf(scoreParticles);
            if (index !== -1) {
                this.particleSystems.splice(index, 1);
            }
        }, 1500);
    }

    // Configurer les effets de post-processing
    setupPostProcessing(camera) {
        if (!GameConfig.enablePostProcessing || !camera) return;

        try {
            // Effet de lueur (intensité réduite)
            const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
            glowLayer.intensity = 0.4; // Réduction de l'intensité
            
            // Effet de profondeur de champ
            const pipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline", 
                true, 
                this.scene, 
                [camera]
            );
            
            // Activer l'antialiasing
            pipeline.samples = 4;
            pipeline.fxaaEnabled = true;
            
            // Activer l'effet de bloom avec intensité réduite
            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = 0.8;  // Seuil plus élevé pour réduire l'effet
            pipeline.bloomWeight = 0.5;     // Poids réduit
            pipeline.bloomKernel = 48;      // Kernel plus petit
            pipeline.bloomScale = 0.3;      // Échelle réduite
            
            // Ajustement des couleurs
            pipeline.imageProcessingEnabled = true;
            pipeline.imageProcessing.contrast = 1.1;
            pipeline.imageProcessing.exposure = 1.0; // Réduction de l'exposition
            
            // Vignette
            pipeline.imageProcessing.vignetteEnabled = true;
            pipeline.imageProcessing.vignetteWeight = 1.5;
            pipeline.imageProcessing.vignetteCentreX = 0;
            pipeline.imageProcessing.vignetteCentreY = 0;
            pipeline.imageProcessing.vignetteColor = new BABYLON.Color4(0, 0, 0.3, 0);
        } catch (e) {
            console.log("Erreur lors de la configuration du post-processing:", e);
        }
    }

    // Créer un matériau grille futuriste
    createGridMaterial(name) {
        try {
            const gridMaterial = new BABYLON.GridMaterial(name, this.scene);
            gridMaterial.mainColor = new BABYLON.Color3(0, 0.5, 1.0);
            gridMaterial.lineColor = new BABYLON.Color3(0, 0.7, 1.0);
            gridMaterial.opacity = 0.8;
            gridMaterial.gridRatio = 0.5;
            gridMaterial.majorUnitFrequency = 5;
            gridMaterial.minorUnitVisibility = 0.3;
            gridMaterial.gridOffset = new BABYLON.Vector3(0, 0, 0);
            return gridMaterial;
        } catch (e) {
            console.log("Erreur lors de la création du matériau grille:", e);
            // Fallback à un matériau standard
            const fallbackMaterial = new BABYLON.StandardMaterial(name, this.scene);
            fallbackMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 1.0);
            return fallbackMaterial;
        }
    }

    // Créer un matériau néon avec intensité réduite
    createNeonMaterial(name, color) {
        const material = new BABYLON.StandardMaterial(name, this.scene);
        if (typeof color === 'string') {
            color = BABYLON.Color3.FromHexString(color);
        }
        material.emissiveColor = color;
        material.specularColor = color;
        material.specularPower = 32;
        material.alpha = 0.75; // Réduire l'opacité
        return material;
    }
    
    // Créer une texture de flare dynamiquement
    createFlareTexture(name) {
        const size = 256;
        const texture = new BABYLON.DynamicTexture(name, size, this.scene, false);
        const ctx = texture.getContext();
        
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 3;
        
        // Créer un dégradé radial
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(0, 100, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        texture.update();
        return texture;
    }

    // Nettoyer les ressources
    dispose() {
        // Arrêter et supprimer tous les systèmes de particules
        this.particleSystems.forEach(system => {
            system.stop();
            system.dispose();
        });
        this.particleSystems = [];
    }
}