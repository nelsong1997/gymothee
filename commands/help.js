//helpers
const sendMessage = require('../helpers/sendMessage.js')

function help (message) {
    sendMessage(
        message.channel,
        `Command list: https://github.com/nelsong1997/gymothee#commands`
    )
}

module.exports = help