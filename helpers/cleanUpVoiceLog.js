//helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')

async function cleanUpVoiceLog(guildId) {
    let voiceLog = await get("voiceLogs", guildId)
    if (!voiceLog) return

    let now = Date.now()
    let sliceIndex = voiceLog.length
    for (let i=0; i<voiceLog.length; i++) {
        if (now - Date.parse(voiceLog[i].timeStamp) < 86400000) { //24 hrs
            sliceIndex = i
            break;
        }
    }
    voiceLog = voiceLog.slice(sliceIndex, voiceLog.length)
    
    let success = post("voiceLogs", voiceLog, guildId)
    if (!success) return

    return voiceLog
}

module.exports = cleanUpVoiceLog