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

    let sendThis = ""
    let doPost = false
    if (!newLogMode) {
        sendThis = `Current log mode: ${settings.logMode}`
    } else if (newLogMode===settings.logMode) {
        sendThis = `Log mode was already ${settings.logMode}!`
    } else if (["passive", "live", "off"].includes(newLogMode)) {
        doPost = true
        sendThis = `Log mode set to: ${newLogMode}`
    } else {
        sendThis = `Invalid log mode: ${newLogMode}`
    }
    
    if (doPost) {
        settings.logMode = newLogMode
        let result = await post("settings", settings, guildId)
        if (!result) sendThis = "Failed to update log mode"
    }

    sendMessage(message.channel, sendThis)
}

module.exports = logMode