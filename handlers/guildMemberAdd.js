//client
const client = require('../client.js')

//json
const userIds = require('../json/userIds.json')

//helpers
const get = require('../helpers/get.js')

async function guildMemberAdd (member) {
    if (member.bot) return
    // console.log("did acknowledge new user")
    let settings = await get("settings", member.guild.id)
    if (!settings) return
    // console.log("did retrieve settings")
    if (settings.welcomeChannelId && settings.welcomeMessage) {
        // console.log("attempting to post welcome msg")
        try {
            let welcomeChannel = await client.channels.fetch(settings.welcomeChannelId)
            welcomeChannel.send(settings.welcomeMessage.replace("<@mention>", `<@${member.id}>`))
        } catch (error) {
            console.log("probably couldnt find welcome channel")
            //maybe post about this in the command channel?
        }
    }
}

module.exports = guildMemberAdd