const get = require('../helpers/get.js')
const post = require('../helpers/post.js')

async function setWelcomeChannel(message) {
    let guildId = message.guild.id
    let channelId = message.channel.id

    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.welcomeChannelId===channelId) {
        message.channel.send(`Welcome channel was already set to <#${channelId}>.`)
        return
    }
    settings.welcomeChannelId = channelId

    let result = await post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update settings")
        return
    }

    message.channel.send(
        `I will now welcome new users here in <#${channelId}>! ` +
        `Please be sure to use "setwelcomemessage" command to set the message.`
    )
}

module.exports = setWelcomeChannel