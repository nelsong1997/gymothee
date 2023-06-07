//helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')
const sendMessage = require('../helpers/sendMessage.js')

async function setWelcomeChannel(message) {
    let guildId = message.guild.id
    let channelId = message.channel.id

    let settings = await get("settings", guildId)
    if (!settings) return

    if (settings.welcomeChannelId===channelId) {
        sendMessage(message.channel, `Welcome channel was already set to <#${channelId}>.`)
        return
    }
    settings.welcomeChannelId = channelId

    let result = await post("settings", settings, guildId)
    if (!result) {
        sendMessage(message.channel, "Failed to update settings")
        return
    }

    sendMessage(message.channel, 
        `I will now welcome new users here in <#${channelId}>! ` +
        `Please be sure to use "setwelcomemessage" command to set the message.`
    )
}

module.exports = setWelcomeChannel