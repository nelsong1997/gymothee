//helpers
const sendMessage = require('../helpers/sendMessage.js')
const displayName = require('../helpers/displayName.js')
const cleanUpAndGetVoiceLogs = require('../helpers/cleanUpAndGetVoiceLogs.js')
const get = require('../helpers/get.js')

async function voiceLogs (message) {
    let guildId = message.guild.id 
    let channelId = message.channel.id

    if (message.channel.type!==2) {
        // not valid unless it's a voice channel, just ignore
        return
    }

    let settings = await get("settings", guildId)
    if (!settings) {
        sendMessage(message.channel, "Failed to get settings")
        return
    }

    if (settings.logMode!=="passive") {
        sendMessage(message.channel, "Error: voicelogs command is only available when logmode is passive")
        return
    }

    let voiceLogs = await cleanUpAndGetVoiceLogs(guildId, channelId)

    let sendThis = ''
    if (voiceLogs.length===0) sendThis = 'No voice logs.'
    for (let logEntry of voiceLogs) {
        sendThis += `${await displayName(logEntry.userId, guildId)} ` +
            `${logEntry.action} at ` +
            `${dateToString(logEntry.timestamp)}.\n`
    }
    sendMessage(message.channel, sendThis)
}

function dateToString(dateString) {
    const date = new Date(dateString)
    let spaceyDate = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'}) //9:03 AM
    let formattedDate = spaceyDate.split(" ").join("").toLowerCase() //9:03am
    return (
        `${formattedDate} ` +
        `on ${new Intl.DateTimeFormat('en-US', { weekday: "long" } ).format(date)}` //Saturday
    )
}

module.exports = voiceLogs