const get = require("../helpers/get")
const post = require("../helpers/post")

async function unsetWelcomeMessage(message) {
    let guildId = message.guild.id

    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.welcomeMessage===null) {
        message.channel.send("There wasn't a welcome message to unset...")
        return
    }
    settings.welcomeMessage = null
    let result = post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update settings")
        return
    }
    message.channel.send("Welcome message disabled.")
}

module.exports = unsetWelcomeMessage