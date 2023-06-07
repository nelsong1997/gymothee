//helpers
const get = require("../helpers/get")
const post = require("../helpers/post.js")
const sendMessage = require('../helpers/sendMessage.js')

async function setCommandChannel(message) {
    let newCommandChannelId = message.channel.id
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.commandChannelId===newCommandChannelId) {
        sendMessage(message.channel, `I was already listening for commands here in <#${newCommandChannelId}>...`)
        return
    }
    settings.commandChannelId = newCommandChannelId
    let result = await post("settings", settings, guildId)
    if (!result) {
        sendMessage(message.channel, "Failed to update settings")
        return
    }
    sendMessage(message.channel, `I will now only listen for commands here in <#${newCommandChannelId}>!`)
    return
}

module.exports = setCommandChannel