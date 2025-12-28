/**
 * Every card in the game, organized by the shape, color, shade, and number.
 * 
 * Shapes: D, S, O -
 * Colors: R, G, P -
 * Shades: E, S, F -
 * Numbers: 1, 2, 3 -
 */
const cards = [
    "DRE1",
    "DRE2",
    "DRE3",
    "DRS1",
    "DRS2",
    "DRS3",
    "DRF1",
    "DRF2",
    "DRF3",
    "DGE1",
    "DGE2",
    "DGE3",
    "DGS1",
    "DGS2",
    "DGS3",
    "DGF1",
    "DGF2",
    "DGF3",
    "DPE1",
    "DPE2",
    "DPE3",
    "DPS1",
    "DPS2",
    "DPS3",
    "DPF1",
    "DPF2",
    "DPF3",
    "SRE1",
    "SRE2",
    "SRE3",
    "SRS1",
    "SRS2",
    "SRS3",
    "SRF1",
    "SRF2",
    "SRF3",
    "SGE1",
    "SGE2",
    "SGE3",
    "SGS1",
    "SGS2",
    "SGS3",
    "SGF1",
    "SGF2",
    "SGF3",
    "SPE1",
    "SPE2",
    "SPE3",
    "SPS1",
    "SPS2",
    "SPS3",
    "SPF1",
    "SPF2",
    "SPF3",
    "ORE1",
    "ORE2",
    "ORE3",
    "ORS1",
    "ORS2",
    "ORS3",
    "ORF1",
    "ORF2",
    "ORF3",
    "OGE1",
    "OGE2",
    "OGE3",
    "OGS1",
    "OGS2",
    "OGS3",
    "OGF1",
    "OGF2",
    "OGF3",
    "OPE1",
    "OPE2",
    "OPE3",
    "OPS1",
    "OPS2",
    "OPS3",
    "OPF1",
    "OPF2",
    "OPF3"
]

/**
 * Every card in the game, object organized by the shape, color, shade, and number.
 */
const cardObjects = cards.map(card => {
    return convertCardToObject(card)
})

const setStreakElement = document.getElementById("setStreak")
const setsFoundElement = document.getElementById("setsFound")

var deck = shuffleDeck([...cards])
var savedBoard = JSON.parse(localStorage.getItem("board")) || null
var board = [] // String values
var selected = [] // Index values
var sets = [] // Array of index arrays
var messageQueue = [] // {message: "", color: "", duration: 0}
var setShowerIndex = Number(localStorage.getItem("setShowerIndex")) || 0 // The index of the set to show when "Show Set" is clicked
var setHintIndex = Number(localStorage.getItem("setHintIndex")) || 0 // The index of the card to show when "Hint" is clicked
var hintUsed = localStorage.getItem("hintUsed") == "true" || false // Whether or not the "Hint" button was used
var showSetUsed = localStorage.getItem("showSetUsed") == "true" || false // Whether or not the "Show Set" button was used
var selectable = true // Whether or not the user can select cards
var darkMode = localStorage.getItem("darkMode") == "1"
var mute = false // Whether or not the mini-popups is muted
var playerMode = localStorage.getItem("mode") || "classic" // The current game mode

const reloaded = savedBoard != null // If this is a reloaded version of the game

function startup() {
    toggleDarkMode(true) // runs the toggle but doesn't change anything (checks it instead)

    if (!localStorage.getItem("setsFound")) localStorage.setItem("setsFound", 0)
    if (!localStorage.getItem("setStreak")) localStorage.setItem("setStreak", 0)
    if (!localStorage.getItem("darkMode")) localStorage.setItem("darkMode", 0)
    if (!localStorage.getItem("mode")) localStorage.setItem("mode", "classic")

    setsFoundElement.innerText = localStorage.getItem("setsFound")
    setStreakElement.innerText = localStorage.getItem("setStreak")
    darkMode = localStorage.getItem("darkMode") == "1"

    updateStatsVisibility();
    changeMode(playerMode);

    setInterval(() => {
        if ((mode !== "decay" && mode !== "darkdecay") || !selectable) return;

        if (deck.length < 3) deck = shuffleDeck([...cards].filter(c => !board.includes(c)))
        var newCard = deck.shift()

        var cardIndex = Math.floor(Math.random() * board.length)
        if (selected.includes(cardIndex)) pickDifferentCard();

        function pickDifferentCard() {
            cardIndex = Math.floor(Math.random() * board.length)
            if (selected.includes(cardIndex)) pickDifferentCard()
        }

        board[cardIndex] = newCard
        setCell(cardIndex, newCard)
        deselectCells()
        findSets()
    }, 10000);
}

function toggleDarkMode(check = false) {
    if (!check) {
        if (localStorage.getItem("darkMode") == "0") {
            localStorage.setItem("darkMode", 1)
            darkMode = true
        } else {
            localStorage.setItem("darkMode", 0)
            darkMode = false
        }
    }

    if (darkMode) document.getElementById("darkmode").innerHTML = `<i class="fa fa-moon"></i>`
    else document.getElementById("darkmode").innerHTML = `<i class="fa fa-sun"></i>`

    for (let i = 0; i < 12; i++) {
        getCell(i).style.background = darkMode ? "#333333" : "white"
        getCell(i).style.border = `1px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`
        if (board.length > 0) setCell(i, board[i])
    }
    if (board.length < 1) redrawGame(false)
    document.getElementById("inner-grid").style.background = darkMode ? "var(--dark-cell-bg)" : "#c9c9c9"
}

function toggleMute() {
    if (mute) {
        mute = false
        showMessage("Unmuted 🔔", "darkgreen", 2000)
        document.getElementById("mute").innerHTML = `<i class="fa fa-bell"></i>`
    }
    else {
        mute = true
        document.getElementById("mute").innerHTML = `<i class="fa fa-bell-slash"></i>`
    }
}

async function setCards() {
    if (savedBoard && board != savedBoard) {
        board = savedBoard
        for (let i = 0; i < 12; i++) {
            setCell(i, board[i])
            await new Promise(resolve => setTimeout(resolve, 20)); // Board restored
        }
    } else {
        board = []
        for (let i = 0; i < 12; i++) {
            let card = deck.shift()
            board.push(card)
            setCell(i, card)
            await new Promise(resolve => setTimeout(resolve, 100)); // Cool animation
            if (i == 11) {
                localStorage.setItem("board", JSON.stringify(board))
                savedBoard = JSON.stringify(board)
            }
        }
    }
    findSets()
}

function shuffleDeck(deckArray) {
    for (let i = 0; i < deckArray.length; i++) {
        let randIndex = Math.floor((Math.random() * (deckArray.length - i)) + i)
        let temp = deckArray[i];
        deckArray[i] = deckArray[randIndex];
        deckArray[randIndex] = temp;
    }
    console.log(deckArray)
    return deckArray
}

function redrawGame(breakStreak) {
    disableButtons(true);

    if (breakStreak) {
        setStreakElement.innerText = 0
        setStreakElement.style.background = "var(--no-streak)"
        localStorage.setItem("setStreak", setStreakElement.innerText)
    }

    deselectCells()
    if (deck.length < 12) deck = shuffleDeck([...cards].filter(c => !board.includes(c)))
    setCards()
}

function convertCardToObject(cardStr) {
    return {
        shape: cardStr[0] == "D" ? "Diamond" : cardStr[0] == "S" ? "Squiggle" : "Oval",
        color: cardStr[1] == "R" ? "Red" : cardStr[1] == "G" ? "Green" : "Purple",
        shade: cardStr[2] == "E" ? "Empty" : cardStr[2] == "S" ? "Striped" : "Full",
        card_src: `cards/${cardStr.toLowerCase()}.png`,
        number: parseInt(cardStr[3])
    }
}

function allSameOrAllDifferent(a, b, c) {
    return (a === b && b === c) || (a !== b && a !== c && b !== c)
}

function clickedCell(cell) {
    if (selected.length > 2 || !selectable) return;
    if (selected.includes(cell)) {
        selected.splice(selected.indexOf(cell), 1)
        getCell(cell).style.border = `1px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`;
    } else {
        selected.push(cell)
        getCell(cell).style.border = `10px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`;
        getCell(cell).style.borderColor = "#0084ffff";
    }

    if (selected.length == 3) {
        let card1 = convertCardToObject((board[selected[0]]))
        let card2 = convertCardToObject((board[selected[1]]))
        let card3 = convertCardToObject((board[selected[2]]))

        if (JSON.stringify(sets).includes(JSON.stringify(selected.slice().sort((a, b) => a - b)))) {
            if (!hintUsed && !showSetUsed) {
                setStreakElement.innerText = parseInt(setStreakElement.innerText) + 1
                if (parseInt(setStreakElement.innerText) >= 5) {
                    setStreakElement.style.background = "var(--gradient-streak)"
                }
            }

            if (!showSetUsed) {
                setsFoundElement.innerText = parseInt(setsFoundElement.innerText) + 1
            }

            if (deck.length < 3) deck = shuffleDeck([...cards].filter(c => !board.includes(c)))

            setTimeout(() => {
                var newCard1 = deck.shift()
                board[selected[0]] = newCard1
                setCell(selected[0], newCard1)

                var newCard2 = deck.shift()
                board[selected[1]] = newCard2
                setCell(selected[1], newCard2)

                var newCard3 = deck.shift()
                board[selected[2]] = newCard3
                setCell(selected[2], newCard3)
                deselectCells()
                findSets()
            }, 500);

            hintUsed = false
            showSetUsed = false

            localStorage.setItem("hintUsed", `${hintUsed}`)
            localStorage.setItem("showSetUsed", `${showSetUsed}`)
            showMessage(["Great job!", "Oo, I didn't see that one!", "Nice!", "Perfect!", "How did you find that???", ":O", "SET-tacular! ha...get it?", "Fantabulous!", "Way to go!", "Keep it up!", "Lookin' good!", "Smokin'!", "You're pretty smart!", "You beat my highscore!"][Math.floor(Math.random() * 14)], "darkblue", 1000)
        } else {
            setStreakElement.innerText = 0
            setStreakElement.style.background = "#333333"

            if (!mute) {
                let alertMessage = []

                if (allSameOrAllDifferent(card1.shape, card2.shape, card3.shape) === false) {
                    if (card1.shape === card2.shape) {
                        alertMessage.push(`• 2 are ${card1.shape.toLowerCase()}s but the other is not.`)
                    } else if (card1.shape === card3.shape) {
                        alertMessage.push(`• 2 are ${card1.shape.toLowerCase()}s but the other is not.`)
                    } else {
                        alertMessage.push(`• 2 are ${card2.shape.toLowerCase()}s but the other is not.`)
                    }
                }
                if (allSameOrAllDifferent(card1.color, card2.color, card3.color) === false) {
                    if (card1.color === card2.color) {
                        alertMessage.push(`• 2 are ${card1.color.toLowerCase()} but the other is not.`)
                    } else if (card1.color === card3.color) {
                        alertMessage.push(`• 2 are ${card1.color.toLowerCase()} but the other is not.`)
                    } else {
                        alertMessage.push(`• 2 are ${card2.color.toLowerCase()} but the other is not.`)
                    }
                }
                if (allSameOrAllDifferent(card1.shade, card2.shade, card3.shade) === false) {
                    if (card1.shade === card2.shade) {
                        alertMessage.push(`• 2 are ${card1.shade.toLowerCase()} but the other is not.`)
                    } else if (card1.shade === card3.shade) {
                        alertMessage.push(`• 2 are ${card1.shade.toLowerCase()} but the other is not.`)
                    } else {
                        alertMessage.push(`• 2 are ${card2.shade.toLowerCase()} but the other is not.`)
                    }
                }
                if (allSameOrAllDifferent(card1.number, card2.number, card3.number) === false) {
                    if (card1.number === card2.number) {
                        alertMessage.push(`• 2 have ${card1.number} shape${card1.number === 1 ? "" : "s"} but the other does not.`)
                    } else if (card1.number === card3.number) {
                        alertMessage.push(`• 2 have ${card1.number} shape${card1.number === 1 ? "" : "s"} but the other does not.`)
                    } else {
                        alertMessage.push(`• 2 have ${card2.number} shape${card2.number === 1 ? "" : "s"} but the other does not.`)
                    }
                }

                showMessage(alertMessage.join("\n"), "darkred", 3000)
            }

            selected.forEach(c => {
                getCell(c).style.border = "10px solid red";
                setTimeout(() => {
                    getCell(c).style.border = `1px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`;
                }, 250);
            })

            selected = []
        }

        localStorage.setItem("setStreak", setStreakElement.innerText)
        localStorage.setItem("setsFound", setsFoundElement.innerText)
    }
}

function findSets() {
    hintUsed = false
    localStorage.setItem("hintUsed", `${hintUsed}`)
    deselectCells()
    var unfilteredSets = []
    for (let i = 0; i < board.length; i++) {
        // For every card on the board
        let card1 = board[i]
        for (let j = i + 1; j < board.length; j++) {
            // For every card on the board after the first
            let card2 = board[j]
            let neededCard = ""
            for (let k = 0; k < 4; k++) {
                // For every attribute in the card
                if (card1[k] === card2[k]) {
                    neededCard += card1[k]
                } else {
                    let allOptions = k == 0 ? ["D", "S", "O"] : k == 1 ? ["R", "G", "P"] : k == 2 ? ["E", "S", "F"] : ["1", "2", "3"]
                    let option = allOptions.filter(opt => opt != card1[k] && opt != card2[k]).join("")
                    neededCard += option
                }
            }

            let neededCardIndex = board.indexOf(neededCard)
            if (neededCardIndex != -1 && neededCardIndex != i && neededCardIndex != j) {
                unfilteredSets.push([i, j, neededCardIndex].sort((a, b) => a - b))
            }
        }
    }

    // Whether or not this is easier than filtering the original array depends on preference.
    const uniqueSets = new Set();
    unfilteredSets.forEach(arr => {
        uniqueSets.add(JSON.stringify(arr));
    });

    sets = Array.from(uniqueSets).map(str => JSON.parse(str));
    setShowerIndex = Math.floor(Math.random() * sets.length)
    setHintIndex = Math.floor(Math.random() * 3)

    localStorage.setItem("setShowerIndex", `${setShowerIndex}`)
    localStorage.setItem("setHintIndex", `${setHintIndex}`)

    console.log(`Found ${sets.length} sets :`, sets)
    console.log(`Only showing Set Index ${setShowerIndex}`, sets[setShowerIndex])

    if (sets.length < 1) {
        showMessage("There were no sets! I redrew for you.", "darkred", 2000)
        redrawGame(false)
    } else {
        localStorage.setItem("board", JSON.stringify(board))
        disableButtons(false);
    }
}

function showSets() {
    disableButtons(true);

    setStreakElement.innerText = 0
    setStreakElement.style.background = "var(--no-streak)"

    hintUsed = true
    showSetUsed = true

    localStorage.setItem("hintUsed", `${hintUsed}`)
    localStorage.setItem("showSetUsed", `${showSetUsed}`)
    localStorage.setItem("setStreak", setStreakElement.innerText)
    if (sets.length > 0) {
        let setToShow = sets[setShowerIndex]
        var i = 0;
        setToShow.forEach(c => {
            setTimeout(() => {
                getCell(c).style.border = "10px solid green";
            }, i * 100);
            setTimeout(() => {
                if (!selected.includes(c)) {
                    getCell(c).style.border = `1px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`;
                } else {
                    getCell(c).style.border = "10px solid #0084ffff";
                }
                if (i > 2) disableButtons(false);
            }, 1000 + (i * 100));
            i++;
        })
    }
}

function showHint() {
    hintUsed = true
    localStorage.setItem("hintUsed", `${hintUsed}`)
    getCell(sets[setShowerIndex][setHintIndex]).style.border = "10px solid orange";
    showMessage(`There ${sets.length !== 1 ? "are" : "is"} ${sets.length} set${sets.length !== 1 ? "s" : ""}.`, "rgb(0, 38, 255)", 2000)
    setTimeout(() => {
        if (!selected.includes(sets[setShowerIndex][setHintIndex])) getCell(sets[setShowerIndex][setHintIndex]).style.border = `1px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`;
        else {
            getCell(sets[setShowerIndex][setHintIndex]).style.border = "10px solid #0084ffff";
        }
    }, 500);
}

function deselectCells() {
    selected.forEach(c => {
        getCell(c).style.border = `1px solid ${darkMode ? "var(--dark-cell-border)" : "var(--cell-border)"}`;
    })
    selected = []
}

function getCell(cell) {
    return document.getElementById(`cell${cell}`)
}

function setCell(cellIndex, cardString) {
    getCell(cellIndex).style.backgroundImage = `url('${darkMode ? "dark" : ""}cards/${cardString.toLowerCase()}.png')`
    getCell(cellIndex).style.backgroundSize = "contain"
    getCell(cellIndex).style.backgroundRepeat = "no-repeat"
    getCell(cellIndex).style.backgroundPosition = "center"
}

function showMessage(message, color, duration, redo = false) {
    if (mute) {
        messageQueue = [];
        return;
    }

    if (!redo) {
        // Prevent duplicate messages from being added
        const isDuplicate = messageQueue.some((obj) => obj.message === message);
        if (isDuplicate) return;
        messageQueue.push({ message: message, color: color, duration: duration });
    }

    if (messageQueue.length === 1 || redo) {
        let messageObj = messageQueue[0];
        document.getElementById("output").style.backgroundColor = messageObj.color;
        document.getElementById("output").style.opacity = 1;
        document.getElementById("output").innerText = messageObj.message;
        setTimeout(() => {
            document.getElementById("output").style.pointerEvents = "auto";
        }, 250); // Prevents instantaneous accidental clicks

        // Fade out immediately on click
        const output = document.getElementById("output");
        output.onclick = () => {
            clearTimeout(fadeOutTimeout);
            fadeOutMessage();
        };

        let fadeOutTimeout = setTimeout(() => {
            fadeOutMessage();
        }, messageObj.duration);
    }
}

function fadeOutMessage() {
    const output = document.getElementById("output");
    output.style.opacity = 0;
    output.style.pointerEvents = "none";
    setTimeout(() => {
        messageQueue.shift();
        if (messageQueue.length > 0) {
            output.style.opacity = 1;
            let messageObj = messageQueue[0];
            output.style.backgroundColor = messageObj.color;
            output.innerText = messageObj.message;
            let fadeOutTimeout = setTimeout(() => {
                fadeOutMessage();
            }, messageObj.duration);
            output.onclick = () => {
                clearTimeout(fadeOutTimeout);
                fadeOutMessage();
            };
        }
    }, 250);
}

async function showRules() {
    showPopup(`
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #f0f0f0;
            line-height: 1.6;
            padding: 1rem;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        body::-webkit-scrollbar {
            display: none;
        }

        h1 {
            text-align: center;
            font-size: 2.2rem;
            margin-bottom: 0.2rem;
            color: #f0f0f0;
            text-shadow: 1px 1px 2px #000;
        }

        h2 {
            margin-top: 1.5rem;
            color: #f0f0f0;
            border-bottom: 2px solid #555;
            padding-bottom: 0.3rem;
        }

        p,
        span,
        li {
            color: #f0f0f0;
            font-size: 1rem;
        }

        .mode-selector {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin: 0.75rem 0;
        }

        .mode-selector .mode-option {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            background: #202020ff;
            color: white;
            border: none;
            border-radius: 3px;
            box-shadow: 0 8px 24px rgba(2, 6, 23, 0.2);
            cursor: pointer;
        }

        .mode-selector .mode-option.selected {
            background: #cececeff;
            color: #000;
        }

        .button-list {
            list-style: none;
            padding: 0;
            margin: 0;

            display: grid;
            grid-template-columns: auto 1fr;
            /* button | text */
            row-gap: 0.6rem;
            column-gap: 0.6rem;
            align-items: center;
        }

        .button-list li {
            display: contents;
            /* lets children participate in grid */
        }

        .button-list button,
        .button-list .set-streak,
        .button-list .sets-found {
            justify-self: center;
        }

        .button-list span {
            line-height: 1.3;
            min-width: 0;
        }

        .attribute-box {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin: 0.5rem 0;
            flex-wrap: wrap;
        }

        .attribute-box img {
            width: 60px;
            height: auto;
            border: 2px solid #888;
            border-radius: 8px;
        }

        .example-set {
            display: flex;
            justify-content: center;
            gap: 0.8rem;
            margin: 0.8rem 0 1.2rem 0;
            flex-wrap: wrap;
        }

        .example-set img {
            width: 80px;
            height: auto;
            border: 2px solid #008800;
            border-radius: 10px;
        }

        .tip-box {
            background-color: #ffeecf;
            border-left: 6px solid #cc8800;
            padding: 0.6rem 1rem;
            margin: 1rem 0;
            border-radius: 8px;
        }

        .popup-toggle-container {
            display: flex;
            justify-content: center;
            margin: 1rem 0;
        }

        .popup-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            user-select: none;
        }

        .popup-toggle input {
            display: none;
        }

        .popup-toggle .slider {
            width: 42px;
            height: 22px;
            background-color: #777;
            border-radius: 999px;
            position: relative;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .popup-toggle .slider::before {
            content: "";
            position: absolute;
            width: 18px;
            height: 18px;
            top: 2px;
            left: 2px;
            background-color: white;
            border-radius: 50%;
            transition: transform 0.2s ease;
        }

        .popup-toggle input:checked+.slider {
            background-color: #4ade80;
        }

        .popup-toggle input:checked+.slider::before {
            transform: translateX(20px);
        }

        .toggle-label {
            opacity: 0.85;
        }
    </style>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const checkbox = document.getElementById("showStats");

            if (!checkbox) return;

            const saved = localStorage.getItem("showStats");
            checkbox.checked = saved === "true";

            checkbox.addEventListener("change", () => {
                localStorage.setItem("showStats", checkbox.checked);
            });

            console.log("ShowStats loaded:", checkbox.checked);
        });
    </script>

</head>

<body>
    <h1>OFFSET</h1>
    <p style="font-size: 1rem; text-align: center; margin-bottom: 0;">Made by <strong>Jgouken</strong> &
        <strong>LeenyRGB</strong>
    </p>
    <p style="font-size: 1rem; text-align: center; margin: 0;">An unofficial remake of "Set" by Marsha Falco</p>
    <p style="font-size: 1rem; text-align: center; margin-top: 0;">Unaffiliated with Set Enterprises, Inc.</p>

    
    <div>
        <div class="mode-selector" id="mode-selector">
            <button class="mode-option" type="button" title="The way Set intended." data-mode="classic">Classic</button>
            <button class="mode-option" type="button" title="Hey! Who turned out the lights?" data-mode="truedark">True Dark</button>
            <button class="mode-option" type="button" title="Must've been the wind." data-mode="decay">Decay</button>
            <button class="mode-option" type="button" title="Hey! Who turned ou..." data-mode="darkdecay">Dark Decay</button>
        </div>
        <div class="popup-toggle-container">
            <label class="popup-toggle">
                <input type="checkbox" id="showStats" checked>
                <span class="slider"></span>
                <span class="toggle-label">Show Counters</span>
            </label>
        </div>
    <p>Each card has 4 attributes:</p>
    <ul>
        <li><strong>Color:</strong> Red, Green, or Purple</li>
        <li><strong>Shape:</strong> Diamond, Squiggle, or Oval</li>
        <li><strong>Shade:</strong> Empty, Striped, or Full</li>
        <li><strong>Number:</strong> 1, 2, or 3 shapes</li>
    </ul>

    <div class="attribute-box" style="justify-content: center;">
        <img src="${darkMode ? " dark" : ""}cards/dre1.png" alt="Diamond Red Empty 1">
        <img src="${darkMode ? " dark" : ""}cards/sps3.png" alt="Squiggle Purple Stripe 3">
        <img src="${darkMode ? " dark" : ""}cards/oge2.png" alt="Oval Green Empty 2">
        <img src="${darkMode ? " dark" : ""}cards/ore2.png" alt="Oval Red Empty 2">
        <img src="${darkMode ? " dark" : ""}cards/dgf1.png" alt="Diamond Green Full 1">
        <img src="${darkMode ? " dark" : ""}cards/sgf3.png" alt="Squiggle Green Full 3">
    </div>
    <p style="font-size: 15px; color: #929292ff; text-align: center;">Can you find the set?
    <p>

    <h2>Examples of Sets</h2>
    <p>The challenge of the game is that sets can look very different from each other. Remember: <strong>EACH</strong>
        attribute needs to be either all the same or all different.</p>
    <p>These cards are all different in all 4 attributes.
    <p>
    <div class="example-set">
        <img src="${darkMode ? " dark" : ""}cards/ors3.png" alt="Oval Red Stripe 3">
        <img src="${darkMode ? " dark" : ""}cards/dgf1.png" alt="Diamond Green Full 1">
        <img src="${darkMode ? " dark" : ""}cards/spe2.png" alt="Squiggle Purple Empty 2">
    </div>
    <p>The color is the same and all other 3 attributes are different.
    <p>
    <div class="example-set">
        <img src="${darkMode ? " dark" : ""}cards/drs1.png" alt="Diamond Red Stripe 1">
        <img src="${darkMode ? " dark" : ""}cards/srf2.png" alt="Squiggle Red Full 2">
        <img src="${darkMode ? " dark" : ""}cards/ore3.png" alt="Oval Red Empty 3">
    </div>
    <p>The amount of shapes on each card is different and the other 3 attributes are the same.
    <p>
    <div class="example-set">
        <img src="${darkMode ? " dark" : ""}cards/spf1.png" alt="Squiggle Purple Full 1">
        <img src="${darkMode ? " dark" : ""}cards/spf2.png" alt="Squiggle Purple Full 2">
        <img src="${darkMode ? " dark" : ""}cards/spf3.png" alt="Squiggle Purple Full 3">
    </div>
    <p>But this is not a set! Although most attributes are different, the last 2 have the same filling (empty) but the first
        one is full.
    <p>
    <div class="example-set">
        <img style="border: 2px solid #ff0000ff;" src="${darkMode ? " dark" : ""}cards/orf1.png" alt="Oval Red Full 1">
        <img style="border: 2px solid #ff0000ff;" src="${darkMode ? " dark" : ""}cards/dge2.png"
            alt="Diamond Green Empty 2">
        <img style="border: 2px solid #ff0000ff;" src="${darkMode ? " dark" : ""}cards/spe3.png"
            alt="Squiggle Purple Empty 3">
    </div>

    <p>This version of the game will always check for at least 1 set on the board and will
        automatically redraw if there isn't one.</p>

    <div class="tip-box">
        <strong>Note:</strong> You will never see the exact same card on the board at once. Therefore, all 4 attributes
        cannot be the same with another card.
    </div>

    <h2>Buttons</h2>
    <ul class="button-list">
        <li>
            <span class="set-streak" id="setStreak">0</span>
            <span>On the left of the screen, the Streak counter. Counts the amount of unassisted sets you find in a row.</span>
        </li>
        <li>
            <button class="topbutton redraw" title="Draws new cards on the board. This will reset your streak.">Redraw</button>
            <span>(Assist) Draws new cards on the board. This will reset your streak.</span>
        </li>
        <li>
            <button class="topbutton find-set" title="Shows you a Set. This will reset your streak.">Solve</button>
            <span>(Assist) Reveal one of the current sets for you. This will reset your streak.</span>
        </li>
        <li>
            <button class="topbutton show-hint"
                title="Show a card that has a SET. Your streak cannot go up after using this.">Hint</button>
            <span>(Assist) Reveals a card from one of the sets on the board. This does not reset your streak, but prevents it from increasing on the next set you find.</span>
        </li>
        <li>
            <button class="topbutton darkmode" id="darkmode" title="Toggle Dark/Light Mode"><i
                    class="fa fa-moon"></i></button>
            <span>Toggles dark or light mode.</span>
        </li>
        <li>
            <button class="topbutton mutemode" id="mute" title="Mute Popups"><i class="fa fa-bell"></i></button>
            <span>Mutes the mini popups that appear.</span>
        </li>
        <li>
            <button class="topbutton showrules" id="rules" title="Show The Rules"><i
                    class="fa fa-question"></i></button>
            <span>Opens this popup.</span>
        </li>
        <li>
            <span class="sets-found" id="setsFound">0</span>
            <span>On the right of the screen, the Sets counter. Counts the total amount of unassisted sets found ever.</span>
        </li>
    </ul>
    <div class="tip-box">
        <strong>Note:</strong> Clearing your cache resets the counters.
    </div>
    <div class="tip-box">
        <strong>Tip:</strong> You can click on the mini popups to dismiss them immediately.
    </div>


    <h2>Tips & Tricks</h2>
    <p>You can unselect cards by clicking on them again.<p>
    <p>There are no timers or time limits. Take your time.<p>
    <p>Whenever you pick 2 cards, there is only 1 other possible card that can complete the set.<p>
    <p>Try to use the board to your advantage. For example, if the entire board only has 1 or 2 colors, then any sets on the board must have the color be the same.<p>
</body>

</html>`)

    setTimeout(() => {
        const checkbox = document.getElementById("showStats");
        if (checkbox) {
            checkbox.checked = localStorage.getItem("showStats") === "true";

            checkbox.onchange = () => {
                localStorage.setItem("showStats", checkbox.checked);
                updateStatsVisibility();
            };
        }

        const modeContainer = document.getElementById("mode-selector");
        if (modeContainer) {
            const buttons = modeContainer.querySelectorAll(".mode-option");
            const saved = localStorage.getItem("mode") || "classic";

            buttons.forEach(b => {
                if (b.dataset.mode === saved) b.classList.add("selected");
                b.addEventListener("click", () => {
                    buttons.forEach(x => x.classList.remove("selected"));
                    b.classList.add("selected");
                    changeMode(b.dataset.mode);
                });
            });
        }
    }, 0);
}

function showPopup(contentHTML) {
    document.getElementById("popupContent").innerHTML = contentHTML;
    document.getElementById("popupOverlay").style.display = "flex";
}

function closePopup() {
    document.getElementById("popupOverlay").style.display = "none";
}

function disableButtons(disabled) {
    const disableAllButtons = [document.getElementById('redraw'), document.getElementById('solve'), document.getElementById('darkmode'), document.getElementById('hint')]

    disableAllButtons.forEach((b) => {
        b.disabled = disabled;
        b.style.cursor = disabled ? 'not-allowed' : 'pointer';
    })
}

function updateStatsVisibility() {
    const streaks = document.getElementById("streaks");
    if (!streaks) return console.error("Streaks doesn't exist!");

    const showStats = localStorage.getItem("showStats") === "true";
    streaks.style.display = showStats ? "flex" : "none"
}

let __trueDarkOverlay = null;
let __trueDarkPointerHandler = null;

function createTrueDarkOverlay() {
    if (__trueDarkOverlay) return;

    const overlay = document.createElement('div');
    overlay.id = 'trueDarkOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        background: '#000', // pitch black film
        pointerEvents: 'none',
        zIndex: '25', // below mini popups (30) and popupOverlay (9999)
    });

    document.body.appendChild(overlay);
    __trueDarkOverlay = overlay;

    __trueDarkPointerHandler = (e) => {
        let clientX = e.clientX;
        let clientY = e.clientY;
        // Support touch events
        if ((typeof clientX === 'undefined' || typeof clientY === 'undefined') && e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        if (typeof clientX === 'undefined' || typeof clientY === 'undefined') return;

        const x = clientX + 'px';
        const y = clientY + 'px';
        // Use CSS masks so the overlay is fully opaque but reveals a soft circular hole
        const mask = `radial-gradient(circle 140px at ${x} ${y}, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 75%)`;
        overlay.style.mask = mask;
    };

    // Track pointer on the document so overlay doesn't block interactions (pointerEvents: none)
    document.addEventListener('pointermove', __trueDarkPointerHandler);
    // Also update position on touch move
    document.addEventListener('touchmove', __trueDarkPointerHandler, { passive: true });
}

function destroyTrueDarkOverlay() {
    if (!__trueDarkOverlay) return;
    document.removeEventListener('pointermove', __trueDarkPointerHandler);
    document.removeEventListener('touchmove', __trueDarkPointerHandler);
    __trueDarkPointerHandler = null;
    __trueDarkOverlay.remove();
    __trueDarkOverlay = null;
}

function changeMode(mode) {
    localStorage.setItem("mode", mode);

    switch (mode) {
        case "classic":
            destroyTrueDarkOverlay();
            break;
        case "truedark":
            createTrueDarkOverlay();
            break;
        case "decay":
            destroyTrueDarkOverlay();
            break;
        case "darkdecay":
            createTrueDarkOverlay();
            break;
        default:
            destroyTrueDarkOverlay();
    }

    // update button visuals if present
    document.querySelectorAll(".mode-option").forEach(b => {
        if (b.dataset.mode === mode) b.classList.add("selected");
        else b.classList.remove("selected");
    });
}

startup()