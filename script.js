let stringEquation;
let termA;
let termB;
let operator;
let solution;

let score = 0;
let survivalHighScore = localStorage.getItem("Surival_High_Score") ? Number(localStorage.getItem("Surival_High_Score")) : 0;
let sprintHighScore = localStorage.getItem("Sprint_High_Score") ? Number(localStorage.getItem("Sprint_High_Score")) : 0;
let gameMode;  
let daily = false;
let dailyDate;
// Math.random in Freeplay; seeded in Daily so everyone gets the same questions
let random = Math.random;
const survivalTime = 1.5;
const sprintTime = 60;
let countDown;
const container = document.getElementsByClassName("container")[0];

// Daily mode: the seed is the local date + mode. Any wrong answer ends a run,
// so question N is the same for every player that day.
function seededRandom(text) {
    // FNV-1a hash of the text, then mulberry32
    let seed = 2166136261;
    for (let i = 0; i < text.length; i++) {
        seed = Math.imul(seed ^ text.charCodeAt(i), 16777619);
    }
    return function () {
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, seed | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function todayKey() {
    // local date, so the Daily rolls over at the player's midnight
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

function formatDay(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Daily #1 is launch day. One number per local date, same as the seed, so equal numbers mean equal questions
function puzzleNumber(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return (Date.UTC(year, month - 1, day) - Date.UTC(2026, 8, 26)) / 86400000 + 1;
}

// Only one day's results are kept: {date: "2026-09-26", survival: 34, sprint: 51}
function loadDaily(dateKey) {
    const saved = JSON.parse(localStorage.getItem("Daily_Results"));
    return saved && saved.date === dateKey ? saved : { date: dateKey };
}

function saveDaily(dateKey, mode, result) {
    const results = loadDaily(dateKey);
    results[mode] = result;
    localStorage.setItem("Daily_Results", JSON.stringify(results));
}

// Difficulty curve: everything scales off score, with no upper cutoff
function ramp(start, full) {
    // 0 before start, 0.25 at start, grows to 1 at full
    if (score < start) return 0;
    return Math.min(1, 0.25 + 0.75 * (score - start) / (full - start));
}

function randInt(min, max) {
    // min and max inclusive
    return Math.floor(random() * (max - min + 1)) + min;
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
    let roll = random() * total;
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
    let wrong = random() < 0.5 ? solution - offset : solution + offset;
    // no negative decoys until negatives can be real answers
    if (wrong < 0 && score < 30) wrong = solution + offset;
    return wrong;
}

function assignSoutions(){
    let solutionA = document.getElementById("solutionA");
    let solutionB = document.getElementById("solutionB");
    let wrong = getWrongAnswer();

    if (random() < 0.5){
        solutionA.innerText = solution;
        solutionB.innerText = wrong;
    } else {
        solutionA.innerText = wrong;
        solutionB.innerText = solution;
    };
}

function buildMenuButton(id, label, dailyResult) {
    let button = document.createElement("button");
    button.id = id;
    button.innerText = label;
    // a Daily mode already played today shows its score instead
    if (dailyResult !== undefined) {
        button.innerText = label + " · " + dailyResult;
        button.disabled = true;
    }
    return button;
}

function buildMenuScreen() {
    // also used to refresh the menu itself, e.g. after midnight
    for (const id of ["menuScreen", "gameOverScreen"]) {
        let screen = document.getElementById(id);
        if (screen) screen.remove();
    }
    const today = loadDaily(todayKey());

    let menu = document.createElement("div");
    menu.className = "container";
    menu.id = "menuScreen";

    let heading = document.createElement("p");
    heading.className = "menu-heading";
    heading.innerText = "Daily";
    menu.appendChild(heading);

    let row = document.createElement("div");
    row.appendChild(buildMenuButton("daily-survival-btn", "Survival", today.survival));
    row.appendChild(buildMenuButton("daily-sprint-btn", "Sprint", today.sprint));
    menu.appendChild(row);

    heading = document.createElement("p");
    heading.className = "menu-heading";
    heading.innerText = "Freeplay";
    menu.appendChild(heading);

    row = document.createElement("div");
    row.appendChild(buildMenuButton("survival-btn", "Survival"));
    row.appendChild(buildMenuButton("sprint-btn", "Sprint"));
    menu.appendChild(row);

    container.appendChild(menu);
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
    if (daily) {
        newElement.innerText = "Daily " + (gameMode === "survival" ? "Survival" : "Sprint") + " #" + puzzleNumber(dailyDate) + " · " + formatDay(dailyDate);
    } else {
        newElement.innerText = "High Score: ";
        let highScore = document.createElement("span");
        highScore.className = "scoreInt";
        highScore.innerText = gameMode === "survival" ? survivalHighScore : sprintHighScore;
        newElement.appendChild(highScore); // p > span
    }
    tempA.appendChild(newElement); // div > p + p > span + p (> span)

    if (daily) {
        newElement = document.createElement("button");
        newElement.id = "share";
        newElement.innerText = "Share";
        tempA.appendChild(newElement);
    }

    newElement = document.createElement("button");
    newElement.id = "restart";
    // a Daily can't be replayed, so it just goes back
    newElement.innerText = daily ? "Menu" : "Play Again?";
    tempA.appendChild(newElement); // div > p + p > span ^^ + p > span ^^ + btn

    container.appendChild(tempA);
}

// One message with both of today's Daily scores
function shareDaily() {
    const results = loadDaily(dailyDate);
    const text = "🧮 Math Dash Daily #" + puzzleNumber(dailyDate) + " · " + formatDay(dailyDate) + "\n"
        + "🏃 Survival " + (results.survival ?? "–") + "\n"
        + "⏱️ Sprint " + (results.sprint ?? "–") + "\n"
        + location.origin + location.pathname;
    // share sheet where there is one (phones, Safari); otherwise copy to the clipboard
    if (navigator.share) {
        navigator.share({ text }).catch((error) => {
            if (error.name !== "AbortError") copyShare(text);
        });
    } else {
        copyShare(text);
    }
}

function copyShare(text) {
    const button = document.getElementById("share");
    navigator.clipboard.writeText(text).then(
        () => { if (button) button.innerText = "Copied!"; },
        () => { if (button) button.innerText = "Couldn't copy"; }
    );
}

function updateGameScreen() {
    let equation = document.getElementById("equationText");
    equation.innerText = generateEquation();
    assignSoutions();
}

function gameOver() {
    clearInterval(countDown);
    if (daily) {
        saveDaily(dailyDate, gameMode, score);
    } else if (gameMode === "survival"){
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

function startGame(mode, isDaily) {
    gameMode = mode;
    daily = isDaily;
    if (daily) {
        dailyDate = todayKey();
        random = seededRandom("math-dash " + dailyDate + " " + mode);
        // counts as played from the first question, so reloading mid-run can't retry
        saveDaily(dailyDate, mode, 0);
    } else {
        random = Math.random;
    }
    buildGameScreen();
    updateGameScreen();
    startTimer(gameMode);
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
            startGame("survival", false);
        } else if (element.tagName == "BUTTON" && element.id == "sprint-btn"){
            startGame("sprint", false);
        } else if (element.tagName == "BUTTON" && element.id == "daily-survival-btn"){
            startGame("survival", true);
        } else if (element.tagName == "BUTTON" && element.id == "daily-sprint-btn"){
            startGame("sprint", true);
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
        } else if (element.tagName == "BUTTON" && element.id == "share"){
            shareDaily();
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
// An installed app can sit in the background overnight; refresh the Daily buttons when it's reopened
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && document.getElementById("menuScreen")) buildMenuScreen();
});

buildMenuScreen();
