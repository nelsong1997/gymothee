//helpers
const get = require('./get.js')
const post = require('./post.js')

async function cleanUpAndGetVoiceLogs (guildId, channelId, memberId, leaveOrJoin) {
    let voiceLogs = await get("voicelogs", guildId)
    if (!voiceLogs) return

    let oldChannelLogs = []
    oldChannelLogs = voiceLogs.filter(
        (logEntry) => logEntry.channelId===channelId
    // newest first
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    let now = new Date()

    let newChannelLogs = []
    for (let logEntry of oldChannelLogs) {
        let newLogCount = newChannelLogs.length
        logTime = new Date(logEntry.timestamp)
        let diffMinutes = (now - logTime)/60000
        let diffHours = diffMinutes/60
        if (newLogCount < 5 && diffHours < 24) newChannelLogs.push(logEntry)
        else if (diffMinutes < 5) newChannelLogs.push(logEntry)
        else break
    }

    if (leaveOrJoin) {
        let newLogEntry = {
            userId: memberId,
            timestamp: now,
            channelId: channelId,
            action: leaveOrJoin
        }
    
        newChannelLogs.push(newLogEntry)
    }

    voiceLogs = voiceLogs.filter(
        (logEntry) => logEntry.channelId!==channelId
    )

    voiceLogs = voiceLogs.concat(newChannelLogs)
    await post("voicelogs", voiceLogs, guildId)

    // oldest first
    return newChannelLogs.reverse()
}

module.exports = cleanUpAndGetVoiceLogs