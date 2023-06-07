//helpers
const sendMessage = require('../helpers/sendMessage.js')

function help (message) {
    sendMessage(
        message.channel,
        `Command list: https://tinyurl.com/gymothee`
    )
}

module.exports = help