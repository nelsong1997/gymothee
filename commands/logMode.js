const client = require('../client.js')
const get = require("../helpers/get")
const post = require("../helpers/post")

async function logMode(params, message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) {
        message.channel.send("Failed to get settings")
        return
    }
    let newLogMode = params[0]
    let logChannelId = settings.logChannelId
    let prefix = settings.prefix

    //now we'll always try to update and send sendThis
    let sendThis = ""
    if (!newLogMode) {
        message.channel.send(`Current log mode: ${settings.logMode}`)
        return
    } else if (newLogMode===settings.logMode) {
        message.channel.send(`Log mode was already ${settings.logMode}!`)
        return
    } else if (newLogMode==="off") {
        sendThis = "Voice logging disabled."
    } else if (newLogMode==="passive") {
        sendThis = `Voice logging enabled in "passive" mode! Use the ${prefix}log command to display voice logs.`
    } else if (newLogMode==="live" && logChannelId) {
        let logChannel = await client.channels.fetch(logChannelId)
        if (logChannel) {
            sendThis = (
                `Voice logging enabled in "live" mode! Voice activity will be logged ` +
                `in <#${logChannelId}>.`
            )
        } else {
            sendThis = (
                `Voice logging enabled in "live" mode, but the current voice log channel is invalid. ` +
                `Please set it again using the ${prefix}setlogchannel command.`
            )
        }
    } else if (newLogMode==="live") {
        sendThis = (
            `Voice logging enabled in "live" mode, but a channel needs to be set as the log channel. ` +
            `Please use the ${prefix}setlogchannel command.`
        )
    } else if (newLogMode==="live2") {
         sendThis = `Voice logging enabled. Logs will be posted in the chat areas of voice channels.`
    } else {
        message.channel.send(`Invalid log mode: ${newLogMode}`)
        return
    }

    settings.logMode = newLogMode
    let result = await post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update log mode")
        return
    }
    message.channel.send(sendThis)
}

module.exports = logMode