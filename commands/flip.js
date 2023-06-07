//helpers
const sendMessage = require('../helpers/sendMessage.js')

function flip (message) {
    let roll = Math.random()
    if (roll < 0.5) sendMessage(message.channel, "heads")
    else sendMessage(message.channel, "tails")
}

module.exports = flip