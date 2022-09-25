//helpers
const findUser = require('./findUser.js')
const get = require('../helpers/get.js')
const post = require('./post.js')

//client
const client = require('../client.js')

async function displayName(userId, guildId) {
    const user = await findUser(userId)
    if (!user) return "Unknown"

    let settings = await get("settings", guildId)
    if (!settings) return "Unknown"

    let displayType = settings.nameDisplay
    if (!displayType) {
        settings.nameDisplay = "username"
        await post("settings", settings, guildId)
    }

    switch (displayType) {
        case "username": return `**${user.username}**`
        case "nickname":
            let guild = await client.guilds.fetch(guildId)
            let guildMember = await guild.members.fetch(userId)
            return `**${guildMember.nickname}**`
        case "full": return `**${user.username}**#${user.discriminator}`
        //case "id": return userId
    }
}

module.exports = displayName