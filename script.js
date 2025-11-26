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
 * 
 * @returns shapes: D, S, O -
 * colors: R, G, P -
 * shades: E, S, F -
 * numbers: 1, 2, 3 -
 */
const cardObjects = cards.map(card => {
    return {
        shape: card[0],
        color: card[1],
        shade: card[2],
        number: parseInt(card[3])
    }
})


console.log(cardObjects)