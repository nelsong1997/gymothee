const get = require("../helpers/get")
const post = require("../helpers/post.js")

async function setCommandChannel(message) {
    let newCommandChannelId = message.channel.id
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.commandChannelId===newCommandChannelId) {
        message.channel.send(`I was already listening for commands here in <#${newCommandChannelId}>...`)
        return
    }
    settings.commandChannelId = newCommandChannelId
    let result = await post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update settings")
        return
    }
    message.channel.send(`I will now only listen for commands here in <#${newCommandChannelId}>!`)
    return
}

module.exports = setCommandChannel