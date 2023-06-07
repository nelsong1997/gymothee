//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function unsetWelcomeMessage(message) {
    let guildId = message.guild.id

    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.welcomeMessage===null) {
        sendMessage(message.channel, "There wasn't a welcome message to unset...")
        return
    }
    settings.welcomeMessage = null
    let result = post("settings", settings, guildId)
    if (!result) {
        sendMessage(message.channel, "Failed to update settings")
        return
    }
    sendMessage(message.channel, "Welcome message disabled.")
}

module.exports = unsetWelcomeMessage