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

function getOperator(){
    let randomNumber = Math.random()
    if (score < 15) {
        operator = '+';
    } else if (score >= 15 && score <= 34) {
        if (randomNumber < 0.5) {
            operator = '+';
        } else {
            operator = '-';
        };
    } else if (score >= 35 && score <=60) {
        if (randomNumber < 0.33) {
            operator = '+';
        } else if (randomNumber > 0.34 && randomNumber < 0.66) {
            operator = '-';
        } else {
            operator = '*';
        };
    }
    return operator;
}

function getRandomInt(){
    // returns 1 (inclusive) to max (exclusive)
    let term = 0;
    if (operator == '+') {
        if (score <= 4 ) {
            term = Math.floor(Math.random() * (5 - 1) + 1);
        } else if (score >= 5 && score <= 14) {
            term = Math.floor(Math.random() * (10 - 1) + 1);
        } else if (score >= 15 && score <= 29) {
            term = Math.floor(Math.random() * (20 - 1) + 1);
        } else {
            term = Math.floor(Math.random() * (40 - 1) + 1);
        };
    } else if (operator == '-') {
        if (score <= 20 ) {
            term = Math.floor(Math.random() * (10 - 1) + 1);
        } else if (score >= 21 && score <= 30) {
            term = Math.floor(Math.random() * (20 - 1) + 1);
        } else {
            term = Math.floor(Math.random() * (40 - 1) + 1);
        };
    } else if (operator == '*') {
        if (score <= 45 ) {
            term = Math.floor(Math.random() * (9 - 1) + 1);
        } else if (score >= 46 && score <= 60) {
            term = Math.floor(Math.random() * (13 - 1) + 1);
        } else {
            term = Math.floor(Math.random() * (15 - 1) + 1);
        };
    };
    return term;
}

function calculateSolution(termA, termB, operator){
    if (operator == '+'){
        return (termA + termB);
    } else if (operator == '-') {
        return (termA - termB);
    }  else if (operator == '*') {
        return (termA * termB);
    };
}

function generateEquation(){
    operator = getOperator();
    termA = getRandomInt();
    termB = getRandomInt();
    solution = calculateSolution(termA, termB, operator);
    // console.log(termA + " " + operator + " " + termB)
    return termA + " " + operator + " " + termB;
}

function assignSoutions(){
    let solutionA = document.getElementById("solutionA");
    let solutionB = document.getElementById("solutionB");

    if (Math.random() < 0.5){
        solutionA.innerText = solution;
        if (Math.random() < 0.5){
            solutionB.innerText = solution - 1;
        } else {
            solutionB.innerText = solution + 1;
        };
    } else {
        solutionB.innerText = solution;
        if (Math.random() < 0.5){
            solutionA.innerText = solution - 1;
        } else {
            solutionA.innerText = solution + 1;
        };
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
    newElement.id = "highScoreText";
    newElement.innerText = "High Score: ";
    let tempB = newElement; // p

    newElement = document.createElement("span");
    newElement.id = "scoreInt";
    newElement.innerText = gameMode === "survival" ? survivalHighScore : sprintHighScore;
    tempB.appendChild(newElement); // p > span
    tempA.appendChild(tempB); // div > p + p > span

    newElement = document.createElement("p");
    newElement.id = "scoreText";
    newElement.innerText = "Score: ";
    tempB = newElement; // p 

    newElement = document.createElement("span");
    newElement.id = "scoreInt";
    newElement.innerText = score;
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
            let progressWidth = (interval / 2) * 100;
            if (interval > 0) {
                progressBar.style.width = progressWidth/2 + "%";
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