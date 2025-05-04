let instructionsScreen = document.getElementById('instructions-screen');
let gameScreen = document.getElementById('game-screen');
let victoryScreen = document.getElementById('victory-screen');
let finalScreen = document.getElementById('final-screen');
let spaceContainer = document.getElementById('space-container');
let levelTitle = document.getElementById('level-title');
let timerElement = document.getElementById('timer');
let messageElement = document.getElementById('message');
let cooldownTimer = document.getElementById('cooldown-timer');
let victoryButtons = document.getElementById('victory-buttons');

let chimeSound = document.getElementById('chime');
let buzzerSound = document.getElementById('buzzer');

let allCards = [];
let selected = [];
let matchedPairs = 0;
let timer;
let timeLeft;
let totalPairs;
let currentLevel = 1;
let cardsData;
let levelConfigs = {
    1: { planets: 8, moons: 0, time: 120 },
    2: { planets: 8, moons: 2, time: 150 },
    3: { planets: 8, moons: 4, time: 180 }
};
let score = 0;
let gridRows = 5;
let gridCols = 5;
let cellWidth = 90 / gridCols;
let cellHeight = 80 / gridRows;
let takenCells = [];


// Load cards data
fetch('data/planets.json')
    .then(res => res.json())
    .then(data => {
        cardsData = data;
        console.log(data)
    });

    function startGame() {
        if (!cardsData) {
            fetch('data/planets.json')
                .then(res => res.json())
                .then(data => {
                    cardsData = data;
                    instructionsScreen.classList.add('hidden');
                    setupLevel(currentLevel);
                })
                .catch(err => {
                    alert("Failed to load game data.");
                    console.error(err);
                });
        } else {
            instructionsScreen.classList.add('hidden');
            setupLevel(currentLevel);
        }
    }    

function setupLevel(level) {
    gameScreen.classList.remove('hidden');
    spaceContainer.innerHTML = '';
    allCards = [];
    selected = [];
    matchedPairs = 0;
    messageElement.innerText = '';

    let config = levelConfigs[level];
    levelTitle.innerText = `Level ${level}`;

    const planets = cardsData.filter(item => item.type === 'planet').slice(0, config.planets);
    const moons = cardsData.filter(item => item.type === 'moon').slice(0, config.moons);

    let cards = [...planets, ...moons];
    cards = [...cards, ...cards];
    totalPairs = cards.length / 2;

    shuffle(cards);

    for (let card of cards) {
        const div = document.createElement('div');
        div.classList.add('planet');
        div.dataset.name = card.name;
        
        let position;
        do {
            let row = Math.floor(Math.random() * gridRows);
            let col = Math.floor(Math.random() * gridCols);
            position = `${row}-${col}`;
        } while (takenCells.includes(position));
        takenCells.push(position);
        let [row, col] = position.split('-').map(Number);
        div.style.top = (row * cellHeight + 5) + 'vh';
        div.style.left = (col * cellWidth + 5) + 'vw';
        //div.style.top = Math.random() * 80 + 'vh'; //This line
       //div.style.left = Math.random() * 90 + 'vw'; //and this line, when replaced with the other removed code above, breaks the buttons. 


        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.name;
        div.appendChild(img);

        div.addEventListener('click', () => selectPlanet(div));
        spaceContainer.appendChild(div);
        allCards.push(div);
    }

    startTimer(config.time);
}

function selectPlanet(planet) {
    if (selected.length === 2 || planet.classList.contains('hidden-planet') || planet.classList.contains('selected')) return;

    planet.classList.add('selected');
    selected.push(planet);

    if (selected.length === 2) {
        if (selected[0].dataset.name === selected[1].dataset.name) {
            matchedPairs++;
            chimeSound.play();
            setTimeout(() => {
                selected[0].classList.add('hidden-planet');
                selected[1].classList.add('hidden-planet');
                selected = [];

                if (matchedPairs === totalPairs) {
                    clearInterval(timer);
                    setTimeout(() => showVictoryScreen(), 500);
                }
            }, 500);
        } else {
            buzzerSound.play();
            setTimeout(() => {
                selected[0].classList.remove('selected');
                selected[1].classList.remove('selected');
                selected = [];
            }, 1000);
        }
    }
}


function startTimer(seconds) {
    timeLeft = seconds;
    timerElement.innerText = `Time: ${timeLeft}`;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            messageElement.innerText = "⏰ Time's Up!";
            showRetryOption();
        }
    }, 1000);
}

function showVictoryScreen() {
    gameScreen.classList.add('hidden');
    victoryScreen.classList.remove('hidden');
    score += timeLeft * 10;
    updateStars();
    startCooldown();
}

function showRetryOption() {
    gameScreen.classList.add('hidden');
    victoryScreen.classList.remove('hidden');
    cooldownTimer.innerText = "";
    victoryButtons.classList.remove('hidden');
    document.querySelector('button[onclick="nextLevel()"]').classList.add('hidden');
}

function startCooldown() {
    if (currentLevel === 3) {
        showFinalScreen();  // Immediately show the final screen after level 3
        return;
    }

    let countdown = 5;
    cooldownTimer.innerText = `Next level in ${countdown}...`;
    victoryButtons.classList.add('hidden');

    let interval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(interval);
            cooldownTimer.innerText = '';
            victoryButtons.classList.remove('hidden');
            document.querySelector('button[onclick="nextLevel()"]').classList.remove('hidden');
        } else {
            cooldownTimer.innerText = `Next level in ${countdown}...`;
        }
    }, 1000);
}


function updateStars() {
    const starsDiv = document.getElementById('stars');
    starsDiv.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        if (i <= currentLevel) {
            starsDiv.innerHTML += '⭐';
        } else {
            starsDiv.innerHTML += '☆';
        }
    }

    //document.getElementById('level-score').innerText = `Points so far: ${score}`;
    //When this is added, the cooldown timer after a level never begins. 
}

function nextLevel() {
    currentLevel++;
    if (currentLevel <= 3) {
        victoryScreen.classList.add('hidden');
        setupLevel(currentLevel);
    } else {
        showFinalScreen();
    }
}

function resetLevel() {
    victoryScreen.classList.add('hidden');
    setupLevel(currentLevel);
}

function backToInstructions() {
    location.reload();
}

function showFinalScreen() {
    victoryScreen.classList.add('hidden');
    finalScreen.classList.remove('hidden');
    document.getElementById('final-stars').innerHTML = `⭐ ⭐ ⭐<br>Total Points: ${score}`;
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}