//helpers
const get = require("../helpers/get")
const post = require("../helpers/post")
const sendMessage = require('../helpers/sendMessage.js')

async function commandSecurity(params, message) {
    let settings = await get("settings", message.guild.id)
    if (!settings) return
    else if (settings.cmdSecurity===undefined) {
        settings.cmdSecurity = false
        await post("settings", settings, message.guild.id)
    }

    const onOrOff = params[0]
    let newValue
    if (onOrOff==="on") newValue = true
    else if (onOrOff==="off") newValue = false
    else {
        sendMessage(message.channel, `Command security is currently ${settings.cmdSecurity ? "on" : "off"}.`)
        return
    }

    if (settings.cmdSecurity===newValue) {
        sendMessage(message.channel, `Error: Command security is already ${onOrOff}.`)
        return
    } else {
        settings.cmdSecurity = newValue
        await post("settings", settings, message.guild.id)
        sendMessage(message.channel, `Command security turned ${onOrOff}.`)
    }
}

module.exports = commandSecurity