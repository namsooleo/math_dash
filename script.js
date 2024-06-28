var stringEquation;
var termA;
var termB;
var operator;
var solution;

var score = 0;
var timer;

var solveSpeed;

var gameMode;
var container = document.getElementsByClassName("container")[0]
var gameOverScreen;
var restartButton;
let countDown

function getOperator(){
    randomNumber = Math.random()
    if (score < 15) {
        operator = '+';
    } else if (score >= 15 && score <= 34) {
        if (randomNumber < 0.5) {
            operator = '+';
        } else {
            operator = '-';
        }
    } else if (score >= 35 && score <=60) {
        if (randomNumber < 0.33) {
            operator = '+';
        } else if (randomNumber > 0.34 && randomNumber < 0.66) {
            operator = '-';
        } else {
            operator = '*';
        }
    }
    return operator;
};

// returns 1 (inclusive) to max (exclusive)
function getRandomInt(){
    if (operator == '+') {
        if (score <= 4 ) {
            var term = Math.floor(Math.random() * (5 - 1) + 1);
        } else if (score >= 5 && score <= 14) {
            var term = Math.floor(Math.random() * (10 - 1) + 1);
        } else if (score >= 15 && score <= 29) {
            var term = Math.floor(Math.random() * (20 - 1) + 1);
        } else {
            var term = Math.floor(Math.random() * (40 - 1) + 1);
        }
    } else if (operator == '-') {
        if (score <= 20 ) {
            var term = Math.floor(Math.random() * (10 - 1) + 1);
        } else if (score >= 21 && score <= 30) {
            var term = Math.floor(Math.random() * (20 - 1) + 1);
        } else {
            var term = Math.floor(Math.random() * (40 - 1) + 1);
        } 
    } else if (operator == '*') {
        if (score <= 45 ) {
            var term = Math.floor(Math.random() * (9 - 1) + 1);
        } else if (score >= 46 && score <= 60) {
            var term = Math.floor(Math.random() * (13 - 1) + 1);
        } else {
            var term = Math.floor(Math.random() * (15 - 1) + 1);
        } 
    }
    return term;
};

function calculateSolution(termA, termB, operator){
    if (operator == '+'){
        return (termA + termB);
    } else if (operator == '-') {
        return (termA - termB);
    }  else if (operator == '*') {
        return (termA * termB);
    }  
}

function generateEquation(){
    operator = getOperator();
    termA = getRandomInt();
    termB = getRandomInt();
    solution = calculateSolution(termA, termB, operator)
    console.log(termA + " " + operator + " " + termB)
    return termA + " " + operator + " " + termB
    
}

function assignSoutions(){
    var solutionA = document.getElementById("solutionA");
    var solutionB = document.getElementById("solutionB");

    if (Math.random() < 0.5){
        solutionA.innerText = solution
        if (Math.random() < 0.5){
            solutionB.innerText = solution - 1
        } else {
            solutionB.innerText = solution + 1
        }
    } else {
        solutionB.innerText = solution
        if (Math.random() < 0.5){
            solutionA.innerText = solution - 1
        } else {
            solutionA.innerText = solution + 1
        }
    }
}

// --------------------
// click event handling
// --------------------
document.addEventListener( "click", clickHandler );

function clickHandler(event){
    var element = event.target;

    if (element.tagName == "BUTTON" && element.id == "survival-btn"){
        gameMode = "survival"
        buildGameScreen()
        updateGameScreen()
        startTimer(gameMode)
    } else if (element.tagName == "BUTTON" && element.id == "sprint-btn"){
        gameMode = "sprint"
        buildGameScreen()
        updateGameScreen()
        startTimer(gameMode)
    } else if (element.tagName == "BUTTON" && element.id == "solutionA"){
        if (solutionA.innerText == solution) {
            score++
            updateGameScreen()
            if (gameMode == "survival") {
                clearInterval(countDown)
                startTimer(gameMode)
            }
        } else {
            clearInterval(countDown)
            buildGameOverScreen()
        }
    } else if (element.tagName == "BUTTON" && element.id == "solutionB"){
        if (solutionB.innerText == solution) {
            score++
            updateGameScreen()
            if (gameMode == "survival") {
                clearInterval(countDown)
                startTimer(gameMode)
            }
        } else {
            clearInterval(countDown)
            buildGameOverScreen()
        }
    } else if (element.tagName == "BUTTON" && element.id == "restart"){
        buildGameScreen()
        updateGameScreen()
        startTimer(gameMode)
    }
}

function buildGameScreen(){

    var menuScreen = document.getElementById("menuScreen");
    var gameOverScreen = document.getElementById("gameOverScreen");
    if (menuScreen){
        menuScreen.remove()
    } else {
        gameOverScreen.remove()
    }
    
    var newElement = document.createElement("div")
    newElement.className = "container"
    newElement.id = "gameScreen"
    
    var tempA = newElement

    newElement = document.createElement("div")
    newElement.className = "progress"

    var tempB = newElement

    newElement = document.createElement("div")
    newElement.className = "progress-inner"

    tempB.appendChild(newElement)
    tempA.appendChild(tempB)

    newElement = document.createElement("p")
    newElement.id = "equationText"
    tempA.appendChild(newElement)

    newElement = document.createElement("div")
    newElement.id = "answer-buttons"

    tempB = newElement

    newElement = document.createElement("button")
    newElement.id = "solutionA"
    tempB.appendChild(newElement)

    newElement = document.createElement("button")
    newElement.id = "solutionB"
    tempB.appendChild(newElement)

    tempA.appendChild(tempB)

    container.appendChild(tempA)
}

function updateGameScreen(){
    var equation = document.getElementById("equationText");
    equation.innerText = generateEquation()
    assignSoutions()
}

function buildGameOverScreen(){
    var gameScreen = document.getElementById("gameScreen")
    gameScreen.remove()

    var newElement = document.createElement("div")
    newElement.className = "container"
    newElement.id = "gameOverScreen"
    
    var tempA = newElement

    newElement = document.createElement("p")
    newElement.id = "gameOverText"
    newElement.innerText = "GAME OVER LOSER"
    tempA.appendChild(newElement)

    newElement = document.createElement("p")
    newElement.id = "scoreText"
    newElement.innerText = "you scored: " + score
    tempA.appendChild(newElement)
    
    newElement = document.createElement("button")
    newElement.id = "restart"
    newElement.innerText = "play again?"
    tempA.appendChild(newElement)

    container.appendChild(tempA)
}

function startTimer(gameMode) {

    var progressBar = document.getElementsByClassName("progress-inner")[0]

    if (gameMode == "survival") {
        let interval = 2;
        countDown = setInterval(() => {
            interval-= 0.005;
            let progressWidth = (interval / 2) * 100
            if (interval > 0) {
                progressBar.style.width = progressWidth/2 + "%"
            } else {
                clearInterval(countDown)
                progressBar.style.width = "0"
                buildGameOverScreen()
            }
        }, 5);
    } else if (gameMode == "sprint") {
        var interval = 60;
        countDown = setInterval(() => {
            interval--;
            let progressWidth = (interval / 60) * 100;
            if (interval > 0) {
                progressBar.style.width = progressWidth + "%"
            } else {
                clearInterval(countDown)
                progressBar.style.width = "0"
                buildGameOverScreen()
            }
        }, 1000);
    }
}

