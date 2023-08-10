//helpers
const findUser = require('./findUser.js')
const get = require('../helpers/get.js')
const post = require('./post.js')

//client
const client = require('../client.js')

async function displayName(userId, guildId) {
    const user = await findUser(userId)
    if (!user) return "Unknown"

    let displayType = "full"
    if (guildId) {
        let settings = await get("settings", guildId)
        if (!settings) return "Unknown"
        if (!settings.nameDisplay) {
            settings.nameDisplay = "full"
            displayType = "full"
            await post("settings", settings, guildId)
        } else displayType = settings.nameDisplay
    }

    switch (displayType) {
        case "username": return `**${user.username}**`
        case "nickname":
            let guild = await client.guilds.fetch(guildId)
            let guildMember = null
            try {
                guildMember = await guild.members.fetch(userId)
            } catch (error) {
                return `**${user.username}**`
            }
            let theNickname = guildMember.nickname ? guildMember.nickname : guildMember.displayName
            return `**${theNickname}**`
        case "id": return userId
        default: return userId
    }
}

module.exports = displayName