//helpers
const sendMessage = require('../helpers/sendMessage.js')

async function roll (params, message) {
    function rollDie(sides) { //inclusive
        return Math.floor(Math.random() * sides) + 1
    }

    let sendThis = ""

    if (params.length===0) sendThis = "Please roll at least one die..."
    for (let i=0; i<params.length; i++) {
        let numSides = Number(params[i])
        if (isNaN(numSides) || typeof(numSides)!=="number") {
            sendThis = "One or more dice has NaN sides..."
            break;
        } else if (numSides < 1 || numSides%1) {
            sendThis = "One or more dice has a non-whole number side..."
            break;
        }
        if (params.length > 1) sendThis += `**Roll ${i+1} (D${numSides})**: ${rollDie(numSides)}\n`
        else sendThis = rollDie(numSides)
    }
    
    await sendMessage(message.channel, sendThis.toString())
}

module.exports = roll