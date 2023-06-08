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
    
    if (logMode!=="on") return
    
    //join
    if (oldMember.channelId===null) {
        sendMessage(newMember.channel, `${await displayName(newMember.id, guildId)} joined.`)
    //leave
    } else if (newMember.channelId===null) {
        sendMessage(oldMember.channel, `${await displayName(oldMember.id, guildId)} left.`)
    //move
    } else {
        sendMessage(oldMember.channel, `${await displayName(oldMember.id, guildId)} left.`)
        sendMessage(newMember.channel, `${await displayName(newMember.id, guildId)} joined.`)
    }
}

module.exports = voiceStateUpdate