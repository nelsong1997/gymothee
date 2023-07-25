//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const displayName = require("../helpers/displayName")
const sendMessage = require('../helpers/sendMessage.js')

async function nameDisplay(params, message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) {
        sendMessage(message.channel, "Failed to get settings")
        return
    }
    let newNameDisplay = params[0]

    if (!settings.nameDisplay) {
        settings.nameDisplay = "username"
        let result = await post("settings", settings, guildId)
        if (!result) {
            sendMessage(message.channel, "Failed to update name display mode")
            return
        }
    }

    if (!newNameDisplay) {
        sendMessage(message.channel, `Current name display mode: ${settings.nameDisplay}`)
        return
    } else if (newNameDisplay===settings.nameDisplay) {
        sendMessage(message.channel, `Name display mode was already "${settings.nameDisplay}"!`)
        return
    } else if (["username", "nickname", "id"].includes(newNameDisplay)) {
        settings.nameDisplay = newNameDisplay
        let result = await post("settings", settings, guildId)
        if (!result) {
            sendMessage(message.channel, "Failed to update name display mode")
            return
        }
        sendMessage(message.channel, `Names will now display like: ${await displayName(message.author.id, guildId)}`)
    } else {
        sendMessage(message.channel, `Invalid name display mode: ${newNameDisplay}. Use "username", "nickname", or "id"`)
        return
    }
}

module.exports = nameDisplay