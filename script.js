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
var hand = [] // String values
var selected = [] // Index values
var sets = [] // Array of index arrays
var messageQueue = [] // {message: "", color: "", duration: 0}
var setShowerIndex = 0
var setHintIndex = 0
var hintUsed = false
var showSetUsed = false
var selectable = true
var darkMode = localStorage.getItem("darkMode") == "1"
var mute = false

function startup() {
    toggleDarkMode(true) // runs the toggle but doesn't change anything (checks it instead)

    if (!localStorage.getItem("setsFound")) localStorage.setItem("setsFound", 0)
    if (!localStorage.getItem("setStreak")) localStorage.setItem("setStreak", 0)
    if (!localStorage.getItem("darkMode")) localStorage.setItem("darkMode", 0)

    setsFoundElement.innerText = localStorage.getItem("setsFound")
    setStreakElement.innerText = localStorage.getItem("setStreak")
    darkMode = localStorage.getItem("darkMode") == "1"
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
        if (hand.length > 0) setCell(i, hand[i])
    }
    if (hand.length < 1) redrawGame(false)
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
    hand = []
    for (let i = 0; i < 12; i++) {
        let card = deck.shift()
        hand.push(card)
        setCell(i, card)
        await new Promise(resolve => setTimeout(resolve, 100)); // Cool animation
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
    if (deck.length < 12) deck = shuffleDeck([...cards].filter(c => !hand.includes(c)))
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
        let card1 = convertCardToObject((hand[selected[0]]))
        let card2 = convertCardToObject((hand[selected[1]]))
        let card3 = convertCardToObject((hand[selected[2]]))

        function allSameOrAllDifferent(a, b, c) {
            return (a === b && b === c) || (a !== b && a !== c && b !== c)
        }

        if (allSameOrAllDifferent(card1.shape, card2.shape, card3.shape) &&
            allSameOrAllDifferent(card1.color, card2.color, card3.color) &&
            allSameOrAllDifferent(card1.shade, card2.shade, card3.shade) &&
            allSameOrAllDifferent(card1.number, card2.number, card3.number)) {
            if (!hintUsed && !showSetUsed) {
                setStreakElement.innerText = parseInt(setStreakElement.innerText) + 1
                if (parseInt(setStreakElement.innerText) >= 5) {
                    setStreakElement.style.background = "var(--gradient-streak)"
                }
            }

            if (!showSetUsed) {
                setsFoundElement.innerText = parseInt(setsFoundElement.innerText) + 1
            }

            if (deck.length < 3) deck = shuffleDeck([...cards].filter(c => !hand.includes(c)))

            setTimeout(() => {
                var newCard1 = deck.shift()
                hand[selected[0]] = newCard1
                setCell(selected[0], newCard1)

                var newCard2 = deck.shift()
                hand[selected[1]] = newCard2
                setCell(selected[1], newCard2)

                var newCard3 = deck.shift()
                hand[selected[2]] = newCard3
                setCell(selected[2], newCard3)
                deselectCells()
                findSets()
            }, 500);

            hintUsed = false
            showSetUsed = false
            showMessage(["Great job!", "Oo, I didn't see that one!", "Nice!", "Perfect!", "How did you find that???", ":O", "SET-tacular! ha...get it?", "Fantabulous!", "Way to go!", "Keep it up!", "Lookin' good!", "Smokin'!", "You're pretty smart!", "You beat my highscore!"][Math.floor(Math.random() * 14)], "darkblue", 1000)
        } else {
            setStreakElement.innerText = 0
            setStreakElement.style.background = "#333333"
            let alertMessage = []

            if (allSameOrAllDifferent(card1.shape, card2.shape, card3.shape) === false) {
                if (card1.shape === card2.shape) {
                    alertMessage.push(`2 are ${card1.shape.toLowerCase()}s but the other is not.`)
                } else if (card1.shape === card3.shape) {
                    alertMessage.push(`2 are ${card1.shape.toLowerCase()}s but the other is not.`)
                } else {
                    alertMessage.push(`2 are ${card2.shape.toLowerCase()}s but the other is not.`)
                }
            }
            if (allSameOrAllDifferent(card1.color, card2.color, card3.color) === false) {
                if (card1.color === card2.color) {
                    alertMessage.push(`2 are ${card1.color.toLowerCase()} but the other is not.`)
                } else if (card1.color === card3.color) {
                    alertMessage.push(`2 are ${card1.color.toLowerCase()} but the other is not.`)
                } else {
                    alertMessage.push(`2 are ${card2.color.toLowerCase()} but the other is not.`)
                }
            }
            if (allSameOrAllDifferent(card1.shade, card2.shade, card3.shade) === false) {
                if (card1.shade === card2.shade) {
                    alertMessage.push(`2 are ${card1.shade.toLowerCase()} but the other is not.`)
                } else if (card1.shade === card3.shade) {
                    alertMessage.push(`2 are ${card1.shade.toLowerCase()} but the other is not.`)
                } else {
                    alertMessage.push(`2 are ${card2.shade.toLowerCase()} but the other is not.`)
                }
            }
            if (allSameOrAllDifferent(card1.number, card2.number, card3.number) === false) {
                if (card1.number === card2.number) {
                    alertMessage.push(`2 have ${card1.number} shape${card1.number === 1 ? "" : "s"} but the other does not.`)
                } else if (card1.number === card3.number) {
                    alertMessage.push(`2 have ${card1.number} shape${card1.number === 1 ? "" : "s"} but the other does not.`)
                } else {
                    alertMessage.push(`2 have ${card2.number} shape${card2.number === 1 ? "" : "s"} but the other does not.`)
                }
            }

            showMessage(alertMessage.join("\n"), "darkred", 3000)

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
    deselectCells()
    var unfilteredSets = []
    for (let i = 0; i < hand.length; i++) {
        // For every card in hand
        let card1 = hand[i]
        for (let j = i + 1; j < hand.length; j++) {
            // For every card in hand after the first
            let card2 = hand[j]
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

            let neededCardIndex = hand.indexOf(neededCard)
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

    console.log(`Found ${sets.length} sets :`, sets)
    console.log(`Only showing Set Index ${setShowerIndex}`, sets[setShowerIndex])

    if (sets.length < 1) {
        showMessage("There were no sets! I redrew for you.", "darkred", 2000)
        redrawGame(false)
    } else {
        disableButtons(false);
    }
}

function showSets() {
    disableButtons(true);
    setStreakElement.innerText = 0
    setStreakElement.style.background = "var(--no-streak)"
    localStorage.setItem("setStreak", setStreakElement.innerText)
    hintUsed = true
    showSetUsed = true
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
        messageQueue = []
        return;
    }

    if (!redo) messageQueue.push({ message: message, color: color, duration: duration })
    messageQueue = messageQueue.filter((obj, index, self) =>
        index === self.findIndex((t) => t.message === obj.message)
    );

    // Prevents addiing multiple of the same message to the queue. Prevents spamming.

    if (messageQueue.length === 1 || redo) {
        // Only runs if this is the first message in the queue or we are doing the next message.
        let messageObj = messageQueue[0];
        document.getElementById("output").style.backgroundColor = messageObj.color;
        document.getElementById("output").style.opacity = 1;
        document.getElementById("output").innerText = messageObj.message

        setTimeout(() => {
            document.getElementById("output").style.opacity = 0;
            setTimeout(() => {
                messageQueue.shift();
                if (messageQueue.length > 0) {
                    showMessage(undefined, undefined, undefined, true)
                }
            }, 500);
        }, messageObj.duration);
    }
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

    p, span, li {
        color: #f0f0f0;
        font-size: 1rem;
    }

    .button-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .button-list li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .button-list span {
        font-size: clamp(0.6rem, 3vw, 1rem);
        flex-shrink: 1;
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
</style>
</head>
<body>
    <h1>OFFSET</h1>
    <p style="font-size: 1rem; text-align: center; margin-bottom: 0;">Made by <strong>Jgouken</strong> & <strong>LeenyRGB</strong></p>
    <p style="font-size: 1rem; text-align: center; margin-top: 0;">A remake of "Set" by Marsha Falco</p>

    <h2>Objective</h2>
    <p>The main objective of the game is to match <strong>3 cards</strong> where each of their <strong>4 attributes</strong> are either all the same or all different.</p>

    <h2>Card Attributes</h2>
    <p>Each card has 4 attributes:</p>
    <ul>
        <li><strong>Color:</strong> Red, Green, or Purple</li>
        <li><strong>Shape:</strong> Diamond, Squiggle, or Oval</li>
        <li><strong>Shade:</strong> Empty, Striped, or Full</li>
        <li><strong>Number:</strong> 1, 2, or 3 shapes</li>
    </ul>

    <div class="attribute-box" style="justify-content: center;">
        <img src="${darkMode ? "dark" : ""}cards/dre1.png" alt="Diamond Red Empty 1">
        <img src="${darkMode ? "dark" : ""}cards/sps3.png" alt="Squiggle Purple Stripe 3">
        <img src="${darkMode ? "dark" : ""}cards/oge2.png" alt="Oval Green Empty 2">
        <img src="${darkMode ? "dark" : ""}cards/ore2.png" alt="Oval Red Empty 2">
        <img src="${darkMode ? "dark" : ""}cards/dgf1.png" alt="Diamond Green Full 1">
        <img src="${darkMode ? "dark" : ""}cards/sgf3.png" alt="Squiggle Green Full 3">
    </div>
    <p style="font-size: 15px; color: #929292ff; text-align: center;">Can you find the set?<p>

    <h2>Examples of Sets</h2>
    <p>The challenge of the game is that sets can look very different from each other. Remember: <strong>EACH</strong> attribute needs to be either all the same or all different.</p>
    <p>These cards are all different in all 4 attributes.<p>
    <div class="example-set">
        <img src="${darkMode ? "dark" : ""}cards/ors3.png" alt="Oval Red Stripe 3">
        <img src="${darkMode ? "dark" : ""}cards/dgf1.png" alt="Diamond Green Full 1">
        <img src="${darkMode ? "dark" : ""}cards/spe2.png" alt="Squiggle Purple Empty 2">
    </div>
    <p>The color is the same and all other 3 attributes are different.<p>
    <div class="example-set">
        <img src="${darkMode ? "dark" : ""}cards/drs1.png" alt="Diamond Red Stripe 1">
        <img src="${darkMode ? "dark" : ""}cards/srf2.png" alt="Squiggle Red Full 2">
        <img src="${darkMode ? "dark" : ""}cards/ore3.png" alt="Oval Red Empty 3">
    </div>
    <p>The amount of shapes on each card is different and the other 3 attributes are the same.<p>
    <div class="example-set">
        <img src="${darkMode ? "dark" : ""}cards/spf1.png" alt="Squiggle Purple Full 1">
        <img src="${darkMode ? "dark" : ""}cards/spf2.png" alt="Squiggle Purple Full 2">
        <img src="${darkMode ? "dark" : ""}cards/spf3.png" alt="Squiggle Purple Full 3">
    </div>
    <p>This is not a set! Although most attributes are different, the last 2 have the same filling (empty) but the first one does not.<p>
    <div class="example-set">
        <img style="border: 2px solid #ff0000ff;" src="${darkMode ? "dark" : ""}cards/orf1.png" alt="Oval Red Full 1">
        <img style="border: 2px solid #ff0000ff;" src="${darkMode ? "dark" : ""}cards/dge2.png" alt="Diamond Green Empty 2">
        <img style="border: 2px solid #ff0000ff;" src="${darkMode ? "dark" : ""}cards/spe3.png" alt="Squiggle Purple Empty 3">
    </div>

    <div class="tip-box">
        <strong>Note:</strong> You will never see the exact same card on the board at once. Therefore, all 4 attributes will not be the same.
    </div>
    
    <div class="tip-box">
        <strong>Tip:</strong> This version of the game will always check for at least 1 set on the board and will automatically redraw if there isn't one.
    </div>

    <h2>Buttons</h2>
    <ul class="button-list">
        <li>
            <span class="set-streak" id="setStreak">0</span>
            <span>Amount of unassisted sets you find in a row.</span>
        </li>
        <li>
            <button class="topbutton redraw" title="Draws new cards. This will reset your streak.">Redraw</button>
            <span>Redraws a brand new board.</span>
        </li>
        <li>
            <button class="topbutton find-set" title="Shows you a Set. This will reset your streak.">Solve</button>
            <span>Reveal one of the current sets for you.</span>
        </li>
        <li>
            <button class="topbutton show-hint" title="Show a card that has a SET. Your streak cannot go up after using this.">Hint</button>
            <span>Reveals a card from one of the sets on the board.</span>
        </li>
        <li>
            <button class="topbutton darkmode" id="darkmode" title="Toggle Dark/Light Mode"><i class="fa fa-moon"></i></button>
            <span>Toggles dark or light mode.</span>
        </li>
        <li>
            <button class="topbutton mutemode" id="mute" title="Mute Popups"><i class="fa fa-bell"></i></button>
            <span>Mutes the mini popups that appear.</span>
        </li>
        <li>
            <button class="topbutton showrules" id="rules" title="Show The Rules"><i class="fa fa-question"></i></button>
            <span>Opens this popup.</span>
        </li>
        <li>
            <span class="sets-found" id="setsFound">0</span>
            <span>Total amount of unassisted sets found.</span>
        </li>
    </ul>


    <h2>Tips & Tricks</h2>
    <div class="tip-box">
        <strong>Tip:</strong> You can unselect cards by selecting them again.
    </div>
    <div class="tip-box">
        <strong>Pro Tip:</strong> Whenever you pick 2 cards, there is only 1 other possible card that can complete the set.
    </div>
</body>
</html>

    `)
}

function showPopup(contentHTML) {
    document.getElementById("popupContent").innerHTML = contentHTML;
    document.getElementById("popupOverlay").style.display = "flex";
}

function closePopup() {
    document.getElementById("popupOverlay").style.display = "none";
}

function disableButtons(disabled) {
    const disableAllButtons = [document.getElementById('redraw'), document.getElementById('solve'), document.getElementById('darkmode')]
    
    disableAllButtons.forEach((b) => {
        b.disabled = disabled;
        b.style.cursor = disabled ? 'not-allowed' : 'pointer';
    })
}

startup()