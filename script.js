let stringEquation;
let termA;
let termB;
let operator;
let solution;

let score = 0;
let survivalHighScore = localStorage.getItem("Surival_High_Score") ? Number(localStorage.getItem("Surival_High_Score")) : 0;
let sprintHighScore = localStorage.getItem("Sprint_High_Score") ? Number(localStorage.getItem("Sprint_High_Score")) : 0;
let gameMode;  
const survivalTime = 1.5;
const sprintTime = 60;
let countDown;
const container = document.getElementsByClassName("container")[0];

// Difficulty curve: everything scales off score, with no upper cutoff
function ramp(start, full) {
    // 0 before start, 0.25 at start, grows to 1 at full
    if (score < start) return 0;
    return Math.min(1, 0.25 + 0.75 * (score - start) / (full - start));
}

function randInt(min, max) {
    // min and max inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getOperator(){
    const weights = {
        '+': 1,
        '-': ramp(15, 25),
        '*': ramp(35, 50),
        '/': ramp(55, 75),
    };
    let total = 0;
    for (const op in weights) total += weights[op];
    let roll = Math.random() * total;
    for (const op in weights) {
        roll -= weights[op];
        if (roll < 0) return op;
    }
    return '+';
}

function getTerms(operator){
    if (operator == '+' || operator == '-') {
        const max = Math.min(99, 4 + score);
        const min = Math.max(1, Math.floor(max / 4));
        let a = randInt(min, max);
        let b = randInt(min, max);
        // negative answers only show up after score 30
        if (operator == '-' && score < 30 && b > a) [a, b] = [b, a];
        return [a, b];
    } else if (operator == '*') {
        const max = Math.min(15, 6 + Math.floor((score - 35) / 4));
        const min = Math.min(3, 1 + Math.floor((score - 35) / 10));
        return [randInt(min, max), randInt(min, max)];
    } else if (operator == '/') {
        // built from a product so the answer is always whole
        const max = Math.min(12, 5 + Math.floor((score - 55) / 4));
        const divisor = randInt(2, max);
        const quotient = randInt(2, max);
        return [divisor * quotient, divisor];
    }
}

function calculateSolution(termA, termB, operator){
    if (operator == '+'){
        return (termA + termB);
    } else if (operator == '-') {
        return (termA - termB);
    } else if (operator == '*') {
        return (termA * termB);
    } else if (operator == '/') {
        return (termA / termB);
    };
}

function generateEquation(){
    operator = getOperator();
    [termA, termB] = getTerms(operator);
    solution = calculateSolution(termA, termB, operator);
    return termA + " " + operator + " " + termB;
}

function getWrongAnswer(){
    // near misses that mimic real mistakes, so parity / last digit can't give it away
    const offsets = [1, 2];
    if (score >= 20) offsets.push(10);
    if (operator == '*') offsets.push(termA, termB);
    const offset = offsets[randInt(0, offsets.length - 1)];
    let wrong = Math.random() < 0.5 ? solution - offset : solution + offset;
    // no negative decoys until negatives can be real answers
    if (wrong < 0 && score < 30) wrong = solution + offset;
    return wrong;
}

function assignSoutions(){
    let solutionA = document.getElementById("solutionA");
    let solutionB = document.getElementById("solutionB");
    let wrong = getWrongAnswer();

    if (Math.random() < 0.5){
        solutionA.innerText = solution;
        solutionB.innerText = wrong;
    } else {
        solutionA.innerText = wrong;
        solutionB.innerText = solution;
    };
}

function buildMenuScreen() {
    let gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.remove();

    let newElement = document.createElement("div");
    newElement.className = "container";
    newElement.id = "menuScreen";
    let tempA = newElement;
    
    newElement = document.createElement("button");
    newElement.id = "survival-btn";
    newElement.innerText = "Survival";
    tempA.appendChild(newElement);

    newElement = document.createElement("button");
    newElement.id = "sprint-btn";
    newElement.innerText = "Sprint";
    tempA.appendChild(newElement);

    container.appendChild(tempA);
}

function buildGameScreen() {
    let menuScreen = document.getElementById("menuScreen");
    menuScreen.remove();
    
    let newElement = document.createElement("div");
    newElement.className = "container";
    newElement.id = "gameScreen";
    let tempA = newElement;

    newElement = document.createElement("div");
    newElement.className = "progress";
    let tempB = newElement;

    newElement = document.createElement("div");
    newElement.className = "progress-inner";
    tempB.appendChild(newElement);
    tempA.appendChild(tempB);

    newElement = document.createElement("p");
    newElement.id = "equationText";
    tempA.appendChild(newElement);

    newElement = document.createElement("div");
    newElement.id = "answer-buttons";
    tempB = newElement;

    newElement = document.createElement("button");
    newElement.id = "solutionA";
    tempB.appendChild(newElement);

    newElement = document.createElement("button");
    newElement.id = "solutionB";
    tempB.appendChild(newElement);
    tempA.appendChild(tempB);

    container.appendChild(tempA);
}

function buildGameOverScreen() {
    let gameScreen = document.getElementById("gameScreen");
    gameScreen.remove();

    let newElement = document.createElement("div");
    newElement.className = "container";
    newElement.id = "gameOverScreen";
    let tempA = newElement; // div

    newElement = document.createElement("p");
    newElement.id = "gameOverText";
    newElement.innerText = "Game Over";
    tempA.appendChild(newElement); // div>p

    newElement = document.createElement("p");
    newElement.id = "scoreText";
    newElement.innerText = "Score: ";
    let tempB = newElement; // p

    newElement = document.createElement("span");
    newElement.className = "scoreInt";
    newElement.innerText = score;
    tempB.appendChild(newElement); // p > span
    tempA.appendChild(tempB); // div > p + p > span
    
    newElement = document.createElement("p");
    newElement.id = "highScoreText";
    newElement.innerText = "High Score: ";
    tempB = newElement; // p

    newElement = document.createElement("span");
    newElement.className = "scoreInt";
    newElement.innerText = gameMode === "survival" ? survivalHighScore : sprintHighScore;
    tempB.appendChild(newElement); // p > span
    tempA.appendChild(tempB); // div > p + p > span + p > span

    newElement = document.createElement("button");
    newElement.id = "restart";
    newElement.innerText = "Play Again?";
    tempA.appendChild(newElement); // div > p + p > span ^^ + p > span ^^ + btn

    container.appendChild(tempA);
}

function updateGameScreen() {
    let equation = document.getElementById("equationText");
    equation.innerText = generateEquation();
    assignSoutions();
}

function gameOver() {
    clearInterval(countDown);
    if (gameMode === "survival"){
        if (score > survivalHighScore) {
            survivalHighScore = score;
            localStorage.setItem("Surival_High_Score", survivalHighScore);
        }
    } else if (gameMode === "sprint") {
        if (score > sprintHighScore) {
            sprintHighScore = score;
            localStorage.setItem("Sprint_High_Score", sprintHighScore);
        }
    }
    buildGameOverScreen();
    gameMode = "";
    score = 0;
}

function startTimer(gameMode) {
    let progressBar = document.getElementsByClassName("progress-inner")[0]

    if (gameMode == "survival") {
        let interval = survivalTime;
        countDown = setInterval(() => {
            interval-= 0.005;
            let progressWidth = (interval / survivalTime) * 100;
            if (interval > 0) {
                progressBar.style.width = progressWidth + "%";
            } else {
                progressBar.style.width = "0";
                gameOver();
            };
        }, 5);
    } else if (gameMode == "sprint") {
        let interval = sprintTime;
        countDown = setInterval(() => {
            interval--;
            let progressWidth = (interval / 60) * 100;
            if (interval > 0) {
                progressBar.style.width = progressWidth + "%";
            } else {
                progressBar.style.width = "0";
                gameOver();
            };
        }, 1000);
    }
}

function inputHandler(event){
    let element = event.target; 

    if (event.type === "click") {
        if (element.tagName == "BUTTON" && element.id == "survival-btn"){
            gameMode = "survival";
            buildGameScreen();
            updateGameScreen();
            startTimer(gameMode);
        } else if (element.tagName == "BUTTON" && element.id == "sprint-btn"){
            gameMode = "sprint";
            buildGameScreen();
            updateGameScreen();
            startTimer(gameMode);
        } else if (element.tagName == "BUTTON" && element.id == "solutionA"){ 
            // correct answer
            if (solutionA.innerText == solution) {
                score++;
                updateGameScreen();
                if (gameMode == "survival") {
                    clearInterval(countDown);
                    startTimer(gameMode);
                };
            // wrong answer
            } else {
                gameOver();
            };
        } else if (element.tagName == "BUTTON" && element.id == "solutionB"){
            // correct answer
            if (solutionB.innerText == solution) {
                score++;
                updateGameScreen();
                if (gameMode == "survival") {
                    clearInterval(countDown);
                    startTimer(gameMode);
                };
             // wrong answer
            } else {
                gameOver();
            }
        } else if (element.tagName == "BUTTON" && element.id == "restart"){
            buildMenuScreen();
        }
    } else if (event.type === "keydown" && gameMode) { 
        if (event.key === "ArrowLeft") {
          document.getElementById("solutionA").click();
        } else if (event.key === "ArrowRight") {
          document.getElementById("solutionB").click();
        };
    };
};

// Input handling
document.addEventListener( "click", inputHandler );
document.addEventListener("keydown", inputHandler);
// Installable app: the service worker keeps it playable offline
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
// Mobile: tap anywhere on the left/right half of the screen to answer
document.addEventListener("touchstart", (event) => {
    if (!gameMode) return;
    // cancel the follow-up click: it would answer twice on a button, or hit "Play Again?" after a loss
    event.preventDefault();
    const x = event.changedTouches[0].clientX;
    document.getElementById(x < window.innerWidth / 2 ? "solutionA" : "solutionB").click();
}, { passive: false });
