/* =========================================================
   EPICOIN TILE RUSH
   Root-only asset system
========================================================= */


/* =========================================================
   TILE ASSETS
========================================================= */

const TILE_ASSETS = [
    "epicoin.png",
    "epicoin2.png",
    "phantom.png",
    "telegram.png",
    "twitter.png",
    "solana.png",
    "ethereum.png",
    "ethereum2.png",
    "trustwallet.png",
    "diamond.png",
    "treasure.png",
    "pumpfun.png",
    "robinhood.png",
    "rocket.png",
    "fire.png"
];


const ONBOARDING_KEYS = {
    profile: "epicoinPlayerProfile",
    spin: "epicoinLuckySpin",
    reward: "epicoinWelcomeReward",
    pot: "epicoinLocalPotBalance"
};

const LUCKY_REWARDS = [
    { key: "10k-pot", kind: "pot", amount: 10000, title: "10K $POT", detail: "10,000 $POT has been added to your local vault." },
    { key: "50k-pot", kind: "pot", amount: 50000, title: "50K $POT", detail: "50,000 $POT is now locked into your local reward balance." },
    { key: "mini-jackpot", kind: "jackpot", title: "MINI JACKPOT", detail: "You hit the MINI JACKPOT and activated the bonus boost." },
    { key: "major-jackpot", kind: "jackpot", title: "MAJOR JACKPOT", detail: "You cracked the MAJOR JACKPOT and the hype meter is maxed." },
    { key: "grand-jackpot", kind: "jackpot", title: "GRAND JACKPOT", detail: "A GRAND JACKPOT hit — the biggest prize on the wheel." },
    { key: "epicoin", kind: "epicoin", title: "EpiCoin", detail: "EpiCoin lands in your reward stack with a major arcade boost." },
    { key: "1000-pot", kind: "pot", amount: 1000, title: "1,000 $POT", detail: "1,000 $POT has been added to your local vault." },
    { key: "500-pot", kind: "pot", amount: 500, title: "500 $POT", detail: "500 $POT has been added to your local vault." }
];

function readLocalJSON(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
}

let playerProfile = readLocalJSON(ONBOARDING_KEYS.profile);
let luckySpinRecord = readLocalJSON(ONBOARDING_KEYS.spin);
let welcomeReward = readLocalJSON(ONBOARDING_KEYS.reward);


/* =========================================================
   BOARD DATA
========================================================= */

const BOARDS = [
    {
        id: 1,
        name: "Epi P",
        shape: "p",
        layers: 5,
        tiles: 100
    },

    {
        id: 2,
        name: "Epi Tower",
        shape: "tower",
        layers: 5,
        tiles: 100
    },

    {
        id: 3,
        name: "Rocket",
        shape: "rocket",
        layers: 5,
        tiles: 100
    },

    {
        id: 4,
        name: "Diamond",
        shape: "diamond",
        layers: 5,
        tiles: 100
    },

    {
        id: 5,
        name: "Coin",
        shape: "coin",
        layers: 5,
        tiles: 100
    },

    {
        id: 6,
        name: "Treasure",
        shape: "treasure",
        layers: 5,
        tiles: 100
    }
];


/* =========================================================
   GAME STATE
========================================================= */

let currentScreen = "home";

let currentBoard = null;

let tiles = [];

let selectedTile = null;

let score = 0;
let matchedScore = 0;

let combo = 1;

let clearedTiles = 0;
let gameFinished = false;

const BOARD_CLEAR_POT_REWARD = 5000;

const BASE_GAME_TIME = 50;
const BOARD_TILE_COUNT = 100;

let gameTime = BASE_GAME_TIME;

let timer = null;
let timerStarted = false;
let boardResizeTimer = null;

let comboTimer = null;
let comboWindowMs = 2000;
let comboWindowStart = 0;
let welcomeComboBoostPending = false;

let soundEnabled = true;

let hints = 3;
let shuffles = 2;
let bombs = 1;

let leaderboard = JSON.parse(
    localStorage.getItem("epicoinTileLeaderboard") || "[]"
);


/* =========================================================
   DOM
========================================================= */

const homeScreen = document.getElementById("homeScreen");
const spinScreen = document.getElementById("spinScreen");
const profileSetupScreen = document.getElementById("profileSetupScreen");
const profileViewScreen = document.getElementById("profileViewScreen");
const boardsScreen = document.getElementById("boardsScreen");
const gameScreen = document.getElementById("gameScreen");
const leaderboardScreen =
    document.getElementById("leaderboardScreen");

const boardGrid = document.getElementById("boardGrid");
const tileBoard = document.getElementById("tileBoard");

const scoreValue = document.getElementById("scoreValue");
const comboValue = document.getElementById("comboValue");
const timeValue = document.getElementById("timeValue");
const tilesValue = document.getElementById("tilesValue");
const progressFill = document.getElementById("progressFill");
const comboProgressFill = document.getElementById("comboProgressFill");
const comboTimerText = document.getElementById("comboTimerText");
const comboTimerWrap = document.getElementById("comboTimerWrap");

const currentBoardName =
    document.getElementById("currentBoardName");

const gameMessage =
    document.getElementById("gameMessage");

const resultModal =
    document.getElementById("resultModal");

const resultTitle =
    document.getElementById("resultTitle");

const finalScore =
    document.getElementById("finalScore");

const resultTimeValue = document.getElementById("resultTimeValue");
const resultComboValue = document.getElementById("resultComboValue");
const resultTilesValue = document.getElementById("resultTilesValue");
const resultMatchScoreValue = document.getElementById("resultMatchScoreValue");

const resultLabel = document.querySelector(".result-label");

const resultIcon =
    document.getElementById("resultIcon");

const leaderboardList =
    document.getElementById("leaderboardList");
const potBalanceValue = document.getElementById("potBalanceValue");

const luckyWheel = document.getElementById("luckyWheel");
const spinNowButton = document.getElementById("spinNowButton");
const spinRewardPanel = document.getElementById("spinRewardPanel");
const spinRewardValue = document.getElementById("spinRewardValue");
const spinRewardDescription = document.getElementById("spinRewardDescription");
const profileSetupForm = document.getElementById("profileSetupForm");
const playerNameInput = document.getElementById("playerNameInput");
const walletAddressInput = document.getElementById("walletAddressInput");
const walletValidationMessage = document.getElementById("walletValidationMessage");
const profileRewardSummary = document.getElementById("profileRewardSummary");


/* =========================================================
   SCREEN NAVIGATION
========================================================= */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(item => item.classList.remove("active"));

    screen.classList.add("active");

    if (screen === homeScreen) {
        updatePotBalance();
    }

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


function updatePotBalance() {

    const balance = Number(
        localStorage.getItem(ONBOARDING_KEYS.pot) || 0
    );

    potBalanceValue.textContent =
        Number.isFinite(balance)
            ? balance.toLocaleString()
            : "0";
}


function creditPotBalance(amount) {

    const currentBalance = Number(
        localStorage.getItem(ONBOARDING_KEYS.pot) || 0
    );
    const nextBalance = currentBalance + amount;

    localStorage.setItem(
        ONBOARDING_KEYS.pot,
        String(nextBalance)
    );

    updatePotBalance();
}


function showLuckyReward() {

    if (!luckySpinRecord?.reward) return;

    const reward = luckySpinRecord.reward;
    const rewardIndex = LUCKY_REWARDS.findIndex(item => item.key === reward.key);
    const selectedIndex = rewardIndex >= 0 ? rewardIndex : 0;
    const rotation = 360 * 6 - selectedIndex * 45;

    luckyWheel.style.transform = `rotate(${rotation}deg)`;
    spinNowButton.disabled = true;
    spinNowButton.querySelector("span").textContent = "SPIN COMPLETE";
    spinRewardValue.textContent = reward.title;
    spinRewardDescription.textContent = reward.detail;
    spinRewardPanel.hidden = false;
    requestAnimationFrame(() => spinRewardPanel.classList.add("visible"));
}


function startLuckySpin() {

    if (luckySpinRecord?.reward) {
        showLuckyReward();
        return;
    }

    const selectedIndex = Math.floor(Math.random() * LUCKY_REWARDS.length);
    const reward = { ...LUCKY_REWARDS[selectedIndex] };
    const rotation = 360 * 6 - selectedIndex * 45;

    spinNowButton.disabled = true;
    spinNowButton.classList.add("is-spinning");
    luckyWheel.style.transform = `rotate(${rotation}deg)`;

    window.setTimeout(() => {
        luckySpinRecord = {
            reward,
            spunAt: Date.now()
        };
        localStorage.setItem(
            ONBOARDING_KEYS.spin,
            JSON.stringify(luckySpinRecord)
        );
        spinNowButton.classList.remove("is-spinning");
        spinNowButton.querySelector("span").textContent = "SPIN COMPLETE";
        spinRewardValue.textContent = reward.title;
        spinRewardDescription.textContent = reward.detail;
        spinRewardPanel.hidden = false;
        requestAnimationFrame(() => spinRewardPanel.classList.add("visible"));
    }, 4300);
}


function claimLuckyReward() {

    if (!luckySpinRecord?.reward) return;

    if (!welcomeReward) {
        welcomeReward = {
            ...luckySpinRecord.reward,
            claimedAt: Date.now(),
            used: false
        };
        localStorage.setItem(
            ONBOARDING_KEYS.reward,
            JSON.stringify(welcomeReward)
        );

        if (welcomeReward.kind === "pot") {
            creditPotBalance(welcomeReward.amount);
        }
    }

    profileRewardSummary.textContent = welcomeReward.title;
    showScreen(profileSetupScreen);
}


function isValidSolanaAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}


function updateWalletValidation() {

    const address = walletAddressInput.value.trim();
    const valid = isValidSolanaAddress(address);

    walletAddressInput.setCustomValidity(
        valid || !address ? "" : "Enter a valid Solana wallet address."
    );
    walletValidationMessage.textContent =
        valid
            ? "Solana address format verified."
            : "Use a valid Solana address (32–44 Base58 characters).";
    walletValidationMessage.classList.toggle("valid", valid);

    return valid;
}


function savePlayerProfile(event) {

    event.preventDefault();

    const name = playerNameInput.value.trim();
    const walletAddress = walletAddressInput.value.trim();

    if (!name || !isValidSolanaAddress(walletAddress)) {
        if (!name) playerNameInput.focus();
        else walletAddressInput.focus();
        updateWalletValidation();
        return;
    }

    playerProfile = {
        name,
        walletAddress,
        reward: welcomeReward?.title || luckySpinRecord?.reward?.title || "Welcome reward",
        createdAt: Date.now()
    };

    localStorage.setItem(
        ONBOARDING_KEYS.profile,
        JSON.stringify(playerProfile)
    );

    renderPlayerProfile();
    showScreen(homeScreen);
    currentScreen = "home";
}


function renderPlayerProfile() {

    if (!playerProfile) return;

    document.getElementById("profileViewName").textContent =
        playerProfile.name;
    document.getElementById("profileViewNameValue").textContent =
        playerProfile.name;
    document.getElementById("profileViewWallet").textContent =
        playerProfile.walletAddress;
}


function openPlayerProfile() {

    if (!playerProfile) return;

    renderPlayerProfile();
    showScreen(profileViewScreen);
}


function initializeFirstVisit() {

    if (playerProfile) {
        renderPlayerProfile();
        showScreen(homeScreen);
        return;
    }

    if (welcomeReward && luckySpinRecord?.reward) {
        profileRewardSummary.textContent = welcomeReward.title;
        showScreen(profileSetupScreen);
        return;
    }

    showScreen(spinScreen);

    if (luckySpinRecord?.reward) {
        showLuckyReward();
    }
}


/* HOME */

function goHome() {

    stopTimer();

    closeModal();

    showScreen(homeScreen);

    currentScreen = "home";
}


/* BOARDS */

function openBoards() {

    stopTimer();

    closeModal();

    showScreen(boardsScreen);

    currentScreen = "boards";

    renderBoards();
}


/* LEADERBOARD */

function openLeaderboard() {

    stopTimer();

    closeModal();

    showScreen(leaderboardScreen);

    currentScreen = "leaderboard";

    renderLeaderboard();
}


/* =========================================================
   BOARD SELECTION
========================================================= */

function renderBoards() {

    boardGrid.innerHTML = "";

    BOARDS.forEach(board => {

        const card = document.createElement("article");

        card.className = "board-card";

        card.innerHTML = `

            <div class="board-preview">

                <div
                    class="board-shape shape-${board.shape}"
                    data-shape="${board.shape}"
                ></div>

            </div>

            <div class="board-info">

                <div class="board-number">
                    ${String(board.id).padStart(2, "0")}
                </div>

                <h3>${board.name}</h3>

                <div class="board-meta">
                    ${board.tiles} tiles • ${board.layers} layers
                </div>

                <button class="board-play">
                    Play this board ↗
                </button>

            </div>
        `;

        card.addEventListener("click", () => {

            startGame(board);

        });

        boardGrid.appendChild(card);

        drawBoardPreview(
            card.querySelector(".board-shape"),
            board.shape
        );
    });
}


/* =========================================================
   BOARD PREVIEW SHAPES
========================================================= */

function drawBoardPreview(container, shape) {

    const patterns = {

        tower: [
            "000111000",
            "001111100",
            "011111110",
            "011111110",
            "011111110",
            "011111110",
            "011111110",
            "011111110",
            "001111100",
            "001111100"
        ],

        p: [
            "11111",
            "10001",
            "10001",
            "10001",
            "11111",
            "11000",
            "11000"
        ],

        rocket: [
            "000110000",
            "001111000",
            "011111100",
            "011111100",
            "011111100",
            "001111000",
            "001111000",
            "001001000",
            "011001100",
            "010110100"
        ],

        diamond: [
            "000110000",
            "001111000",
            "011111100",
            "111111110",
            "111111110",
            "011111100",
            "001111000",
            "000110000"
        ],

        coin: [
            "001111100",
            "011111110",
            "111111111",
            "111111111",
            "111111111",
            "111111111",
            "011111110",
            "001111100"
        ],

        treasure: [
            "000111000",
            "001111100",
            "011111110",
            "111111111",
            "111111111",
            "111111111",
            "011111110",
            "001111100",
            "000111000"
        ]
    };


    const pattern = patterns[shape] || patterns.tower;

    container.innerHTML = "";

    pattern.forEach(row => {

        [...row].forEach(value => {

            const tile =
                document.createElement("div");

            if (value === "1") {

                tile.className =
                    "preview-tile";

            } else {

                tile.style.visibility =
                    "hidden";
            }

            container.appendChild(tile);
        });
    });
}


/* =========================================================
   START GAME
========================================================= */

function startGame(board) {

    currentBoard = board;

    const pendingWelcomeReward =
        welcomeReward && !welcomeReward.used
            ? welcomeReward
            : null;

    score = 0;
    matchedScore = 0;
    combo = 1;
    clearedTiles = 0;
    gameFinished = false;
    gameTime =
        BASE_GAME_TIME +
        (pendingWelcomeReward?.kind === "time"
            ? pendingWelcomeReward.amount
            : 0);
    timerStarted = false;
    welcomeComboBoostPending =
        pendingWelcomeReward?.kind === "combo";

    selectedTile = null;

    hints = 3 + (pendingWelcomeReward?.kind === "hint" ? 1 : 0);
    shuffles = 2;
    bombs = 1 + (pendingWelcomeReward?.kind === "bomb" ? 1 : 0);
    shuffles += pendingWelcomeReward?.kind === "shuffle" ? 1 : 0;

    if (pendingWelcomeReward) {
        welcomeReward.used = true;
        localStorage.setItem(
            ONBOARDING_KEYS.reward,
            JSON.stringify(welcomeReward)
        );
    }

    currentBoardName.textContent =
        board.name;

    stopTimer();
    stopComboTimer();
    closeModal();

    showScreen(gameScreen);

    createGameBoard();

    updateUI();

    gameMessage.textContent =
        `${formatTime(gameTime)} ready — make a correct match to start the timer.`;
}


/* =========================================================
   CREATE GAME BOARD
========================================================= */

function createGameBoard() {

    tileBoard.innerHTML = "";

    tiles = [];

    const pattern =
        getBoardShapePattern(
            currentBoard?.shape || "tower"
        );

    const activeCells = [];

    pattern.forEach((row, y) => {

        [...row].forEach((cell, x) => {

            if (cell === "1") {
                activeCells.push({ x, y });
            }
        });
    });

    const targetCells = BOARD_TILE_COUNT / 5;
    const columns = Math.max(...pattern.map(row => row.length));
    const rows = pattern.length;

    while (activeCells.length < targetCells) {

        const index = activeCells.length;
        const x = index % columns;
        const y = Math.floor(index / columns) % rows;
        const key = `${x}-${y}`;

        if (!activeCells.some(cell => `${cell.x}-${cell.y}` === key)) {
            activeCells.push({ x, y });
        }
    }

    const cells = activeCells.length <= targetCells
        ? activeCells
        : Array.from(
            { length: targetCells },
            (_, index) => activeCells[
                Math.floor(index * activeCells.length / targetCells)
            ]
        );

    for (let layer = 0; layer < 5; layer++) {

        const layerAssets = [];

        for (let pairIndex = 0; pairIndex < targetCells / 2; pairIndex++) {

            const asset =
                TILE_ASSETS[
                    (pairIndex + layer + (currentBoard?.id || 1)) %
                    TILE_ASSETS.length
                ];

            layerAssets.push(asset, asset);
        }

        shuffleArray(layerAssets);

        cells.forEach((cell, index) => {

            tiles.push({
                id: tiles.length,
                asset: layerAssets[index],
                removed: false,
                selected: false,
                layer,
                x: 0,
                y: 0,
                patternX: cell.x,
                patternY: cell.y
            });
        });
    }

    positionTiles();
    renderTiles();
}


function getBoardShapePattern(shape) {

    const shapes = {
        tower: [
            "0011110000",
            "0111111000",
            "1111111100",
            "1111111100",
            "1111111100",
            "1111111100",
            "0111111000",
            "0011110000",
            "0001100000",
            "0001100000"
        ],

        p: [
            "11111",
            "10001",
            "10001",
            "10001",
            "11111",
            "11000",
            "11000"
        ],

        rocket: [
            "0001100000",
            "0011110000",
            "0111111000",
            "0111111000",
            "0111111000",
            "0011110000",
            "0010010000",
            "0110011000",
            "0101101000",
            "0001100000"
        ],

        diamond: [
            "0001100000",
            "0011110000",
            "0111111000",
            "1111111100",
            "0111111000",
            "0011110000",
            "0001100000",
            "0000000000",
            "0000000000",
            "0000000000"
        ],

        coin: [
            "0011111000",
            "0111111100",
            "1111111110",
            "1111111110",
            "1111111110",
            "1111111110",
            "0111111100",
            "0011111000",
            "0000000000",
            "0000000000"
        ],

        treasure: [
            "0001110000",
            "0011111000",
            "0111111100",
            "1111111110",
            "1111111110",
            "0111111100",
            "0011111000",
            "0001110000",
            "0000000000",
            "0000000000"
        ]
    };

    return shapes[shape] || shapes.tower;
}


/* =========================================================
   POSITION TILES
========================================================= */

function positionTiles() {

    const width = tileBoard.clientWidth;
    const height = tileBoard.clientHeight;

    const pattern =
        getBoardShapePattern(
            currentBoard?.shape || "tower"
        );

    const cols = Math.max(...pattern.map(row => row.length));
    const rows = pattern.length;
    const pitchX = Math.min(68, (width - 16) / cols);
    const pitchY = Math.min(56, (height - 24) / rows);
    const tileWidth = Math.max(30, pitchX + 2);
    const tileHeight = Math.max(36, pitchY - 1);
    const gridWidth = cols * pitchX;
    const gridHeight = rows * pitchY;
    const startX = (width - gridWidth) / 2;
    const startY = (height - gridHeight) / 2;

    tiles.forEach(tile => {

        const scatterX =
            ((tile.patternX * 7 + tile.patternY * 3 + tile.layer) % 3) - 1;

        const scatterY =
            ((tile.patternY * 5 + tile.patternX * 2 + tile.layer) % 3) - 1;

        tile.x =
            startX +
            tile.patternX * pitchX +
            (tile.layer - 2) * 4 +
            scatterX;

        tile.y =
            startY +
            tile.patternY * pitchY +
            (tile.layer - 2) * 4 +
            scatterY;

        tile.width = tileWidth;
        tile.height = tileHeight;
    });
}


/* =========================================================
   RENDER TILES
========================================================= */

function renderTiles() {

    tileBoard.innerHTML = "";

    /*
        Lower layer first.
        Upper layer last.
    */

    const sorted =
        [...tiles].sort(
            (a, b) => a.layer - b.layer
        );


    sorted.forEach(tile => {

        if (tile.removed) return;


        const element =
            document.createElement("button");

        element.className = "tile";

        element.dataset.id = tile.id;

        element.dataset.index =
            String(tile.id + 1);


        element.style.left =
            `${tile.x}px`;

        element.style.top =
            `${tile.y}px`;

        element.style.width =
            `${tile.width}px`;

        element.style.height =
            `${tile.height}px`;


        element.style.zIndex =
            tile.layer * 100 +
            tile.id;


        element.innerHTML = `

            <img
                src="${tile.asset}"
                alt=""
                draggable="false"
            >

        `;


        if (isTileFree(tile)) {

            element.classList.add("free");

        } else {

            element.classList.add("blocked");
        }


        if (tile.selected) {

            element.classList.add("selected");
        }


        element.addEventListener(
            "click",
            () => handleTileClick(tile)
        );


        tileBoard.appendChild(element);
    });
}


/* =========================================================
   TILE BLOCKING SYSTEM
========================================================= */

function isTileFree(tile) {

    if (tile.removed) {
        return false;
    }


    /*
        A tile can only be selected if
        there is no remaining tile above it
        overlapping its position.
    */

    const coveringTile =
        tiles.some(other => {

            if (other.removed) return false;

            if (other.id === tile.id) return false;

            if (other.layer <= tile.layer) {
                return false;
            }


            const overlap =
                rectanglesOverlap(
                    tile,
                    other
                );


            return overlap;
        });


    return !coveringTile;
}


/* =========================================================
   OVERLAP DETECTION
========================================================= */

function rectanglesOverlap(a, b) {
    return !(
        a.x + a.width - 4 < b.x ||
        a.x + 4 > b.x + b.width ||
        a.y + a.height - 4 < b.y ||
        a.y + 4 > b.y + b.height
    );
}


/* =========================================================
   TILE CLICK
========================================================= */

function handleTileClick(tile) {

    if (tile.removed) return;

    if (!isTileFree(tile)) {

        gameMessage.textContent =
            "That tile is blocked.";

        return;
    }


    /*
        First tile selected.
    */

    if (!selectedTile) {

        selectedTile = tile;

        tile.selected = true;

        gameMessage.textContent =
            "Now find its matching tile.";

        renderTiles();

        return;
    }


    /*
        Clicking same tile deselects.
    */

    if (selectedTile.id === tile.id) {

        tile.selected = false;

        selectedTile = null;

        gameMessage.textContent =
            "Find a matching pair.";

        renderTiles();

        return;
    }


    /*
        Matching pair.
    */

    if (
        selectedTile.asset === tile.asset
    ) {
        matchTiles(
            selectedTile,
            tile
        );

        return;
    }


    /*
        Wrong pair.
    */

    combo = 1;
    stopComboTimer();
    updateUI();

    gameMessage.textContent =
        "Not a match — try again.";

    tileFlash(tile);

    setTimeout(() => {

        if (selectedTile) {

            selectedTile.selected = false;

        }

        selectedTile = null;

        renderTiles();

    }, 300);
}


/* =========================================================
   MATCH TILES
========================================================= */

function matchTiles(first, second) {

    if (!timerStarted) {
        startTimer();
    }

    first.selected = false;

    second.selected = false;

    first.removed = true;
    second.removed = true;

    selectedTile = null;

    clearedTiles += 2;

    gameTime += 1;
    const matchPoints =
        10 * (combo + (welcomeComboBoostPending ? 1 : 0));

    score += matchPoints;
    matchedScore += matchPoints;
    welcomeComboBoostPending = false;

    combo++;

    if (combo > 9) {
        combo = 9;
    }

    if (combo >= 2) {
        startComboTimer();
    }

    gameMessage.textContent =
        `MATCH! +${matchPoints} • +1s`;

    createMatchEffect(first);
    createMatchEffect(second);

    renderTiles();

    updateUI();

    const totalTiles = tiles.length || BOARD_TILE_COUNT;

    if (clearedTiles >= totalTiles) {

        finishGame(true);

    }
}


/* =========================================================
   TILE EFFECT
========================================================= */

function createMatchEffect(tile) {

    const element =
        document.createElement("div");

    element.style.position =
        "absolute";

    element.style.left =
        `${tile.x + 10}px`;

    element.style.top =
        `${tile.y + 10}px`;

    element.style.width =
        "35px";

    element.style.height =
        "35px";

    element.style.borderRadius =
        "50%";

    element.style.background =
        "radial-gradient(circle, #fff, #d05cff, transparent)";

    element.style.pointerEvents =
        "none";

    element.style.zIndex =
        "9999";

    element.style.animation =
        "matchBurst .45s ease forwards";

    tileBoard.appendChild(element);

    setTimeout(() => {

        element.remove();

    }, 500);
}


/* =========================================================
   WRONG TILE EFFECT
========================================================= */

function tileFlash(tile) {

    const element =
        document.querySelector(
            `.tile[data-id="${tile.id}"]`
        );

    if (!element) return;

    element.animate(
        [
            {
                transform: "translateX(0)"
            },
            {
                transform: "translateX(-5px)"
            },
            {
                transform: "translateX(5px)"
            },
            {
                transform: "translateX(0)"
            }
        ],
        {
            duration: 220
        }
    );
}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    if (timerStarted) {
        return;
    }

    timerStarted = true;

    timer = setInterval(() => {

        gameTime = Math.max(0, gameTime - 1);

        updateUI();

        if (gameTime <= 0) {

            finishGame(false);

        }

    }, 1000);
}


function stopTimer() {

    if (timer) {

        clearInterval(timer);

        timer = null;
    }

    timerStarted = false;
}


function startComboTimer() {

    stopComboTimer();

    comboWindowStart = Date.now();
    comboTimerWrap.classList.add("active");

    comboTimer = setInterval(() => {

        const elapsed = Date.now() - comboWindowStart;
        const remaining = Math.max(0, comboWindowMs - elapsed);

        comboProgressFill.style.width =
            `${(remaining / comboWindowMs) * 100}%`;

        comboTimerText.textContent =
            `${(remaining / 1000).toFixed(1)}s`;

        if (remaining <= 0) {

            combo = 1;
            stopComboTimer();
            gameMessage.textContent =
                "Combo faded — build it again.";
            updateUI();
        }

    }, 50);
}


function stopComboTimer() {

    if (comboTimer) {
        clearInterval(comboTimer);
        comboTimer = null;
    }

    comboTimerWrap.classList.remove("active");
    comboProgressFill.style.width = "0%";
    comboTimerText.textContent = "2.0s";
}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    scoreValue.textContent =
        score.toLocaleString();

    comboValue.textContent =
        `${combo}×`;

    timeValue.textContent =
        formatTime(gameTime);

    const totalTiles = tiles.length || BOARD_TILE_COUNT;

    tilesValue.textContent =
        totalTiles - clearedTiles;

    const progress =
        ((totalTiles - clearedTiles) / totalTiles) * 100;

    progressFill.style.width =
        `${progress}%`;

    if (combo >= 2 && !comboTimer) {
        startComboTimer();
    }

    if (combo < 2) {
        stopComboTimer();
    }


    document.getElementById(
        "hintCount"
    ).textContent =
        `×${hints}`;

    document.getElementById(
        "shuffleCount"
    ).textContent =
        `×${shuffles}`;

    document.getElementById(
        "bombCount"
    ).textContent =
        `×${bombs}`;
}


function formatTime(seconds) {

    const mins =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


/* =========================================================
   HINT
========================================================= */

function useHint() {

    if (hints <= 0) {

        gameMessage.textContent =
            "No hints remaining.";

        return;
    }


    const freeTiles =
        tiles.filter(tile =>
            !tile.removed &&
            isTileFree(tile)
        );


    let found = false;


    for (let i = 0; i < freeTiles.length; i++) {

        for (let j = i + 1; j < freeTiles.length; j++) {

            if (
                freeTiles[i].asset ===
                freeTiles[j].asset
            ) {

                highlightHint(
                    freeTiles[i],
                    freeTiles[j]
                );

                found = true;

                break;
            }
        }

        if (found) break;
    }


    if (!found) {

        gameMessage.textContent =
            "No exposed pair found.";

        return;
    }


    hints--;

    updateUI();
}


function highlightHint(a, b) {

    const first =
        document.querySelector(
            `.tile[data-id="${a.id}"]`
        );

    const second =
        document.querySelector(
            `.tile[data-id="${b.id}"]`
        );

    if (!first || !second) return;

    first.animate(
        [
            {
                boxShadow:
                    "0 0 0 0 transparent"
            },
            {
                boxShadow:
                    "0 0 0 6px #f4c95d, 0 0 30px #f4c95d"
            },
            {
                boxShadow:
                    "0 0 0 0 transparent"
            }
        ],
        {
            duration: 900,
            iterations: 2
        }
    );

    second.animate(
        [
            {
                boxShadow:
                    "0 0 0 0 transparent"
            },
            {
                boxShadow:
                    "0 0 0 6px #f4c95d, 0 0 30px #f4c95d"
            },
            {
                boxShadow:
                    "0 0 0 0 transparent"
            }
        ],
        {
            duration: 900,
            iterations: 2
        }
    );
}


/* =========================================================
   SHUFFLE
========================================================= */

function useShuffle() {

    if (shuffles <= 0) {

        gameMessage.textContent =
            "No shuffles remaining.";

        return;
    }


    const remaining =
        tiles.filter(
            tile => !tile.removed
        );


    const assets =
        remaining.map(
            tile => tile.asset
        );


    shuffleArray(assets);


    remaining.forEach(
        (tile, index) => {

            tile.asset =
                assets[index];

        }
    );


    shuffles--;

    selectedTile = null;

    tiles.forEach(
        tile => tile.selected = false
    );

    renderTiles();

    updateUI();

    gameMessage.textContent =
        "Board shuffled.";
}


/* =========================================================
   BOMB
========================================================= */

function useBomb() {

    if (bombs <= 0) {

        gameMessage.textContent =
            "No bombs remaining.";

        return;
    }


    const freeTiles =
        tiles.filter(tile =>
            !tile.removed &&
            isTileFree(tile)
        );


    if (!freeTiles.length) return;


    /*
        Bomb clears one exposed pair.
    */

    let pair = null;


    for (let i = 0; i < freeTiles.length; i++) {

        for (let j = i + 1; j < freeTiles.length; j++) {

            if (
                freeTiles[i].asset ===
                freeTiles[j].asset
            ) {

                pair = [
                    freeTiles[i],
                    freeTiles[j]
                ];

                break;
            }
        }

        if (pair) break;
    }


    if (!pair) {

        gameMessage.textContent =
            "No exposed matching pair.";

        return;
    }


    bombs--;

    matchTiles(
        pair[0],
        pair[1]
    );

    gameMessage.textContent =
        "Bomb cleared a pair!";
}


/* =========================================================
   FINISH GAME
========================================================= */

function finishGame(won) {

    if (gameFinished) return;

    gameFinished = true;

    stopTimer();
    stopComboTimer();

    const potReward = document.getElementById("resultPotReward");
    const potRewardAmount = document.getElementById("resultPotRewardAmount");
    potReward.hidden = !won;

    if (won) {

        creditPotBalance(BOARD_CLEAR_POT_REWARD);
        potRewardAmount.textContent =
            `+${BOARD_CLEAR_POT_REWARD.toLocaleString()} $POT`;

        score +=
            gameTime * 25;

        score +=
            combo * 100;

        resultIcon.textContent =
            "🏆";

        resultTitle.textContent =
            "Board Cleared!";

        resultLabel.textContent =
            "GAME COMPLETE";

        document.getElementById("resultScoreNote").textContent =
            "Clear bonus included. Score saved to your leaderboard.";

        document.getElementById("playAgainButton").textContent =
            "PLAY AGAIN";

    } else {

        resultIcon.textContent =
            "⏱️";

        resultTitle.textContent =
            "Game Over";

        resultLabel.textContent =
            "TIME'S UP";

        document.getElementById("resultScoreNote").textContent =
            "Match points saved to your leaderboard.";

        document.getElementById("playAgainButton").textContent =
            "START AGAIN";

    }


    finalScore.textContent =
        score.toLocaleString();

    resultTimeValue.textContent =
        formatTime(gameTime);

    resultComboValue.textContent =
        `${Math.max(1, combo)}×`;

    resultTilesValue.textContent =
        `${clearedTiles} / ${tiles.length || BOARD_TILE_COUNT}`;

    resultMatchScoreValue.textContent =
        matchedScore.toLocaleString();


    saveLeaderboardScore();


    resultModal.classList.add(
        "show"
    );
}


/* =========================================================
   LEADERBOARD
========================================================= */

function saveLeaderboardScore() {

    leaderboard.push({

        name: playerProfile?.name || "You",

        isUser: true,

        score: score,

        board: currentBoard
            ? currentBoard.name
            : "Tile Rush",

        date: Date.now()

    });


    leaderboard.sort(
        (a, b) => b.score - a.score
    );


    leaderboard =
        leaderboard.slice(0, 20);


    localStorage.setItem(
        "epicoinTileLeaderboard",
        JSON.stringify(leaderboard)
    );
}


function renderLeaderboard() {

    leaderboardList.innerHTML = "";


    const demoPlayers = [

        {
            name: "EpiMaster",
            score: 12840
        },

        {
            name: "PurpleKing",
            score: 11220
        },

        {
            name: "CoinHunter",
            score: 9870
        },

        {
            name: "TileLegend",
            score: 8640
        },

        {
            name: "EpiPlayer",
            score: 7210
        }
    ];


    const combined = [
        ...demoPlayers,
        ...leaderboard
    ];


    combined.sort(
        (a, b) => b.score - a.score
    );


    combined
        .slice(0, 20)
        .forEach((player, index) => {

            const row =
                document.createElement("div");

            row.className =
                "leader-row";


            if (
                player.isUser || player.name === "You"
            ) {

                row.classList.add("you");
            }


            const avatar =
                player.isUser || player.name === "You"
                    ? "epicoin2.png"
                    : "epicoin.png";


            row.innerHTML = `

                <div class="rank">
                    ${index + 1}
                </div>

                <img
                    class="avatar"
                    src="${avatar}"
                    alt=""
                >

                <div class="player-info">

                    <strong>
                        ${escapeHTML(player.name)}
                    </strong>

                    <small>
                        Tile Rush
                    </small>

                </div>

                <div class="player-score">
                    ${Number(player.score).toLocaleString()}
                </div>

            `;


            leaderboardList.appendChild(row);
        });
}


/* =========================================================
   UTILITY
========================================================= */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function closeModal() {

    resultModal.classList.remove(
        "show"
    );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document
    .getElementById("tileRushButton")
    .addEventListener(
        "click",
        openBoards
    );


document
    .getElementById("leaderboardButton")
    .addEventListener(
        "click",
        openLeaderboard
    );


document
    .getElementById("homeLeaderboardBtn")
    .addEventListener(
        "click",
        openLeaderboard
    );


document
    .getElementById("myProfileButton")
    .addEventListener(
        "click",
        openPlayerProfile
    );


document
    .getElementById("spinNowButton")
    .addEventListener(
        "click",
        startLuckySpin
    );


document
    .getElementById("claimRewardButton")
    .addEventListener(
        "click",
        claimLuckyReward
    );


profileSetupForm.addEventListener(
    "submit",
    savePlayerProfile
);


walletAddressInput.addEventListener(
    "input",
    updateWalletValidation
);


document
    .getElementById("profileHomeButton")
    .addEventListener(
        "click",
        () => {
            showScreen(homeScreen);
            currentScreen = "home";
        }
    );


document
    .getElementById("boardsBack")
    .addEventListener(
        "click",
        goHome
    );


document
    .getElementById("gameBack")
    .addEventListener(
        "click",
        openBoards
    );


document
    .getElementById("leaderboardBack")
    .addEventListener(
        "click",
        goHome
    );


document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        () => {

            if (currentBoard) {

                startGame(currentBoard);

            }

        }
    );


document
    .getElementById("playAgainButton")
    .addEventListener(
        "click",
        () => {

            closeModal();

            if (currentBoard) {

                startGame(currentBoard);

            }

        }
    );


document
    .getElementById("resultBoardsButton")
    .addEventListener(
        "click",
        () => {

            closeModal();

            openBoards();

        }
    );


document
    .getElementById("hintButton")
    .addEventListener(
        "click",
        useHint
    );


document
    .getElementById("shuffleButton")
    .addEventListener(
        "click",
        useShuffle
    );


document
    .getElementById("bombButton")
    .addEventListener(
        "click",
        useBomb
    );


window.addEventListener("resize", () => {

    clearTimeout(boardResizeTimer);

    boardResizeTimer = setTimeout(() => {

        if (!gameScreen.classList.contains("active") || !tiles.length) {
            return;
        }

        positionTiles();
        renderTiles();

    }, 120);
});


document
    .getElementById("soundButton")
    .addEventListener(
        "click",
        () => {

            soundEnabled =
                !soundEnabled;

            document.getElementById(
                "soundButton"
            ).textContent =
                soundEnabled
                    ? "🔊"
                    : "🔇";

        }
    );


/* =========================================================
   CSS ANIMATION ADDED FROM JS
========================================================= */

const dynamicStyle =
    document.createElement("style");

dynamicStyle.textContent = `

@keyframes matchBurst {

    0% {
        opacity: 1;
        transform: scale(.3);
    }

    60% {
        opacity: 1;
        transform: scale(1.7);
    }

    100% {
        opacity: 0;
        transform: scale(2.4);
    }

}

`;

document.head.appendChild(
    dynamicStyle
);


/* =========================================================
   INITIALIZE
========================================================= */

renderBoards();
initializeFirstVisit();