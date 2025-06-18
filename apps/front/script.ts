// --- Menu latéral ---
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

const canvas = document.getElementById('pong') as HTMLCanvasElement | null;
const playBtn = document.getElementById('playBtn') as HTMLButtonElement | null;
let animationId: number | null = null;
if (canvas) {
	const ctx = canvas.getContext('2d');

	const paddleHeight = 80, paddleWidth = 10;
	let leftY = 160, rightY = 160;
	const paddleSpeed = 10;

	let ballX = 300, ballY = 200, ballVX = 4, ballVY = 4, ballSize = 10;

	const keys: { [key: string]: boolean } = {};

	document.addEventListener('keydown', function (e: KeyboardEvent) {
		keys[e.key] = true;
	});
	document.addEventListener('keyup', function (e: KeyboardEvent) {
		keys[e.key] = false;
	});

	function drawStatic() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'white';
		ctx.fillRect(10, leftY, paddleWidth, paddleHeight);
		ctx.fillRect(canvas.width - 20, rightY, paddleWidth, paddleHeight);
		ctx.beginPath();
		ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
		ctx.fill();
	}

	function draw() {

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

		if (ballX - ballSize < 20 && ballY > leftY && ballY < leftY + paddleHeight) ballVX = -ballVX;

		if (ballX + ballSize > canvas.width - 20 && ballY > rightY && ballY < rightY + paddleHeight) ballVX = -ballVX;

		if (ballX < 0 || ballX > canvas.width) {
			ballX = canvas.width / 2;
			ballY = canvas.height / 2;
			ballVX = -ballVX;
		}

		animationId = requestAnimationFrame(draw);
	}
	drawStatic();
	if (playBtn) {
		playBtn.onclick = () => {
			if (animationId !== null) cancelAnimationFrame(animationId); // reset si besoin
			draw();
		};
	}
}