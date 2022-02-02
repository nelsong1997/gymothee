const get = require("../helpers/get")
const post = require("../helpers/post")

async function unsetCommandChannel(message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) return

    if (!settings.commandChannelId) {
        message.channel.send(`I didn't have a command channel set...`)
        return
    }
    settings.commandChannelId = null
    let result = post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update settings")
        return
    }
    message.channel.send(`I will now listen for commands in all channels!`)
}

module.exports = unsetCommandChannel