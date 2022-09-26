//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const displayName = require("../helpers/displayName")

async function nameDisplay(params, message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) {
        message.channel.send("Failed to get settings")
        return
    }
    let newNameDisplay = params[0]

    if (!settings.nameDisplay) {
        settings.nameDisplay = "username"
        let result = await post("settings", settings, guildId)
        if (!result) {
            message.channel.send("Failed to update name display mode")
            return
        }
    }

    if (!newNameDisplay) {
        message.channel.send(`Current name display mode: ${settings.nameDisplay}`)
        return
    } else if (newNameDisplay===settings.nameDisplay) {
        message.channel.send(`Name display mode was already "${settings.nameDisplay}"!`)
        return
    } else if (["username", "nickname", "full", "id"].includes(newNameDisplay)) {
        settings.nameDisplay = newNameDisplay
        let result = await post("settings", settings, guildId)
        if (!result) {
            message.channel.send("Failed to update name display mode")
            return
        }
        message.channel.send(`Names will now display like: ${await displayName(message.author.id, guildId)}`)
    } else {
        message.channel.send(`Invalid name display mode: ${newNameDisplay}`)
        return
    }
}

module.exports = nameDisplay