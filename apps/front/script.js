// --- Menu latéral ---
var sidenav = document.getElementById("mySidenav");
var openBtn = document.getElementById("openBtn");
var closeBtn = document.getElementById("closeBtn");
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
var canvas = document.getElementById('pong');
var playBtn = document.getElementById('playBtn');
var animationId = null;
if (canvas) {
    var ctx_1 = canvas.getContext('2d');
    var paddleHeight_1 = 80, paddleWidth_1 = 10;
    var leftY_1 = 160, rightY_1 = 160;
    var paddleSpeed_1 = 10;
    var ballX_1 = 300, ballY_1 = 200, ballVX_1 = 4, ballVY_1 = 4, ballSize_1 = 10;
    var keys_1 = {};
    document.addEventListener('keydown', function (e) {
        keys_1[e.key] = true;
    });
    document.addEventListener('keyup', function (e) {
        keys_1[e.key] = false;
    });
    function drawStatic() {
        ctx_1.clearRect(0, 0, canvas.width, canvas.height);
        ctx_1.fillStyle = 'white';
        ctx_1.fillRect(10, leftY_1, paddleWidth_1, paddleHeight_1);
        ctx_1.fillRect(canvas.width - 20, rightY_1, paddleWidth_1, paddleHeight_1);
        ctx_1.beginPath();
        ctx_1.arc(ballX_1, ballY_1, ballSize_1, 0, Math.PI * 2);
        ctx_1.fill();
    }
    function draw() {
        if (keys_1['w'] && leftY_1 > 0)
            leftY_1 -= paddleSpeed_1;
        if (keys_1['s'] && leftY_1 < canvas.height - paddleHeight_1)
            leftY_1 += paddleSpeed_1;
        if (keys_1['ArrowUp'] && rightY_1 > 0)
            rightY_1 -= paddleSpeed_1;
        if (keys_1['ArrowDown'] && rightY_1 < canvas.height - paddleHeight_1)
            rightY_1 += paddleSpeed_1;
        ctx_1.clearRect(0, 0, canvas.width, canvas.height);
        ctx_1.fillStyle = 'white';
        ctx_1.fillRect(10, leftY_1, paddleWidth_1, paddleHeight_1);
        ctx_1.fillRect(canvas.width - 20, rightY_1, paddleWidth_1, paddleHeight_1);
        ctx_1.beginPath();
        ctx_1.arc(ballX_1, ballY_1, ballSize_1, 0, Math.PI * 2);
        ctx_1.fill();
        ballX_1 += ballVX_1;
        ballY_1 += ballVY_1;
        if (ballY_1 < ballSize_1 || ballY_1 > canvas.height - ballSize_1)
            ballVY_1 = -ballVY_1;
        if (ballX_1 - ballSize_1 < 20 && ballY_1 > leftY_1 && ballY_1 < leftY_1 + paddleHeight_1)
            ballVX_1 = -ballVX_1;
        if (ballX_1 + ballSize_1 > canvas.width - 20 && ballY_1 > rightY_1 && ballY_1 < rightY_1 + paddleHeight_1)
            ballVX_1 = -ballVX_1;
        if (ballX_1 < 0 || ballX_1 > canvas.width) {
            ballX_1 = canvas.width / 2;
            ballY_1 = canvas.height / 2;
            ballVX_1 = -ballVX_1;
        }
        animationId = requestAnimationFrame(draw);
    }
    drawStatic();
    if (playBtn) {
        playBtn.onclick = function () {
            if (animationId !== null)
                cancelAnimationFrame(animationId); // reset si besoin
            draw();
        };
    }
}
