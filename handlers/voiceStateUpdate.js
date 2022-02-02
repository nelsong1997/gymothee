//client
const client = require('../client.js')

//helpers
const cleanUpVoiceLog = require('../helpers/cleanUpVoiceLog.js')
const logItemsToString = require('../helpers/logItemsToString.js')
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')

async function voiceStateUpdate (oldMember, newMember) {
    if (oldMember.channelId===newMember.channelId) return //stay at top for perf

    let guildId = oldMember.guild.id
    
    let settings = await get("settings", guildId)
    if (!settings) return
    let logMode = settings.logMode
    
    if (logMode==="off") return
    
    //build log entry to add to logs or post immediately
    let logItem = null
    let oldUser = await client.users.fetch(oldMember.id)
    //there's always an old member
    //but when they join they will have no channel id
    logItem = {
        username: oldUser.username,
        userId: oldMember.id,
        timeStamp: new Date(),
        guildId: guildId
    }
    if (oldMember.channelId===null) {
        let newChannel = await client.channels.fetch(newMember.channelId)
        logItem.changeType = 'join'
        logItem.newChannelName = newChannel.name
        logItem.newChannelId = newChannel.id
    } else if (newMember.channelId===null) {
        let oldChannel = await client.channels.fetch(oldMember.channelId)
        logItem.changeType = 'leave',
        logItem.oldChannelName = oldChannel.name
        logItem.oldChannelId = oldChannel.id
    } else {
        let newChannel = await client.channels.fetch(newMember.channelId)
        let oldChannel = await client.channels.fetch(oldMember.channelId)
        logItem.changeType = 'move',
        logItem.oldChannelName = oldChannel.name
        logItem.oldChannelId = oldChannel.id
        logItem.newChannelName = newChannel.name
        logItem.newChannelId = newChannel.id
    }

    if (logMode==="live" && settings.logChannelId) {
        try {
            let logChannel = await client.channels.fetch(settings.logChannelId)
            logChannel.send(logItemsToString([logItem], false))
        } catch (error) {
            console.log("I had trouble finding the log channel")
            console.log(error)
        }
    } else if (logMode==="passive") {
        let voiceLog = await cleanUpVoiceLog(guildId)
        if (!voiceLog) return
        voiceLog.push(logItem)
        post("voiceLogs", voiceLog, guildId)
    } //if live but no long channel will simply return
}

module.exports = voiceStateUpdate