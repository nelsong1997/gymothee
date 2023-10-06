//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function enableCommandSecurity(message) {
    let settings = await get("settings", message.guild.id)
    if (!settings) return

    if (settings.cmdSecurity===true) {
        sendMessage(message.channel, "Error: Command security is already enabled.")
    } else {
        settings.cmdSecurity = true
        await post("settings", settings, message.guild.id)
        sendMessage(message.channel, "Command security enabled")
    }
}

module.exports = enableCommandSecurity