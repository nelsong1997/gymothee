//client
const client = require('../client.js')

//helpers
const get = require('../helpers/get.js')

async function guildMemberAdd (member) {
    if (member.user.bot) return
    // console.log("did acknowledge new user")
    let settings = await get("settings", member.guild.id)
    if (!settings) return
    // console.log("did retrieve settings")
    if (settings.welcomeChannelId && settings.welcomeMessage) {
        // console.log("attempting to post welcome msg")
        try {
            let welcomeChannel = await client.channels.fetch(settings.welcomeChannelId)
            welcomeChannel.send(settings.welcomeMessage.replaceAll("<@mention>", `<@${member.id}>`))
        } catch (error) {
            console.log("probably couldnt find welcome channel")
            //maybe post about this in the command channel?
        }
    }
}

module.exports = guildMemberAdd