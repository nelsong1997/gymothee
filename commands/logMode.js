//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function logMode(params, message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) {
        sendMessage(message.channel, "Failed to get settings")
        return
    }
    let newLogMode = params[0]

    //now we'll always try to update and send sendThis
    let sendThis = ""
    if (!newLogMode) {
        sendMessage(message.channel, `Current log mode: ${settings.logMode}`)
        return
    } else if (newLogMode===settings.logMode) {
        sendMessage(message.channel, `Log mode was already ${settings.logMode}!`)
        return
    } else if (newLogMode==="off") {
        sendThis = "Voice logging disabled."
    } else if (newLogMode==="on") {
        sendThis = `Voice logging enabled. Logs will be posted in the chat areas of voice channels.`
    } else {
        sendMessage(message.channel, `Invalid log mode: ${newLogMode}`)
        return
    }

    settings.logMode = newLogMode
    let result = await post("settings", settings, guildId)
    if (!result) {
        sendMessage(message.channel, "Failed to update log mode")
        return
    }
    sendMessage(message.channel, sendThis)
}

module.exports = logMode