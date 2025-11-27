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

var deck = cards
var hand = [] // String values
var selected = [] // Index values

function startGame() {
    for (let i = 0; i < 12; i++) {
        let card = deck[Math.floor(Math.random() * deck.length)]
        hand.push(card)
        deck.splice(deck.indexOf(card), 1)

        getCell(i + 1).style.backgroundImage = `url('cards/${card.toLowerCase()}.png')`
        getCell(i + 1).style.backgroundSize = "contain"
        getCell(i + 1).style.backgroundRepeat = "no-repeat"
        getCell(i + 1).style.backgroundPosition = "center"
    }

    console.log(hand)
}

startGame()

/**
 * Every card in the game, object organized by the shape, color, shade, and number.
 */
const cardObjects = cards.map(card => {
    return convertCardToObject(card)
})

function convertCardToObject(cardStr) {
    return {
        shape: cardStr[0] == "D" ? "Diamond" : cardStr[0] == "S" ? "Squiggle" : "Oval",
        color: cardStr[1] == "R" ? "Red" : cardStr[1] == "G" ? "Green" : "Purple",
        shade: cardStr[2] == "E" ? "Empty" : cardStr[2] == "S" ? "Striped" : "Full",
        card_src: `cards/${cardStr.toLowerCase()}.png`,
        number: parseInt(cardStr[3])
    }
}

function getCell(cell) {
    return document.getElementById(`cell${cell}`)
}

function clickedCell(cell) {
    if (selected.length >= 2) {
        let card1 = convertCardToObject((hand[selected[0] - 1]))
        let card2 = convertCardToObject((hand[selected[1] - 1]))
        let card3 = convertCardToObject((hand[cell - 1]))

        function allSameOrAllDifferent(a, b, c) {
            return (a === b && b === c) || (a !== b && a !== c && b !== c)
        }

        if (allSameOrAllDifferent(card1.shape, card2.shape, card3.shape) &&
            allSameOrAllDifferent(card1.color, card2.color, card3.color) &&
            allSameOrAllDifferent(card1.shade, card2.shade, card3.shade) &&
            allSameOrAllDifferent(card1.number, card2.number, card3.number)) {
            console.log("Set found!")

            let newCard1 = deck[Math.floor(Math.random() * deck.length)]
            hand[selected[0] - 1] = newCard1
            deck.splice(deck.indexOf(newCard1), 1)
            getCell(selected[0]).style.backgroundImage = `url('cards/${newCard1.toLowerCase()}.png')`
            getCell(selected[0]).style.backgroundSize = "contain"
            getCell(selected[0]).style.backgroundRepeat = "no-repeat"
            getCell(selected[0]).style.backgroundPosition = "center"

            let newCard2 = deck[Math.floor(Math.random() * deck.length)]
            hand[selected[1] - 1] = newCard2
            deck.splice(deck.indexOf(newCard2), 1)
            getCell(selected[1]).style.backgroundImage = `url('cards/${newCard2.toLowerCase()}.png')`
            getCell(selected[1]).style.backgroundSize = "contain"
            getCell(selected[1]).style.backgroundRepeat = "no-repeat"
            getCell(selected[1]).style.backgroundPosition = "center"

            let newCard3 = deck[Math.floor(Math.random() * deck.length)]
            hand[cell - 1] = newCard3
            deck.splice(deck.indexOf(newCard3), 1)
            getCell(cell).style.backgroundImage = `url('cards/${newCard3.toLowerCase()}.png')`
            getCell(cell).style.backgroundSize = "contain"
            getCell(cell).style.backgroundRepeat = "no-repeat"
            getCell(cell).style.backgroundPosition = "center"

        } else {
            // Explain why not a set with "2 are the same and 1 is different" for each attribute
            let alertMessage = ["That is not a set!\n"]
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
            alert(alertMessage.join("\n"))
        }

        selected.forEach(c => {
            getCell(c).style.border = "1px solid var(--cell-border)";
        })
        selected = []

    } else if (selected.includes(cell)) {
        selected.splice(selected.indexOf(cell), 1)
        getCell(cell).style.border = "1px solid var(--cell-border)";
    } else {
        selected.push(cell)
        getCell(cell).style.border = "10px solid var(--cell-border)";
        getCell(cell).style.borderColor = "#0084ffff";
    }
}