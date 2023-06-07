//client
const client = require("../client.js")

//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function setWelcomeMessage(params, message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) return

    let welcomeMessage = params.join(" ")
    let welcomeChannelId = settings.welcomeChannelId
    let sendThis = ""

    if (welcomeChannelId) {
        let welcomeChannel = await client.channels.fetch(welcomeChannelId)
        if (welcomeChannel) sendThis = "Welcome message updated! Posting it below..."
        else {
            sendThis = (
                "Welcome message updated, but the current welcome channel is invalid. " +
                "Please use setwelcomechannel to update it. Posting welcome message below..."
            )
        }
    } else {
        sendThis = (
            "Welcome message updated, but there is no welcome channel set. " +
            "Please use setwelcomechannel to set it. Posting welcome message below..."
        )
    }
    settings.welcomeMessage = welcomeMessage
    let result = post("settings", settings, guildId)
    if (!result) {
        sendMessage(message.channel, "Failed to update settings")
        return
    }
    sendMessage(message.channel, sendThis)
    sendMessage(message.channel, welcomeMessage)
}

module.exports = setWelcomeMessage