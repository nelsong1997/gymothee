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
            let guildMember = await guild.members.fetch(userId)
            let theNickname = guildMember.nickname ? guildMember.nickname : user.username
            return `**${theNickname}**`
        case "full": return `**${user.username}**#${user.discriminator}`
        case "id": return userId
    }
}

module.exports = displayName