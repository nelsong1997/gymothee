const get = require("../helpers/get")
const post = require("../helpers/post.js")

async function setPrefix(params, message) {
    let guildId = message.guild.id
    let settings = await get("settings", guildId)
    if (!settings) return

    let oldPrefix = settings.prefix
    let newPrefix = params[0]

    if (!newPrefix) {
        message.channel.send("Could not set prefix: No new prefix specified!")
        return
    } else if (oldPrefix===newPrefix) {
        message.channel.send(`Prefix was already set to ${oldPrefix}!`)
        return
    }
    let acceptableChars = "!$%^&"
    if (newPrefix.length > 2) {
        message.channel.send(`Could not set prefix: Prefixes longer than 2 chars not allowed`)
        return
    } else if (
        !acceptableChars.includes(newPrefix[0]) ||
        (newPrefix[1] &&
        !acceptableChars.includes(newPrefix[1]))
    ) {
        let charsArray = acceptableChars.split("")
        let charsString = charsArray.join(", ")
        message.channel.send(`Could not set prefix: Disallowed character used. Acceptable chars: ${charsString}`)
        return
    }
    settings.prefix = newPrefix
    let result = await post("settings", settings, guildId)
    if (!result) {
        message.channel.send("Failed to update settings")
        return
    }
    message.channel.send(`Prefix set to "${newPrefix}"! Now your commands will look like: "${newPrefix}command"`)
}

module.exports = setPrefix