//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function disableCommandSecurity(message) {
    let settings = await get("settings", message.guild.id)
    if (!settings) return

    if (settings.cmdSecurity===false) {
        sendMessage(message.channel, "Error: Command security is already disabled.")
    } else {
        settings.cmdSecurity = false
        await post("settings", settings, message.guild.id)
        sendMessage(message.channel, "Command security disabled")
    }
}

module.exports = disableCommandSecurity