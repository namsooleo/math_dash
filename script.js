var stringEquation;
var termA;
var termB;
var operation;
var solution;
var level = 3;
var score = 0;
var timer;
var solveSpeed;
var gameMode;
var container = document.getElementsByClassName("container")[0]
var gameOverScreen;
var restartButton;
let countDown

// returns 1 (inclusive) to max (exclusive)
function getRandomInt(max){
    var term = Math.floor(Math.random() * (max - 1) + 1);
    return term;
};

function getOperator(){
    if (level < 5) {
        operation = '+';
    } else if (level < 10) {
        if (getRandomInt(3) % 2 == 0) {
            operation = '+';
        } else {
            operation = '-';
        }
    }
    return operation;
};

function calculateSolution(termA, termB, operation){
    if (operation == '+'){
        return (termA + termB);
    } else {
        return (termA - termB);
    }
}

function generateEquation(){
    termA = getRandomInt(level);
    termB = getRandomInt(level);
    operation = getOperator();
    solution = calculateSolution(termA, termB, operation)
    return termA + " " + operation + " " + termB
    
}

function assignSoutions(){
    var solutionA = document.getElementById("solutionA");
    var solutionB = document.getElementById("solutionB");

    if (getRandomInt(3) % 2 == 0){
        solutionA.innerText = solution
        if (getRandomInt(3) % 2 == 0){
            solutionB.innerText = solution - 1
        } else {
            solutionB.innerText = solution + 1
        }
    } else {
        solutionB.innerText = solution
        if (getRandomInt(3) % 2 == 0){
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
            console.log('Current Score: ' + score);
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
            console.log('Current Score: ' + score);
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

// TIMER FUNCTION TESTING
function startTimer(gameMode) {

    var progressBar = document.getElementsByClassName("progress-inner")[0]

    if (gameMode == "survival") {
        let interval = 2.5;
        countDown = setInterval(() => {
            interval-= 0.005;
            let progressWidth = (interval / 3) * 100
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

