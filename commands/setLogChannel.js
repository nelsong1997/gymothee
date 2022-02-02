const get = require('../helpers/get.js')
const post = require('../helpers/post.js')

async function setLogChannel(message) {
    let guildId = message.guild.id
    let channelId = message.channel.id

    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.logMode!=="live") {
        message.channel.send(`Error: Can only set log channel when logmode is set to "live"`)
        return
    } else if (settings.logChannelId===channelId) {
        message.channel.send(`Log channel was already set to <#${channelId}>.`)
        return
    }
    settings.logChannelId = channelId
    let result = await post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update settings")
        return
    }
    message.channel.send(`I will now log voice channel activity here in <#${channelId}>!`)
    return
}

module.exports = setLogChannel