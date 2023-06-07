//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function unsetCommandChannel(message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) return

    if (!settings.commandChannelId) {
        sendMessage(message.channel, `I didn't have a command channel set...`)
        return
    }
    settings.commandChannelId = null
    let result = post("settings", settings, guildId)
    if (!result) {
        sendMessage(message.channel, "Failed to update settings")
        return
    }
    sendMessage(message.channel, `I will now listen for commands in all channels!`)
}

module.exports = unsetCommandChannel