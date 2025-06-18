"use strict";
const sidenav = document.getElementById("mySidenav");
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
if (sidenav && openBtn && closeBtn) {
    openBtn.onclick = openNav;
    closeBtn.onclick = closeNav;
}
function openNav() {
    if (sidenav) {
        sidenav.classList.remove("left-[-250px]");
        sidenav.classList.add("left-0");
    }
}
function closeNav() {
    if (sidenav) {
        sidenav.classList.remove("left-0");
        sidenav.classList.add("left-[-250px]");
    }
}
// --- Jeu Pong ---
const canvas = document.getElementById('pong');
const playGame = document.getElementById('playGame');
let animationId = null;
if (!canvas) {
    throw new Error("Canvas element not found!");
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error("Could not get canvas context!");
}
function draw() {
    if (!ctx || !canvas)
        return;
    if (keys['w'] && leftY > 0)
        leftY -= paddleSpeed;
    if (keys['s'] && leftY < canvas.height - paddleHeight)
        leftY += paddleSpeed;
    if (keys['ArrowUp'] && rightY > 0)
        rightY -= paddleSpeed;
    if (keys['ArrowDown'] && rightY < canvas.height - paddleHeight)
        rightY += paddleSpeed;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(10, leftY, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 20, rightY, paddleWidth, paddleHeight);
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
    ballX += ballVX;
    ballY += ballVY;
    if (ballY < ballSize || ballY > canvas.height - ballSize)
        ballVY = -ballVY;
    if (ballX - ballSize < 20 && ballY > leftY && ballY < leftY + paddleHeight) {
        ballVX = -ballVX;
        ballX = 20 + ballSize;
    }
    if (ballX + ballSize > canvas.width - 20 && ballY > rightY && ballY < rightY + paddleHeight) {
        ballVX = -ballVX;
        ballX = canvas.width - 20 - ballSize;
    }
    if (ballX < 0) {
        rightScore++;
        resetBall();
    }
    if (ballX > canvas.width) {
        leftScore++;
        resetBall();
    }
    if (leftScore >= maxScore || rightScore >= maxScore) {
        gameOver = true;
        ctx.font = "40px 'Press Start 2P', monospace";
        ctx.fillStyle = "yellow";
        ctx.textAlign = "center";
        ctx.fillText((leftScore >= maxScore ? "Player 1 won !" : "Player 2 won !"), canvas.width / 2, canvas.height / 2);
        return;
    }
    ctx.font = "32px 'Press Start 2P', monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(leftScore + "   " + rightScore, canvas.width / 2, 50);
    if (!gameOver) {
        animationId = requestAnimationFrame(draw);
    }
}
function launchFullscreen(element) {
    if (element.requestFullscreen)
        element.requestFullscreen();
    else if (element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen)
        element.msRequestFullscreen();
}
function exitFullscreen() {
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
}
let leftScore = 0;
let rightScore = 0;
let gameOver = false;
const paddleHeight = 80, paddleWidth = 10;
let leftY = 160, rightY = 160;
const paddleSpeed = 10;
let ballX = canvas.width / 2, ballY = canvas.height / 2, ballVX = 4, ballVY = 4, ballSize = 10;
const maxScore = 5;
const keys = {};
document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
});
document.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVX = -ballVX;
    ballVY = 4 * (Math.random() > 0.5 ? 1 : -1);
}
draw();
if (playGame) {
    playGame.onclick = () => {
        leftScore = 0;
        rightScore = 0;
        gameOver = false;
        playGame.classList.add('hidden');
        canvas.classList.remove('hidden');
        launchFullscreen(canvas);
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        draw();
    };
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            canvas.classList.add('hidden');
            playGame.classList.remove('hidden');
            exitFullscreen();
        }
    });
}
const loginBtn = document.getElementById('loginBtn');
loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener('click', () => {
    // Vérifie si le formulaire existe déjà
    if (document.getElementById('loginForm'))
        return;
    // Crée le conteneur du formulaire
    const formDiv = document.createElement('div');
    formDiv.id = 'loginForm';
    formDiv.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50';
    document.body.appendChild(formDiv);
    showLoginForm();
    // Fonction pour afficher le formulaire de connexion
    function showLoginForm() {
        formDiv.innerHTML = `
            <div class="bg-white text-black rounded-lg p-8 shadow-lg w-full max-w-xs">
                <h2 class="text-xl font-bold mb-4 text-center">Connexion</h2>
                <form>
                    <input type="text" name="username" placeholder="Nom d'utilisateur" class="w-full mb-3 px-3 py-2 border rounded" />
                    <input type="password" name="password" placeholder="Mot de passe" class="w-full mb-4 px-3 py-2 border rounded" />
                    <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Se connecter</button>
                </form>
                <button id="closeLogin" class="mt-4 w-full text-sm text-gray-500 hover:text-red-500">Annuler</button>
                <button id="signupBtn" class="mt-2 w-full text-sm text-blue-500 hover:text-blue-700 underline">S'inscrire</button>
            </div>
        `;
        attachEvents();
        const loginForm = formDiv.querySelector('form');
        loginForm === null || loginForm === void 0 ? void 0 : loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(loginForm);
                const data = {
                    username: formData.get("username"),
                    password: formData.get("password"),
                };
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (response.ok) {
                    alert('Connexion réussie !');
                    formDiv.remove();
                }
                else {
                    alert('Nom d\'utilisateur ou mot de passe incorrect');
                }
            }
            catch (error) {
                alert("Erreur réseau ou serveur injoignable !");
                console.error(error);
            }
        });
    }
    // Fonction pour afficher le formulaire d'inscription
    function showSignupForm() {
        formDiv.innerHTML = `
            <div class="bg-white text-black rounded-lg p-8 shadow-lg w-full max-w-xs">
                <h2 class="text-xl font-bold mb-4 text-center">Inscription</h2>
                <form>
                    <input type="text" name="username" placeholder="Nom d'utilisateur" class="w-full mb-3 px-3 py-2 border rounded" />
                    <input type="email" name="email" placeholder="Email" class="w-full mb-3 px-3 py-2 border rounded" />
                    <input type="password" name="password" placeholder="Mot de passe" class="w-full mb-4 px-3 py-2 border rounded" />
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">S'inscrire</button>
                </form>
                <button id="closeLogin" class="mt-4 w-full text-sm text-gray-500 hover:text-red-500">Annuler</button>
                <button id="backToLogin" class="mt-2 w-full text-sm text-blue-500 hover:text-blue-700 underline">Déjà un compte ? Se connecter</button>
            </div>
        `;
        attachEvents();
        const signupForm = formDiv.querySelector('form');
        signupForm === null || signupForm === void 0 ? void 0 : signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(signupForm);
                const data = {
                    username: formData.get("username"),
                    email: formData.get("email"),
                    password: formData.get("password"),
                };
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                if (response.ok) {
                    alert('Inscription réussie !');
                    formDiv.remove();
                }
                else {
                    alert('Erreur lors de l\'inscription');
                }
            }
            catch (error) {
                alert("Erreur réseau ou serveur injoignable !");
                console.error(error);
            }
        });
    }
    // Attache les événements aux boutons du formulaire courant
    function attachEvents() {
        const closeBtn = document.getElementById('closeLogin');
        closeBtn === null || closeBtn === void 0 ? void 0 : closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            formDiv.remove();
        });
        const signupBtn = document.getElementById('signupBtn');
        signupBtn === null || signupBtn === void 0 ? void 0 : signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSignupForm();
        });
        const backToLogin = document.getElementById('backToLogin');
        backToLogin === null || backToLogin === void 0 ? void 0 : backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
        // Fermer si on clique en dehors du formulaire
        formDiv.addEventListener('click', (e) => {
            if (e.target === formDiv)
                formDiv.remove();
        });
    }
});
