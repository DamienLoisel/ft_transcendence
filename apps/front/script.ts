const sidenav = document.getElementById("mySidenav") as HTMLElement | null;
const openBtn = document.getElementById("openBtn") as HTMLElement | null;
const closeBtn = document.getElementById("closeBtn") as HTMLElement | null;

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
const canvas = document.getElementById('pong') as HTMLCanvasElement;
const playGame = document.getElementById('playGame') as HTMLElement | null;
let animationId: number | null = null;

if (!canvas) {
	throw new Error("Canvas element not found!");
}

const ctx = canvas.getContext('2d');
if (!ctx) {
	throw new Error("Could not get canvas context!");
}

function draw(): void {
	if (!ctx || !canvas) return;

	if (keys['w'] && leftY > 0) leftY -= paddleSpeed;
	if (keys['s'] && leftY < canvas.height - paddleHeight) leftY += paddleSpeed;
	if (keys['ArrowUp'] && rightY > 0) rightY -= paddleSpeed;
	if (keys['ArrowDown'] && rightY < canvas.height - paddleHeight) rightY += paddleSpeed;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	ctx.fillRect(10, leftY, paddleWidth, paddleHeight);
	ctx.fillRect(canvas.width - 20, rightY, paddleWidth, paddleHeight);

	ctx.beginPath();
	ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
	ctx.fill();

	ballX += ballVX;
	ballY += ballVY;

	if (ballY < ballSize || ballY > canvas.height - ballSize) ballVY = -ballVY;

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
		ctx.fillText(
			(leftScore >= maxScore ? "Player 1 won !" : "Player 2 won !"),
			canvas.width / 2,
			canvas.height / 2
		);
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

function launchFullscreen(element: HTMLElement) {
	if (element.requestFullscreen) element.requestFullscreen();
	else if ((element as any).webkitRequestFullscreen) (element as any).webkitRequestFullscreen();
	else if ((element as any).msRequestFullscreen) (element as any).msRequestFullscreen();
}

function exitFullscreen() {
	if (document.exitFullscreen) document.exitFullscreen();
	else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
	else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
}

let leftScore = 0;
let rightScore = 0;
let gameOver = false;

const paddleHeight = 80, paddleWidth = 10;
let leftY = 160, rightY = 160;
const paddleSpeed = 10;

let ballX = canvas.width / 2, ballY = canvas.height / 2, ballVX = 4, ballVY = 4, ballSize = 10;
const maxScore = 5;

const keys: { [key: string]: boolean } = {};

document.addEventListener('keydown', function (e: KeyboardEvent) {
	keys[e.key] = true;
});

document.addEventListener('keyup', function (e: KeyboardEvent) {
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



function showLoginForm(formDiv: HTMLElement) {
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
	attachEvents(formDiv);

	const loginForm = formDiv.querySelector('form');
	const errorDiv = document.createElement('div');
	errorDiv.className = "text-red-600 text-center mb-2";
	loginForm?.insertBefore(errorDiv, loginForm.querySelector('button[type="submit"]'));
	loginForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			const formData = new FormData(loginForm as HTMLFormElement);
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
				const username = data.username as string;
				const loginBtn = document.getElementById('loginBtn');
				if (loginBtn) {
					// Crée un conteneur pour le nom d'utilisateur et le bouton logout
					const userDiv = document.createElement('div');
					userDiv.className = 'flex items-center gap-2';

					const userSpan = document.createElement('span');
					userSpan.textContent = username;
					userSpan.className = 'text-green-600 font-bold ml-2';

					const logoutBtn = document.createElement('button');
					logoutBtn.textContent = 'Logout';
					logoutBtn.className = 'ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 text-sm';

					logoutBtn.addEventListener('click', () => {
						// Remplace le userDiv par le bouton login
						const newLoginBtn = document.createElement('button');
						newLoginBtn.id = 'loginBtn';
						newLoginBtn.textContent = 'Login';
						newLoginBtn.className = loginBtn.className;
						userDiv.parentNode?.replaceChild(newLoginBtn, userDiv);

						// Réattache l'event pour ouvrir le formulaire
						newLoginBtn.addEventListener('click', () => {
							if (document.getElementById('loginForm')) return;
							const formDiv = document.createElement('div');
							formDiv.id = 'loginForm';
							formDiv.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50';
							document.body.appendChild(formDiv);
							showLoginForm(formDiv);
						});
					});

					userDiv.appendChild(userSpan);
					userDiv.appendChild(logoutBtn);
					loginBtn.replaceWith(userDiv);
				}
				formDiv.remove();
			} else {
				errorDiv.textContent = "Nom d'utilisateur ou mot de passe incorrect";
			}
		} catch (error) {
			alert("Erreur réseau ou serveur injoignable !");
			console.error(error);
		}
	});

}


function showSignupForm(formDiv: HTMLElement) {
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
	attachEvents(formDiv);

	const signupForm = formDiv.querySelector('form');
	signupForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			const formData = new FormData(signupForm as HTMLFormElement);
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
				formDiv.innerHTML = `
        <div class="bg-white text-black rounded-lg p-8 shadow-lg w-full max-w-xs text-center">
            <h2 class="text-2xl font-bold mb-4 text-green-600">Inscription réussie !</h2>
            <p class="mb-6">Votre compte a été créé avec succès.</p>
            <button id="goToLogin" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Se connecter</button>
        </div>
    `;
				const goToLoginBtn = document.getElementById('goToLogin');
				goToLoginBtn?.addEventListener('click', (e) => {
					e.preventDefault();
					showLoginForm(formDiv);
				});
			} else {
				alert('Erreur lors de l\'inscription');
			}
		} catch (error) {
			alert("Erreur réseau ou serveur injoignable !");
			console.error(error);
		}
	});

}


function attachEvents(formDiv: HTMLElement) {
	const closeBtn = document.getElementById('closeLogin');
	closeBtn?.addEventListener('click', (e) => {
		e.preventDefault();
		formDiv.remove();
	});
	const signupBtn = document.getElementById('signupBtn');
	signupBtn?.addEventListener('click', (e) => {
		e.preventDefault();
		showSignupForm(formDiv);
	});
	const backToLogin = document.getElementById('backToLogin');
	backToLogin?.addEventListener('click', (e) => {
		e.preventDefault();
		showLoginForm(formDiv);
	});


	// Fermer si on clique en dehors du formulaire
	formDiv.addEventListener('click', (e) => {
		if (e.target === formDiv) formDiv.remove();
	});
}

loginBtn?.addEventListener('click', () => {
	// Vérifie si le formulaire existe déjà
	if (document.getElementById('loginForm')) return;

	// Crée le conteneur du formulaire
	const formDiv = document.createElement('div');
	formDiv.id = 'loginForm';
	formDiv.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50';

	document.body.appendChild(formDiv);
	showLoginForm(formDiv);

});
