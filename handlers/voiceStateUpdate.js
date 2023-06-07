//client
const client = require('../client.js')

//helpers
const displayName = require("../helpers/displayName")
const get = require('../helpers/get.js')
const sendMessage = require('../helpers/sendMessage.js')

async function voiceStateUpdate (oldMember, newMember) {
    if (oldMember.channelId===newMember.channelId) return //stay at top for perf

    let guildId = oldMember.guild.id
    
    let settings = await get("settings", guildId)
    if (!settings) return
    let logMode = settings.logMode
    
    if (logMode==="off") return
    
    //build log entry to add to logs or post immediately
    let logItem = null
    //there's always an old member
    //but if they are joining oldMember will have no channel id
    logItem = {
        userId: oldMember.id,
        timeStamp: new Date(),
        guildId: guildId
    }
    let oldChannel = null;
    let newChannel = null;
    if (oldMember.channelId===null) {
        newChannel = await client.channels.fetch(newMember.channelId)
        logItem.changeType = 'join'
        logItem.newChannelName = newChannel.name
        logItem.newChannelId = newChannel.id
    } else if (newMember.channelId===null) {
        oldChannel = await client.channels.fetch(oldMember.channelId)
        logItem.changeType = 'leave',
        logItem.oldChannelName = oldChannel.name
        logItem.oldChannelId = oldChannel.id
    } else {
        newChannel = await client.channels.fetch(newMember.channelId)
        oldChannel = await client.channels.fetch(oldMember.channelId)
        logItem.changeType = 'move',
        logItem.oldChannelName = oldChannel.name
        logItem.oldChannelId = oldChannel.id
        logItem.newChannelName = newChannel.name
        logItem.newChannelId = newChannel.id
    }

    if (logMode==="on") {
        if (logItem.changeType==='join') {
            await sendMessage(newChannel, await logItemsToString([logItem], false, true, guildId))
        } else if (logItem.changeType==='leave') {
            await sendMessage(oldChannel, await logItemsToString([logItem], false, true, guildId))
        } else if (logItem.changeType==='move') {
            logItem.changeType = "leave"
            await sendMessage(oldChannel, await logItemsToString([logItem], false, true, guildId))
            logItem.changeType = "join"
            await sendMessage(newChannel, await logItemsToString([logItem], false, true, guildId))
        }
    }
    //invalid logmode not handled
}

async function logItemsToString(items, includeTime, hideChannel, guildId) {
    let logsString = ""
    for (let logItem of items) {
        if (!hideChannel) {
            let timeString = ""
            if (includeTime) timeString = ` at ${dateToString(logItem.timeStamp)}`
            switch (logItem.changeType) {
                case "join":
                    logsString += (
                        `${await displayName(logItem.userId, guildId)} joined **${logItem.newChannelName}**${timeString}.\n`
                    )
                    break;
                case "leave":
                    logsString += (
                        `${await displayName(logItem.userId, guildId)} left **${logItem.oldChannelName}**${timeString}.\n` 
                    )
                    break;
                case "move":
                    logsString += (
                        `${await displayName(logItem.userId, guildId)} left **${logItem.oldChannelName}** and ` +
                        `joined **${logItem.newChannelName}**${timeString}.\n`
                    )
            }
        } else {
            //when hideChannel is true, includeTime should always be false
            switch (logItem.changeType) {
                case "join":
                    logsString = `${await displayName(logItem.userId, guildId)} joined.\n`
                    break;
                case "leave":
                    logsString = `${await displayName(logItem.userId, guildId)} left.\n`
            }
        }
    }
    return logsString
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

module.exports = voiceStateUpdate