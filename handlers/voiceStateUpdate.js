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
    //but if they are joining oldMember will have no channel id
    logItem = {
        username: oldUser.username,
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

    if (logMode==="live" && settings.logChannelId) {
        try {
            let logChannel = await client.channels.fetch(settings.logChannelId)
            logChannel.send(logItemsToString([logItem], false))
        } catch (error) {
            console.log("I had trouble finding the log channel")
            console.log(error)
            //should consider posting a message in the command channel
            //could also create a way to find a random channel to post errors in
        }
    } else if (logMode==="passive") {
        let voiceLog = await cleanUpVoiceLog(guildId)
        if (!voiceLog) return
        voiceLog.push(logItem)
        await post("voiceLogs", voiceLog, guildId)
    } else if (logMode==="live2") {
        if (logItem.changeType==='join') {
            await newChannel.send(logItemsToString([logItem], false, true))
        } else if (logItem.changeType==='leave') {
            await oldChannel.send(logItemsToString([logItem], false, true))
        } else if (logItem.changeType==='move') {
            logItem.changeType = "leave"
            await oldChannel.send(logItemsToString([logItem], false, true))
            logItem.changeType = "join"
            await newChannel.send(logItemsToString([logItem], false, true))
        }
    }
    //invalid logmode not handled
}

module.exports = voiceStateUpdate